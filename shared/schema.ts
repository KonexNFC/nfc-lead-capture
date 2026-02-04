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
    twitter?: string;
    instagram?: string;
    snapchat?: string;
    tiktok?: string;
    youtube?: string;
  }>(),
  theme: text("theme").default("light"), // light, dark, custom
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  note: text("note"),
  source: text("source").default("nfc"), // nfc, qr, direct
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

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, userId: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, profileId: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type CreateProfileRequest = InsertProfile;
export type UpdateProfileRequest = Partial<InsertProfile>;
