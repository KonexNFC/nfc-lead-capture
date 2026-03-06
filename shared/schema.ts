import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export interface ProfileTile {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  iconUrl?: string;
  type: "link" | "pdf" | "menu" | "custom";
}

export interface ProfileReview {
  id: string;
  platform: string;
  url: string;
  label?: string;
}

export interface ProfileBranding {
  logoUrl?: string;
  coverUrl?: string;
  heroUrl?: string;
  heroVideoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface ProfileTextOverrides {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  bioOverride?: string;
  locale?: string;
}

export interface ProfileModules {
  order?: string[];
  enabled?: Record<string, boolean>;
  tiles?: ProfileTile[];
  videoUrl?: string;
  bookingUrl?: string;
  bookingLabel?: string;
  reviews?: ProfileReview[];
  address?: string;
}

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  title: text("title"),
  company: text("company"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  slug: text("slug").notNull().unique(),
  links: jsonb("links").$type<{
    phone?: string;
    whatsapp?: string;
    sms?: string;
    email?: string;
    linkedin?: string;
    website?: string;
    twitter?: string;
    x?: string;
    facebook?: string;
    instagram?: string;
    snapchat?: string;
    tiktok?: string;
    youtube?: string;
  }>(),
  theme: text("theme").default("light"),
  views: integer("views").default(0),
  modules: jsonb("modules").$type<ProfileModules>(),
  branding: jsonb("branding").$type<ProfileBranding>(),
  textOverrides: jsonb("text_overrides").$type<ProfileTextOverrides>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  telephone: text("telephone"),
  whatsapp: text("whatsapp"),
  company: text("company"),
  note: text("note"),
  source: text("source").default("nfc"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  profile: one(profiles, {
    fields: [leads.profileId],
    references: [profiles.id],
  }),
}));

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  title: text("title"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  user: one(users, {
    fields: [testimonials.userId],
    references: [users.id],
  }),
}));

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  cardCode: text("card_code").notNull().unique(),
  chipUid: text("chip_uid"),
  ownerId: integer("owner_id"),
  profileId: integer("profile_id"),
  productTier: text("product_tier").notNull().default("basic"),
  status: text("status").notNull().default("unassigned"),
  nickname: text("nickname"),
  tapCount: integer("tap_count").notNull().default(0),
  qrScanCount: integer("qr_scan_count").notNull().default(0),
  lastTapAt: timestamp("last_tap_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  activatedAt: timestamp("activated_at"),
}, (table) => [
  uniqueIndex("cards_chip_uid_unique").on(table.chipUid),
]);

export const cardTapEvents = pgTable("card_tap_events", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull(),
  ownerId: integer("owner_id"),
  eventType: text("event_type").notNull().default("nfc_tap"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  ipAddress: text("ip_address"),
  country: text("country"),
  city: text("city"),
  destinationUrl: text("destination_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardAssignmentsHistory = pgTable("card_assignments_history", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull(),
  previousOwnerId: integer("previous_owner_id"),
  newOwnerId: integer("new_owner_id"),
  actionType: text("action_type").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardsRelations = relations(cards, ({ one, many }) => ({
  owner: one(users, { fields: [cards.ownerId], references: [users.id] }),
  profile: one(profiles, { fields: [cards.profileId], references: [profiles.id] }),
  tapEvents: many(cardTapEvents),
  assignmentHistory: many(cardAssignmentsHistory),
}));

export const cardTapEventsRelations = relations(cardTapEvents, ({ one }) => ({
  card: one(cards, { fields: [cardTapEvents.cardId], references: [cards.id] }),
}));

export const cardAssignmentsHistoryRelations = relations(cardAssignmentsHistory, ({ one }) => ({
  card: one(cards, { fields: [cardAssignmentsHistory.cardId], references: [cards.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, isAdmin: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, profileId: true, createdAt: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true, userId: true, status: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true, createdAt: true, updatedAt: true, tapCount: true, qrScanCount: true });
export const insertCardTapEventSchema = createInsertSchema(cardTapEvents).omit({ id: true, createdAt: true });
export const insertCardAssignmentSchema = createInsertSchema(cardAssignmentsHistory).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type CardTapEvent = typeof cardTapEvents.$inferSelect;
export type InsertCardTapEvent = z.infer<typeof insertCardTapEventSchema>;
export type CardAssignment = typeof cardAssignmentsHistory.$inferSelect;
export type InsertCardAssignment = z.infer<typeof insertCardAssignmentSchema>;

export type CreateProfileRequest = InsertProfile;
export type UpdateProfileRequest = Partial<InsertProfile>;
