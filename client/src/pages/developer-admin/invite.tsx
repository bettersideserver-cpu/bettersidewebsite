import React, { useState } from "react";
import { Copy, Check, Send, Plus, Link as LinkIcon } from "lucide-react";

const Invite = () => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const projects = [
    { id: "p1", name: "Skyline Heights", link: "https://betterside.com/invite/skyline/X7K9P2" },
    { id: "p2", name: "The Grand Villa", link: "https://betterside.com/invite/grandvilla/M4N2B1" },
    { id: "p3", name: "Tech Park One", link: "https://betterside.com/invite/techpark/L9J5H3" },
  ];

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-display font-bold mb-2">Invite Channel Partners</h2>
        <p className="text-white/60">Expand your network by inviting verified partners to your projects.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Method 1: Send Invite Form */}
        <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Send size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display">Send Direct Invite</h3>
              <p className="text-sm text-white/60">Invite a specific CP via email</p>
            </div>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">CP Name</label>
                <input 
                  type="text" 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Company</label>
                <input 
                  type="text" 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                  placeholder="Apex Realty"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Phone</label>
                <input 
                  type="text" 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase mb-1">Assign Project</label>
              <select className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all appearance-none">
                <option>Skyline Heights</option>
                <option>The Grand Villa</option>
                <option>Tech Park One</option>
              </select>
            </div>

            <button className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4">
              <Plus size={18} />
              Send Invitation
            </button>
          </form>
        </div>

        {/* Method 2: Share Links */}
        <div className="bg-[#0B0F1A] border border-white/10 rounded-2xl p-6 md:p-8">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <LinkIcon size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display">Project White Links</h3>
              <p className="text-sm text-white/60">Share these links to onboard CPs automatically</p>
            </div>
          </div>

          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-white">{project.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-green-400 bg-green-500/10 px-2 py-1 rounded">Active Link</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black/30 rounded px-3 py-2 text-xs text-white/60 font-mono truncate">
                    {project.link}
                  </code>
                  <button 
                    onClick={() => handleCopy(project.id, project.link)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    title="Copy Link"
                  >
                    {copiedLink === project.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 leading-relaxed">
            <strong>Pro Tip:</strong> CPs who sign up using these links will be automatically tagged to the respective project and added to your dashboard.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invite;
