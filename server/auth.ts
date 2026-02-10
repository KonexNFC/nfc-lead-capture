import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { storage } from "./storage";
import { sendPasswordResetEmail } from "./email";
import { type User as SelectUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "r8q/+&1LM3)Cd*zAGpx1xm{NeQHc;#",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByEmail(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, (user as SelectUser).id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByEmail(req.body.email);
      if (existingUser) {
        return res.status(409).send("Email already in use");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).send("Invalid email or password");
      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, resetToken: _t, resetTokenExpiry: _e, ...safeUser } = user;
        res.status(200).json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as SelectUser;
      const { password: _, resetToken: _t, resetTokenExpiry: _e, ...safeUser } = user;
      return res.json(safeUser);
    }
    res.status(401).send("Not logged in");
  });

  const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email"),
  });

  const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send(parsed.error.errors[0]?.message || "Invalid input");
      }
      const { email } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
      }

      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setResetToken(user.id, token, expiry);

      const host = req.get("host") || "konexnfc.com";
      const protocol = host.includes("localhost") ? "http" : "https";
      const resetUrl = `${protocol}://${host}/reset-password?token=${token}`;

      sendPasswordResetEmail(email, resetUrl).catch((err) => {
        console.error("[EMAIL ERROR] Password reset email failed:", err);
      });

      res.status(200).json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).send(parsed.error.errors[0]?.message || "Invalid input");
      }
      const { token, password } = parsed.data;

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
        return res.status(400).send("Invalid or expired reset link");
      }

      const hashedPassword = await hashPassword(password);
      await storage.updatePassword(user.id, hashedPassword);

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (err) {
      next(err);
    }
  });
}
