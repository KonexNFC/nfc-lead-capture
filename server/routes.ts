import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import {
  sendLeadNotificationEmail,
  sendOrganizationInviteEmail,
  sendActivationEmail,
  sendWelcomeEmail,
  sendAdminOrderNotification,
  sendShippedEmail,
  sendRefundEmail,
  sendAdminDisputeAlert,
} from "./email";
import {
  SKU_CATALOG,
  createPayPalOrder,
  capturePayPalOrder,
  verifyWebhookSignature,
  isPayPalConfigured,
  getPayPalClientId,
} from "./paypal";

async function seedDatabase() {
  const existingUser = await storage.getUserByEmail("demo@konex.app");
  if (!existingUser) {
    console.log("Seeding database...");
    const hashedPassword = await hashPassword("demo123");
    const user = await storage.createUser({
      email: "demo@konex.app",
      password: hashedPassword,
    });

    const profile = await storage.createProfile({
      userId: user.id,
      name: "Alex Rivera",
      title: "Product Designer",
      company: "Acme Inc",
      bio: "Building digital experiences that matter. Passionate about UI/UX and accessibility.",
      slug: "arivera",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      theme: "light",
      links: {
        linkedin: "https://linkedin.com/in/arivera",
        email: "alex@acme.inc",
        website: "https://alexrivera.design",
        twitter: "https://twitter.com/arivera"
      }
    });

    await storage.createLead({
      profileId: profile.id,
      name: "Sarah Chen",
      email: "sarah@techcorp.com",
      company: "TechCorp",
      note: "Met at TechCrunch Disrupt. Interested in design services.",
      source: "nfc"
    });

    await storage.createLead({
      profileId: profile.id,
      name: "Mike Ross",
      email: "mike@lawfirm.com",
      company: "Pearson Specter",
      note: "Needs a new website.",
      source: "qr"
    });
    
    console.log("Database seeded successfully!");
  }

  // Seed demo cards
  const existingCard = await storage.getCardByCode("KONEX-B-00001");
  const legacyCard = await storage.getCardByCode("KONEX-B-0001");
  if (!existingCard && !legacyCard) {
    const demoUser = await storage.getUserByEmail("demo@konex.app");
    const demoProfile = demoUser ? await storage.getProfile(demoUser.id) : null;

    await storage.createCard({
      cardCode: "KONEX-B-00001",
      productTier: "basic",
      status: "unassigned",
      nickname: null,
    });

    if (demoUser && demoProfile) {
      const premiumCard = await storage.createCard({
        cardCode: "KONEX-P-00001",
        productTier: "premium",
        status: "active",
        nickname: "Main Card",
        ownerId: demoUser.id,
        profileId: demoProfile.id,
        activatedAt: new Date(),
      });
      await storage.createAssignmentHistory({
        cardId: premiumCard.id,
        newOwnerId: demoUser.id,
        actionType: "activated",
        note: "Demo card activation",
      });
    }

    await storage.createCard({
      cardCode: "KONEX-E-00001",
      productTier: "elite",
      status: "suspended",
      nickname: "Event Card",
    });

    console.log("Demo cards seeded successfully!");
  }

  const existingOrgs = await storage.getUserOrganizations(
    (await storage.getUserByEmail("demo@konex.app"))?.id ?? 0
  );
  if (existingOrgs.length === 0) {
    const demoUser = await storage.getUserByEmail("demo@konex.app");
    if (demoUser) {
      const hashedPw = await hashPassword("team123");

      const teamUser1 = await storage.getUserByEmail("team1@konex.app") ??
        await storage.createUser({ email: "team1@konex.app", password: hashedPw });
      await storage.getProfile(teamUser1.id) ??
        await storage.createProfile({
          userId: teamUser1.id,
          name: "Jordan Lee",
          title: "Sales Manager",
          company: "Acme Inc",
          slug: "jlee",
          theme: "light",
          links: { email: "jordan@acme.inc", linkedin: "https://linkedin.com/in/jlee" },
        });

      const teamUser2 = await storage.getUserByEmail("team2@konex.app") ??
        await storage.createUser({ email: "team2@konex.app", password: hashedPw });
      await storage.getProfile(teamUser2.id) ??
        await storage.createProfile({
          userId: teamUser2.id,
          name: "Casey Tran",
          title: "Marketing Lead",
          company: "Acme Inc",
          slug: "ctran",
          theme: "dark",
          links: { email: "casey@acme.inc", instagram: "https://instagram.com/caseyt" },
        });

      const org = await storage.createOrganization({
        name: "Acme Inc",
        slug: "acme-inc",
        ownerUserId: demoUser.id,
        planType: "business",
      });

      await storage.addOrganizationMember({
        organizationId: org.id,
        userId: demoUser.id,
        role: "owner",
        status: "active",
      });

      await storage.addOrganizationMember({
        organizationId: org.id,
        userId: teamUser1.id,
        role: "admin",
        status: "active",
      });

      await storage.addOrganizationMember({
        organizationId: org.id,
        userId: teamUser2.id,
        role: "member",
        status: "active",
      });

      const orgCardCodes = ["KONEX-B-00001", "KONEX-P-00001", "KONEX-E-00001"];
      for (const code of orgCardCodes) {
        const card = await storage.getCardByCode(code);
        if (card) {
          await storage.assignCardToOrganization({
            organizationId: org.id,
            cardId: card.id,
            assignedUserId: code === "KONEX-P-00001" ? demoUser.id : null,
          });
        }
      }

      const orgOnlyCodes = [
        { code: "KONEX-B-00002", tier: "basic" as const },
        { code: "KONEX-B-00003", tier: "basic" as const },
      ];
      for (const { code, tier } of orgOnlyCodes) {
        const existing = await storage.getCardByCode(code);
        if (!existing) {
          const newCard = await storage.createCard({
            cardCode: code,
            productTier: tier,
            status: "unassigned",
            nickname: null,
          });
          await storage.assignCardToOrganization({
            organizationId: org.id,
            cardId: newCard.id,
          });
        }
      }

      console.log("Demo organization seeded successfully!");
    }
  }

  await ensureAdminAccount();
}

