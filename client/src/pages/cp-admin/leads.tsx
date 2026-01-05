import React, { useState, useEffect } from "react";
import { Search, Filter, Download, MessageSquare, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { getCpLeads, getCpProjects, updateCpLead } from "../../lib/api";

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

interface Project {
  id: string;
  name: string;
}

const CpLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadData();
  }, [page, projectFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (projectFilter !== "All") params.project_id = projectFilter;
      if (statusFilter !== "All") params.status = statusFilter;

      const [leadsData, projectsData] = await Promise.all([
        getCpLeads(params),
        getCpProjects(),
      ]);
      
      setLeads(leadsData.data);
      setTotalPages(leadsData.pagination.totalPages);
      setTotal(leadsData.pagination.total);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string, previousStatus: string) => {
    setLeads(leads => leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    try {
      await updateCpLead(leadId, { status: newStatus });
    } catch (err) {
      setLeads(leads => leads.map(l => l.id === leadId ? { ...l, status: previousStatus } : l));
      setError(err instanceof Error ? err.message : "Failed to update lead status");
      setTimeout(() => setError(null), 3000);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.customerPhone.includes(searchTerm);
    return matchesSearch;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error && leads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-leads-title">My Leads</h1>
          <p className="text-white/60">Manage and track all your potential clients. ({total} total)</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2 text-sm font-medium" data-testid="button-export-csv">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400" data-testid="text-error">
          {error}
        </div>
      )}

      <div className="bg-[#0B0F1A] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            className="w-full bg-[#050816] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-leads"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative min-w-[180px]">
            <select 
              className="w-full bg-[#050816] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white appearance-none focus:outline-none focus:border-primary cursor-pointer"
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
              data-testid="select-project-filter"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
          </div>
          
          <div className="relative min-w-[160px]">
            <select 
              className="w-full bg-[#050816] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white appearance-none focus:outline-none focus:border-primary cursor-pointer"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              data-testid="select-status-filter"
            >
              <option value="All">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="site_visit">Site Visit</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-[#0B0F1A] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors" data-testid={`row-lead-${lead.id}`}>
                  <td className="px-6 py-4 font-medium text-white">{lead.customerName}</td>
                  <td className="px-6 py-4 text-white/80">{lead.customerPhone}</td>
                  <td className="px-6 py-4 text-white/80">{getProjectName(lead.projectId)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded bg-white/5 text-xs text-white/70 border border-white/10">
                      {getSourceLabel(lead.source)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-xs font-mono">{formatDate(lead.createdAt)}</td>
                  <td className="px-6 py-4">
                    <select 
                      className="bg-[#050816] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary w-full max-w-[160px]"
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value, lead.status)}
                      data-testid={`select-status-${lead.id}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="site_visit">Site Visit</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-blue-400 transition-colors" title="View Notes" data-testid={`button-notes-${lead.id}`}>
                      <MessageSquare size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/40">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-white/60 text-sm">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                data-testid="button-prev-page"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                data-testid="button-next-page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CpLeads;
