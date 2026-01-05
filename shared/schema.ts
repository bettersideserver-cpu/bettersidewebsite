import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  role: text("role", { enum: ["buyer", "cp", "developer"] }).notNull(),
  password: text("password").notNull(),
  
  // Channel Partner specific
  companyName: text("company_name"),
  
  // Developer specific
  contactPerson: text("contact_person"),
  gstNumber: text("gst_number"),
  reraNumber: text("rera_number"),
  isReraRegistered: boolean("is_rera_registered").default(false),
  docLink: text("doc_link"),
  
  // Buyer specific
  budget: text("budget"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

// Projects table - Developer's projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  developerId: varchar("developer_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  city: text("city").notNull(),
  projectType: text("project_type", { enum: ["residential", "commercial", "villa", "plot"] }).notNull(),
  status: text("status", { enum: ["pre_launch", "under_construction", "ready_to_move", "completed"] }).notNull(),
  priceMin: integer("price_min"),
  priceMax: integer("price_max"),
  reraNumber: text("rera_number"),
  totalUnits: integer("total_units"),
  availableUnits: integer("available_units"),
  amenities: text("amenities"),
  imageUrl: text("image_url"),
  brochureUrl: text("brochure_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// CP-Project mapping - Which CP works on which project
export const cpProjectMap = pgTable("cp_project_map", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpId: varchar("cp_id").notNull().references(() => users.id),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const insertCpProjectMapSchema = createInsertSchema(cpProjectMap).omit({
  id: true,
  assignedAt: true,
});

export type InsertCpProjectMap = z.infer<typeof insertCpProjectMapSchema>;
export type CpProjectMap = typeof cpProjectMap.$inferSelect;

// Leads table - For CP dashboard + developer analytics
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpId: varchar("cp_id").notNull().references(() => users.id),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  developerId: varchar("developer_id").notNull().references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  customerCity: text("customer_city"),
  budget: text("budget"),
  status: text("status", { enum: ["new", "contacted", "site_visit", "negotiation", "converted", "lost"] }).default("new"),
  notes: text("notes"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLeadSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  customerCity: z.string().optional(),
  budget: z.string().optional(),
  status: z.enum(["new", "contacted", "site_visit", "negotiation", "converted", "lost"]).optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
}).strict();

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Ads table - Advertising campaigns
export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpId: varchar("cp_id").references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  developerId: varchar("developer_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  budget: integer("budget").notNull(),
  spentAmount: integer("spent_amount").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", { enum: ["draft", "pending", "active", "paused", "completed", "cancelled"] }).default("draft"),
  platform: text("platform", { enum: ["facebook", "instagram", "google", "all"] }).default("all"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  leads: integer("leads").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAdSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  budget: z.number().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(["draft", "pending", "active", "paused", "completed", "cancelled"]).optional(),
  platform: z.enum(["facebook", "instagram", "google", "all"]).optional(),
}).strict();

export type InsertAd = z.infer<typeof insertAdSchema>;
export type UpdateAd = z.infer<typeof updateAdSchema>;
export type Ad = typeof ads.$inferSelect;

// CP Profiles - Extended profile info for Channel Partners
export const cpProfiles = pgTable("cp_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name"),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  extraJson: text("extra_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCpProfileSchema = createInsertSchema(cpProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCpProfileSchema = z.object({
  fullName: z.string().optional(),
  companyName: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional(),
  city: z.string().optional(),
  extraJson: z.string().optional(),
}).strict();

export type InsertCpProfile = z.infer<typeof insertCpProfileSchema>;
export type UpdateCpProfile = z.infer<typeof updateCpProfileSchema>;
export type CpProfile = typeof cpProfiles.$inferSelect;

// Marketing Counters - Track creatives and EDMs shared with CPs
export const marketingCounters = pgTable("marketing_counters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpId: varchar("cp_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  creativesShared: integer("creatives_shared").default(0),
  edmsShared: integer("edms_shared").default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertMarketingCounterSchema = createInsertSchema(marketingCounters).omit({
  id: true,
  lastUpdated: true,
});

export type InsertMarketingCounter = z.infer<typeof insertMarketingCounterSchema>;
export type MarketingCounter = typeof marketingCounters.$inferSelect;

// Marketing Requests - CP requests for creatives/EDMs
export const marketingRequests = pgTable("marketing_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cpId: varchar("cp_id").notNull().references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  requestType: text("request_type", { enum: ["creative", "edm"] }).notNull(),
  notes: text("notes"),
  status: text("status", { enum: ["pending", "in_progress", "completed", "cancelled"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMarketingRequestSchema = createInsertSchema(marketingRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMarketingRequest = z.infer<typeof insertMarketingRequestSchema>;
export type MarketingRequest = typeof marketingRequests.$inferSelect;

// Enhanced lead schema for CP-specific validation
export const insertCpLeadSchema = z.object({
  projectId: z.string().optional(),
  developerId: z.string().optional(),
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerCity: z.string().optional(),
  budget: z.string().optional(),
  source: z.enum(["meta_ads", "organic", "betterside", "referral", "other"]).optional(),
  status: z.enum(["new", "contacted", "site_visit", "negotiation", "converted", "lost"]).optional(),
  notes: z.string().optional(),
});

export type InsertCpLead = z.infer<typeof insertCpLeadSchema>;

// Ads requests schema (Run Ads feature)
export const insertAdsRequestSchema = z.object({
  projectId: z.string(),
  objective: z.enum(["lead_generation", "awareness", "site_visits"]),
  budgetInr: z.number().positive("Budget must be positive"),
  durationDays: z.number().int().positive("Duration must be positive"),
  notes: z.string().optional(),
});

export type InsertAdsRequest = z.infer<typeof insertAdsRequestSchema>;
