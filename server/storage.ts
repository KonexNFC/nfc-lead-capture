import { db } from "./db";
import {
  users, profiles, leads, siteSettings,
  type User, type InsertUser,
  type Profile, type InsertProfile, type UpdateProfileRequest,
  type Lead, type InsertLead,
  type SiteSetting
} from "@shared/schema";
import { eq, desc, sql, count, gte, and } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setResetToken(userId: number, token: string, expiry: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  updatePassword(userId: number, hashedPassword: string): Promise<void>;
  updateEmail(userId: number, email: string): Promise<void>;
  clearResetToken(userId: number): Promise<void>;

  // Profile
  getProfile(userId: number): Promise<Profile | undefined>;
  getProfilesByUserId(userId: number): Promise<Profile[]>;
  getProfileBySlug(slug: string): Promise<Profile | undefined>;
  getProfileById(profileId: number): Promise<Profile | undefined>;
  incrementProfileViews(profileId: number): Promise<void>;
  createProfile(profile: InsertProfile & { userId: number }): Promise<Profile>;
  updateProfile(userId: number, updates: UpdateProfileRequest): Promise<Profile>;
  updateProfileById(profileId: number, updates: UpdateProfileRequest): Promise<Profile>;
  deleteProfile(profileId: number): Promise<void>;

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
  getGrowthData(days: number): Promise<{ date: string; users: number; leads: number; views: number }[]>;
  getTopProfiles(limit: number): Promise<{ id: number; name: string; slug: string; views: number; leadCount: number; photoUrl: string | null }[]>;
  getRecentActivity(limit: number): Promise<{ type: string; description: string; timestamp: string; meta?: Record<string, any> }[]>;
  toggleAdmin(userId: number, isAdmin: boolean): Promise<void>;
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

  async updateEmail(userId: number, email: string): Promise<void> {
    await db.update(users).set({ email }).where(eq(users.id, userId));
  }

  async clearResetToken(userId: number): Promise<void> {
    await db.update(users).set({ resetToken: null, resetTokenExpiry: null }).where(eq(users.id, userId));
  }

  // Profile
  async getProfile(userId: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfilesByUserId(userId: number): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.userId, userId)).orderBy(desc(profiles.createdAt));
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

  async deleteProfile(profileId: number): Promise<void> {
    await db.delete(leads).where(eq(leads.profileId, profileId));
    await db.delete(profiles).where(eq(profiles.id, profileId));
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
    const userProfiles = await this.getProfilesByUserId(userId);
    for (const profile of userProfiles) {
      await db.delete(leads).where(eq(leads.profileId, profile.id));
    }
    await db.delete(profiles).where(eq(profiles.userId, userId));
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

  async getGrowthData(days: number): Promise<{ date: string; users: number; leads: number; views: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const usersByDay = await db
      .select({
        date: sql<string>`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, since))
      .groupBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${users.createdAt}, 'YYYY-MM-DD')`);

    const leadsByDay = await db
      .select({
        date: sql<string>`TO_CHAR(${leads.createdAt}, 'YYYY-MM-DD')`,
        count: count(),
      })
      .from(leads)
      .where(gte(leads.createdAt, since))
      .groupBy(sql`TO_CHAR(${leads.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${leads.createdAt}, 'YYYY-MM-DD')`);

    const dateMap = new Map<string, { users: number; leads: number; views: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().split('T')[0];
      dateMap.set(key, { users: 0, leads: 0, views: 0 });
    }

    for (const row of usersByDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.users = row.count;
    }
    for (const row of leadsByDay) {
      const existing = dateMap.get(row.date);
      if (existing) existing.leads = row.count;
    }

    return Array.from(dateMap.entries()).map(([date, data]) => ({ date, ...data }));
  }

  async getTopProfiles(limit: number): Promise<{ id: number; name: string; slug: string; views: number; leadCount: number; photoUrl: string | null }[]> {
    const rows = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        slug: profiles.slug,
        views: profiles.views,
        photoUrl: profiles.photoUrl,
        leadCount: sql<number>`(SELECT COUNT(*) FROM ${leads} WHERE ${leads.profileId} = ${profiles.id})`,
      })
      .from(profiles)
      .orderBy(desc(profiles.views))
      .limit(limit);

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      views: r.views ?? 0,
      leadCount: Number(r.leadCount),
      photoUrl: r.photoUrl,
    }));
  }

  async getRecentActivity(limit: number): Promise<{ type: string; description: string; timestamp: string; meta?: Record<string, any> }[]> {
    const recentUsers = await db
      .select({ id: users.id, email: users.email, createdAt: users.createdAt })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit);

    const recentLeads = await db
      .select({
        id: leads.id,
        name: leads.name,
        profileName: profiles.name,
        source: leads.source,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .leftJoin(profiles, eq(leads.profileId, profiles.id))
      .orderBy(desc(leads.createdAt))
      .limit(limit);

    const activities: { type: string; description: string; timestamp: string; meta?: Record<string, any> }[] = [];

    for (const u of recentUsers) {
      activities.push({
        type: "signup",
        description: `${u.email} created an account`,
        timestamp: u.createdAt?.toISOString() ?? new Date().toISOString(),
        meta: { email: u.email },
      });
    }

    for (const l of recentLeads) {
      activities.push({
        type: "lead",
        description: `${l.name} submitted contact via ${l.profileName || 'a profile'}`,
        timestamp: l.createdAt?.toISOString() ?? new Date().toISOString(),
        meta: { source: l.source, profileName: l.profileName },
      });
    }

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, limit);
  }

  async toggleAdmin(userId: number, isAdmin: boolean): Promise<void> {
    await db.update(users).set({ isAdmin }).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