async function ensureAdminAccount() {
  const adminEmails = ["info@konexnfc.com", "admin@konexnfc.com"];
  const { db } = await import("./db");
  const { users } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");
  const hashedPassword = await hashPassword("Milan2020");

  for (const adminEmail of adminEmails) {
    const adminUser = await storage.getUserByEmail(adminEmail);
    if (adminUser) {
      await db.update(users).set({ password: hashedPassword, isAdmin: true }).where(eq(users.id, adminUser.id));
      console.log("Admin account ensured for", adminEmail);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  setupAuth(app);

  // Register object storage routes
  registerObjectStorageRoutes(app);

  const TIER_PREFIX_MAP: Record<string, string> = {
    basic: "B",
    premium: "P",
    elite: "E",
    custom: "C",
  };

  function getTierFromCode(cardCode: string): string | null {
    const match = cardCode.match(/^KONEX-([BPEC])-/i);
    if (!match) return null;
    const prefix = match[1].toUpperCase();
    for (const [tier, code] of Object.entries(TIER_PREFIX_MAP)) {
      if (code === prefix) return tier;
    }
    return null;
  }

  function validateCardCodeTier(cardCode: string, productTier: string): string | null {
    const expectedPrefix = TIER_PREFIX_MAP[productTier];
    if (!expectedPrefix) return `Unknown product tier: ${productTier}`;
    const tierFromCode = getTierFromCode(cardCode);
    if (!tierFromCode) return `Invalid card code format: ${cardCode}. Expected KONEX-{B|P|E|C}-XXXXX`;
    if (tierFromCode !== productTier) {
      return `Card code prefix "${cardCode}" does not match tier "${productTier}". Expected prefix KONEX-${expectedPrefix}-`;
    }
    return null;
  }

  // Seed DB
  seedDatabase().catch(console.error);

  // === Profiles ===

  // List all my profiles
  app.get("/api/profiles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userProfiles = await storage.getProfilesByUserId(req.user.id);
    res.json(userProfiles);
  });

  // Create a new profile
  app.post("/api/profiles", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const input = api.profiles.updateMine.input.parse(req.body);
    if (!input.slug) return res.status(400).json({ message: "Slug is required" });
    if (!input.name) return res.status(400).json({ message: "Name is required" });
    try {
      const profile = await storage.createProfile({
        ...input,
        userId: req.user.id,
        name: input.name,
        slug: input.slug,
        photoUrl: input.photoUrl ? input.photoUrl.replace(/^\/objects\//, '') : input.photoUrl
      });
      res.status(201).json(profile);
    } catch (e) {
      res.status(400).json({ message: "Slug might be taken" });
    }
  });

  // Get specific profile by ID (ownership check)
  app.get("/api/profiles/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profileId = parseInt(req.params.id);
    if (isNaN(profileId)) return res.status(400).json({ message: "Invalid profile ID" });
    const profile = await storage.getProfileById(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user.id) return res.status(403).json({ message: "Not your profile" });
    res.json(profile);
  });

  // Update specific profile by ID (ownership check)
  app.put("/api/profiles/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profileId = parseInt(req.params.id);
    if (isNaN(profileId)) return res.status(400).json({ message: "Invalid profile ID" });
    const profile = await storage.getProfileById(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user.id) return res.status(403).json({ message: "Not your profile" });
    const input = api.profiles.updateMine.input.parse(req.body);
    const updated = await storage.updateProfileById(profileId, {
      ...input,
      photoUrl: input.photoUrl ? input.photoUrl.replace(/^\/objects\//, '') : input.photoUrl
    });
    res.json(updated);
  });

  // Delete a profile (ownership check)
  app.delete("/api/profiles/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profileId = parseInt(req.params.id);
    if (isNaN(profileId)) return res.status(400).json({ message: "Invalid profile ID" });
    const profile = await storage.getProfileById(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user.id) return res.status(403).json({ message: "Not your profile" });
    await storage.deleteProfile(profileId);
    res.json({ message: "Profile deleted" });
  });
  
  // Get my profile (legacy - returns first profile)
  app.get(api.profiles.getMine.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profile = await storage.getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  // Update my profile (legacy - updates first profile or creates)
  app.put(api.profiles.updateMine.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    let profile = await storage.getProfile(req.user.id);
    const input = api.profiles.updateMine.input.parse(req.body);

    if (!profile) {
      if (!input.slug) {
        return res.status(400).json({ message: "Slug is required for new profile" });
      }
      if (!input.name) {
         return res.status(400).json({ message: "Name is required for new profile" });
      }
      
      try {
        profile = await storage.createProfile({
          ...input,
          userId: req.user.id,
          name: input.name,
          slug: input.slug,
          photoUrl: input.photoUrl ? input.photoUrl.replace(/^\/objects\//, '') : input.photoUrl
        });
        return res.json(profile);
      } catch (e) {
        return res.status(400).json({ message: "Slug might be taken" });
      }
    }

    const updated = await storage.updateProfile(req.user.id, {
      ...input,
      photoUrl: input.photoUrl ? input.photoUrl.replace(/^\/objects\//, '') : input.photoUrl
    });
    res.json(updated);
  });

  // Check slug availability
  app.get(api.profiles.checkSlug.path, async (req, res) => {
    const slug = req.params.slug as string;
    const profile = await storage.getProfileBySlug(slug);
    res.json({ available: !profile });
  });

  // Public Profile View
  app.get(api.profiles.getBySlug.path, async (req, res) => {
    const slug = req.params.slug as string;
    const profile = await storage.getProfileBySlug(slug);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Fire-and-forget — do not block the response on analytics writes
    storage.incrementProfileViews(profile.id).catch(() => {});

    // Cache public profiles for 60 s on CDN/browser; revalidate in background
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(profile);
  });


  // === Leads ===

  // Submit Lead (Public)
  app.post(api.leads.submit.path, async (req, res) => {
    const input = api.leads.submit.input.parse(req.body);
    const profile = await storage.getProfileBySlug(input.slug);
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const lead = await storage.createLead({
      name: input.name,
      email: input.email || null,
      telephone: input.telephone || null,
      whatsapp: input.whatsapp || null,
      company: input.company,
      note: input.note,
      source: input.source,
      profileId: profile.id
    });

    const owner = await storage.getUser(profile.userId);
    if (owner?.email && lead.name) {
      sendLeadNotificationEmail(
        owner.email,
        profile.name || 'Your Profile',
        lead.name,
        lead.telephone || lead.whatsapp || lead.email || 'no contact',
        { email: lead.email, telephone: lead.telephone, whatsapp: lead.whatsapp, company: lead.company, note: lead.note }
      ).catch((err) => {
        console.error("[EMAIL ERROR] Lead notification failed:", err);
      });
    }

    res.status(201).json(lead);
  });

  // List Leads (Private) - supports ?profileId= filter
  app.get(api.leads.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const profileIdParam = req.query.profileId ? parseInt(req.query.profileId as string) : null;
    const userProfiles = await storage.getProfilesByUserId(req.user.id);
    if (userProfiles.length === 0) return res.json([]);

    if (profileIdParam) {
      const targetProfile = userProfiles.find(p => p.id === profileIdParam);
      if (!targetProfile) return res.status(403).json({ message: "Not your profile" });
      const profileLeads = await storage.getLeadsByProfile(profileIdParam);
      return res.json(profileLeads);
    }

    const allLeads: any[] = [];
    for (const p of userProfiles) {
      const profileLeads = await storage.getLeadsByProfile(p.id);
      allLeads.push(...profileLeads.map(l => ({ ...l, profileName: p.name })));
    }
    allLeads.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    res.json(allLeads);
  });

  // Analytics - supports ?profileId= filter
  app.get(api.leads.stats.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const profileIdParam = req.query.profileId ? parseInt(req.query.profileId as string) : null;
    const userProfiles = await storage.getProfilesByUserId(req.user.id);
    if (userProfiles.length === 0) return res.json({ totalLeads: 0, recentLeads: [], totalViews: 0 });

    if (profileIdParam) {
      const targetProfile = userProfiles.find(p => p.id === profileIdParam);
      if (!targetProfile) return res.json({ totalLeads: 0, recentLeads: [], totalViews: 0 });
      const profileLeads = await storage.getLeadsByProfile(profileIdParam);
      return res.json({ totalLeads: profileLeads.length, recentLeads: profileLeads.slice(0, 5), totalViews: targetProfile.views });
    }

    let totalLeads = 0;
    let totalViews = 0;
    const allLeads: any[] = [];
    for (const p of userProfiles) {
      const profileLeads = await storage.getLeadsByProfile(p.id);
      totalLeads += profileLeads.length;
      totalViews += (p.views || 0);
      allLeads.push(...profileLeads);
    }
    allLeads.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    res.json({ totalLeads, recentLeads: allLeads.slice(0, 5), totalViews });
  });

  // === Profile Event Tracking (Public, rate-limited) ===
  const eventRateLimits = new Map<string, { count: number; resetAt: number }>();
  function eventRateLimit(req: any, res: any, next: any) {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = eventRateLimits.get(key);
    if (!entry || entry.resetAt < now) {
      eventRateLimits.set(key, { count: 1, resetAt: now + 60_000 });
      return next();
    }
    if (entry.count >= 30) return res.status(429).json({ message: "Too many events" });
    entry.count++;
    return next();
  }
  // Purge stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    Array.from(eventRateLimits.entries()).forEach(([k, v]) => {
      if (v.resetAt < now) eventRateLimits.delete(k);
    });
  }, 300_000);

  app.post("/api/public/track", eventRateLimit, async (req, res) => {
    const { slug, eventType, metadata } = req.body;
    if (!slug || !eventType || typeof eventType !== "string") return res.status(400).json({ message: "slug and eventType required" });
    const allowed = ["view","cta_click","call_click","email_click","whatsapp_click","website_click","social_click","booking_click","save_contact","form_submit","qr_scan","payment_click"];
    if (!allowed.includes(eventType)) return res.status(400).json({ message: "Unknown event type" });
    const profile = await storage.getProfileBySlug(slug);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    await storage.createProfileEvent({ profileId: profile.id, eventType, metadata: metadata || {} });
    res.json({ ok: true });
  });

  // === Waitlist (Public) ===
  app.post("/api/waitlist", async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      product: z.string().min(1).max(100),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Valid email and product required" });
    const { email, product } = parsed.data;
    console.log(`[waitlist] ${email} joined waitlist for: ${product}`);
    res.json({ ok: true });
  });

  // === Analytics (Authenticated) ===
  app.get("/api/analytics/overview", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const overview = await storage.getAnalyticsOverview(req.user.id);
    res.json(overview);
  });

  app.get("/api/analytics/trend", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const days = Math.min(parseInt(req.query.days as string || "30"), 90);
    const trend = await storage.getAnalyticsTrend(req.user.id, days);
    res.json(trend);
  });

  app.get("/api/analytics/ctas", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const ctas = await storage.getAnalyticsCtas(req.user.id);
    res.json(ctas);
  });

  app.get("/api/analytics/sources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sources = await storage.getAnalyticsSources(req.user.id);
    res.json(sources);
  });

  // === Auth Middleware ===
  function requireAuth(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  }

  // === Admin Routes ===
  function requireAdmin(req: any, res: any, next: any) {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    next();
  }

  app.get("/api/admin/analytics", requireAdmin, async (_req, res) => {
    const analytics = await storage.getAdminAnalytics();
    res.json(analytics);
  });

  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    const allUsers = await storage.listAllUsers();
    const allProfiles = await storage.listAllProfiles();
    const usersWithProfiles = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      profile: allProfiles.find(p => p.userId === u.id) || null,
    }));
    res.json(usersWithProfiles);
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const profile = await storage.getProfile(userId);
    const userLeads = profile ? await storage.getLeadsByProfile(profile.id) : [];
    res.json({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      profile: profile || null,
      leads: userLeads,
    });
  });

  app.put("/api/admin/users/:id/profile", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const input = api.profiles.updateMine.input.parse(req.body);
    let profile = await storage.getProfile(userId);
    if (!profile) {
      if (!input.slug || !input.name) {
        return res.status(400).json({ message: "Name and slug are required for new profile" });
      }
      profile = await storage.createProfile({ ...input, userId, name: input.name, slug: input.slug });
      return res.json(profile);
    }

    const updated = await storage.updateProfileById(profile.id, input);
    res.json(updated);
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin) return res.status(400).json({ message: "Cannot delete an admin account" });
    await storage.deleteUser(userId);
    res.json({ message: "User deleted" });
  });

  app.get("/api/admin/leads", requireAdmin, async (_req, res) => {
    const allLeads = await storage.listAllLeads();
    res.json(allLeads);
  });

  app.get("/api/admin/growth", requireAdmin, async (req, res) => {
    const days = parseInt(req.query.days as string) || 30;
    const growth = await storage.getGrowthData(Math.min(days, 90));
    res.json(growth);
  });

  app.get("/api/admin/top-profiles", requireAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const topProfiles = await storage.getTopProfiles(Math.min(limit, 20));
    res.json(topProfiles);
  });

  app.get("/api/admin/activity", requireAdmin, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activity = await storage.getRecentActivity(Math.min(limit, 50));
    res.json(activity);
  });

  app.patch("/api/admin/users/:id/toggle-admin", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });
    const toggleSchema = z.object({ isAdmin: z.boolean() });
    const parsed = toggleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid request body" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.id === (req.user as any).id) return res.status(400).json({ message: "Cannot change your own admin status" });
    await storage.toggleAdmin(userId, parsed.data.isAdmin);
    res.json({ message: "Admin status updated" });
  });

  // === Account Settings ===
  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  });

  app.post("/api/change-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const user = await storage.getUser((req.user as any).id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await comparePasswords(parsed.data.currentPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect" });

    const hashed = await hashPassword(parsed.data.newPassword);
    await storage.updatePassword(user.id, hashed);
    res.json({ message: "Password updated successfully" });
  });

  const changeEmailSchema = z.object({
    newEmail: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
  });

  app.patch("/api/change-email", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = changeEmailSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const user = await storage.getUser((req.user as any).id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await comparePasswords(parsed.data.password, user.password);
    if (!valid) return res.status(400).json({ message: "Password is incorrect" });

    const existing = await storage.getUserByEmail(parsed.data.newEmail);
    if (existing && existing.id !== user.id) return res.status(409).json({ message: "Email already in use" });

    await storage.updateEmail(user.id, parsed.data.newEmail.toLowerCase().trim());
    res.json({ message: "Email updated successfully" });
  });

  const deleteAccountSchema = z.object({
    password: z.string().min(1, "Password is required"),
  });

  app.delete("/api/account", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = deleteAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const user = await storage.getUser((req.user as any).id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin) return res.status(400).json({ message: "Admin accounts cannot be deleted this way" });

    const valid = await comparePasswords(parsed.data.password, user.password);
    if (!valid) return res.status(400).json({ message: "Password is incorrect" });

    req.logout((err) => {
      if (err) console.error("Logout error during account deletion:", err);
    });

    await storage.deleteUser(user.id);
    res.json({ message: "Account deleted successfully" });
  });

  // === Testimonials ===

  const testimonialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    title: z.string().optional(),
    quote: z.string().min(10, "Review must be at least 10 characters"),
    rating: z.number().int().min(1).max(5),
  });

  app.post("/api/testimonials", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = testimonialSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const existing = await storage.getTestimonialsByUser(req.user.id);
    if (existing.length > 0) {
      return res.status(400).json({ message: "You have already submitted a testimonial" });
    }

    const testimonial = await storage.createTestimonial({
      ...parsed.data,
      title: parsed.data.title || null,
      userId: req.user.id,
    });
    res.status(201).json(testimonial);
  });

  app.get("/api/testimonials/mine", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const testimonials = await storage.getTestimonialsByUser(req.user.id);
    res.json(testimonials);
  });

  app.get("/api/public/testimonials", async (_req, res) => {
    const testimonials = await storage.getApprovedTestimonials();
    res.json(testimonials);
  });

  app.get("/api/admin/testimonials", requireAdmin, async (_req, res) => {
    const testimonials = await storage.getAllTestimonials();
    res.json(testimonials);
  });

  app.patch("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const statusSchema = z.object({ status: z.enum(["approved", "rejected", "pending"]) });
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid status" });
    const updated = await storage.updateTestimonialStatus(id, parsed.data.status);
    res.json(updated);
  });

  app.delete("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteTestimonial(id);
    res.json({ message: "Testimonial deleted" });
  });

  // === Site Settings (Public) ===
  app.get("/api/public/settings/:key", async (req, res) => {
    try {
      const value = await storage.getSetting(req.params.key);
      res.json({ value });
    } catch (error) {
      res.status(500).json({ message: "Failed to get setting" });
    }
  });

  // === Admin Settings (Protected) ===
  app.put("/api/settings/:key", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { value } = req.body;
      if (typeof value !== 'string') {
        return res.status(400).json({ message: "Value must be a string" });
      }
      const setting = await storage.setSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // === NFC Tap Router (Public) ===
  app.get("/api/tap/:cardCode", async (req, res) => {
    const card = await storage.getCardByCode(req.params.cardCode);
    if (!card) return res.status(404).json({ status: "not_found" });

    if (card.status === "unassigned") {
      return res.json({ status: "unassigned", cardCode: card.cardCode });
    }

    if (card.status === "suspended" || card.status === "lost") {
      return res.json({ status: "inactive", cardCode: card.cardCode });
    }

    if (card.status === "active" && card.profileId) {
      const profile = await storage.getProfileById(card.profileId);
      if (profile) {
        await storage.incrementCardTapCount(card.id);
        await storage.createTapEvent({
          cardId: card.id,
          ownerId: card.ownerId,
          eventType: "nfc_tap",
          userAgent: req.headers["user-agent"] || null,
          referer: req.headers["referer"] || null,
          ipAddress: req.ip || null,
          destinationUrl: `/u/${profile.slug}`,
        });
        await storage.incrementProfileViews(profile.id);
        return res.json({ status: "active", redirectTo: `/u/${profile.slug}`, profileSlug: profile.slug });
      }
    }

    return res.json({ status: "active", redirectTo: null, cardCode: card.cardCode });
  });

  // === Card Activation (Public but needs auth) ===
  app.post("/api/cards/activate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { cardCode } = req.body;
    if (!cardCode) return res.status(400).json({ message: "Card code is required" });

    const normalizedCode = cardCode.trim().toUpperCase();
    const tierError = getTierFromCode(normalizedCode);
    if (!tierError && normalizedCode.startsWith("KONEX-")) {
      return res.status(400).json({ message: "Invalid card code format. Expected KONEX-{B|P|E|C}-XXXXX" });
    }

    const card = await storage.getCardByCode(normalizedCode);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const mismatch = validateCardCodeTier(card.cardCode, card.productTier);
    if (mismatch) {
      return res.status(400).json({ message: `Card data integrity error: ${mismatch}. Contact support.` });
    }

    if (card.ownerId === req.user.id) {
      return res.json({ message: "Card already belongs to you", card });
    }

    if (card.ownerId && card.ownerId !== req.user.id) {
      return res.status(403).json({ message: "This card is already assigned to another user. Please contact support." });
    }

    if (card.status !== "unassigned") {
      return res.status(400).json({ message: "This card cannot be activated" });
    }

    const userProfile = await storage.getProfile(req.user.id);
    const updated = await storage.updateCard(card.id, {
      ownerId: req.user.id,
      profileId: userProfile?.id || null,
      status: "active",
      activatedAt: new Date(),
    });

    await storage.createAssignmentHistory({
      cardId: card.id,
      newOwnerId: req.user.id,
      actionType: "activated",
      note: "User-initiated activation",
    });

    res.json({ message: "Card activated successfully", card: updated, hasProfile: !!userProfile });
  });

  // === User Card Routes ===
  app.get("/api/cards/my", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userCards = await storage.getCardsByOwnerId(req.user.id);
    res.json(userCards);
  });

  app.patch("/api/cards/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cardId = parseInt(req.params.id);
    if (isNaN(cardId)) return res.status(400).json({ message: "Invalid card ID" });
    const card = await storage.getCardById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.ownerId !== req.user.id) return res.status(403).json({ message: "Not your card" });

    const allowedFields = z.object({
      nickname: z.string().optional(),
      profileId: z.number().optional(),
    });
    const parsed = allowedFields.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    if (parsed.data.profileId) {
      const targetProfile = await storage.getProfileById(parsed.data.profileId);
      if (!targetProfile || targetProfile.userId !== req.user.id) {
        return res.status(403).json({ message: "You can only link cards to your own profiles" });
      }
    }

    const updated = await storage.updateCard(cardId, parsed.data);
    res.json(updated);
  });

  app.post("/api/cards/:id/suspend", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cardId = parseInt(req.params.id);
    const card = await storage.getCardById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.ownerId !== req.user.id) return res.status(403).json({ message: "Not your card" });
    const updated = await storage.updateCard(cardId, { status: "suspended" });
    await storage.createAssignmentHistory({ cardId, previousOwnerId: req.user.id, newOwnerId: req.user.id, actionType: "suspended" });
    res.json(updated);
  });

  app.post("/api/cards/:id/reactivate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cardId = parseInt(req.params.id);
    const card = await storage.getCardById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.ownerId !== req.user.id) return res.status(403).json({ message: "Not your card" });
    const updated = await storage.updateCard(cardId, { status: "active" });
    await storage.createAssignmentHistory({ cardId, previousOwnerId: req.user.id, newOwnerId: req.user.id, actionType: "restored" });
    res.json(updated);
  });

  app.post("/api/cards/:id/lost", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cardId = parseInt(req.params.id);
    const card = await storage.getCardById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.ownerId !== req.user.id) return res.status(403).json({ message: "Not your card" });
    const updated = await storage.updateCard(cardId, { status: "lost" });
    await storage.createAssignmentHistory({ cardId, previousOwnerId: req.user.id, newOwnerId: req.user.id, actionType: "suspended", note: "Marked as lost" });
    res.json(updated);
  });

  app.get("/api/cards/:id/analytics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cardId = parseInt(req.params.id);
    const card = await storage.getCardById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.ownerId !== req.user.id) return res.status(403).json({ message: "Not your card" });
    const analytics = await storage.getCardAnalytics(cardId);
    res.json(analytics);
  });

  // === Admin Card Routes ===
  app.get("/api/admin/cards", requireAdmin, async (req, res) => {
    const filters = {
      status: req.query.status as string | undefined,
      productTier: req.query.productTier as string | undefined,
      search: req.query.search as string | undefined,
    };
    const allCards = await storage.listAllCards(filters);
    res.json(allCards);
  });

  app.get("/api/admin/cards/stats", requireAdmin, async (_req, res) => {
    const stats = await storage.getCardStats();
    res.json(stats);
  });

  app.post("/api/admin/cards/batch-create", requireAdmin, async (req, res) => {
    const batchSchema = z.object({
      quantity: z.number().int().min(1).max(500),
      productTier: z.enum(["basic", "premium", "elite", "custom"]),
      startNumber: z.number().int().min(1).optional(),
      nicknamePattern: z.string().optional(),
    });
    const parsed = batchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const { quantity, productTier, startNumber, nicknamePattern } = parsed.data;
    const tierCode = productTier === "basic" ? "B" : productTier === "premium" ? "P" : productTier === "elite" ? "E" : "C";
    const start = startNumber || 1;

    const expectedPrefix = TIER_PREFIX_MAP[productTier];
    if (!expectedPrefix) return res.status(400).json({ message: `Unknown product tier: ${productTier}` });

    const cardsToCreate = [];
    const duplicateCheck: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const seqNum = String(start + i).padStart(5, "0");
      const cardCode = `KONEX-${expectedPrefix}-${seqNum}`;
      duplicateCheck.push(cardCode);
      cardsToCreate.push({
        cardCode,
        productTier,
        status: "unassigned" as const,
        nickname: nicknamePattern ? `${nicknamePattern} ${start + i}` : null,
      });
    }

    const existingCards = await storage.getCardsByCodes(duplicateCheck);
    if (existingCards.length > 0) {
      const dupes = existingCards.map(c => c.cardCode).join(", ");
      return res.status(409).json({ message: `Duplicate card codes found: ${dupes}. Adjust the start number.` });
    }

    const created = await storage.batchCreateCards(cardsToCreate);

    const csvRows = ["card_code,url"];
    for (const card of created) {
      csvRows.push(`${card.cardCode},https://konexnfc.com/t/${card.cardCode}`);
    }

    res.status(201).json({
      message: `${created.length} cards created`,
      count: created.length,
      cards: created,
      csv: csvRows.join("\n"),
    });
  });

  app.patch("/api/admin/cards/:id/assign", requireAdmin, async (req, res) => {
    const cardId = parseInt(req.params.id);
    if (isNaN(cardId)) return res.status(400).json({ message: "Invalid card ID" });
    const card = await storage.getCardById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const assignSchema = z.object({ userId: z.number().nullable(), profileId: z.number().nullable().optional() });
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const previousOwnerId = card.ownerId;
    const updated = await storage.updateCard(cardId, {
      ownerId: parsed.data.userId,
      profileId: parsed.data.profileId ?? null,
      status: parsed.data.userId ? "active" : "unassigned",
      activatedAt: parsed.data.userId ? new Date() : null,
    });

    await storage.createAssignmentHistory({
      cardId,
      previousOwnerId,
      newOwnerId: parsed.data.userId,
      actionType: parsed.data.userId ? "reassigned" : "deactivated",
      note: "Admin-initiated",
    });

    res.json(updated);
  });

  app.patch("/api/admin/cards/:id/status", requireAdmin, async (req, res) => {
    const cardId = parseInt(req.params.id);
    if (isNaN(cardId)) return res.status(400).json({ message: "Invalid card ID" });
    const card = await storage.getCardById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const statusSchema = z.object({ status: z.enum(["unassigned", "active", "suspended", "lost", "archived"]) });
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid status" });

    const updated = await storage.updateCard(cardId, { status: parsed.data.status });
    res.json(updated);
  });

  app.post("/api/admin/cards/fix-codes", requireAdmin, async (_req, res) => {
    const allCards = await storage.listAllCards();
    let fixed = 0;
    const skipped: string[] = [];
    for (const card of allCards) {
      const match = card.cardCode.match(/^KONEX-(\d{4,5})$/);
      if (match && card.productTier) {
        const prefix = TIER_PREFIX_MAP[card.productTier];
        if (prefix) {
          const newCode = `KONEX-${prefix}-${match[1].padStart(5, "0")}`;
          const existing = await storage.getCardByCode(newCode);
          if (existing) {
            skipped.push(`${card.cardCode} → ${newCode} (already exists)`);
            continue;
          }
          await storage.updateCard(card.id, { cardCode: newCode });
          fixed++;
        }
      }
    }
    res.json({ message: `Fixed ${fixed} card codes`, skipped });
  });

  app.get("/api/admin/cards/export", requireAdmin, async (_req, res) => {
    const allCards = await storage.listAllCards();
    const csv = ["card_code,product_tier,status,owner_id,profile_id,tap_count,qr_scan_count,nickname,activated_at,created_at"];
    for (const c of allCards) {
      csv.push(`${c.cardCode},${c.productTier},${c.status},${c.ownerId || ""},${c.profileId || ""},${c.tapCount},${c.qrScanCount},${c.nickname || ""},${c.activatedAt || ""},${c.createdAt || ""}`);
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=konex-cards-export.csv");
    res.send(csv.join("\n"));
  });

  app.get("/api/admin/cards/encoding-csv", requireAdmin, async (_req, res) => {
    const allCards = await storage.listAllCards();
    const csv = ["card_code,url"];
    for (const c of allCards) {
      csv.push(`${c.cardCode},https://konexnfc.com/t/${c.cardCode}`);
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=konex-encoding-csv.csv");
    res.send(csv.join("\n"));
  });

  // ==================== ORGANIZATION ROUTES ====================

  const requireOrgRole = (allowedRoles: string[]) => {
    return async (req: any, res: any, next: any) => {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const orgId = parseInt(req.params.orgId || req.params.id);
      if (isNaN(orgId)) return res.status(400).json({ message: "Invalid organization ID" });
      const member = await storage.getOrganizationMember(orgId, req.user.id);
      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ message: "You don't have permission for this action" });
      }
      (req as any).orgMember = member;
      next();
    };
  };

  app.post("/api/organizations", requireAuth, requireAdmin, async (req, res) => {
    const schema = z.object({
      name: z.string().min(2).max(100),
      slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
      planType: z.enum(["free", "pro", "business", "enterprise"]).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const existing = await storage.getOrganizationBySlug(parsed.data.slug);
    if (existing) return res.status(409).json({ message: "Organization slug is already taken" });

    const org = await storage.createOrganization({
      name: parsed.data.name,
      slug: parsed.data.slug,
      ownerUserId: req.user!.id,
      planType: parsed.data.planType || "free",
    });

    await storage.addOrganizationMember({
      organizationId: org.id,
      userId: req.user!.id,
      role: "owner",
      status: "active",
    });

    res.status(201).json(org);
  });

  app.get("/api/organizations", requireAuth, async (req, res) => {
    const orgs = await storage.getUserOrganizations(req.user!.id);
    res.json(orgs);
  });

  app.get("/api/organizations/:id", requireAuth, async (req, res) => {
    const orgId = parseInt(req.params.id);
    if (isNaN(orgId)) return res.status(400).json({ message: "Invalid ID" });
    const member = await storage.getOrganizationMember(orgId, req.user!.id);
    if (!member) return res.status(403).json({ message: "Not a member of this organization" });
    const org = await storage.getOrganization(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.json({ ...org, role: member.role });
  });

  app.patch("/api/organizations/:id", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const schema = z.object({
      name: z.string().min(2).max(100).optional(),
      logoUrl: z.string().nullable().optional(),
      planType: z.enum(["free", "pro", "business", "enterprise"]).optional(),
      brandingColor: z.string().nullable().optional(),
      defaultTheme: z.string().nullable().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
    const updated = await storage.updateOrganization(orgId, parsed.data);
    res.json(updated);
  });

  app.post("/api/organizations/:id/invite", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const schema = z.object({
      email: z.string().email(),
      role: z.enum(["admin", "manager", "member"]),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await storage.createOrganizationInvitation({
      organizationId: orgId,
      email: parsed.data.email,
      role: parsed.data.role,
      token,
      status: "pending",
      invitedByUserId: req.user!.id,
      expiresAt,
    });

    const org = await storage.getOrganization(orgId);
    const inviterProfile = await storage.getProfile(req.user!.id);
    const inviterName = inviterProfile?.name || req.user!.email;
    const baseUrl = process.env.NODE_ENV === "production" ? "https://konexnfc.com" : `${req.protocol}://${req.get("host")}`;
    const acceptUrl = `${baseUrl}/dashboard/organization?invite=${token}`;

    sendOrganizationInviteEmail(
      parsed.data.email,
      org?.name || "an organization",
      inviterName,
      parsed.data.role,
      acceptUrl
    ).catch(err => console.error("[EMAIL] Invite email failed:", err));

    res.status(201).json(invitation);
  });

  app.post("/api/organizations/accept-invite", requireAuth, async (req, res) => {
    const schema = z.object({ token: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid token" });

    const invitation = await storage.getOrganizationInvitationByToken(parsed.data.token);
    if (!invitation) return res.status(404).json({ message: "Invitation not found" });
    if (invitation.status !== "pending") return res.status(400).json({ message: "Invitation is no longer valid" });
    if (new Date() > new Date(invitation.expiresAt)) {
      await storage.updateOrganizationInvitationStatus(invitation.id, "expired");
      return res.status(400).json({ message: "Invitation has expired" });
    }

    const existingMember = await storage.getOrganizationMember(invitation.organizationId, req.user!.id);
    if (existingMember) return res.status(400).json({ message: "Already a member of this organization" });

    await storage.addOrganizationMember({
      organizationId: invitation.organizationId,
      userId: req.user!.id,
      role: invitation.role,
      status: "active",
    });

    await storage.updateOrganizationInvitationStatus(invitation.id, "accepted");
    res.json({ message: "Invitation accepted" });
  });

  app.get("/api/organizations/:id/invitations", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const invitations = await storage.getOrganizationInvitations(orgId);
    res.json(invitations);
  });

  app.delete("/api/organizations/:id/invitations/:invitationId", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const invitationId = parseInt(req.params.invitationId);
    if (isNaN(invitationId)) return res.status(400).json({ message: "Invalid invitation ID" });
    const invitations = await storage.getOrganizationInvitations(orgId);
    const target = invitations.find(i => i.id === invitationId);
    if (!target) return res.status(404).json({ message: "Invitation not found in this organization" });
    await storage.updateOrganizationInvitationStatus(invitationId, "cancelled");
    res.json({ message: "Invitation cancelled" });
  });

  app.post("/api/organizations/:id/invitations/:invitationId/resend", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const invitationId = parseInt(req.params.invitationId);
    if (isNaN(invitationId)) return res.status(400).json({ message: "Invalid invitation ID" });
    const invitations = await storage.getOrganizationInvitations(orgId);
    const target = invitations.find(i => i.id === invitationId);
    if (!target) return res.status(404).json({ message: "Invitation not found in this organization" });
    if (target.status !== "pending") return res.status(400).json({ message: "Only pending invitations can be resent" });

    const org = await storage.getOrganization(orgId);
    const inviterProfile = await storage.getProfile(req.user!.id);
    const inviterName = inviterProfile?.name || req.user!.email;
    const baseUrl = process.env.NODE_ENV === "production" ? "https://konexnfc.com" : `${req.protocol}://${req.get("host")}`;
    const acceptUrl = `${baseUrl}/dashboard/organization?invite=${target.token}`;

    await sendOrganizationInviteEmail(
      target.email,
      org?.name || "an organization",
      inviterName,
      target.role,
      acceptUrl
    );

    res.json({ message: "Invitation email resent" });
  });

  app.get("/api/organizations/:id/members", requireAuth, requireOrgRole(["owner", "admin", "manager", "member"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const members = await storage.getOrganizationMembers(orgId);
    res.json(members);
  });

  app.patch("/api/organizations/:id/members/:memberId", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const memberId = parseInt(req.params.memberId);
    if (isNaN(memberId)) return res.status(400).json({ message: "Invalid member ID" });
    const schema = z.object({ role: z.enum(["admin", "manager", "member"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid role" });
    const members = await storage.getOrganizationMembers(orgId);
    const target = members.find(m => m.id === memberId);
    if (!target) return res.status(404).json({ message: "Member not found in this organization" });
    if (target.role === "owner") return res.status(403).json({ message: "Cannot change owner role" });
    const updated = await storage.updateOrganizationMemberRole(memberId, parsed.data.role);
    res.json(updated);
  });

  app.delete("/api/organizations/:id/members/:memberId", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const memberId = parseInt(req.params.memberId);
    if (isNaN(memberId)) return res.status(400).json({ message: "Invalid member ID" });
    const members = await storage.getOrganizationMembers(orgId);
    const target = members.find(m => m.id === memberId);
    if (!target) return res.status(404).json({ message: "Member not found in this organization" });
    if (target.role === "owner") return res.status(403).json({ message: "Cannot remove organization owner" });
    await storage.removeOrganizationMember(memberId);
    res.json({ message: "Member removed" });
  });

  app.get("/api/organizations/:id/cards", requireAuth, requireOrgRole(["owner", "admin", "manager", "member"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const orgCards = await storage.getOrganizationCards(orgId);
    res.json(orgCards);
  });

  app.post("/api/organizations/:id/cards", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const schema = z.object({
      cardId: z.number().optional(),
      cardCode: z.string().optional(),
      assignedUserId: z.number().nullable().optional(),
    }).refine(d => d.cardId || d.cardCode, { message: "Provide cardId or cardCode" });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    let card;
    if (parsed.data.cardCode) {
      card = await storage.getCardByCode(parsed.data.cardCode.trim().toUpperCase());
    } else if (parsed.data.cardId) {
      card = await storage.getCardById(parsed.data.cardId);
    }
    if (!card) return res.status(404).json({ message: "Card not found. Check the card code and try again." });

    if (parsed.data.assignedUserId) {
      const member = await storage.getOrganizationMember(orgId, parsed.data.assignedUserId);
      if (!member) return res.status(400).json({ message: "User is not a member of this organization" });
    }

    const orgCard = await storage.assignCardToOrganization({
      organizationId: orgId,
      cardId: card.id,
      assignedUserId: parsed.data.assignedUserId || null,
    });
    res.status(201).json(orgCard);
  });

  app.patch("/api/organizations/:id/cards/:orgCardId", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgCardId = parseInt(req.params.orgCardId);
    const orgId = parseInt(req.params.id);
    if (isNaN(orgCardId) || isNaN(orgId)) return res.status(400).json({ message: "Invalid ID" });
    const schema = z.object({ assignedUserId: z.number().nullable() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });
    if (parsed.data.assignedUserId !== null) {
      const member = await storage.getOrganizationMember(orgId, parsed.data.assignedUserId);
      if (!member) return res.status(400).json({ message: "User is not a member of this organization" });
    }
    const updated = await storage.updateOrganizationCard(orgCardId, { assignedUserId: parsed.data.assignedUserId });
    res.json(updated);
  });

  app.delete("/api/organizations/:id/cards/:orgCardId", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
    const orgCardId = parseInt(req.params.orgCardId);
    if (isNaN(orgCardId)) return res.status(400).json({ message: "Invalid ID" });
    await storage.removeOrganizationCard(orgCardId);
    res.json({ message: "Card removed from organization" });
  });

  app.get("/api/organizations/:id/member-analytics", requireAuth, requireOrgRole(["owner", "admin", "manager"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const data = await storage.getOrganizationMemberAnalytics(orgId);
    res.json(data);
  });

  app.post("/api/org/cards/assign", requireAuth, async (req, res) => {
    const schema = z.object({
      orgId: z.number(),
      cardCode: z.string().optional(),
      cardId: z.number().optional(),
      assignedUserId: z.number(),
    }).refine(d => d.cardId || d.cardCode, { message: "Provide cardId or cardCode" });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const member = await storage.getOrganizationMember(parsed.data.orgId, req.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let card;
    if (parsed.data.cardCode) {
      card = await storage.getCardByCode(parsed.data.cardCode.trim().toUpperCase());
    } else if (parsed.data.cardId) {
      card = await storage.getCardById(parsed.data.cardId);
    }
    if (!card) return res.status(404).json({ message: "Card not found" });

    const assignee = await storage.getOrganizationMember(parsed.data.orgId, parsed.data.assignedUserId);
    if (!assignee) return res.status(400).json({ message: "User is not a member of this organization" });

    const orgCards = await storage.getOrganizationCards(parsed.data.orgId);
    const existingOrgCard = orgCards.find(oc => oc.cardId === card!.id);

    if (existingOrgCard) {
      const updated = await storage.updateOrganizationCard(existingOrgCard.id, { assignedUserId: parsed.data.assignedUserId });
      return res.json({ message: "Card assigned to member", orgCard: updated });
    }

    const orgCard = await storage.assignCardToOrganization({
      organizationId: parsed.data.orgId,
      cardId: card.id,
      assignedUserId: parsed.data.assignedUserId,
    });
    res.status(201).json({ message: "Card assigned to member", orgCard });
  });

  app.patch("/api/org/cards/reassign", requireAuth, async (req, res) => {
    const schema = z.object({
      orgId: z.number(),
      orgCardId: z.number(),
      assignedUserId: z.number(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const member = await storage.getOrganizationMember(parsed.data.orgId, req.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const orgCard = await storage.getOrganizationCardById(parsed.data.orgCardId);
    if (!orgCard || orgCard.organizationId !== parsed.data.orgId) {
      return res.status(404).json({ message: "Organization card not found" });
    }

    const assignee = await storage.getOrganizationMember(parsed.data.orgId, parsed.data.assignedUserId);
    if (!assignee) return res.status(400).json({ message: "User is not a member of this organization" });

    const updated = await storage.updateOrganizationCard(parsed.data.orgCardId, { assignedUserId: parsed.data.assignedUserId });
    res.json({ message: "Card reassigned", orgCard: updated });
  });

  app.patch("/api/org/cards/suspend", requireAuth, async (req, res) => {
    const schema = z.object({
      orgId: z.number(),
      orgCardId: z.number(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const member = await storage.getOrganizationMember(parsed.data.orgId, req.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const orgCard = await storage.getOrganizationCardById(parsed.data.orgCardId);
    if (!orgCard || orgCard.organizationId !== parsed.data.orgId) {
      return res.status(404).json({ message: "Organization card not found" });
    }

    await storage.updateCard(orgCard.cardId, { status: "suspended" });
    res.json({ message: "Card suspended" });
  });

  app.patch("/api/org/cards/lost", requireAuth, async (req, res) => {
    const schema = z.object({
      orgId: z.number(),
      orgCardId: z.number(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });

    const member = await storage.getOrganizationMember(parsed.data.orgId, req.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const orgCard = await storage.getOrganizationCardById(parsed.data.orgCardId);
    if (!orgCard || orgCard.organizationId !== parsed.data.orgId) {
      return res.status(404).json({ message: "Organization card not found" });
    }

    await storage.updateCard(orgCard.cardId, { status: "lost" });
    await storage.updateOrganizationCard(parsed.data.orgCardId, { assignedUserId: null });
    res.json({ message: "Card marked as lost and unassigned" });
  });

  app.get("/api/organizations/:id/analytics", requireAuth, requireOrgRole(["owner", "admin", "manager"]), async (req, res) => {
    const orgId = parseInt(req.params.id);
    const analytics = await storage.getOrganizationAnalytics(orgId);
    res.json(analytics);
  });

  // ─── PAYPAL & CHECKOUT ROUTES ───────────────────────────────────────────────

  // Simple in-memory rate limiter (per IP, resets on server restart)
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(key);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= maxRequests) return false;
    entry.count++;
    return true;
  }

  // Helper: generate unique card code for a tier
  async function generateCardCode(tier: string): Promise<string> {
    const prefix =
      tier === "basic" ? "B" : tier === "premium" ? "P" : tier === "elite" ? "E" : "C";
    const rows = await storage.listAllCards({ productTier: tier });
    const max = rows.reduce((acc, c) => {
      const parts = c.cardCode.split("-");
      const num = parseInt(parts[parts.length - 1] || "0", 10);
      return num > acc ? num : acc;
    }, 0);
    const next = String(max + 1).padStart(5, "0");
    return `KONEX-${prefix}-${next}`;
  }

  // Public: PayPal client config for frontend
  app.get("/api/config/paypal", (_req, res) => {
    res.json({
      clientId: getPayPalClientId() || null,
      env: process.env.PAYPAL_ENV || "sandbox",
      configured: isPayPalConfigured(),
    });
  });

  // Public: Create PayPal order
  app.post("/api/paypal/create-order", async (req, res) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
    if (!checkRateLimit(`create-order:${ip}`, 5, 60_000)) {
      return res.status(429).json({ message: "Too many requests. Please wait a moment and try again." });
    }

    if (!isPayPalConfigured()) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    const schema = z.object({
      sku: z.string(),
      engravingText: z.string().max(60).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "SKU is required" });
    }

    const { sku, engravingText } = parsed.data;
    const item = SKU_CATALOG[sku];
    if (!item) {
      return res.status(400).json({ message: "Invalid product SKU" });
    }

    try {
      const appBase =
        process.env.APP_BASE_URL ||
        (process.env.NODE_ENV === "production"
          ? "https://konexnfc.com"
          : `http://localhost:5000`);

      const returnUrl = `${appBase}/checkout/success`;
      const cancelUrl = `${appBase}/checkout/cancel`;

      const { orderId: paypalOrderId, approveUrl } = await createPayPalOrder(
        sku,
        returnUrl,
        cancelUrl,
        engravingText,
      );

      // Persist draft order
      const order = await storage.createOrder({
        paypalOrderId,
        status: "created",
        amount: item.amount,
        currency: item.currency,
        sku,
        productType: item.productType,
        userId: req.isAuthenticated() ? req.user!.id : null,
      });

      res.json({ paypalOrderId, approveUrl, orderId: order.id });
    } catch (err: any) {
      console.error("[paypal] create-order error:", err.message);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  // Public: Capture PayPal order after approval
  app.post("/api/paypal/capture-order", async (req, res) => {
    if (!isPayPalConfigured()) {
      return res.status(503).json({ message: "Payment system not configured" });
    }

    const schema = z.object({ paypalOrderId: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "paypalOrderId is required" });
    }

    const { paypalOrderId } = parsed.data;

    // Idempotency: if already captured, return existing token
    const existingOrder = await storage.getOrderByPaypalId(paypalOrderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (existingOrder.status === "captured" || existingOrder.status === "activation_pending") {
      // Return existing activation token
      const rows = await storage.listOrders(1);
      // Re-issue token lookup
      const existingToken = await storage
        .getActivationTokenByToken(existingOrder.id.toString())
        .catch(() => undefined);
      return res.json({ success: true, orderId: existingOrder.id, alreadyCaptured: true });
    }
    if (existingOrder.status === "activated") {
      return res.status(409).json({ message: "Order already activated" });
    }

    try {
      const { captureId, email, name } = await capturePayPalOrder(paypalOrderId);

      const updatedOrder = await storage.updateOrder(existingOrder.id, {
        status: "activation_pending",
        paypalCaptureId: captureId,
        customerEmail: email,
        customerName: name,
      });

      // Generate secure activation token (7-day expiry)
      const rawToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await storage.createActivationToken({
        orderId: updatedOrder.id,
        token: rawToken,
        expiresAt,
      });

      // Send activation email (best-effort, non-blocking)
      const item = SKU_CATALOG[existingOrder.sku];
      if (updatedOrder.customerEmail) {
        sendActivationEmail(
          updatedOrder.customerEmail,
          updatedOrder.customerName,
          rawToken,
          item?.name || existingOrder.sku,
        ).catch((e) => console.error("[email] activation send failed:", e));
      }

      console.log(`[checkout] Order #${updatedOrder.id} captured; activation token issued`);
      res.json({ success: true, activationToken: rawToken, orderId: updatedOrder.id });
    } catch (err: any) {
      console.error("[paypal] capture-order error:", err.message);
      await storage.updateOrder(existingOrder.id, { status: "failed" }).catch(() => {});
      res.status(500).json({ message: "Payment capture failed" });
    }
  });

  // Public: PayPal Webhook (raw body required for signature verification)
  app.post("/api/paypal/webhook", async (req, res) => {
    const rawBody = (req as any).rawBody?.toString() || JSON.stringify(req.body);
    const webhookId = process.env.PAYPAL_WEBHOOK_ID || "";
    const paypalEventId = req.headers["paypal-transmission-id"] as string;

    if (!paypalEventId) {
      return res.status(400).json({ message: "Missing PayPal headers" });
    }

    // Idempotency check
    const existing = await storage.getWebhookEventByPaypalId(paypalEventId);
    if (existing) {
      return res.status(200).json({ message: "Already processed" });
    }

    // Verify signature if webhook ID is configured
    if (webhookId && isPayPalConfigured()) {
      const valid = await verifyWebhookSignature(
        req.headers as Record<string, string>,
        rawBody,
        webhookId,
      );
      if (!valid) {
        console.warn("[paypal] webhook signature verification failed");
        return res.status(401).json({ message: "Invalid webhook signature" });
      }
    }

    const event = req.body as { event_type: string; resource?: any; id?: string };

    // Store event for replay safety
    await storage.createWebhookEvent({
      paypalEventId,
      eventType: event.event_type || "unknown",
      payloadJson: req.body,
    });

    // Process known event types
    try {
      const allOrders = await storage.listOrders(500);

      if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const captureId = event.resource?.id;
        if (captureId) {
          const order = allOrders.find((o) => o.paypalCaptureId === captureId);
          if (order && !["activated", "shipped"].includes(order.status)) {
            await storage.updateOrder(order.id, { status: "activation_pending" });
            console.log(`[webhook] CAPTURE.COMPLETED: order #${order.id} → activation_pending`);
          }
        }
      }

      if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
        const captureId = event.resource?.id;
        if (captureId) {
          const order = allOrders.find((o) => o.paypalCaptureId === captureId);
          if (order) {
            await storage.updateOrder(order.id, { status: "refunded", refundedAt: new Date() });
            console.log(`[webhook] CAPTURE.REFUNDED: order #${order.id} → refunded`);
            if (order.customerEmail) {
              sendRefundEmail(
                order.customerEmail,
                order.customerName || "",
                order.productType,
                order.amount,
                order.currency,
              ).catch((e) => console.error("[email] refund notification failed:", e));
            }
          }
        }
      }

      if (
        event.event_type === "PAYMENT.CAPTURE.DENIED" ||
        event.event_type === "CHECKOUT.PAYMENT-APPROVAL.REVERSED"
      ) {
        const paypalOrderId =
          event.resource?.supplementary_data?.related_ids?.order_id ||
          event.resource?.id;
        if (paypalOrderId) {
          const order = allOrders.find(
            (o) => o.paypalOrderId === paypalOrderId || o.paypalCaptureId === paypalOrderId,
          );
          if (order && !["activated", "shipped"].includes(order.status)) {
            await storage.updateOrder(order.id, { status: "failed" });
            console.log(`[webhook] ${event.event_type}: order #${order.id} → failed`);
          }
        }
      }

      if (event.event_type === "CUSTOMER.DISPUTE.CREATED") {
        const disputedCaptureId = event.resource?.disputed_transactions?.[0]?.seller_transaction_id;
        if (disputedCaptureId) {
          const order = allOrders.find((o) => o.paypalCaptureId === disputedCaptureId);
          if (order) {
            await storage.updateOrder(order.id, { status: "disputed", disputedAt: new Date() });
            console.warn(`[webhook] DISPUTE.CREATED: order #${order.id} → disputed`);

            const adminEmail = process.env.ADMIN_EMAIL || "info@konexnfc.com";
            const reason = event.resource?.reason || undefined;
            sendAdminDisputeAlert({
              adminEmail,
              orderId: order.id,
              customerEmail: order.customerEmail || "unknown",
              amount: order.amount,
              reason,
            }).catch((e) => console.error("[email] dispute alert failed:", e));
          }
        }
      }
    } catch (err: any) {
      console.error("[paypal] webhook processing error:", err.message);
    }

    res.status(200).json({ received: true });
  });

  // Public: Validate activation token info
  app.get("/api/checkout/token-info", async (req, res) => {
    const token = req.query.token as string;
    if (!token) return res.status(400).json({ message: "Token required" });

    const tokenRecord = await storage.getActivationTokenByToken(token);
    if (!tokenRecord) return res.status(404).json({ message: "Token not found" });
    if (tokenRecord.consumedAt) return res.status(410).json({ message: "Token already used" });
    if (new Date() > tokenRecord.expiresAt) return res.status(410).json({ message: "Token expired" });

    const order = await storage.getOrderById(tokenRecord.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = SKU_CATALOG[order.sku];
    res.json({
      valid: true,
      sku: order.sku,
      productName: item?.name || order.sku,
      productType: order.productType,
      tier: item?.tier || null,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
    });
  });

  // Public: Complete activation
  app.post("/api/checkout/activate", async (req, res) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
    if (!checkRateLimit(`activate:${ip}`, 3, 60_000)) {
      return res.status(429).json({ message: "Too many attempts. Please wait a minute and try again." });
    }

    const schema = z.object({
      token: z.string(),
      displayName: z.string().min(1).max(100),
      title: z.string().max(100).optional(),
      company: z.string().max(100).optional(),
      phone: z.string().max(30).optional(),
      email: z.string().email().optional().or(z.literal("")),
      website: z.string().url().optional().or(z.literal("")),
      bio: z.string().max(500).optional(),
      slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
      password: z.string().min(8).optional(),
      shippingAddress: z.string().max(400).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0]?.message || "Invalid input" });
    }

    const { token, displayName, title, company, phone, email, website, bio, slug, password, shippingAddress } = parsed.data;

    const tokenRecord = await storage.getActivationTokenByToken(token);
    if (!tokenRecord) return res.status(404).json({ message: "Token not found" });
    if (tokenRecord.consumedAt) return res.status(410).json({ message: "Token already used" });
    if (new Date() > tokenRecord.expiresAt) return res.status(410).json({ message: "Token expired" });

    const order = await storage.getOrderById(tokenRecord.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Check slug availability
    const existingSlug = await storage.getProfileBySlug(slug);
    if (existingSlug) return res.status(409).json({ message: "That URL is already taken. Please choose another." });

    try {
      // Create or find user
      let user;
      const contactEmail = email || order.customerEmail;

      if (contactEmail) {
        user = await storage.getUserByEmail(contactEmail);
      }

      if (!user) {
        if (!contactEmail) {
          return res.status(400).json({ message: "Email is required to create your account" });
        }
        const hashedPw = await hashPassword(password || crypto.randomBytes(16).toString("hex"));
        user = await storage.createUser({
          email: contactEmail,
          password: hashedPw,
        });
      }

      // Create profile
      const profile = await storage.createProfile({
        userId: user.id,
        name: displayName,
        title: title || null,
        company: company || null,
        bio: bio || null,
        slug,
        links: {
          phone: phone || undefined,
          email: contactEmail || undefined,
          website: website || undefined,
        },
        theme: "dark",
      });

      // Auto-generate NFC card for physical products
      if (order.productType === "physical_card") {
        const item = SKU_CATALOG[order.sku];
        const tier = item?.tier || "basic";
        const cardCode = await generateCardCode(tier);
        await storage.createCard({
          cardCode,
          ownerId: user.id,
          profileId: profile.id,
          productTier: tier,
          status: "active",
          activatedAt: new Date(),
        });
      }

      // Consume token + mark order activated (save shipping address if provided)
      await storage.markActivationTokenConsumed(tokenRecord.id);
      await storage.updateOrder(order.id, {
        status: "activated",
        userId: user.id,
        ...(shippingAddress ? { shippingAddress } : {}),
      });

      // Fire post-activation emails (non-blocking)
      const orderItem = SKU_CATALOG[order.sku];
      const recipientEmail = contactEmail!;

      sendWelcomeEmail(
        recipientEmail,
        displayName,
        profile.slug,
        order.productType,
      ).catch((e) => console.error("[email] welcome send failed:", e));

      if (order.productType === "physical_card") {
        const adminEmail = process.env.ADMIN_EMAIL || "info@konexnfc.com";
        sendAdminOrderNotification({
          adminEmail,
          orderId: order.id,
          productName: orderItem?.name || order.sku,
          customerName: displayName,
          customerEmail: recipientEmail,
          sku: order.sku,
          amount: order.amount,
          shippingAddress: shippingAddress,
        }).catch((e) => console.error("[email] admin notification failed:", e));
      }

      console.log(`[checkout] Order #${order.id} fully activated for ${recipientEmail}`);
      res.json({
        success: true,
        profileSlug: profile.slug,
        email: user.email,
        message: "Profile activated successfully",
      });
    } catch (err: any) {
      console.error("[checkout] activate error:", err.message);
      res.status(500).json({ message: "Activation failed. Please contact support." });
    }
  });

  // Admin: list orders
  app.get("/api/admin/orders", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) return res.sendStatus(403);
    const orderList = await storage.listOrders(200);
    res.json(orderList);
  });

  // Admin: mark order as shipped
  app.post("/api/admin/orders/ship", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) return res.sendStatus(403);

    const schema = z.object({
      orderId: z.number().int().positive(),
      trackingInfo: z.string().max(200).optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const { orderId, trackingInfo } = parsed.data;
    const order = await storage.getOrderById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.productType !== "physical_card") {
      return res.status(400).json({ message: "Only physical card orders can be shipped" });
    }

    const item = SKU_CATALOG[order.sku];
    await storage.updateOrder(orderId, {
      status: "shipped",
      shippedAt: new Date(),
    });

    if (order.customerEmail) {
      sendShippedEmail(
        order.customerEmail,
        order.customerName || "Customer",
        item?.name || order.sku,
        trackingInfo,
      ).catch((e) => console.error("[email] shipped notification failed:", e));
    }

    console.log(`[admin] Order #${orderId} marked as shipped by admin ${req.user.id}`);
    res.json({ success: true });
  });

  // Public: download vCard for a profile
  app.get("/api/public/vcard/:slug", async (req, res) => {
    const { slug } = req.params;
    const profile = await storage.getProfileBySlug(slug);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const links = (profile.links as Record<string, string | undefined>) || {};
    const name = profile.name || "";
    const nameParts = name.trim().split(/\s+/);
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const firstName = nameParts.slice(0, nameParts.length > 1 ? -1 : 1).join(" ");

    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${name}`,
      `N:${lastName};${firstName};;;`,
    ];

    if (profile.title || profile.company) {
      if (profile.title) lines.push(`TITLE:${profile.title}`);
      if (profile.company) lines.push(`ORG:${profile.company}`);
    }
    if (links.phone) lines.push(`TEL;TYPE=CELL:${links.phone}`);
    if (links.email) lines.push(`EMAIL:${links.email}`);
    if (links.website) lines.push(`URL:${links.website}`);
    if (links.linkedin) lines.push(`URL;TYPE=LinkedIn:${links.linkedin}`);
    if (profile.bio) lines.push(`NOTE:${profile.bio.replace(/\n/g, "\\n")}`);
    if (profile.photoUrl) lines.push(`PHOTO;VALUE=URI:${profile.photoUrl}`);

    const appBase = process.env.APP_BASE_URL || "https://konexnfc.com";
    lines.push(`URL;TYPE=Profile:${appBase}/u/${slug}`);
    lines.push("END:VCARD");

    const vcf = lines.join("\r\n");
    const filename = `${slug}.vcf`;
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(vcf);
  });

  return httpServer;
}
