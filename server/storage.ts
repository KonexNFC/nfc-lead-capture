import { db, pool } from "./db";
import {
  users, profiles, leads, siteSettings, testimonials,
  cards, cardTapEvents, cardAssignmentsHistory,
  organizations, organizationMembers, organizationInvitations, organizationCards,
  profileEvents,
  orders, checkoutActivationTokens, webhookEvents,
  type User, type InsertUser,
  type Profile, type InsertProfile, type UpdateProfileRequest,
  type Lead, type InsertLead,
  type SiteSetting,
  type Testimonial, type InsertTestimonial,
  type Card, type InsertCard,
  type CardTapEvent, type InsertCardTapEvent,
  type CardAssignment, type InsertCardAssignment,
  type Organization, type InsertOrganization,
  type OrganizationMember, type InsertOrganizationMember,
  type OrganizationInvitation, type InsertOrganizationInvitation,
  type OrganizationCard, type InsertOrganizationCard,
  type Order, type InsertOrder,
  type CheckoutActivationToken, type InsertCheckoutActivationToken,
  type WebhookEvent, type InsertWebhookEvent,
} from "@shared/schema";
import { eq, desc, sql, count, gte, and, like, inArray } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

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

  // Testimonials
  createTestimonial(testimonial: InsertTestimonial & { userId: number }): Promise<Testimonial>;
  getTestimonialsByUser(userId: number): Promise<Testimonial[]>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getAllTestimonials(): Promise<Testimonial[]>;
  updateTestimonialStatus(id: number, status: string): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<void>;

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

  // Cards
  getCardByCode(code: string): Promise<Card | undefined>;
  getCardById(id: number): Promise<Card | undefined>;
  getCardsByOwnerId(userId: number): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, updates: Partial<Card>): Promise<Card>;
  getCardsByCodes(codes: string[]): Promise<Card[]>;
  batchCreateCards(cardsData: InsertCard[]): Promise<Card[]>;
  listAllCards(filters?: { status?: string; productTier?: string; search?: string }): Promise<Card[]>;
  getCardStats(): Promise<{ total: number; activated: number; unassigned: number; suspended: number; lost: number }>;
  incrementCardTapCount(cardId: number): Promise<void>;

  // Card Tap Events
  createTapEvent(event: InsertCardTapEvent): Promise<CardTapEvent>;
  getTapEventsByCardId(cardId: number): Promise<CardTapEvent[]>;
  getTapEventsByOwnerId(ownerId: number): Promise<CardTapEvent[]>;
  getCardAnalytics(cardId: number): Promise<{ totalTaps: number; totalQrScans: number; recentEvents: CardTapEvent[] }>;

  // Card Assignment History
  createAssignmentHistory(entry: InsertCardAssignment): Promise<CardAssignment>;
  getAssignmentHistoryByCardId(cardId: number): Promise<CardAssignment[]>;

  // Organizations
  createOrganization(org: InsertOrganization): Promise<Organization>;
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization>;
  getUserOrganizations(userId: number): Promise<(Organization & { role: string })[]>;

  // Organization Members
  addOrganizationMember(member: InsertOrganizationMember): Promise<OrganizationMember>;
  getOrganizationMember(orgId: number, userId: number): Promise<OrganizationMember | undefined>;
  getOrganizationMembers(orgId: number): Promise<(OrganizationMember & { email: string; name?: string })[]>;
  updateOrganizationMemberRole(id: number, role: string): Promise<OrganizationMember>;
  removeOrganizationMember(id: number): Promise<void>;

  // Organization Invitations
  createOrganizationInvitation(invitation: InsertOrganizationInvitation): Promise<OrganizationInvitation>;
  getOrganizationInvitationByToken(token: string): Promise<OrganizationInvitation | undefined>;
  getOrganizationInvitations(orgId: number): Promise<OrganizationInvitation[]>;
  updateOrganizationInvitationStatus(id: number, status: string): Promise<void>;

  // Organization Cards
  assignCardToOrganization(entry: InsertOrganizationCard): Promise<OrganizationCard>;
  getOrganizationCards(orgId: number): Promise<(OrganizationCard & { cardCode: string; status: string; productTier: string })[]>;
  getOrganizationCardById(id: number): Promise<OrganizationCard | undefined>;
  updateOrganizationCard(id: number, updates: Partial<OrganizationCard>): Promise<OrganizationCard>;
  removeOrganizationCard(id: number): Promise<void>;

  // Organization Analytics
  getOrganizationMemberAnalytics(orgId: number): Promise<{
    memberId: number;
    userId: number;
    name: string;
    email: string;
    role: string;
    assignedCards: number;
    totalTaps: number;
    totalLeads: number;
    activationRate: number;
  }[]>;
  getOrganizationAnalytics(orgId: number): Promise<{
    totalCards: number;
    activeCards: number;
    totalTaps: number;
    totalLeads: number;
    topCard: { cardCode: string; taps: number } | null;
    topMember: { name: string; email: string; taps: number } | null;
  }>;

  // Orders / Checkout
  createOrder(data: InsertOrder): Promise<Order>;
  getOrderByPaypalId(paypalOrderId: string): Promise<Order | undefined>;
  getOrderById(id: number): Promise<Order | undefined>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order>;
  listOrders(limit?: number): Promise<Order[]>;

  // Activation Tokens
  createActivationToken(data: InsertCheckoutActivationToken): Promise<CheckoutActivationToken>;
  getActivationTokenByToken(token: string): Promise<CheckoutActivationToken | undefined>;
  markActivationTokenConsumed(id: number): Promise<void>;

  // Webhook Events
  createWebhookEvent(data: InsertWebhookEvent): Promise<WebhookEvent>;
  getWebhookEventByPaypalId(paypalEventId: string): Promise<WebhookEvent | undefined>;

  // Profile Events (conversion analytics)
  createProfileEvent(event: { profileId: number; eventType: string; metadata?: Record<string, string> }): Promise<void>;
  getAnalyticsOverview(userId: number): Promise<{
    views: number; taps: number; leads: number; formSubmits: number;
    ctaClicks: number; saveContacts: number; conversionRate: number;
  }>;
  getAnalyticsTrend(userId: number, days: number): Promise<{ date: string; views: number; leads: number; clicks: number }[]>;
  getAnalyticsCtas(userId: number): Promise<{ eventType: string; count: number }[]>;
  getAnalyticsSources(userId: number): Promise<{ source: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    const PgSession = connectPgSimple(session);
    this.sessionStore = new PgSession({
      pool,
      tableName: "session",
    });
    // Create session table using inline SQL so the build bundle needs no external SQL file
    pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
      ) WITH (OIDS=FALSE);
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `).catch((err: Error) => console.error("[session] table init error:", err.message));
  }

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

  // Testimonials
  async createTestimonial(testimonial: InsertTestimonial & { userId: number }): Promise<Testimonial> {
    const [created] = await db.insert(testimonials).values(testimonial).returning();
    return created;
  }

  async getTestimonialsByUser(userId: number): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.userId, userId)).orderBy(desc(testimonials.createdAt));
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).where(eq(testimonials.status, "approved")).orderBy(desc(testimonials.createdAt));
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async updateTestimonialStatus(id: number, status: string): Promise<Testimonial> {
    const [updated] = await db.update(testimonials).set({ status }).where(eq(testimonials.id, id)).returning();
    return updated;
  }

  async deleteTestimonial(id: number): Promise<void> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  }

  // Cards
  async getCardByCode(code: string): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.cardCode, code));
    return card;
  }

  async getCardById(id: number): Promise<Card | undefined> {
    const [card] = await db.select().from(cards).where(eq(cards.id, id));
    return card;
  }

  async getCardsByOwnerId(userId: number): Promise<Card[]> {
    return await db.select().from(cards).where(eq(cards.ownerId, userId)).orderBy(desc(cards.createdAt));
  }

  async createCard(card: InsertCard): Promise<Card> {
    const [created] = await db.insert(cards).values(card).returning();
    return created;
  }

  async updateCard(id: number, updates: Partial<Card>): Promise<Card> {
    const [updated] = await db.update(cards).set({ ...updates, updatedAt: new Date() }).where(eq(cards.id, id)).returning();
    return updated;
  }

  async getCardsByCodes(codes: string[]): Promise<Card[]> {
    if (codes.length === 0) return [];
    return await db.select().from(cards).where(inArray(cards.cardCode, codes));
  }

  async batchCreateCards(cardsData: InsertCard[]): Promise<Card[]> {
    if (cardsData.length === 0) return [];
    return await db.insert(cards).values(cardsData).returning();
  }

  async listAllCards(filters?: { status?: string; productTier?: string; search?: string }): Promise<Card[]> {
    let query = db.select().from(cards);
    const conditions = [];
    if (filters?.status) conditions.push(eq(cards.status, filters.status));
    if (filters?.productTier) conditions.push(eq(cards.productTier, filters.productTier));
    if (filters?.search) conditions.push(like(cards.cardCode, `%${filters.search}%`));
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    return await (query as any).orderBy(desc(cards.createdAt));
  }

  async incrementCardTapCount(cardId: number): Promise<void> {
    await db.update(cards).set({
      tapCount: sql`${cards.tapCount} + 1`,
      lastTapAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(cards.id, cardId));
  }

  async getCardStats(): Promise<{ total: number; activated: number; unassigned: number; suspended: number; lost: number }> {
    const [total] = await db.select({ count: count() }).from(cards);
    const [activated] = await db.select({ count: count() }).from(cards).where(eq(cards.status, "active"));
    const [unassigned] = await db.select({ count: count() }).from(cards).where(eq(cards.status, "unassigned"));
    const [suspended] = await db.select({ count: count() }).from(cards).where(eq(cards.status, "suspended"));
    const [lost] = await db.select({ count: count() }).from(cards).where(eq(cards.status, "lost"));
    return {
      total: total.count,
      activated: activated.count,
      unassigned: unassigned.count,
      suspended: suspended.count,
      lost: lost.count,
    };
  }

  // Card Tap Events
  async createTapEvent(event: InsertCardTapEvent): Promise<CardTapEvent> {
    const [created] = await db.insert(cardTapEvents).values(event).returning();
    return created;
  }

  async getTapEventsByCardId(cardId: number): Promise<CardTapEvent[]> {
    return await db.select().from(cardTapEvents).where(eq(cardTapEvents.cardId, cardId)).orderBy(desc(cardTapEvents.createdAt));
  }

  async getTapEventsByOwnerId(ownerId: number): Promise<CardTapEvent[]> {
    return await db.select().from(cardTapEvents).where(eq(cardTapEvents.ownerId, ownerId)).orderBy(desc(cardTapEvents.createdAt));
  }

  async getCardAnalytics(cardId: number): Promise<{ totalTaps: number; totalQrScans: number; recentEvents: CardTapEvent[] }> {
    const [taps] = await db.select({ count: count() }).from(cardTapEvents).where(and(eq(cardTapEvents.cardId, cardId), eq(cardTapEvents.eventType, "nfc_tap")));
    const [scans] = await db.select({ count: count() }).from(cardTapEvents).where(and(eq(cardTapEvents.cardId, cardId), eq(cardTapEvents.eventType, "qr_scan")));
    const recentEvents = await db.select().from(cardTapEvents).where(eq(cardTapEvents.cardId, cardId)).orderBy(desc(cardTapEvents.createdAt)).limit(20);
    return { totalTaps: taps.count, totalQrScans: scans.count, recentEvents };
  }

  // Card Assignment History
  async createAssignmentHistory(entry: InsertCardAssignment): Promise<CardAssignment> {
    const [created] = await db.insert(cardAssignmentsHistory).values(entry).returning();
    return created;
  }

  async getAssignmentHistoryByCardId(cardId: number): Promise<CardAssignment[]> {
    return await db.select().from(cardAssignmentsHistory).where(eq(cardAssignmentsHistory.cardId, cardId)).orderBy(desc(cardAssignmentsHistory.createdAt));
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [created] = await db.insert(organizations).values(org).returning();
    return created;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return org;
  }

  async updateOrganization(id: number, updates: Partial<Organization>): Promise<Organization> {
    const [updated] = await db.update(organizations).set({ ...updates, updatedAt: new Date() }).where(eq(organizations.id, id)).returning();
    return updated;
  }

  async getUserOrganizations(userId: number): Promise<(Organization & { role: string })[]> {
    const rows = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        logoUrl: organizations.logoUrl,
        ownerUserId: organizations.ownerUserId,
        planType: organizations.planType,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        role: organizationMembers.role,
      })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(and(eq(organizationMembers.userId, userId), eq(organizationMembers.status, "active")));
    return rows;
  }

  async addOrganizationMember(member: InsertOrganizationMember): Promise<OrganizationMember> {
    const [created] = await db.insert(organizationMembers).values(member).returning();
    return created;
  }

  async getOrganizationMember(orgId: number, userId: number): Promise<OrganizationMember | undefined> {
    const [member] = await db.select().from(organizationMembers)
      .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId)));
    return member;
  }

  async getOrganizationMembers(orgId: number): Promise<(OrganizationMember & { email: string; name?: string })[]> {
    const rows = await db
      .select({
        id: organizationMembers.id,
        organizationId: organizationMembers.organizationId,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        department: organizationMembers.department,
        status: organizationMembers.status,
        createdAt: organizationMembers.createdAt,
        updatedAt: organizationMembers.updatedAt,
        email: users.email,
        name: profiles.name,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .leftJoin(profiles, eq(organizationMembers.userId, profiles.userId))
      .where(eq(organizationMembers.organizationId, orgId))
      .orderBy(organizationMembers.createdAt);
    return rows;
  }

  async updateOrganizationMemberRole(id: number, role: string): Promise<OrganizationMember> {
    const [updated] = await db.update(organizationMembers).set({ role, updatedAt: new Date() }).where(eq(organizationMembers.id, id)).returning();
    return updated;
  }

  async removeOrganizationMember(id: number): Promise<void> {
    await db.delete(organizationMembers).where(eq(organizationMembers.id, id));
  }

  async createOrganizationInvitation(invitation: InsertOrganizationInvitation): Promise<OrganizationInvitation> {
    const [created] = await db.insert(organizationInvitations).values(invitation).returning();
    return created;
  }

  async getOrganizationInvitationByToken(token: string): Promise<OrganizationInvitation | undefined> {
    const [inv] = await db.select().from(organizationInvitations).where(eq(organizationInvitations.token, token));
    return inv;
  }

  async getOrganizationInvitations(orgId: number): Promise<OrganizationInvitation[]> {
    return await db.select().from(organizationInvitations)
      .where(eq(organizationInvitations.organizationId, orgId))
      .orderBy(desc(organizationInvitations.createdAt));
  }

  async updateOrganizationInvitationStatus(id: number, status: string): Promise<void> {
    await db.update(organizationInvitations).set({ status }).where(eq(organizationInvitations.id, id));
  }

  async assignCardToOrganization(entry: InsertOrganizationCard): Promise<OrganizationCard> {
    const [created] = await db.insert(organizationCards).values(entry).returning();
    return created;
  }

  async getOrganizationCards(orgId: number): Promise<(OrganizationCard & { cardCode: string; status: string; productTier: string })[]> {
    const rows = await db
      .select({
        id: organizationCards.id,
        organizationId: organizationCards.organizationId,
        cardId: organizationCards.cardId,
        assignedUserId: organizationCards.assignedUserId,
        createdAt: organizationCards.createdAt,
        cardCode: cards.cardCode,
        status: cards.status,
        productTier: cards.productTier,
      })
      .from(organizationCards)
      .innerJoin(cards, eq(organizationCards.cardId, cards.id))
      .where(eq(organizationCards.organizationId, orgId));
    return rows;
  }

  async getOrganizationCardById(id: number): Promise<OrganizationCard | undefined> {
    const [row] = await db.select().from(organizationCards).where(eq(organizationCards.id, id));
    return row;
  }

  async updateOrganizationCard(id: number, updates: Partial<OrganizationCard>): Promise<OrganizationCard> {
    const [updated] = await db.update(organizationCards).set(updates).where(eq(organizationCards.id, id)).returning();
    return updated;
  }

  async removeOrganizationCard(id: number): Promise<void> {
    await db.delete(organizationCards).where(eq(organizationCards.id, id));
  }

  async getOrganizationMemberAnalytics(orgId: number): Promise<{
    memberId: number;
    userId: number;
    name: string;
    email: string;
    role: string;
    assignedCards: number;
    totalTaps: number;
    totalLeads: number;
    activationRate: number;
  }[]> {
    const memberRows = await db.select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
    }).from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));

    const orgCardRows = await db.select({
      cardId: organizationCards.cardId,
      assignedUserId: organizationCards.assignedUserId,
    }).from(organizationCards)
      .where(eq(organizationCards.organizationId, orgId));

    const cardIds = orgCardRows.map(c => c.cardId);
    const cardRows = cardIds.length > 0
      ? await db.select({ id: cards.id, tapCount: cards.tapCount, status: cards.status }).from(cards).where(inArray(cards.id, cardIds))
      : [];

    const result = await Promise.all(memberRows.map(async (member) => {
      const [userRow] = await db.select({ email: users.email }).from(users).where(eq(users.id, member.userId));
      const [profileRow] = await db.select({ name: profiles.name }).from(profiles).where(eq(profiles.userId, member.userId));

      const memberCardIds = orgCardRows.filter(oc => oc.assignedUserId === member.userId).map(oc => oc.cardId);
      const memberCards = cardRows.filter(c => memberCardIds.includes(c.id));
      const assignedCards = memberCards.length;
      const totalTaps = memberCards.reduce((sum, c) => sum + c.tapCount, 0);
      const activeCards = memberCards.filter(c => c.status === "active").length;
      const activationRate = assignedCards > 0 ? Math.round((activeCards / assignedCards) * 100) : 0;

      let totalLeads = 0;
      const [profileLeadRow] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, member.userId));
      if (profileLeadRow) {
        const [leadCount] = await db.select({ count: sql<number>`count(*)::int` }).from(leads).where(eq(leads.profileId, profileLeadRow.id));
        totalLeads = leadCount?.count ?? 0;
      }

      return {
        memberId: member.id,
        userId: member.userId,
        name: profileRow?.name || userRow?.email || "Unknown",
        email: userRow?.email || "",
        role: member.role,
        assignedCards,
        totalTaps,
        totalLeads,
        activationRate,
      };
    }));

    return result.sort((a, b) => b.totalTaps - a.totalTaps);
  }

  async getOrganizationAnalytics(orgId: number): Promise<{
    totalCards: number;
    activeCards: number;
    totalTaps: number;
    totalLeads: number;
    topCard: { cardCode: string; taps: number } | null;
    topMember: { name: string; email: string; taps: number } | null;
  }> {
    const orgCardRows = await db.select({
      cardId: organizationCards.cardId,
      assignedUserId: organizationCards.assignedUserId,
    }).from(organizationCards)
      .where(eq(organizationCards.organizationId, orgId));
    const cardIds = orgCardRows.map(c => c.cardId);

    if (cardIds.length === 0) {
      return { totalCards: 0, activeCards: 0, totalTaps: 0, totalLeads: 0, topCard: null, topMember: null };
    }

    const cardRows = await db.select().from(cards).where(inArray(cards.id, cardIds));
    const totalCards = cardRows.length;
    const activeCards = cardRows.filter(c => c.status === "active").length;
    const totalTaps = cardRows.reduce((sum, c) => sum + c.tapCount, 0);

    const topCardRow = cardRows.reduce((best, c) => (c.tapCount > (best?.tapCount ?? -1) ? c : best), cardRows[0]);
    const topCard = topCardRow && topCardRow.tapCount > 0
      ? { cardCode: topCardRow.cardCode, taps: topCardRow.tapCount }
      : null;

    const memberRows = await db.select({ userId: organizationMembers.userId }).from(organizationMembers)
      .where(eq(organizationMembers.organizationId, orgId));
    const memberUserIds = memberRows.map(m => m.userId);

    let totalLeads = 0;
    if (memberUserIds.length > 0) {
      const memberProfiles = await db.select({ id: profiles.id }).from(profiles)
        .where(inArray(profiles.userId, memberUserIds));
      const profileIds = memberProfiles.map(p => p.id);
      if (profileIds.length > 0) {
        const [leadCount] = await db.select({ count: sql<number>`count(*)::int` }).from(leads)
          .where(inArray(leads.profileId, profileIds));
        totalLeads = leadCount?.count ?? 0;
      }
    }

    let topMember: { name: string; email: string; taps: number } | null = null;
    const assignedUserTaps = new Map<number, number>();
    for (const oc of orgCardRows) {
      if (oc.assignedUserId) {
        const card = cardRows.find(c => c.id === oc.cardId);
        if (card) {
          assignedUserTaps.set(oc.assignedUserId, (assignedUserTaps.get(oc.assignedUserId) || 0) + card.tapCount);
        }
      }
    }
    if (assignedUserTaps.size > 0) {
      let topUserId = 0;
      let topTaps = 0;
      for (const [userId, taps] of assignedUserTaps) {
        if (taps > topTaps) { topUserId = userId; topTaps = taps; }
      }
      if (topUserId && topTaps > 0) {
        const [topUser] = await db.select({ email: users.email }).from(users).where(eq(users.id, topUserId));
        const [topProfile] = await db.select({ name: profiles.name }).from(profiles).where(eq(profiles.userId, topUserId));
        topMember = { name: topProfile?.name || "Unknown", email: topUser?.email || "", taps: topTaps };
      }
    }

    return { totalCards, activeCards, totalTaps, totalLeads, topCard, topMember };
  }

  // ── Profile Events (conversion analytics) ─────────────────────────────────

  async createProfileEvent(event: { profileId: number; eventType: string; metadata?: Record<string, string> }): Promise<void> {
    await db.insert(profileEvents).values(event);
  }

  async getAnalyticsOverview(userId: number): Promise<{
    views: number; taps: number; leads: number; formSubmits: number;
    ctaClicks: number; saveContacts: number; conversionRate: number;
  }> {
    const userProfiles = await db.select({ id: profiles.id, views: profiles.views }).from(profiles).where(eq(profiles.userId, userId));
    if (userProfiles.length === 0) return { views: 0, taps: 0, leads: 0, formSubmits: 0, ctaClicks: 0, saveContacts: 0, conversionRate: 0 };

    const profileIds = userProfiles.map(p => p.id);
    const totalViews = userProfiles.reduce((s, p) => s + (p.views || 0), 0);

    const userCards = await db.select({ tapCount: cards.tapCount }).from(cards).where(eq(cards.ownerId, userId));
    const totalTaps = userCards.reduce((s, c) => s + (c.tapCount || 0), 0);

    const [leadCount] = await db.select({ count: count() }).from(leads).where(inArray(leads.profileId, profileIds));

    const eventCounts = await db
      .select({ eventType: profileEvents.eventType, count: count() })
      .from(profileEvents)
      .where(inArray(profileEvents.profileId, profileIds))
      .groupBy(profileEvents.eventType);

    const byType: Record<string, number> = {};
    for (const row of eventCounts) byType[row.eventType] = Number(row.count);

    const formSubmits = byType["form_submit"] || 0;
    const ctaClicks = (byType["cta_click"] || 0);
    const saveContacts = byType["save_contact"] || 0;
    const leadsTotal = Number(leadCount?.count || 0);
    const conversionRate = totalViews > 0 ? Math.round((leadsTotal / totalViews) * 100 * 10) / 10 : 0;

    return { views: totalViews, taps: totalTaps, leads: leadsTotal, formSubmits, ctaClicks, saveContacts, conversionRate };
  }

  async getAnalyticsTrend(userId: number, days: number): Promise<{ date: string; views: number; leads: number; clicks: number }[]> {
    const userProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId));
    if (userProfiles.length === 0) return [];
    const profileIds = userProfiles.map(p => p.id);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const clickTypes = ["cta_click", "call_click", "email_click", "whatsapp_click", "website_click", "social_click", "booking_click", "save_contact"];
    const clickTypeLiterals = clickTypes.map(t => `'${t}'`).join(",");

    const rows = await pool.query<{ day: string; leads: string; clicks: string }>(`
      SELECT
        to_char(d.day, 'YYYY-MM-DD') AS day,
        COALESCE(l.cnt, 0)::int AS leads,
        COALESCE(e.cnt, 0)::int AS clicks
      FROM generate_series($1::date, CURRENT_DATE, '1 day'::interval) AS d(day)
      LEFT JOIN (
        SELECT date_trunc('day', created_at) AS day, count(*) AS cnt
        FROM leads WHERE profile_id = ANY($2) AND created_at >= $1 GROUP BY 1
      ) l ON l.day = d.day
      LEFT JOIN (
        SELECT date_trunc('day', created_at) AS day, count(*) AS cnt
        FROM profile_events WHERE profile_id = ANY($2) AND created_at >= $1 AND event_type IN (${clickTypeLiterals}) GROUP BY 1
      ) e ON e.day = d.day
      ORDER BY d.day
    `, [since.toISOString().split("T")[0], profileIds]);

    return rows.rows.map(r => ({ date: r.day, views: 0, leads: Number(r.leads), clicks: Number(r.clicks) }));
  }

  async getAnalyticsCtas(userId: number): Promise<{ eventType: string; count: number }[]> {
    const userProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId));
    if (userProfiles.length === 0) return [];
    const profileIds = userProfiles.map(p => p.id);

    const rows = await db
      .select({ eventType: profileEvents.eventType, count: count() })
      .from(profileEvents)
      .where(inArray(profileEvents.profileId, profileIds))
      .groupBy(profileEvents.eventType)
      .orderBy(desc(count()));

    return rows.map(r => ({ eventType: r.eventType, count: Number(r.count) }));
  }

  async getAnalyticsSources(userId: number): Promise<{ source: string; count: number }[]> {
    const userProfiles = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId));
    if (userProfiles.length === 0) return [];
    const profileIds = userProfiles.map(p => p.id);

    const rows = await pool.query<{ source: string; cnt: string }>(`
      SELECT COALESCE(metadata->>'source', 'direct') AS source, count(*) AS cnt
      FROM profile_events
      WHERE profile_id = ANY($1) AND event_type = 'view'
      GROUP BY 1 ORDER BY 2 DESC LIMIT 6
    `, [profileIds]);

    if (rows.rows.length === 0) {
      const leadRows = await pool.query<{ source: string; cnt: string }>(`
        SELECT COALESCE(source, 'direct') AS source, count(*) AS cnt
        FROM leads WHERE profile_id = ANY($1) GROUP BY 1 ORDER BY 2 DESC
      `, [profileIds]);
      return leadRows.rows.map(r => ({ source: r.source, count: Number(r.cnt) }));
    }

    return rows.rows.map(r => ({ source: r.source, count: Number(r.cnt) }));
  }

  // Orders
  async createOrder(data: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async getOrderByPaypalId(paypalOrderId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.paypalOrderId, paypalOrderId));
    return order;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async listOrders(limit = 100): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
  }

  // Activation Tokens
  async createActivationToken(data: InsertCheckoutActivationToken): Promise<CheckoutActivationToken> {
    const [token] = await db.insert(checkoutActivationTokens).values(data).returning();
    return token;
  }

  async getActivationTokenByToken(token: string): Promise<CheckoutActivationToken | undefined> {
    const [row] = await db.select().from(checkoutActivationTokens).where(eq(checkoutActivationTokens.token, token));
    return row;
  }

  async markActivationTokenConsumed(id: number): Promise<void> {
    await db.update(checkoutActivationTokens).set({ consumedAt: new Date() }).where(eq(checkoutActivationTokens.id, id));
  }

  // Webhook Events
  async createWebhookEvent(data: InsertWebhookEvent): Promise<WebhookEvent> {
    const [event] = await db.insert(webhookEvents).values(data).returning();
    return event;
  }

  async getWebhookEventByPaypalId(paypalEventId: string): Promise<WebhookEvent | undefined> {
    const [event] = await db.select().from(webhookEvents).where(eq(webhookEvents.paypalEventId, paypalEventId));
    return event;
  }
}

export const storage = new DatabaseStorage();
