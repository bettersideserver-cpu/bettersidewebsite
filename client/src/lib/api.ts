import type { User } from "@shared/schema";

export async function register(data: {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  password: string;
  companyName?: string;
  contactPerson?: string;
  gstNumber?: string;
  reraNumber?: string;
  isReraRegistered?: boolean;
  docLink?: string;
  budget?: string;
}): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

// CP Dashboard API
export async function getCpDashboardStats() {
  const response = await fetch("/api/cp/dashboard", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load dashboard stats");
  return response.json();
}

// CP Leads API
export async function getCpLeads(params?: { page?: number; limit?: number; project_id?: string; status?: string; date?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set("page", params.page.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.project_id) queryParams.set("project_id", params.project_id);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.date) queryParams.set("date", params.date);
  
  const response = await fetch(`/api/cp/leads?${queryParams}`, { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load leads");
  return response.json();
}

export async function createCpLead(data: { customerName: string; customerPhone: string; customerEmail?: string; projectId?: string; source?: string; notes?: string }) {
  const response = await fetch("/api/cp/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create lead");
  }
  return response.json();
}

export async function updateCpLead(id: string, data: { status?: string; notes?: string }) {
  const response = await fetch(`/api/cp/leads/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update lead");
  return response.json();
}

// CP Ads API
export async function getCpAdsRequests() {
  const response = await fetch("/api/cp/ads-requests", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load ad requests");
  return response.json();
}

export async function createCpAdRequest(data: { projectId: string; objective: string; budgetInr: number; durationDays: number; targetArea?: string; notes?: string }) {
  const response = await fetch("/api/cp/ads-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create ad request");
  }
  return response.json();
}

// CP Marketing API
export async function getCpMarketing() {
  const response = await fetch("/api/cp/marketing", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load marketing data");
  return response.json();
}

export async function createCpMarketingRequest(data: { project_id?: string; type: string; notes?: string }) {
  const response = await fetch("/api/cp/marketing/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create marketing request");
  return response.json();
}

export async function getCpMarketingRequests() {
  const response = await fetch("/api/cp/marketing/requests", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load marketing requests");
  return response.json();
}

// CP Profile API
export async function getCpProfile() {
  const response = await fetch("/api/cp/profile", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load profile");
  return response.json();
}

export async function updateCpProfile(data: { fullName?: string; companyName?: string; phone?: string; city?: string }) {
  const response = await fetch("/api/cp/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }
  return response.json();
}

// CP Projects API
export async function getCpProjects() {
  const response = await fetch("/api/cp/projects", { credentials: "include" });
  if (!response.ok) throw new Error("Failed to load projects");
  return response.json();
}
