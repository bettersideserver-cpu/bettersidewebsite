import React, { useMemo } from "react";
import { Users, Megaphone, CheckCircle, BarChart3 } from "lucide-react";
import { mockCPActivity, getProjectStatus } from "@/lib/mockDeveloperData";

const DeveloperDashboard = () => {
  // Aggregate Data by Project
  const projectSummaries = useMemo(() => {
    const summaries: Record<string, {
      name: string;
      cpCount: number;
      adsRunning: number;
      totalLeads: number;
    }> = {};

    mockCPActivity.forEach(activity => {
      if (!summaries[activity.projectName]) {
        summaries[activity.projectName] = {
          name: activity.projectName,
          cpCount: 0,
          adsRunning: 0,
          totalLeads: 0
        };
      }
      
      summaries[activity.projectName].cpCount += 1;
      if (activity.hasRunAds) summaries[activity.projectName].adsRunning += 1;
      summaries[activity.projectName].totalLeads += activity.totalLeads;
    });

    return Object.values(summaries);
  }, []);

  // Calculate Global Stats
  const globalStats = useMemo(() => {
    return {
      totalProjects: projectSummaries.length,
      activeCPs: mockCPActivity.length,
      adsRunning: mockCPActivity.filter(cp => cp.hasRunAds).length,
      totalLeads: mockCPActivity.reduce((sum, cp) => sum + cp.totalLeads, 0)
    };
  }, [projectSummaries]);

  const stats = [
    { label: "Total Projects", value: globalStats.totalProjects.toString(), icon: CheckCircle, color: "text-blue-400" },
    { label: "Active CPs", value: globalStats.activeCPs.toString(), icon: Users, color: "text-orange-400" },
    { label: "Ads Running", value: globalStats.adsRunning.toString(), icon: Megaphone, color: "text-purple-400" },
    { label: "Total Leads", value: globalStats.totalLeads.toLocaleString(), icon: BarChart3, color: "text-green-400" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2">Dashboard Overview</h2>
        <p className="text-white/60">Welcome back, here's what's happening across your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">{stat.label}</span>
              <stat.icon className={`${stat.color}`} size={20} />
            </div>
            <div className="text-3xl font-bold font-display">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Projects Summary Table */}
      <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold font-display">Project Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Project Name</th>
                <th className="px-6 py-4 font-medium">Active CPs</th>
                <th className="px-6 py-4 font-medium">Ads Running</th>
                <th className="px-6 py-4 font-medium">Total Leads</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {projectSummaries.map((project, idx) => {
                 const status = getProjectStatus(project.totalLeads);
                 return (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{project.name}</td>
                    <td className="px-6 py-4 text-white/80">{project.cpCount}</td>
                    <td className="px-6 py-4 text-white/80">{project.adsRunning}</td>
                    <td className="px-6 py-4 text-white/80">{project.totalLeads}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
