import { 
  type User, type InsertUser,
  type Project, type InsertProject,
  type CpProjectMap, type InsertCpProjectMap,
  type Lead, type InsertLead,
  type Ad, type InsertAd,
  type CpProfile, type InsertCpProfile, type UpdateCpProfile,
  type MarketingCounter, type InsertMarketingCounter,
  type MarketingRequest, type InsertMarketingRequest,
  users, projects, cpProjectMap, leads, ads, cpProfiles, marketingCounters, marketingRequests
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql, isNull } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByDeveloper(developerId: string): Promise<Project[]>;
  getAllActiveProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  // CP-Project Mapping
  getCpProjectMap(id: string): Promise<CpProjectMap | undefined>;
  getProjectsByCp(cpId: string): Promise<CpProjectMap[]>;
  getCpsByProject(projectId: string): Promise<CpProjectMap[]>;
  assignCpToProject(data: InsertCpProjectMap): Promise<CpProjectMap>;
  updateCpProjectStatus(id: string, status: string): Promise<CpProjectMap | undefined>;

  // Leads
  getLead(id: string): Promise<Lead | undefined>;
  getLeadsByCp(cpId: string): Promise<Lead[]>;
  getLeadsByDeveloper(developerId: string): Promise<Lead[]>;
  getLeadsByProject(projectId: string): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined>;

  // Ads
  getAd(id: string): Promise<Ad | undefined>;
  getAdsByCp(cpId: string): Promise<Ad[]>;
  getAdsByDeveloper(developerId: string): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, data: Partial<InsertAd>): Promise<Ad | undefined>;

  // CP Profiles
  getCpProfile(userId: string): Promise<CpProfile | undefined>;
  createCpProfile(profile: InsertCpProfile): Promise<CpProfile>;
  updateCpProfile(userId: string, data: UpdateCpProfile): Promise<CpProfile | undefined>;

  // Marketing Counters
  getMarketingCountersByCp(cpId: string): Promise<MarketingCounter[]>;
  getMarketingCounter(cpId: string, projectId?: string): Promise<MarketingCounter | undefined>;
  createMarketingCounter(data: InsertMarketingCounter): Promise<MarketingCounter>;
  incrementMarketingCounter(cpId: string, projectId: string | null, creatives?: number, edms?: number): Promise<MarketingCounter | undefined>;

  // Marketing Requests
  getMarketingRequest(id: string): Promise<MarketingRequest | undefined>;
  getMarketingRequestsByCp(cpId: string): Promise<MarketingRequest[]>;
  createMarketingRequest(data: InsertMarketingRequest): Promise<MarketingRequest>;
  updateMarketingRequestStatus(id: string, status: string): Promise<MarketingRequest | undefined>;

  // Paginated Leads for CP
  getLeadsByCpPaginated(cpId: string, options: { page?: number; limit?: number; projectId?: string; status?: string; dateFrom?: Date }): Promise<{ data: Lead[]; total: number }>;
  countLeadsByCp(cpId: string, dateFrom?: Date): Promise<number>;
  getUniqueProjectsCountForCp(cpId: string): Promise<number>;
  getActiveAdsCountByCp(cpId: string): Promise<number>;

  // Update user profile
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // ============ USERS ============
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  // ============ PROJECTS ============
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByDeveloper(developerId: string): Promise<Project[]> {
    return db.select().from(projects)
      .where(eq(projects.developerId, developerId))
      .orderBy(desc(projects.createdAt));
  }

  async getAllActiveProjects(): Promise<Project[]> {
    return db.select().from(projects)
      .where(eq(projects.isActive, true))
      .orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // ============ CP-PROJECT MAPPING ============
  async getCpProjectMap(id: string): Promise<CpProjectMap | undefined> {
    const [mapping] = await db.select().from(cpProjectMap).where(eq(cpProjectMap.id, id));
    return mapping;
  }

  async getProjectsByCp(cpId: string): Promise<CpProjectMap[]> {
    return db.select().from(cpProjectMap)
      .where(eq(cpProjectMap.cpId, cpId))
      .orderBy(desc(cpProjectMap.assignedAt));
  }

  async getCpsByProject(projectId: string): Promise<CpProjectMap[]> {
    return db.select().from(cpProjectMap)
      .where(eq(cpProjectMap.projectId, projectId))
      .orderBy(desc(cpProjectMap.assignedAt));
  }

  async assignCpToProject(data: InsertCpProjectMap): Promise<CpProjectMap> {
    const [mapping] = await db.insert(cpProjectMap).values(data).returning();
    return mapping;
  }

  async updateCpProjectStatus(id: string, status: string): Promise<CpProjectMap | undefined> {
    const [updated] = await db.update(cpProjectMap)
      .set({ status: status as "pending" | "approved" | "rejected" })
      .where(eq(cpProjectMap.id, id))
      .returning();
    return updated;
  }

  // ============ LEADS ============
  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadsByCp(cpId: string): Promise<Lead[]> {
    return db.select().from(leads)
      .where(eq(leads.cpId, cpId))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByDeveloper(developerId: string): Promise<Lead[]> {
    return db.select().from(leads)
      .where(eq(leads.developerId, developerId))
      .orderBy(desc(leads.createdAt));
  }

  async getLeadsByProject(projectId: string): Promise<Lead[]> {
    return db.select().from(leads)
      .where(eq(leads.projectId, projectId))
      .orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const [updated] = await db.update(leads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  // ============ ADS ============
  async getAd(id: string): Promise<Ad | undefined> {
    const [ad] = await db.select().from(ads).where(eq(ads.id, id));
    return ad;
  }

  async getAdsByCp(cpId: string): Promise<Ad[]> {
    return db.select().from(ads)
      .where(eq(ads.cpId, cpId))
      .orderBy(desc(ads.createdAt));
  }

  async getAdsByDeveloper(developerId: string): Promise<Ad[]> {
    return db.select().from(ads)
      .where(eq(ads.developerId, developerId))
      .orderBy(desc(ads.createdAt));
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const [newAd] = await db.insert(ads).values(ad).returning();
    return newAd;
  }

  async updateAd(id: string, data: Partial<InsertAd>): Promise<Ad | undefined> {
    const [updated] = await db.update(ads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ads.id, id))
      .returning();
    return updated;
  }

  // ============ CP PROFILES ============
  async getCpProfile(userId: string): Promise<CpProfile | undefined> {
    const [profile] = await db.select().from(cpProfiles).where(eq(cpProfiles.userId, userId));
    return profile;
  }

  async createCpProfile(profile: InsertCpProfile): Promise<CpProfile> {
    const [newProfile] = await db.insert(cpProfiles).values(profile).returning();
    return newProfile;
  }

  async updateCpProfile(userId: string, data: UpdateCpProfile): Promise<CpProfile | undefined> {
    const [updated] = await db.update(cpProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cpProfiles.userId, userId))
      .returning();
    return updated;
  }

  // ============ MARKETING COUNTERS ============
  async getMarketingCountersByCp(cpId: string): Promise<MarketingCounter[]> {
    return db.select().from(marketingCounters).where(eq(marketingCounters.cpId, cpId));
  }

  async getMarketingCounter(cpId: string, projectId?: string): Promise<MarketingCounter | undefined> {
    if (projectId) {
      const [counter] = await db.select().from(marketingCounters)
        .where(and(eq(marketingCounters.cpId, cpId), eq(marketingCounters.projectId, projectId)));
      return counter;
    } else {
      const [counter] = await db.select().from(marketingCounters)
        .where(and(eq(marketingCounters.cpId, cpId), isNull(marketingCounters.projectId)));
      return counter;
    }
  }

  async createMarketingCounter(data: InsertMarketingCounter): Promise<MarketingCounter> {
    const [counter] = await db.insert(marketingCounters).values(data).returning();
    return counter;
  }

  async incrementMarketingCounter(cpId: string, projectId: string | null, creatives?: number, edms?: number): Promise<MarketingCounter | undefined> {
    const condition = projectId 
      ? and(eq(marketingCounters.cpId, cpId), eq(marketingCounters.projectId, projectId))
      : and(eq(marketingCounters.cpId, cpId), isNull(marketingCounters.projectId));
    
    const [existing] = await db.select().from(marketingCounters).where(condition);
    
    if (!existing) {
      const [created] = await db.insert(marketingCounters).values({
        cpId,
        projectId: projectId || undefined,
        creativesShared: creatives || 0,
        edmsShared: edms || 0,
      }).returning();
      return created;
    }

    const [updated] = await db.update(marketingCounters)
      .set({
        creativesShared: (existing.creativesShared || 0) + (creatives || 0),
        edmsShared: (existing.edmsShared || 0) + (edms || 0),
        lastUpdated: new Date(),
      })
      .where(condition)
      .returning();
    return updated;
  }

  // ============ MARKETING REQUESTS ============
  async getMarketingRequest(id: string): Promise<MarketingRequest | undefined> {
    const [request] = await db.select().from(marketingRequests).where(eq(marketingRequests.id, id));
    return request;
  }

  async getMarketingRequestsByCp(cpId: string): Promise<MarketingRequest[]> {
    return db.select().from(marketingRequests)
      .where(eq(marketingRequests.cpId, cpId))
      .orderBy(desc(marketingRequests.createdAt));
  }

  async createMarketingRequest(data: InsertMarketingRequest): Promise<MarketingRequest> {
    const [request] = await db.insert(marketingRequests).values(data).returning();
    return request;
  }

  async updateMarketingRequestStatus(id: string, status: string): Promise<MarketingRequest | undefined> {
    const [updated] = await db.update(marketingRequests)
      .set({ status: status as "pending" | "in_progress" | "completed" | "cancelled", updatedAt: new Date() })
      .where(eq(marketingRequests.id, id))
      .returning();
    return updated;
  }

  // ============ PAGINATED LEADS FOR CP ============
  async getLeadsByCpPaginated(cpId: string, options: { page?: number; limit?: number; projectId?: string; status?: string; dateFrom?: Date }): Promise<{ data: Lead[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    let conditions = [eq(leads.cpId, cpId)];
    if (options.projectId) {
      conditions.push(eq(leads.projectId, options.projectId));
    }
    if (options.status) {
      conditions.push(eq(leads.status, options.status as any));
    }
    if (options.dateFrom) {
      conditions.push(gte(leads.createdAt, options.dateFrom));
    }

    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

    const data = await db.select().from(leads)
      .where(whereClause)
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(whereClause);

    return { data, total: countResult?.count || 0 };
  }

  async countLeadsByCp(cpId: string, dateFrom?: Date): Promise<number> {
    let conditions = [eq(leads.cpId, cpId)];
    if (dateFrom) {
      conditions.push(gte(leads.createdAt, dateFrom));
    }
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
    
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(whereClause);
    return result?.count || 0;
  }

  async getUniqueProjectsCountForCp(cpId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(distinct ${cpProjectMap.projectId})::int` })
      .from(cpProjectMap)
      .where(eq(cpProjectMap.cpId, cpId));
    return result?.count || 0;
  }

  async getActiveAdsCountByCp(cpId: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)::int` })
      .from(ads)
      .where(and(eq(ads.cpId, cpId), eq(ads.status, "active")));
    return result?.count || 0;
  }

  // ============ UPDATE USER ============
  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
