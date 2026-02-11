import { db } from "./db";
import {
  users, profiles, leads, siteSettings,
  type User, type InsertUser,
  type Profile, type InsertProfile, type UpdateProfileRequest,
  type Lead, type InsertLead,
  type SiteSetting
} from "@shared/schema";
import { eq, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setResetToken(userId: number, token: string, expiry: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  updatePassword(userId: number, hashedPassword: string): Promise<void>;
  clearResetToken(userId: number): Promise<void>;

  // Profile
  getProfile(userId: number): Promise<Profile | undefined>;
  getProfileBySlug(slug: string): Promise<Profile | undefined>;
  getProfileById(profileId: number): Promise<Profile | undefined>;
  incrementProfileViews(profileId: number): Promise<void>;
  createProfile(profile: InsertProfile & { userId: number }): Promise<Profile>;
  updateProfile(userId: number, updates: UpdateProfileRequest): Promise<Profile>;
  updateProfileById(profileId: number, updates: UpdateProfileRequest): Promise<Profile>;

  // Leads
  createLead(lead: InsertLead & { profileId: number }): Promise<Lead>;
  getLeadsByProfile(profileId: number): Promise<Lead[]>;

  // Site Settings
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<SiteSetting>;

  // Admin
  listAllUsers(): Promise<User[]>;
  listAllProfiles(): Promise<Profile[]>;
  listAllLeads(): Promise<(Lead & { profileName?: string })[]>;
  deleteUser(userId: number): Promise<void>;
  getAdminAnalytics(): Promise<{ totalUsers: number; totalProfiles: number; totalLeads: number; totalViews: number }>;
}

export class DatabaseStorage implements IStorage {
  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(sql`LOWER(${users.email}) = LOWER(${email})`);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async setResetToken(userId: number, token: string, expiry: Date): Promise<void> {
    await db.update(users).set({ resetToken: token, resetTokenExpiry: expiry }).where(eq(users.id, userId));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword, resetToken: null, resetTokenExpiry: null }).where(eq(users.id, userId));
  }

  async clearResetToken(userId: number): Promise<void> {
    await db.update(users).set({ resetToken: null, resetTokenExpiry: null }).where(eq(users.id, userId));
  }

  // Profile
  async getProfile(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileBySlug(slug: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.slug, slug));
    return profile;
  }

  async incrementProfileViews(profileId: number): Promise<void> {
    await db
      .update(profiles)
      .set({ 
        views: sql`${profiles.views} + 1` 
      })
      .where(eq(profiles.id, profileId));
  }

  async createProfile(profile: InsertProfile & { userId: number }): Promise<Profile> {
    const [newProfile] = await db.insert(profiles).values(profile).returning();
    return newProfile;
  }

  async updateProfile(userId: number, updates: UpdateProfileRequest): Promise<Profile> {
    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
    return updated;
  }

  // Leads
  async createLead(lead: InsertLead & { profileId: number }): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async getLeadsByProfile(profileId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.profileId, profileId))
      .orderBy(desc(leads.createdAt));
  }

  // Profile by ID
  async getProfileById(profileId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, profileId));
    return profile;
  }

  async updateProfileById(profileId: number, updates: UpdateProfileRequest): Promise<Profile> {
    const [updated] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, profileId))
      .returning();
    return updated;
  }

  // Site Settings
  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting?.value || null;
  }

  async setSetting(key: string, value: string): Promise<SiteSetting> {
    const existing = await this.getSetting(key);
    if (existing !== null) {
      const [updated] = await db
        .update(siteSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(siteSettings).values({ key, value }).returning();
    return created;
  }

  // Admin
  async listAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async listAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles).orderBy(desc(profiles.createdAt));
  }

  async listAllLeads(): Promise<(Lead & { profileName?: string })[]> {
    const rows = await db
      .select({
        id: leads.id,
        profileId: leads.profileId,
        name: leads.name,
        email: leads.email,
        telephone: leads.telephone,
        whatsapp: leads.whatsapp,
        company: leads.company,
        note: leads.note,
        source: leads.source,
        createdAt: leads.createdAt,
        profileName: profiles.name,
      })
      .from(leads)
      .leftJoin(profiles, eq(leads.profileId, profiles.id))
      .orderBy(desc(leads.createdAt));
    return rows.map(r => ({ ...r, profileName: r.profileName ?? undefined }));
  }

  async deleteUser(userId: number): Promise<void> {
    const profile = await this.getProfile(userId);
    if (profile) {
      await db.delete(leads).where(eq(leads.profileId, profile.id));
      await db.delete(profiles).where(eq(profiles.userId, userId));
    }
    await db.delete(users).where(eq(users.id, userId));
  }

  async getAdminAnalytics(): Promise<{ totalUsers: number; totalProfiles: number; totalLeads: number; totalViews: number }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [profileCount] = await db.select({ count: count() }).from(profiles);
    const [leadCount] = await db.select({ count: count() }).from(leads);
    const [viewSum] = await db.select({ total: sql<number>`COALESCE(SUM(${profiles.views}), 0)` }).from(profiles);
    return {
      totalUsers: userCount.count,
      totalProfiles: profileCount.count,
      totalLeads: leadCount.count,
      totalViews: Number(viewSum.total),
    };
  }
}

export const storage = new DatabaseStorage();
