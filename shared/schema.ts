import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
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
    linkedin?: string;
    email?: string;
    website?: string;
    phone?: string;
    whatsapp?: string;
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

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, profileId: true, createdAt: true });
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type CreateProfileRequest = InsertProfile;
export type UpdateProfileRequest = Partial<InsertProfile>;
