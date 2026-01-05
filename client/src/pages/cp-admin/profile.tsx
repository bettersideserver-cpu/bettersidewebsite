import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Building, MapPin, Loader2, Save } from "lucide-react";
import { getCpProfile, updateCpProfile } from "../../lib/api";

interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  companyName?: string;
}

const CpProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    city: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCpProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName || "",
        companyName: data.companyName || "",
        phone: data.phone || "",
        city: data.city || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await updateCpProfile(formData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0].toUpperCase())
      .join("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-profile-title">My Profile</h1>
        <p className="text-white/60">Manage your account details and preferences.</p>
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

      <div className="bg-[#0B0F1A] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-white/5"></div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-[#050816] p-2 inline-block">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white shadow-lg" data-testid="text-initials">
                {profile ? getInitials(profile.fullName) : "??"}
              </div>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    data-testid="input-fullname"
                  />
                </div>
                
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(f => ({ ...f, companyName: e.target.value }))}
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    data-testid="input-company"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(f => ({ ...f, city: e.target.value }))}
                    className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    data-testid="input-city"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="button-save"
                  >
                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium"
                    data-testid="button-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-1">Full Name</label>
                  <div className="flex items-center gap-3 text-lg font-medium text-white">
                    <User size={20} className="text-primary" />
                    {profile?.fullName || "Not set"}
                  </div>
                </div>
                
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-1">Email Address</label>
                  <div className="flex items-center gap-3 text-lg font-medium text-white">
                    <Mail size={20} className="text-primary" />
                    {profile?.email || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-1">Phone Number</label>
                  <div className="flex items-center gap-3 text-lg font-medium text-white">
                    <Phone size={20} className="text-primary" />
                    {profile?.phone || "Not set"}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-1">Company Name</label>
                  <div className="flex items-center gap-3 text-lg font-medium text-white">
                    <Building size={20} className="text-accent" />
                    {profile?.companyName || "Not set"}
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs uppercase tracking-wider font-bold block mb-1">Location</label>
                  <div className="flex items-center gap-3 text-lg font-medium text-white">
                    <MapPin size={20} className="text-accent" />
                    {profile?.city || "Not set"}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold"
                    data-testid="button-edit"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CpProfile;
