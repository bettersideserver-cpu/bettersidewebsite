import React, { useState } from "react";
import { useLocation } from "wouter";
import { User, Building, Briefcase, ArrowLeft } from "lucide-react";
import logoIcon from "@assets/generated_images/simple_abstract_logo_icon.png";
import heroBg from "@assets/generated_images/futuristic_luxury_skyscraper_at_twilight.png";
import { register } from "../lib/api";

const Login = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"Home Buyer / Investor" | "Channel Partner" | "Developer" | null>(null);
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    companyName: "", // For CP & Developer
    contactPerson: "", // For Developer
    gstNumber: "", // For Developer
    reraNumber: "", // For Developer
    isReraRegistered: false, // For Developer
    docLink: "", // For Developer
    budget: "", // For Buyer
  });

  // Error State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const phoneRegex = /^[6-9][0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cityRegex = /^[A-Za-z\s]{3,}$/;
    const gstRegex = /^[A-Z0-9]{15}$/i;
    const reraRegex = /^[A-Za-z0-9\/\-]{8,}$/;

    // Common Validation
    if (role !== "Developer") {
       if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
         newErrors.fullName = "Name must be at least 3 characters.";
       }
    } else {
       if (!formData.companyName.trim() || formData.companyName.trim().length < 3) {
         newErrors.companyName = "Developer/Group Name must be at least 3 characters.";
       }
       if (!formData.contactPerson.trim() || formData.contactPerson.trim().length < 3) {
         newErrors.contactPerson = "Contact Person Name must be at least 3 characters.";
       }
    }

    if (role === "Channel Partner") {
       if (!formData.companyName.trim() || formData.companyName.trim().length < 2) {
         newErrors.companyName = "Company Name must be at least 2 characters.";
       }
    }

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.city || !cityRegex.test(formData.city)) {
      newErrors.city = "Please enter a valid city name (letters only, min 3 chars).";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // Role Specific Validation
    if (role === "Home Buyer / Investor") {
       if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
         newErrors.budget = "Please enter a valid budget amount.";
       }
    }

    if (role === "Developer") {
       if (!formData.gstNumber || !gstRegex.test(formData.gstNumber)) {
         newErrors.gstNumber = "GST number must be 15 characters (letters and numbers only).";
       }
       
       if (formData.isReraRegistered) {
          if (!formData.reraNumber || !reraRegex.test(formData.reraNumber)) {
            newErrors.reraNumber = "RERA number format looks invalid. Please check and enter full RERA ID.";
          }
       }
       
       if (formData.docLink && !formData.docLink.startsWith("http://") && !formData.docLink.startsWith("https://")) {
         newErrors.docLink = "Please enter a valid URL (starting with http:// or https://)";
       }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (selectedRole: "Home Buyer / Investor" | "Channel Partner" | "Developer") => {
    setRole(selectedRole);
    setStep(2);
    setErrors({}); // Clear errors when switching roles
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError("");

    try {
      let userRole = "buyer";
      let userName = formData.fullName;

      if (role === "Channel Partner") {
        userRole = "cp";
      } else if (role === "Developer") {
        userRole = "developer";
        userName = formData.contactPerson || formData.fullName;
      }

      const user = await register({
        fullName: userName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        role: userRole,
        companyName: formData.companyName || undefined,
        contactPerson: formData.contactPerson || undefined,
        gstNumber: formData.gstNumber || undefined,
        reraNumber: formData.reraNumber || undefined,
        isReraRegistered: formData.isReraRegistered,
        docLink: formData.docLink || undefined,
        budget: formData.budget || undefined,
      });

      // Store in localStorage for quick access
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.fullName);
      if (user.companyName) {
        localStorage.setItem("userCompany", user.companyName);
      }
      if (user.phone) {
        localStorage.setItem("userPhone", user.phone);
      }
      if (user.email) {
        localStorage.setItem("userEmail", user.email);
      }
      if (user.city) {
        localStorage.setItem("userCity", user.city);
      }

      // Redirect
      if (user.role === "cp") {
        setLocation("/cp-dashboard");
      } else if (user.role === "developer") {
        setLocation("/developer-dashboard");
      } else {
        setLocation("/");
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="Background" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/80 to-transparent"></div>
      </div>

      <div className="w-full max-w-lg m-auto bg-[#0B0F1A]/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-8">
          <img src={logoIcon} alt="BetterSide" className="w-12 h-12 mb-4 object-contain" />
          <h1 className="text-3xl font-display font-bold text-white">
            {step === 1 ? "Welcome Back" : `Join as ${role}`}
          </h1>
          <p className="text-white/60">
            {step === 1 ? "Sign in to continue to BetterSide" : "Please fill in your details"}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">Who are you?</label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "Home Buyer / Investor", icon: User, desc: "Explore immersive projects" },
                  { id: "Channel Partner", icon: Briefcase, desc: "Manage leads & ads" },
                  { id: "Developer", icon: Building, desc: "List & manage projects" }
                ].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleRoleSelect(item.id as any)}
                    className="cursor-pointer border border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all duration-200 bg-white/5 hover:bg-white/10 hover:text-white text-white/60 group"
                  >
                    <div className="p-2 rounded-lg bg-white/10 text-white/60 group-hover:text-white transition-colors">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{item.id}</p>
                      <p className="text-xs opacity-70">{item.desc}</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary">
                         <div className="w-0 h-0 rounded-full bg-primary transition-all group-hover:w-3 group-hover:h-3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-4"
            >
              <ArrowLeft size={16} /> Back
            </button>

            {/* Common Fields */}
            {role !== "Developer" && (
              <div>
                 <label className="block text-xs font-bold text-white/60 uppercase mb-1">Full Name</label>
                 <input 
                   name="fullName"
                   value={formData.fullName}
                   onChange={handleInputChange}
                   className={`w-full bg-[#050816] border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                   placeholder="John Doe"
                 />
                 {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
            )}

            {/* Role Specific Fields */}
            {role === "Channel Partner" && (
              <>
                <div>
                   <label className="block text-xs font-bold text-white/60 uppercase mb-1">Company / Firm Name</label>
                   <input 
                     name="companyName"
                     value={formData.companyName}
                     onChange={handleInputChange}
                     className={`w-full bg-[#050816] border ${errors.companyName ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                     placeholder="Apex Realty"
                   />
                   {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
              </>
            )}

             {role === "Developer" && (
              <>
                <div>
                   <label className="block text-xs font-bold text-white/60 uppercase mb-1">Developer / Group Name</label>
                   <input 
                     name="companyName"
                     value={formData.companyName}
                     onChange={handleInputChange}
                     className={`w-full bg-[#050816] border ${errors.companyName ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                     placeholder="Prestige Group"
                   />
                   {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                 <div>
                   <label className="block text-xs font-bold text-white/60 uppercase mb-1">Contact Person Name</label>
                   <input 
                     name="contactPerson"
                     value={formData.contactPerson}
                     onChange={handleInputChange}
                     className={`w-full bg-[#050816] border ${errors.contactPerson ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                     placeholder="Jane Smith"
                   />
                   {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-white/60 uppercase mb-1">Phone</label>
                 <input 
                   name="phone"
                   value={formData.phone}
                   onChange={handleInputChange}
                   className={`w-full bg-[#050816] border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                   placeholder="+91 98765..."
                 />
                 {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                 <label className="block text-xs font-bold text-white/60 uppercase mb-1">Email</label>
                 <input 
                   name="email"
                   type="text"
                   value={formData.email}
                   onChange={handleInputChange}
                   className={`w-full bg-[#050816] border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                   placeholder="john@example.com"
                 />
                 {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-white/60 uppercase mb-1">City</label>
               <input 
                 name="city"
                 value={formData.city}
                 onChange={handleInputChange}
                 className={`w-full bg-[#050816] border ${errors.city ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                 placeholder="Mumbai"
               />
               {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
               <label className="block text-xs font-bold text-white/60 uppercase mb-1">Password</label>
               <input 
                 name="password"
                 type="password"
                 value={formData.password}
                 onChange={handleInputChange}
                 className={`w-full bg-[#050816] border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                 placeholder="Minimum 6 characters"
                 data-testid="input-password"
               />
               {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {role === "Home Buyer / Investor" && (
              <div>
                 <label className="block text-xs font-bold text-white/60 uppercase mb-1">Budget (Optional)</label>
                 <input 
                   name="budget"
                   value={formData.budget}
                   onChange={handleInputChange}
                   className={`w-full bg-[#050816] border ${errors.budget ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                   placeholder="e.g. 1 Cr - 2 Cr"
                 />
                 {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
              </div>
            )}

            {role === "Developer" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase mb-1">GST Number</label>
                    <input 
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className={`w-full bg-[#050816] border ${errors.gstNumber ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                      placeholder="22AAAAA0000A1Z5"
                    />
                    {errors.gstNumber && <p className="text-red-500 text-xs mt-1">{errors.gstNumber}</p>}
                  </div>
                   <div>
                    <label className="block text-xs font-bold text-white/60 uppercase mb-1">RERA No.</label>
                    <input 
                      name="reraNumber"
                      value={formData.reraNumber}
                      onChange={handleInputChange}
                      className={`w-full bg-[#050816] border ${errors.reraNumber ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                      placeholder="P51800000000"
                    />
                    {errors.reraNumber && <p className="text-red-500 text-xs mt-1">{errors.reraNumber}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox"
                    id="isReraRegistered"
                    name="isReraRegistered"
                    checked={formData.isReraRegistered}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-white/10 bg-[#050816] text-primary focus:ring-primary"
                  />
                  <label htmlFor="isReraRegistered" className="text-sm text-white/80">I confirm that I am RERA Registered</label>
                </div>

                 <div>
                   <label className="block text-xs font-bold text-white/60 uppercase mb-1">Document Link (Optional)</label>
                   <input 
                     name="docLink"
                     value={formData.docLink}
                     onChange={handleInputChange}
                     className={`w-full bg-[#050816] border ${errors.docLink ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-all`}
                     placeholder="Google Drive / Dropbox Link"
                   />
                   {errors.docLink && <p className="text-red-500 text-xs mt-1">{errors.docLink}</p>}
                </div>
              </>
            )}

            {apiError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{apiError}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              data-testid="button-submit"
            >
              {isSubmitting ? "Creating Account..." : "Complete Registration"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
