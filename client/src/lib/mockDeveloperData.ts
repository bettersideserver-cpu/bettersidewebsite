// Mock Data for Developer Admin Panel

export interface CPActivity {
  id: string;
  projectName: string;
  cpName: string;
  company: string;
  city: string;
  totalLeads: number;
  hasRunAds: boolean;
  creativesReceived: number;
  edmSent: number;
}

export const mockCPActivity: CPActivity[] = [
  // Lutyens Project
  { id: "1", projectName: "Lutyens", cpName: "Aman Gupta", company: "InvestHomes", city: "Delhi", totalLeads: 45, hasRunAds: true, creativesReceived: 5, edmSent: 2000 },
  { id: "2", projectName: "Lutyens", cpName: "Rajesh Kumar", company: "Delhi Estates", city: "Delhi", totalLeads: 12, hasRunAds: false, creativesReceived: 2, edmSent: 0 },
  { id: "3", projectName: "Lutyens", cpName: "Sonia Singh", company: "Prime Properties", city: "Noida", totalLeads: 28, hasRunAds: true, creativesReceived: 4, edmSent: 1500 },
  { id: "4", projectName: "Lutyens", cpName: "Vikram Malhotra", company: "Luxury Spaces", city: "Gurgaon", totalLeads: 8, hasRunAds: false, creativesReceived: 1, edmSent: 0 },
  { id: "5", projectName: "Lutyens", cpName: "Neha Sharma", company: "Urban Living", city: "Delhi", totalLeads: 55, hasRunAds: true, creativesReceived: 6, edmSent: 3000 },

  // California State Project
  { id: "6", projectName: "California State", cpName: "Rahul Verma", company: "Green Valley", city: "Bangalore", totalLeads: 35, hasRunAds: true, creativesReceived: 4, edmSent: 1200 },
  { id: "7", projectName: "California State", cpName: "Priya Desai", company: "Tech City Homes", city: "Bangalore", totalLeads: 3, hasRunAds: false, creativesReceived: 0, edmSent: 0 },
  { id: "8", projectName: "California State", cpName: "Amit Shah", company: "Shah Realtors", city: "Mumbai", totalLeads: 22, hasRunAds: true, creativesReceived: 3, edmSent: 800 },
  { id: "9", projectName: "California State", cpName: "Kavita Reddy", company: "South Estates", city: "Hyderabad", totalLeads: 15, hasRunAds: false, creativesReceived: 2, edmSent: 0 },
  { id: "10", projectName: "California State", cpName: "John D'Souza", company: "Coastal Properties", city: "Goa", totalLeads: 42, hasRunAds: true, creativesReceived: 5, edmSent: 2500 },
  
  // Sky City Project
  { id: "11", projectName: "Sky City", cpName: "Arjun Rampal", company: "Sky High Realty", city: "Mumbai", totalLeads: 60, hasRunAds: true, creativesReceived: 8, edmSent: 5000 },
  { id: "12", projectName: "Sky City", cpName: "Meera Iyer", company: "Iyer Associates", city: "Chennai", totalLeads: 10, hasRunAds: false, creativesReceived: 1, edmSent: 0 },
  { id: "13", projectName: "Sky City", cpName: "Suresh Patel", company: "Gujarat Homes", city: "Ahmedabad", totalLeads: 25, hasRunAds: true, creativesReceived: 3, edmSent: 1000 },
  { id: "14", projectName: "Sky City", cpName: "Deepak Chopra", company: "Chopra Estates", city: "Pune", totalLeads: 5, hasRunAds: false, creativesReceived: 1, edmSent: 0 },
  { id: "15", projectName: "Sky City", cpName: "Anjali Mehta", company: "Mehta Group", city: "Mumbai", totalLeads: 32, hasRunAds: true, creativesReceived: 4, edmSent: 1800 },
];

// Helper to get Engagement Status
export const getEngagementStatus = (leads: number) => {
  if (leads > 40) return { label: "High Activity", color: "text-green-400", bg: "bg-green-500/20" };
  if (leads >= 20) return { label: "Active", color: "text-blue-400", bg: "bg-blue-500/20" };
  return { label: "Low Activity", color: "text-orange-400", bg: "bg-orange-500/20" };
};

// Helper to get Project Status based on total leads (simplified rule for project level)
export const getProjectStatus = (totalLeads: number) => {
   if (totalLeads > 100) return { label: "High Performance", color: "text-green-400", bg: "bg-green-500/20" };
   if (totalLeads > 50) return { label: "Steady", color: "text-blue-400", bg: "bg-blue-500/20" };
   return { label: "Growing", color: "text-orange-400", bg: "bg-orange-500/20" };
};
