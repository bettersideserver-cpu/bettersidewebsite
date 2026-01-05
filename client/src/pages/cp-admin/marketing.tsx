import React, { useState, useEffect } from "react";
import { Info, Loader2 } from "lucide-react";
import { getCpMarketing, getCpMarketingRequests, getCpProjects } from "../../lib/api";

interface MarketingStats {
  creativesToday: number;
  creativesMonth: number;
  creativesTotal: number;
  edmsTotal: number;
}

interface MarketingRequest {
  id: string;
  cpId: string;
  projectId?: string;
  type: string;
  status: string;
  createdAt: string;
  notes?: string;
}

interface Project {
  id: string;
  name: string;
}

const CpMarketingSupport = () => {
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [requests, setRequests] = useState<MarketingRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [marketingData, requestsData, projectsData] = await Promise.all([
        getCpMarketing(),
        getCpMarketingRequests(),
        getCpProjects(),
      ]);
      setStats(marketingData);
      setRequests(requestsData);
      setProjects(projectsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marketing data");
    } finally {
      setLoading(false);
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return "All Projects";
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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
    { label: "Creatives Today", value: stats?.creativesToday?.toString() || "0" },
    { label: "Creatives this Month", value: stats?.creativesMonth?.toString() || "0" },
    { label: "Total Creatives", value: stats?.creativesTotal?.toString() || "0" },
    { label: "EDMs Sent", value: stats?.edmsTotal?.toString() || "0" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-marketing-title">Marketing Support</h1>
        <p className="text-white/60">Track the marketing collateral shared with you.</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-blue-200/80 leading-relaxed">
          Actual creative files (images, videos) and EDM HTML templates are shared directly via WhatsApp or Email by your account manager. This page only tracks the volume of support provided.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsDisplay.map((stat, i) => (
          <div key={i} className="bg-[#0B0F1A] border border-white/5 p-6 rounded-2xl shadow-lg" data-testid={`card-stat-${i}`}>
            <p className="text-white/60 text-xs uppercase tracking-wider font-medium mb-2">{stat.label}</p>
            <h3 className="text-3xl font-display font-bold text-white" data-testid={`text-stat-${i}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-[#0B0F1A] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Support History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                    No marketing support history yet.
                  </td>
                </tr>
              ) : (
                requests.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors" data-testid={`row-request-${item.id}`}>
                    <td className="px-6 py-4 font-mono text-white/60">{formatDate(item.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${item.type === 'creative' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {item.type === 'creative' ? 'Creative' : 'EDM'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{getProjectName(item.projectId)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${
                        item.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CpMarketingSupport;
