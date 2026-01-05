import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  BarChart3, 
  UserCircle, 
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Home
} from "lucide-react";
import logoIcon from "@assets/generated_images/simple_abstract_logo_icon.png";
import { logout } from "../../lib/api";

import CpDashboard from "./dashboard";
import CpLeads from "./leads";
import CpRunAds from "./ads";
import CpMarketingSupport from "./marketing";
import CpProfile from "./profile";

interface CpAdminLayoutProps {
  children?: React.ReactNode;
}

const CpAdminLayout = ({ children }: CpAdminLayoutProps) => {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "leads" | "runAds" | "marketing" | "profile">("dashboard");

  // User Details from LocalStorage
  const userName = localStorage.getItem("userName") || "Channel Partner";
  const userCompany = localStorage.getItem("userCompany") || "Registered Partner";
  const userCity = localStorage.getItem("userCity") || "";

  // Generate Initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  
  const userInitials = getInitials(userName);

  // Access Control Check
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "cp") {
      setLocation("/"); // Redirect to home if not CP
    }
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userCompany");
      localStorage.removeItem("userPhone");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userCity");
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setLocation("/");
    }
  };

  const navigation = [
    { id: "home", name: "Home", icon: Home, action: () => setLocation("/") },
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "leads", name: "Leads", icon: Users },
    { id: "runAds", name: "Run Ads", icon: Megaphone },
    { id: "marketing", name: "Marketing Support", icon: BarChart3 },
    { id: "profile", name: "Profile", icon: UserCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050816] text-white flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0B0F1A] border-r border-white/10 z-50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 mb-10 cursor-pointer">
              <img src={logoIcon} alt="BetterSide" className="w-8 h-8 object-contain" />
              <span className="text-xl font-display font-bold tracking-tight text-white">CP Panel</span>
              <button 
                className="md:hidden ml-auto text-white/60"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSidebarOpen(false);
                }}
              >
                <X size={20} />
              </button>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const active = activeTab === item.id;
              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      // @ts-ignore
                      setActiveTab(item.id);
                    }
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
                    ${active 
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(0,87,255,0.3)]" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <item.icon size={20} className={active ? "text-white" : "group-hover:text-primary transition-colors"} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{userName}</p>
                <p className="text-xs text-white/40 truncate">{userCompany}</p>
                {userCity && <p className="text-[10px] text-white/30 truncate">{userCity}</p>}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/10 flex items-center px-6 bg-[#0B0F1A]">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} className="text-white" />
          </button>
          <span className="ml-4 font-bold">CP Dashboard</span>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
             <Link href="/">
               <button className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                 <ArrowLeft size={16} />
                 Back to Home
               </button>
             </Link>
          </div>

          {activeTab === "dashboard" && <CpDashboard />}
          {activeTab === "leads" && <CpLeads />}
          {activeTab === "runAds" && <CpRunAds />}
          {activeTab === "marketing" && <CpMarketingSupport />}
          {activeTab === "profile" && <CpProfile />}
        </div>
      </main>
    </div>
  );
};

export default CpAdminLayout;
