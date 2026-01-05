import React from "react";
import { User, Building, Phone, Mail, MapPin, ShieldCheck, FileText } from "lucide-react";

const Profile = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2">Developer Profile</h2>
        <p className="text-white/60">Manage your organization details and compliance info.</p>
      </div>

      <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-emerald-900 to-emerald-700"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex justify-between items-end">
             <div className="w-24 h-24 rounded-2xl bg-[#0B0F1A] p-2 border border-white/10">
               <div className="w-full h-full bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                 <Building size={40} />
               </div>
             </div>
             <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
               Coming Soon: Edit Profile
             </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-xs text-white/40 uppercase font-bold block mb-1">Developer / Group Name</label>
                <div className="text-xl font-bold font-display">Prestige Group</div>
              </div>
              
              <div className="flex gap-4">
                <div>
                   <label className="text-xs text-white/40 uppercase font-bold block mb-1">Contact Person</label>
                   <div className="flex items-center gap-2 text-white/80">
                     <User size={16} className="text-primary" />
                     Jane Smith
                   </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 uppercase font-bold block mb-1">Contact Details</label>
                <div className="space-y-2 mt-2">
                   <div className="flex items-center gap-2 text-white/80">
                     <Phone size={16} className="text-white/40" />
                     +91 98765 43210
                   </div>
                   <div className="flex items-center gap-2 text-white/80">
                     <Mail size={16} className="text-white/40" />
                     jane.smith@prestige.com
                   </div>
                   <div className="flex items-center gap-2 text-white/80">
                     <MapPin size={16} className="text-white/40" />
                     Bangalore, Karnataka
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" />
                Compliance Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 uppercase font-bold block mb-1">RERA Status</label>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20">
                    <CheckCircleIcon /> Registered
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/40 uppercase font-bold block mb-1">GST Number</label>
                  <div className="font-mono text-white/80 tracking-wide bg-black/20 px-3 py-2 rounded-lg border border-white/5 inline-block">
                    29AAAAA0000A1Z5
                  </div>
                </div>

                <div>
                   <label className="text-xs text-white/40 uppercase font-bold block mb-1">Documentation</label>
                   <div className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                     <FileText size={14} />
                     View Verified Documents
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default Profile;
