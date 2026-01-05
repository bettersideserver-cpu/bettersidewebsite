import React, { useMemo } from "react";
import { BarChart3, Palette, Mail } from "lucide-react";
import { mockCPActivity } from "@/lib/mockDeveloperData";

const Marketing = () => {
  
  // Calculate Summaries
  const stats = useMemo(() => {
    let creatives = 0;
    let edms = 0;
    
    mockCPActivity.forEach(item => {
      creatives += item.creativesReceived;
      edms += item.edmSent;
    });

    return [
      { label: "Creatives Today", value: "0", icon: Palette, color: "text-pink-400" }, // Mock 0 for "today"
      { label: "Creatives This Month", value: creatives.toString(), icon: Palette, color: "text-purple-400" },
      { label: "Total Creatives", value: (creatives + 50).toString(), icon: Palette, color: "text-blue-400" }, // Add base offset
      { label: "Total EDMs Sent", value: (edms + 1000).toLocaleString(), icon: Mail, color: "text-orange-400" } // Add base offset
    ];
  }, []);

  // Generate Table Data (Simplified Mock Activity Log)
  const activityLog = useMemo(() => {
    return [
      { date: "Today", type: "Creative", project: "Lutyens", count: 2 },
      { date: "Yesterday", type: "EDM", project: "Lutyens", count: 2000 },
      { date: "Yesterday", type: "Creative", project: "California State", count: 1 },
      { date: "Mar 10", type: "EDM", project: "Sky City", count: 5000 },
      { date: "Mar 08", type: "Creative", project: "Lutyens", count: 3 },
    ];
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2">Marketing & Ads Support</h2>
        <p className="text-white/60">Track marketing assets provided by BetterSide.</p>
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

      {/* Table */}
      <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold font-display">Recent Activity</h3>
          <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">
            Log only
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Count / Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activityLog.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white/80">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      item.type === 'Creative' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {item.type === 'Creative' ? <Palette size={12} /> : <Mail size={12} />}
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{item.project}</td>
                  <td className="px-6 py-4 font-bold">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
