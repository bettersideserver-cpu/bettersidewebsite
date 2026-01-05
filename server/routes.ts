import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, loginSchema, 
  insertProjectSchema, insertLeadSchema, insertAdSchema, insertCpProjectMapSchema,
  updateLeadSchema, updateAdSchema,
  insertCpLeadSchema, insertAdsRequestSchema,
  updateCpProfileSchema, insertMarketingRequestSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import bcrypt from "bcryptjs";

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated", code: "UNAUTHORIZED" });
  }
  next();
};

const requireCp = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated", code: "UNAUTHORIZED" });
  }
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "cp") {
    return res.status(403).json({ error: "Access denied. CP role required", code: "FORBIDDEN" });
  }
  (req as any).cpUser = user;
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminToken = process.env.ADMIN_TOKEN;
  const authHeader = req.headers.authorization;
  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return res.status(403).json({ error: "Admin access required", code: "FORBIDDEN" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // User Registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: fromZodError(result.error).message 
        });
      }

      const userData = result.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Store in session
      if (req.session) {
        req.session.userId = user.id;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  // User Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: fromZodError(result.error).message 
        });
      }

      const { email, password } = result.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Store in session
      if (req.session) {
        req.session.userId = user.id;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Get Current User
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    req.session?.destroy((err: Error | null) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // ============ PROJECTS ============

  // Get all active projects (public) or developer's projects
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let projects;
      if (user.role === "developer") {
        projects = await storage.getProjectsByDeveloper(user.id);
      } else {
        projects = await storage.getAllActiveProjects();
      }
      res.json(projects);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ error: "Failed to get projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ error: "Failed to get project" });
    }
  });

  // Create project (developer only)
  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== "developer") {
        return res.status(403).json({ error: "Only developers can create projects" });
      }

      const result = insertProjectSchema.safeParse({ ...req.body, developerId: user.id });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const project = await storage.createProject(result.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Create project error:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project (developer only, own projects)
  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== "developer") {
        return res.status(403).json({ error: "Only developers can update projects" });
      }

      const project = await storage.getProject(req.params.id);
      if (!project || project.developerId !== user.id) {
        return res.status(404).json({ error: "Project not found" });
      }

      const updated = await storage.updateProject(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update project error:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project (developer only, own projects)
  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== "developer") {
        return res.status(403).json({ error: "Only developers can delete projects" });
      }

      const project = await storage.getProject(req.params.id);
      if (!project || project.developerId !== user.id) {
        return res.status(404).json({ error: "Project not found" });
      }

      await storage.deleteProject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete project error:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // ============ LEADS ============

  // Get leads (filtered by user role)
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let leads;
      if (user.role === "cp") {
        leads = await storage.getLeadsByCp(user.id);
      } else if (user.role === "developer") {
        leads = await storage.getLeadsByDeveloper(user.id);
      } else {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(leads);
    } catch (error) {
      console.error("Get leads error:", error);
      res.status(500).json({ error: "Failed to get leads" });
    }
  });

  // Get single lead
  app.get("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      if (user.role === "cp" && lead.cpId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "developer" && lead.developerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "buyer") {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(lead);
    } catch (error) {
      console.error("Get lead error:", error);
      res.status(500).json({ error: "Failed to get lead" });
    }
  });

  // Create lead (CP only)
  app.post("/api/leads", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== "cp") {
        return res.status(403).json({ error: "Only channel partners can create leads" });
      }

      const result = insertLeadSchema.safeParse({ ...req.body, cpId: user.id });
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const lead = await storage.createLead(result.data);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Create lead error:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Update lead
  app.put("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      if (user.role === "cp" && lead.cpId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "developer" && lead.developerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "buyer") {
        return res.status(403).json({ error: "Access denied" });
      }

      const result = updateLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const updated = await storage.updateLead(req.params.id, result.data);
      res.json(updated);
    } catch (error) {
      console.error("Update lead error:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // ============ ADS ============

  // Get ads (filtered by user role)
  app.get("/api/ads", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let ads;
      if (user.role === "cp") {
        ads = await storage.getAdsByCp(user.id);
      } else if (user.role === "developer") {
        ads = await storage.getAdsByDeveloper(user.id);
      } else {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(ads);
    } catch (error) {
      console.error("Get ads error:", error);
      res.status(500).json({ error: "Failed to get ads" });
    }
  });

  // Get single ad
  app.get("/api/ads/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const ad = await storage.getAd(req.params.id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      if (user.role === "cp" && ad.cpId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "developer" && ad.developerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "buyer") {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(ad);
    } catch (error) {
      console.error("Get ad error:", error);
      res.status(500).json({ error: "Failed to get ad" });
    }
  });

  // Create ad
  app.post("/api/ads", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const adData = { ...req.body };
      if (user.role === "cp") {
        adData.cpId = user.id;
      } else if (user.role === "developer") {
        adData.developerId = user.id;
      } else {
        return res.status(403).json({ error: "Access denied" });
      }

      const result = insertAdSchema.safeParse(adData);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const ad = await storage.createAd(result.data);
      res.status(201).json(ad);
    } catch (error) {
      console.error("Create ad error:", error);
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  // Update ad
  app.put("/api/ads/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const ad = await storage.getAd(req.params.id);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }

      if (user.role === "cp" && ad.cpId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "developer" && ad.developerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "buyer") {
        return res.status(403).json({ error: "Access denied" });
      }

      const result = updateAdSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const updated = await storage.updateAd(req.params.id, result.data);
      res.json(updated);
    } catch (error) {
      console.error("Update ad error:", error);
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  // ============ CP-PROJECT ASSIGNMENTS ============

  // Get CP's project assignments
  app.get("/api/cp-projects", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let assignments;
      if (user.role === "cp") {
        assignments = await storage.getProjectsByCp(user.id);
      } else if (user.role === "developer") {
        const projectId = req.query.projectId as string;
        if (projectId) {
          const project = await storage.getProject(projectId);
          if (!project || project.developerId !== user.id) {
            return res.status(403).json({ error: "Access denied" });
          }
          assignments = await storage.getCpsByProject(projectId);
        } else {
          return res.status(400).json({ error: "Project ID required for developers" });
        }
      } else {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(assignments);
    } catch (error) {
      console.error("Get CP projects error:", error);
      res.status(500).json({ error: "Failed to get CP project assignments" });
    }
  });

  // Assign CP to project (developer owns project, or CP requesting access)
  app.post("/api/cp-projects", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const result = insertCpProjectMapSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }

      const project = await storage.getProject(result.data.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (user.role === "developer" && project.developerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (user.role === "cp" && result.data.cpId !== user.id) {
        return res.status(403).json({ error: "CPs can only request access for themselves" });
      }
      if (user.role === "buyer") {
        return res.status(403).json({ error: "Access denied" });
      }

      const assignment = await storage.assignCpToProject(result.data);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Assign CP to project error:", error);
      res.status(500).json({ error: "Failed to assign CP to project" });
    }
  });

  // Update CP-project status (developer only, must own project)
  app.put("/api/cp-projects/:id/status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== "developer") {
        return res.status(403).json({ error: "Only developers can update assignment status" });
      }

      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const assignment = await storage.getCpProjectMap(req.params.id);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const project = await storage.getProject(assignment.projectId);
      if (!project || project.developerId !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updated = await storage.updateCpProjectStatus(req.params.id, status);
      res.json(updated);
    } catch (error) {
      console.error("Update CP project status error:", error);
      res.status(500).json({ error: "Failed to update assignment status" });
    }
  });

  // Get all CPs (for developers to see available channel partners)
  app.get("/api/users/cps", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session!.userId);
      if (!user || user.role !== "developer") {
        return res.status(403).json({ error: "Only developers can view channel partners" });
      }

      const cps = await storage.getUsersByRole("cp");
      const cpsWithoutPassword = cps.map(({ password, ...cp }) => cp);
      res.json(cpsWithoutPassword);
    } catch (error) {
      console.error("Get CPs error:", error);
      res.status(500).json({ error: "Failed to get channel partners" });
    }
  });

  // ============ CP PANEL ENDPOINTS ============

  // CP Dashboard Stats
  app.get("/api/cp/dashboard", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [todaysLeads, totalLeads, activeProjects, activeAds] = await Promise.all([
        storage.countLeadsByCp(cpUser.id, today),
        storage.countLeadsByCp(cpUser.id),
        storage.getUniqueProjectsCountForCp(cpUser.id),
        storage.getActiveAdsCountByCp(cpUser.id),
      ]);

      res.json({
        todaysLeads,
        totalLeads,
        activeProjects,
        activeAds,
      });
    } catch (error) {
      console.error("CP Dashboard error:", error);
      res.status(500).json({ error: "Failed to load dashboard", code: "SERVER_ERROR" });
    }
  });

  // CP Leads - List with pagination
  app.get("/api/cp/leads", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const { page, limit, project_id, status, date } = req.query;
      
      let dateFrom: Date | undefined;
      if (date === "today") {
        dateFrom = new Date();
        dateFrom.setHours(0, 0, 0, 0);
      }

      const result = await storage.getLeadsByCpPaginated(cpUser.id, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        projectId: project_id as string,
        status: status as string,
        dateFrom,
      });

      res.json({
        data: result.data,
        meta: {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
          total: result.total,
        },
      });
    } catch (error) {
      console.error("CP Leads list error:", error);
      res.status(500).json({ error: "Failed to load leads", code: "SERVER_ERROR" });
    }
  });

  // CP Leads - Get single lead
  app.get("/api/cp/leads/:id", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const lead = await storage.getLead(req.params.id);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found", code: "NOT_FOUND" });
      }
      if (lead.cpId !== cpUser.id) {
        return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" });
      }

      res.json(lead);
    } catch (error) {
      console.error("CP Get lead error:", error);
      res.status(500).json({ error: "Failed to get lead", code: "SERVER_ERROR" });
    }
  });

  // CP Leads - Create lead with 10-digit phone validation
  app.post("/api/cp/leads", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const result = insertCpLeadSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: fromZodError(result.error).message,
          code: "VALIDATION_ERROR" 
        });
      }

      const lead = await storage.createLead({
        cpId: cpUser.id,
        projectId: result.data.projectId,
        developerId: result.data.developerId,
        customerName: result.data.customerName,
        customerPhone: result.data.customerPhone,
        customerEmail: result.data.customerEmail || null,
        customerCity: result.data.customerCity,
        budget: result.data.budget,
        source: result.data.source,
        status: result.data.status || "new",
        notes: result.data.notes,
      });

      res.status(201).json(lead);
    } catch (error) {
      console.error("CP Create lead error:", error);
      res.status(500).json({ error: "Failed to create lead", code: "SERVER_ERROR" });
    }
  });

  // CP Leads - Update lead
  app.put("/api/cp/leads/:id", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const lead = await storage.getLead(req.params.id);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found", code: "NOT_FOUND" });
      }
      if (lead.cpId !== cpUser.id) {
        return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" });
      }

      const result = updateLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: fromZodError(result.error).message,
          code: "VALIDATION_ERROR" 
        });
      }

      const updated = await storage.updateLead(req.params.id, result.data);
      res.json(updated);
    } catch (error) {
      console.error("CP Update lead error:", error);
      res.status(500).json({ error: "Failed to update lead", code: "SERVER_ERROR" });
    }
  });

  // CP Leads - Delete lead
  app.delete("/api/cp/leads/:id", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const lead = await storage.getLead(req.params.id);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found", code: "NOT_FOUND" });
      }
      if (lead.cpId !== cpUser.id) {
        return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" });
      }

      // Soft delete by updating status
      await storage.updateLead(req.params.id, { status: "lost" });
      res.status(204).send();
    } catch (error) {
      console.error("CP Delete lead error:", error);
      res.status(500).json({ error: "Failed to delete lead", code: "SERVER_ERROR" });
    }
  });

  // CP Ads Requests - List
  app.get("/api/cp/ads-requests", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const ads = await storage.getAdsByCp(cpUser.id);
      
      res.json({
        data: ads,
        meta: { total: ads.length },
      });
    } catch (error) {
      console.error("CP Ads list error:", error);
      res.status(500).json({ error: "Failed to load ad requests", code: "SERVER_ERROR" });
    }
  });

  // CP Ads Requests - Get single
  app.get("/api/cp/ads-requests/:id", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const ad = await storage.getAd(req.params.id);
      
      if (!ad) {
        return res.status(404).json({ error: "Ad request not found", code: "NOT_FOUND" });
      }
      if (ad.cpId !== cpUser.id) {
        return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" });
      }

      res.json(ad);
    } catch (error) {
      console.error("CP Get ad error:", error);
      res.status(500).json({ error: "Failed to get ad request", code: "SERVER_ERROR" });
    }
  });

  // CP Ads Requests - Create (Run Ads)
  app.post("/api/cp/ads-requests", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const result = insertAdsRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: fromZodError(result.error).message,
          code: "VALIDATION_ERROR" 
        });
      }

      // Verify project exists
      const project = await storage.getProject(result.data.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found", code: "NOT_FOUND" });
      }

      const ad = await storage.createAd({
        cpId: cpUser.id,
        projectId: result.data.projectId,
        title: `${result.data.objective} Campaign`,
        description: result.data.notes || "",
        budget: result.data.budgetInr,
        status: "pending",
        platform: "all",
        startDate: new Date(),
        endDate: new Date(Date.now() + result.data.durationDays * 24 * 60 * 60 * 1000),
      });

      res.status(201).json(ad);
    } catch (error) {
      console.error("CP Create ad error:", error);
      res.status(500).json({ error: "Failed to create ad request", code: "SERVER_ERROR" });
    }
  });

  // CP Ads Requests - Update (cancel or update notes)
  app.put("/api/cp/ads-requests/:id", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const ad = await storage.getAd(req.params.id);
      
      if (!ad) {
        return res.status(404).json({ error: "Ad request not found", code: "NOT_FOUND" });
      }
      if (ad.cpId !== cpUser.id) {
        return res.status(403).json({ error: "Access denied", code: "FORBIDDEN" });
      }

      const { status, description } = req.body;
      const updates: any = {};
      
      if (status === "cancelled") {
        updates.status = "cancelled";
      }
      if (description !== undefined) {
        updates.description = description;
      }

      const updated = await storage.updateAd(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("CP Update ad error:", error);
      res.status(500).json({ error: "Failed to update ad request", code: "SERVER_ERROR" });
    }
  });

  // CP Marketing Counters
  app.get("/api/cp/marketing", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const counters = await storage.getMarketingCountersByCp(cpUser.id);
      
      let totalCreatives = 0;
      let totalEdms = 0;
      const perProject: any[] = [];

      for (const counter of counters) {
        totalCreatives += counter.creativesShared || 0;
        totalEdms += counter.edmsShared || 0;
        
        if (counter.projectId) {
          const project = await storage.getProject(counter.projectId);
          perProject.push({
            projectId: counter.projectId,
            projectTitle: project?.name || "Unknown",
            creativesShared: counter.creativesShared || 0,
            edmsShared: counter.edmsShared || 0,
          });
        }
      }

      res.json({
        creatives_shared: totalCreatives,
        edms_shared: totalEdms,
        per_project: perProject,
      });
    } catch (error) {
      console.error("CP Marketing counters error:", error);
      res.status(500).json({ error: "Failed to load marketing counters", code: "SERVER_ERROR" });
    }
  });

  // Admin endpoint to increment marketing counters
  app.post("/api/cp/marketing/increment", requireAdmin, async (req, res) => {
    try {
      const { cp_id, project_id, creatives, edms } = req.body;
      
      if (!cp_id) {
        return res.status(400).json({ error: "cp_id required", code: "VALIDATION_ERROR" });
      }

      const counter = await storage.incrementMarketingCounter(
        cp_id,
        project_id || null,
        creatives || 0,
        edms || 0
      );

      res.json(counter);
    } catch (error) {
      console.error("Increment marketing counters error:", error);
      res.status(500).json({ error: "Failed to increment counters", code: "SERVER_ERROR" });
    }
  });

  // CP Marketing Request (request creative/edm)
  app.post("/api/cp/marketing/request", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const { project_id, type, notes } = req.body;

      if (!type || !["creative", "edm"].includes(type)) {
        return res.status(400).json({ 
          error: "Invalid request type. Must be 'creative' or 'edm'",
          code: "VALIDATION_ERROR" 
        });
      }

      const request = await storage.createMarketingRequest({
        cpId: cpUser.id,
        projectId: project_id,
        requestType: type,
        notes: notes || "",
        status: "pending",
      });

      res.status(201).json(request);
    } catch (error) {
      console.error("CP Marketing request error:", error);
      res.status(500).json({ error: "Failed to create marketing request", code: "SERVER_ERROR" });
    }
  });

  // CP Marketing Requests List
  app.get("/api/cp/marketing/requests", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const requests = await storage.getMarketingRequestsByCp(cpUser.id);
      res.json({ data: requests, meta: { total: requests.length } });
    } catch (error) {
      console.error("CP Marketing requests list error:", error);
      res.status(500).json({ error: "Failed to load marketing requests", code: "SERVER_ERROR" });
    }
  });

  // CP Profile - Get
  app.get("/api/cp/profile", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const profile = await storage.getCpProfile(cpUser.id);
      
      if (!profile) {
        // Return user data as fallback if no separate profile exists
        const { password, ...userWithoutPassword } = cpUser;
        return res.json({
          userId: cpUser.id,
          fullName: cpUser.fullName || "",
          companyName: cpUser.companyName || "",
          phone: cpUser.phone || "",
          city: cpUser.city || "",
          email: cpUser.email,
        });
      }

      res.json({
        ...profile,
        email: cpUser.email,
      });
    } catch (error) {
      console.error("CP Profile get error:", error);
      res.status(500).json({ error: "Failed to load profile", code: "SERVER_ERROR" });
    }
  });

  // CP Profile - Update
  app.put("/api/cp/profile", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const result = updateCpProfileSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: fromZodError(result.error).message,
          code: "VALIDATION_ERROR" 
        });
      }

      // Check if profile exists
      const existingProfile = await storage.getCpProfile(cpUser.id);
      
      if (existingProfile) {
        const updated = await storage.updateCpProfile(cpUser.id, result.data);
        return res.json(updated);
      }

      // Create new profile if doesn't exist
      const newProfile = await storage.createCpProfile({
        userId: cpUser.id,
        fullName: result.data.fullName || cpUser.fullName || "",
        companyName: result.data.companyName || cpUser.companyName || "",
        phone: result.data.phone || cpUser.phone || "",
        city: result.data.city || cpUser.city || "",
        extraJson: result.data.extraJson,
      });

      res.json(newProfile);
    } catch (error) {
      console.error("CP Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile", code: "SERVER_ERROR" });
    }
  });

  // CP Projects - Get assigned projects
  app.get("/api/cp/projects", requireCp, async (req, res) => {
    try {
      const cpUser = (req as any).cpUser;
      const assignments = await storage.getProjectsByCp(cpUser.id);
      
      // Enrich with project details
      const projectsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const project = await storage.getProject(assignment.projectId);
          return {
            ...assignment,
            project: project || null,
          };
        })
      );

      res.json(projectsWithDetails);
    } catch (error) {
      console.error("CP Projects error:", error);
      res.status(500).json({ error: "Failed to load projects", code: "SERVER_ERROR" });
    }
  });

  return httpServer;
}
