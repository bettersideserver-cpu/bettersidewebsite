import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, Phone, MessageSquare, PlusCircle, Loader2 } from "lucide-react";
import { getCpDashboardStats, getCpLeads, updateCpLead } from "../../lib/api";

interface DashboardStats {
  todaysLeads: number;
  totalLeads: number;
  activeProjects: number;
  activeAds: number;
}

interface Lead {
  id: string;
  customerName: string;
  customerPhone: string;
  projectId: string;
  source: string;
  status: string;
  createdAt: string;
  notes?: string;
}

const CpDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayLeads, setTodayLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const rawName = localStorage.getItem("userName") || "Channel Partner";

  const formatName = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formattedName = formatName(rawName);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, leadsData] = await Promise.all([
        getCpDashboardStats(),
        getCpLeads({ date: "today", limit: 5 }),
      ]);
      setStats(statsData);
      setTodayLeads(leadsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string, previousStatus: string) => {
    setTodayLeads(leads => leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    setStatusError(null);
    try {
      await updateCpLead(leadId, { status: newStatus });
    } catch (err) {
      setTodayLeads(leads => leads.map(l => l.id === leadId ? { ...l, status: previousStatus } : l));
      setStatusError(err instanceof Error ? err.message : "Failed to update status");
      setTimeout(() => setStatusError(null), 3000);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      meta_ads: "Meta Ads",
      organic: "Organic",
      betterside: "BetterSide IPX",
      referral: "Referral",
      other: "Other",
    };
    return labels[source] || source;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: "New",
      contacted: "Called - Contacted",
      site_visit: "Site Visit",
      negotiation: "Negotiation",
      converted: "Converted",
      lost: "Lost",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const statsDisplay = [
    { label: "Today's Leads", value: stats?.todaysLeads?.toString() || "0", trend: todayLeads.length > 0 ? `+${todayLeads.length}` : "0", color: "bg-blue-500/20 text-blue-400" },
    { label: "Total Leads", value: stats?.totalLeads?.toString() || "0", trend: "+15%", color: "bg-orange-500/20 text-orange-400" },
    { label: "Active Projects", value: stats?.activeProjects?.toString() || "0", trend: "Running", color: "bg-emerald-500/20 text-emerald-400" },
    { label: "Ads in Progress", value: stats?.activeAds?.toString() || "0", trend: "Reviewing", color: "bg-purple-500/20 text-purple-400" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-welcome">Welcome, {formattedName}!</h1>
        <p className="text-white/60">Here's what's happening with your projects today.</p>
      </div>

      {statusError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400" data-testid="text-status-error">
          {statusError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat, i) => (
          <div key={i} className="bg-[#0B0F1A] border border-white/5 p-6 rounded-2xl shadow-lg hover:border-white/10 transition-colors" data-testid={`card-stat-${i}`}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-white/60 text-sm font-medium">{stat.label}</p>
              <div className={`px-2 py-1 rounded text-xs font-bold ${stat.color}`}>
                {stat.trend}
              </div>
            </div>
            <h3 className="text-4xl font-display font-bold text-white" data-testid={`text-stat-${i}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-[#0B0F1A] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Today's Leads</h2>
          <Link href="/cp-dashboard/leads">
            <span className="text-sm text-primary hover:text-primary/80 cursor-pointer font-medium flex items-center gap-1" data-testid="link-view-all-leads">
              View All <ArrowUpRight size={16} />
            </span>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {todayLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No leads received today yet.
                  </td>
                </tr>
              ) : (
                todayLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors" data-testid={`row-lead-${lead.id}`}>
                    <td className="px-6 py-4 font-medium text-white">{lead.customerName}</td>
                    <td className="px-6 py-4 text-white/80">{lead.customerPhone}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-white/5 text-xs text-white/70 border border-white/10">
                        {getSourceLabel(lead.source)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60 text-xs font-mono">{formatTime(lead.createdAt)}</td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-[#050816] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value, lead.status)}
                        data-testid={`select-status-${lead.id}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Called - Contacted</option>
                        <option value="site_visit">Site Visit</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="converted">Converted</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <a href={`tel:${lead.customerPhone}`} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-green-400 transition-colors" title="Call" data-testid={`button-call-${lead.id}`}>
                          <Phone size={16} />
                        </a>
                        <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-blue-400 transition-colors" title="Notes" data-testid={`button-notes-${lead.id}`}>
                          <MessageSquare size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Need more qualified leads?</h3>
          <p className="text-white/70 max-w-xl">
            Launch targeted ad campaigns with BetterSide's marketing experts. We handle the creative, targeting, and optimization.
          </p>
        </div>
        <Link href="/cp-dashboard/ads">
          <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap" data-testid="button-run-ads">
            <PlusCircle size={20} />
            Run Ads with BetterSide
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CpDashboard;
