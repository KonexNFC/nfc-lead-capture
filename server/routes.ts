import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { sendLeadNotificationEmail } from "./email";

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

  await ensureAdminAccount();
}

async function ensureAdminAccount() {
  const adminEmail = "info@konexnfc.com";
  const adminUser = await storage.getUserByEmail(adminEmail);
  if (adminUser) {
    const hashedPassword = await hashPassword("Milan2020");
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ password: hashedPassword, isAdmin: true }).where(eq(users.id, adminUser.id));
    console.log("Admin account ensured for", adminEmail);
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
    
    // Increment views
    await storage.incrementProfileViews(profile.id);
    
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

    const card = await storage.getCardByCode(cardCode);
    if (!card) return res.status(404).json({ message: "Card not found" });

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

    const cardsToCreate = [];
    const duplicateCheck: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const seqNum = String(start + i).padStart(5, "0");
      const cardCode = `KONEX-${tierCode}-${seqNum}`;
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

  return httpServer;
}
