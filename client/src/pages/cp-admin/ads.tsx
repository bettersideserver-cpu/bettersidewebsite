import React, { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { getCpAdsRequests, createCpAdRequest, getCpProjects } from "../../lib/api";

interface AdsRequest {
  id: string;
  projectId: string;
  objective: string;
  budgetInr: number;
  durationDays: number;
  status: string;
  impressions?: number;
  clicks?: number;
  leadsGenerated?: number;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

const CpRunAds = () => {
  const [adsRequests, setAdsRequests] = useState<AdsRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    projectId: "",
    targetArea: "",
    budget: "",
    duration: "",
    objective: "leads",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [adsData, projectsData] = await Promise.all([
        getCpAdsRequests(),
        getCpProjects(),
      ]);
      setAdsRequests(adsData);
      setProjects(projectsData);
      if (projectsData.length > 0 && !formData.projectId) {
        setFormData(f => ({ ...f, projectId: projectsData[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.budget || !formData.duration) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await createCpAdRequest({
        projectId: formData.projectId,
        objective: formData.objective,
        budgetInr: parseInt(formData.budget),
        durationDays: parseInt(formData.duration),
        targetArea: formData.targetArea || undefined,
        notes: formData.notes || undefined,
      });
      setSuccess("Ad request submitted successfully!");
      setFormData(f => ({ ...f, targetArea: "", budget: "", duration: "", notes: "" }));
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "running": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "pending": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "completed": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "rejected": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-white/60 bg-white/5 border-white/10";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "In Discussion",
      running: "Running",
      completed: "Completed",
      rejected: "Rejected",
    };
    return labels[status] || status;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return "-";
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-ads-title">Run Ads with BetterSide</h1>
        <p className="text-white/60">Submit a request to launch targeted campaigns for your projects.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400" data-testid="text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400" data-testid="text-success">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-[#0B0F1A] border border-white/5 p-6 rounded-2xl shadow-lg sticky top-24">
            <h2 className="text-xl font-bold text-white mb-6">New Ad Request</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Select Project</label>
                <select 
                  className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                  value={formData.projectId}
                  onChange={(e) => setFormData(f => ({ ...f, projectId: e.target.value }))}
                  data-testid="select-project"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Target City / Area</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mohali, South Delhi" 
                  className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  value={formData.targetArea}
                  onChange={(e) => setFormData(f => ({ ...f, targetArea: e.target.value }))}
                  data-testid="input-target-area"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Budget (INR)</label>
                  <input 
                    type="number" 
                    placeholder="50000" 
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={formData.budget}
                    onChange={(e) => setFormData(f => ({ ...f, budget: e.target.value }))}
                    data-testid="input-budget"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Duration (Days)</label>
                  <input 
                    type="number" 
                    placeholder="15" 
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    value={formData.duration}
                    onChange={(e) => setFormData(f => ({ ...f, duration: e.target.value }))}
                    data-testid="input-duration"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Campaign Objective</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ value: "leads", label: "Leads" }, { value: "awareness", label: "Awareness" }, { value: "visits", label: "Visits" }].map((obj) => (
                    <label key={obj.value} className="cursor-pointer">
                      <input 
                        type="radio" 
                        name="objective" 
                        className="peer hidden" 
                        checked={formData.objective === obj.value}
                        onChange={() => setFormData(f => ({ ...f, objective: obj.value }))}
                      />
                      <div className="text-center py-2 rounded-lg border border-white/10 bg-[#050816] text-white/60 text-sm peer-checked:bg-primary/20 peer-checked:border-primary peer-checked:text-white transition-all" data-testid={`radio-${obj.value}`}>
                        {obj.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 uppercase tracking-wider mb-2">Additional Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Any specific targeting or requirements..."
                  className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                  data-testid="textarea-notes"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-submit-ad"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {submitting ? "Submitting..." : "Submit Ad Request"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">Your Ad Requests</h2>
          
          {adsRequests.length === 0 ? (
            <div className="bg-[#0B0F1A] border border-white/5 rounded-2xl p-12 text-center">
              <p className="text-white/40">No ad requests yet. Submit your first campaign above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {adsRequests.map((req) => (
                <div key={req.id} className="bg-[#0B0F1A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors" data-testid={`card-ad-${req.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">{getProjectName(req.projectId)}</h3>
                      <p className="text-white/60 text-sm">{req.objective} • ₹{req.budgetInr.toLocaleString()} • {req.durationDays} Days</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border w-fit ${getStatusColor(req.status)}`}>
                      {getStatusLabel(req.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-1">Impressions</p>
                      <p className="text-xl font-mono font-bold text-white">{formatNumber(req.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-1">Clicks</p>
                      <p className="text-xl font-mono font-bold text-white">{formatNumber(req.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-1">Leads Generated</p>
                      <p className="text-xl font-mono font-bold text-primary">{formatNumber(req.leadsGenerated)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CpRunAds;
