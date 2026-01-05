import { db } from "../server/db";
import { users, projects, cpProjectMap, leads, ads, cpProfiles, marketingCounters } from "../shared/schema";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await db.execute(sql`TRUNCATE TABLE marketing_counters, marketing_requests, cp_profiles, leads, ads, cp_project_map, projects, users RESTART IDENTITY CASCADE`);

  // Create 2 CP users
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const [cp1] = await db.insert(users).values({
    email: "rahul.sharma@example.com",
    password: hashedPassword,
    fullName: "Rahul Sharma",
    role: "cp",
    companyName: "Sharma Realty",
    phone: "9876543210",
    city: "Mumbai",
  }).returning();

  const [cp2] = await db.insert(users).values({
    email: "priya.patel@example.com",
    password: hashedPassword,
    fullName: "Priya Patel",
    role: "cp",
    companyName: "Patel Properties",
    phone: "9123456789",
    city: "Pune",
  }).returning();

  // Create 1 Developer user
  const [developer1] = await db.insert(users).values({
    email: "developer@lodhagroup.com",
    password: hashedPassword,
    fullName: "Lodha Group",
    role: "developer",
    companyName: "Lodha Group",
    phone: "9999888877",
    city: "Mumbai",
    contactPerson: "Abhishek Lodha",
    gstNumber: "27AABCL1234F1Z5",
    reraNumber: "P51700012345",
  }).returning();

  const [developer2] = await db.insert(users).values({
    email: "developer@godrej.com",
    password: hashedPassword,
    fullName: "Godrej Properties",
    role: "developer",
    companyName: "Godrej Properties",
    phone: "9988776655",
    city: "Pune",
    contactPerson: "Pirojsha Godrej",
    gstNumber: "27AABCG5678H1Z3",
    reraNumber: "P52900067890",
  }).returning();

  console.log("✅ Created users:", { cp1: cp1.email, cp2: cp2.email, developer1: developer1.email, developer2: developer2.email });

  // Create 2 Projects
  const [project1] = await db.insert(projects).values({
    developerId: developer1.id,
    name: "Lodha Park Side",
    description: "Luxurious 2 & 3 BHK apartments in Worli with sea-facing views.",
    city: "Mumbai",
    location: "Worli",
    priceMin: 35000000,
    priceMax: 70000000,
    projectType: "residential",
    status: "under_construction",
    isActive: true,
  }).returning();

  const [project2] = await db.insert(projects).values({
    developerId: developer2.id,
    name: "Godrej Horizon",
    description: "Premium residences in Undri with world-class amenities.",
    city: "Pune",
    location: "Undri",
    priceMin: 8500000,
    priceMax: 15000000,
    projectType: "residential",
    status: "under_construction",
    isActive: true,
  }).returning();

  console.log("✅ Created projects:", { project1: project1.name, project2: project2.name });

  // Assign CPs to Projects
  await db.insert(cpProjectMap).values([
    { cpId: cp1.id, projectId: project1.id, status: "approved" },
    { cpId: cp1.id, projectId: project2.id, status: "approved" },
    { cpId: cp2.id, projectId: project2.id, status: "approved" },
  ]);

  console.log("✅ Assigned CPs to projects");

  // Create 6 Leads (3 for each CP)
  const leadData = [
    { cpId: cp1.id, projectId: project1.id, developerId: developer1.id, customerName: "Vikram Mehta", customerPhone: "9112233445", customerEmail: "vikram@email.com", customerCity: "Mumbai", budget: "4 Cr", source: "meta_ads" as const, status: "new" as const, notes: "Interested in sea-facing unit" },
    { cpId: cp1.id, projectId: project1.id, developerId: developer1.id, customerName: "Ananya Singh", customerPhone: "9223344556", customerCity: "Mumbai", budget: "5 Cr", source: "referral" as const, status: "contacted" as const, notes: "Follow up scheduled for next week" },
    { cpId: cp1.id, projectId: project2.id, developerId: developer2.id, customerName: "Rajesh Kumar", customerPhone: "9334455667", customerEmail: "rajesh.k@email.com", customerCity: "Pune", budget: "1.2 Cr", source: "betterside" as const, status: "site_visit" as const, notes: "Site visit completed, very positive" },
    { cpId: cp2.id, projectId: project2.id, developerId: developer2.id, customerName: "Sneha Desai", customerPhone: "9445566778", customerEmail: "sneha.d@email.com", customerCity: "Pune", budget: "1 Cr", source: "organic" as const, status: "new" as const },
    { cpId: cp2.id, projectId: project2.id, developerId: developer2.id, customerName: "Amit Joshi", customerPhone: "9556677889", customerCity: "Pune", budget: "90 L", source: "meta_ads" as const, status: "negotiation" as const, notes: "Negotiating on payment plan" },
    { cpId: cp2.id, projectId: project2.id, developerId: developer2.id, customerName: "Pooja Sharma", customerPhone: "9667788990", customerEmail: "pooja.s@email.com", customerCity: "Mumbai", budget: "1.3 Cr", source: "referral" as const, status: "converted" as const, notes: "Booking done!" },
  ];

  await db.insert(leads).values(leadData);
  console.log("✅ Created 6 leads");

  // Create 2 Ad Requests for each CP
  const adData = [
    { cpId: cp1.id, projectId: project1.id, title: "Lead Generation Campaign", description: "Target HNIs in Mumbai", budget: 50000, status: "active" as const, platform: "facebook" as const, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { cpId: cp1.id, projectId: project2.id, title: "Awareness Campaign", description: "Brand awareness in Pune", budget: 25000, status: "pending" as const, platform: "instagram" as const, startDate: new Date(), endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { cpId: cp2.id, projectId: project2.id, title: "Site Visit Campaign", description: "Drive site visits for Godrej Horizon", budget: 75000, status: "active" as const, platform: "all" as const, startDate: new Date(), endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
    { cpId: cp2.id, projectId: project2.id, title: "Lead Gen - Phase 2", description: "Second phase lead generation", budget: 35000, status: "completed" as const, platform: "google" as const, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), endDate: new Date() },
  ];

  await db.insert(ads).values(adData);
  console.log("✅ Created 4 ad requests");

  // Create CP Profiles
  await db.insert(cpProfiles).values([
    { userId: cp1.id, fullName: "Rahul Sharma", companyName: "Sharma Realty", phone: "9876543210", city: "Mumbai" },
    { userId: cp2.id, fullName: "Priya Patel", companyName: "Patel Properties", phone: "9123456789", city: "Pune" },
  ]);
  console.log("✅ Created CP profiles");

  // Create Marketing Counters
  await db.insert(marketingCounters).values([
    { cpId: cp1.id, projectId: project1.id, creativesShared: 15, edmsShared: 8 },
    { cpId: cp1.id, projectId: project2.id, creativesShared: 10, edmsShared: 5 },
    { cpId: cp2.id, projectId: project2.id, creativesShared: 12, edmsShared: 6 },
  ]);
  console.log("✅ Created marketing counters");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("  CP 1: rahul.sharma@example.com / password123");
  console.log("  CP 2: priya.patel@example.com / password123");
  console.log("  Developer 1: developer@lodhagroup.com / password123");
  console.log("  Developer 2: developer@godrej.com / password123");

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
