import React from "react";
import { Link } from "wouter";
import { Building } from "lucide-react";

const DeveloperDashboard = () => {
  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-lg">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
          <Building size={40} className="text-primary" />
        </div>
        <h1 className="text-4xl font-display font-bold">Welcome Developer</h1>
        <p className="text-xl text-white/60">Developer Dashboard coming soon.</p>
        <div className="pt-8">
          <Link href="/">
            <button className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
