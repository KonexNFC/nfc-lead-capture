import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth setup
  setupAuth(app);

  // Seed DB
  seedDatabase().catch(console.error);

  // === Profiles ===
  
  // Get my profile
  app.get(api.profiles.getMine.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profile = await storage.getProfile(req.user.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  });

  // Update my profile
  app.put(api.profiles.updateMine.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Check if profile exists, if not create one
    let profile = await storage.getProfile(req.user.id);
    const input = api.profiles.updateMine.input.parse(req.body);

    if (!profile) {
      // Create with default slug if not provided? 
      // For MVP assume user provides enough info or we handle it in frontend
      if (!input.slug) {
        return res.status(400).json({ message: "Slug is required for new profile" });
      }
      // Ensure name is present for creation
      if (!input.name) {
         return res.status(400).json({ message: "Name is required for new profile" });
      }
      
      try {
        profile = await storage.createProfile({
          ...input,
          userId: req.user.id,
          name: input.name,
          slug: input.slug
        });
        return res.json(profile);
      } catch (e) {
        // Handle unique slug error
        return res.status(400).json({ message: "Slug might be taken" });
      }
    }

    const updated = await storage.updateProfile(req.user.id, input);
    res.json(updated);
  });

  // Check slug availability
  app.get(api.profiles.checkSlug.path, async (req, res) => {
    const { slug } = req.params;
    const profile = await storage.getProfileBySlug(slug);
    res.json({ available: !profile });
  });

  // Public Profile View
  app.get(api.profiles.getBySlug.path, async (req, res) => {
    const { slug } = req.params;
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
      email: input.email,
      company: input.company,
      note: input.note,
      source: input.source,
      profileId: profile.id
    });

    // TODO: Send email notification here (mock for MVP)
    console.log(`[EMAIL MOCK] Notification to profile owner ${profile.userId}: New lead from ${lead.name} (${lead.email})`);

    res.status(201).json(lead);
  });

  // List Leads (Private)
  app.get(api.leads.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const profile = await storage.getProfile(req.user.id);
    if (!profile) return res.json([]); // No profile = no leads

    const leads = await storage.getLeadsByProfile(profile.id);
    res.json(leads);
  });

  // Analytics
  app.get(api.leads.stats.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const profile = await storage.getProfile(req.user.id);
    if (!profile) return res.json({ totalLeads: 0, recentLeads: [] });

    const leads = await storage.getLeadsByProfile(profile.id);
    
    res.json({
      totalLeads: leads.length,
      recentLeads: leads.slice(0, 5), // Last 5
      totalViews: profile.views
    });
  });

  return httpServer;
}
