import React, { useRef, useState } from "react";
import { Link } from "wouter";
import { Play, ChevronRight, Menu, X, User, Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import heroBg from "@assets/generated_images/futuristic_luxury_skyscraper_at_twilight.png";
import logoIcon from "@assets/generated_images/simple_abstract_logo_icon.png";
import project1 from "@assets/generated_images/luxury_apartment_interior_evening.png";
import project2 from "@assets/generated_images/modern_villa_exterior_night.png";
import project3 from "@assets/generated_images/commercial_office_lobby_futuristic.png";
import featuredBg1 from "@assets/CM_Infinia_1766146715845.jpg";
import featuredBg2 from "@assets/MDB_Lutyens_1766146795158.jpg";
import featuredBg3 from "@assets/AnantaStreet_1766146992482.jpg";
import { logout } from "../lib/api";
import { InteractiveHero } from "../components/InteractiveHero";

import Betterside_Logo from "@assets/Betterside Logo.png";

import Betterside_Logo___2 from "@assets/Betterside Logo - 2.png";

// --- Components ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userCompany");
      localStorage.removeItem("userPhone");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userCity");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.reload();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 transition-all duration-300 bg-gradient-to-b from-black/80 to-transparent">
      {/* Logo */}
      <Link href="/">
        <div className="flex items-center gap-3 cursor-pointer">
          <img src={Betterside_Logo___2} alt="BetterSide Logo" className="w-32 h-auto object-contain" />
        </div>
      </Link>
      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/">
          <span className="text-sm font-medium text-white transition-all tracking-wide relative group cursor-pointer">
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF6A00] transition-all duration-300 group-hover:w-full"></span>
          </span>
        </Link>
        {["Explore", "Blog", "About", "Contact"].map((item) => (
          <a
            key={item}
            href={item === "Blog" ? "/#blog-section" : item === "Contact" ? "/#contact-section" : "#"}
            onClick={(e) => {
              if ((item === "Blog" || item === "Contact") && window.location.pathname === '/') {
                e.preventDefault();
                const sectionId = item === "Blog" ? 'blog-section' : 'contact-section';
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-sm font-medium text-white transition-all tracking-wide relative group"
          >
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#FF6A00] transition-all duration-300 group-hover:w-full"></span>
          </a>
        ))}
        
        {userRole === "cp" && (
          <Link href="/cp-dashboard">
            <span className="text-sm font-medium text-accent hover:text-accent/80 transition-all tracking-wide cursor-pointer font-bold">
              CP Dashboard
            </span>
          </Link>
        )}

        {userRole === "developer" && (
          <Link href="/developer-dashboard">
             <span className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-all tracking-wide cursor-pointer font-bold">
              Developer Dashboard
            </span>
          </Link>
        )}

        {userRole ? (
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Hi, {userName?.split(' ')[0]}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300"
            >
              <User size={16} />
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold hover:bg-white hover:text-black transition-all duration-300">
              <User size={16} />
              Login
            </button>
          </Link>
        )}
      </div>
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden text-white p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#050816] border-b border-white/10 p-6 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-2">
          {["Explore", "Blog", "About", "Contact"].map((item) => (
            <a 
              key={item} 
              href={item === "Blog" ? "/#blog-section" : item === "Contact" ? "/#contact-section" : "#"}
              onClick={(e) => {
                if ((item === "Blog" || item === "Contact") && window.location.pathname === '/') {
                  e.preventDefault();
                  const sectionId = item === "Blog" ? 'blog-section' : 'contact-section';
                  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                  setIsOpen(false);
                }
              }}
              className="text-white hover:text-[#FF6A00] py-2 text-lg font-medium transition-colors"
            >
              {item}
            </a>
          ))}
          
          {userRole === "cp" && (
            <Link href="/cp-dashboard">
              <span className="text-accent hover:text-accent/80 py-2 text-lg font-bold transition-colors cursor-pointer block">
                CP Dashboard
              </span>
            </Link>
          )}

           {userRole === "developer" && (
            <Link href="/developer-dashboard">
              <span className="text-emerald-400 hover:text-emerald-300 py-2 text-lg font-bold transition-colors cursor-pointer block">
                Developer Dashboard
              </span>
            </Link>
          )}

          {userRole ? (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white font-bold mb-4 text-center">Hi, {userName}</p>
              <button 
                onClick={handleLogout}
                className="w-full py-3 rounded-full bg-white/10 text-white font-bold flex items-center justify-center gap-2 border border-white/20"
              >
                <User size={18} />
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login">
              <button className="w-full mt-4 py-3 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2">
                <User size={18} />
                Login
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent z-10" /> {/* Bottom Fade */}
        <img
          src={heroBg}
          alt="Hero Background"
          className="w-full h-full object-cover animate-in fade-in duration-1000 scale-105"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-7xl mx-auto pt-20">
        <span className="inline-block mb-4 text-accent font-bold tracking-widest text-xs uppercase animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
          Immersive Project Experience (IPX)
        </span>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1] mb-6 max-w-4xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
          Experience Real Estate <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            Before It’s Built.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
          BetterSide helps you explore trusted pre-launch and under-construction projects in full immersive 3D, right from your browser.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-400">
          <button className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,87,255,0.4)]">
            Explore IPX Projects
          </button>
          <button className="px-8 py-4 rounded-full border border-white/30 text-white font-bold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm">
            Talk to Our Team
          </button>
        </div>
      </div>

      {/* Slider Indicators */}
      <div className="absolute bottom-12 left-6 md:left-12 flex gap-3 z-30">
        <div className="w-12 h-1 bg-white rounded-full" />
        <div className="w-2 h-1 bg-white/30 rounded-full" />
        <div className="w-2 h-1 bg-white/30 rounded-full" />
      </div>
    </section>
  );
};

interface ProjectCardProps {
  image: string;
  title: string;
  desc: string;
  badge: string;
  badgeColor?: "blue" | "orange";
}

const ProjectCard = ({ image, title, desc, badge, badgeColor = "blue" }: ProjectCardProps) => (
  <div className="group relative min-w-[300px] md:min-w-[400px] h-[500px] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-500 hover:-translate-y-2">
    <img
      src={image}
      alt={title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
    
    {/* Badge */}
    <div className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white ${badgeColor === 'orange' ? 'bg-accent' : 'bg-primary'}`}>
      {badge}
    </div>

    {/* Content */}
    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform transition-transform duration-300 group-hover:translate-y-[-8px]">
      <h3 className="text-2xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70 text-sm font-medium mb-4">{desc}</p>
      
      <div className="flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
        View Project <ChevronRight size={16} />
      </div>
    </div>
  </div>
);

const DiscoverProjectsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const projects = [
    {
      image: project1,
      title: "Skyline Heights, Zirakpur",
      desc: "Luxury 3 & 4 BHK • Trusted Developer",
      badge: "Best Seller",
      badgeColor: "blue" as const
    },
    {
      image: project2,
      title: "The Grand Villa, Goa",
      desc: "Sea-facing 5 BHK Villas • Pre-Launch",
      badge: "New Launch",
      badgeColor: "orange" as const
    },
    {
      image: project3,
      title: "Tech Park One, Bangalore",
      desc: "Premium Commercial Spaces • Ready to Move",
      badge: "Featured",
      badgeColor: "blue" as const
    },
    {
      image: project1, // reusing for demo
      title: "Lakeside Residences",
      desc: "Waterfront Living • 2 & 3 BHK",
      badge: "Pre-Launch",
      badgeColor: "orange" as const
    },
    {
      image: project2, // reusing for demo
      title: "Urban Towers",
      desc: "Modern City Living • Smart Homes",
      badge: "Popular",
      badgeColor: "blue" as const
    }
  ];

  return (
    <section id="discover-section" className="py-24 bg-[#050816] relative overflow-hidden">
      <div className="px-6 md:px-12 max-w-[1920px] mx-auto mb-12">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-3">
          DISCOVER OUR PROJECT WORLDS
        </h2>
        <p className="text-white/60 text-lg">Handpicked IPX experiences from trusted developers.</p>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-12 snap-x snap-mandatory hide-scrollbar"
        ref={scrollRef}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {projects.map((project, idx) => (
          <div key={idx} className="snap-start">
            <ProjectCard {...project} />
          </div>
        ))}
      </div>
    </section>
  );
};

interface FeaturedProjectProps {
  image: string;
  title: string;
  desc: string;
  link?: string;
  reversed?: boolean;
}

const FeaturedProjectSection = ({ image, title, desc, link, reversed = false }: FeaturedProjectProps) => {
  return (
    <section className="py-16 md:py-24 bg-[#050816] px-6 md:px-12 border-t border-white/5 last:border-b-0">
      <div className="max-w-7xl mx-auto">
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden group shadow-2xl shadow-primary/10 border border-white/5">
          {/* Background */}
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Overlay Gradient - Stronger at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-3">{title}</h2>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">{desc}</p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a 
                href={link || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg min-w-[200px] text-center"
              >
                View Full IPX Experience
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
            Powered by BetterSide — Verified Developer
          </p>
        </div>
      </div>
    </section>
  );
};

const FeaturedProjectsList = () => {
  return (
    <>
      <FeaturedProjectSection 
        image={featuredBg1}
        title="CM Infinia"
        desc="Full immersive tour of CM Infinia, a premium luxury residential tower in the heart of the city."
        link="https://www.cminfiniaimmersive.com/"
      />
      <FeaturedProjectSection 
        image={featuredBg2}
        title="MDB The Lutyens"
        desc="Experience luxury redefined. An exclusive residential enclave with world-class amenities and timeless architecture."
        link="https://mdbthelutyens.in/"
      />
      <FeaturedProjectSection 
        image={featuredBg3}
        title="Ananta Street"
        desc="A vibrant commercial destination with premium retail spaces, dining, and entertainment in a stunning architectural setting."
        link="https://bettersideserver-cpu.github.io/AnantaStreet/"
      />
    </>
  );
};

const BlogSection = () => {
  const posts = [
    {
      title: "The Future of Virtual Real Estate Tours",
      category: "Technology",
      date: "Oct 12, 2024",
      image: project1
    },
    {
      title: "Why Pre-Launch Investments Yield Better Returns",
      category: "Investment",
      date: "Nov 05, 2024",
      image: project2
    },
    {
      title: "Sustainable Living: The New Standard",
      category: "Trends",
      date: "Dec 01, 2024",
      image: project3
    }
  ];

  return (
    <section id="blog-section" className="py-24 bg-[#050816] px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-3">Latest Insights</h2>
          <p className="text-white/60 text-lg">Trends, analysis, and news from the world of real estate.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
             <div key={i} className="group cursor-pointer">
               <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-white/5">
                 <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                 <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                   {post.category}
                 </div>
               </div>
               <p className="text-accent text-sm font-bold mb-2">{post.date}</p>
               <h3 className="text-2xl font-display font-bold text-white leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ContactSection = () => {
  return (
    <section id="contact-section" className="py-24 bg-[#050816] px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Contact Details */}
          <div>
            <span className="text-accent font-bold tracking-widest text-xs uppercase mb-4 block">Get in Touch</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Let's build the future together.</h2>
            <p className="text-white/60 text-lg mb-12 max-w-md">
              Whether you're a developer, channel partner, or home buyer, we're here to help you experience real estate in a whole new way.
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Call Us</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-white/50 text-sm">Manik Aggarwal</span>
                      <a href="tel:+917986519697" className="text-white/70 hover:text-white transition-colors text-lg block">
                        +91 79865 19697
                      </a>
                    </div>
                    <div>
                      <span className="text-white/50 text-sm">Damanjot Singh</span>
                      <a href="tel:+917009255992" className="text-white/70 hover:text-white transition-colors text-lg block">
                        +91 70092 55992
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Email Us</h3>
                  <a href="mailto:betterside.in@gmail.com" className="text-white/70 hover:text-white transition-colors text-lg">
                    betterside.in@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Visit Us</h3>
                  <p className="text-white/70 text-lg">
                    404, Nirmal Nagar Rd, Duggri,<br />Ludhiana, Punjab 141001
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative w-full aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-primary/5 group">
             {/* Simple Map Placeholder / Embed */}
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3424.123456789!2d75.8572!3d30.8773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a8376c2f0b2f9%3A0x1234567890abcdef!2sNirmal%20Nagar%20Rd%2C%20Duggri%2C%20Ludhiana%2C%20Punjab%20141001!5e0!3m2!1sen!2sin!4v1716382958611!5m2!1sen!2sin" 
               width="100%" 
               height="100%" 
               style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               className="grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
             ></iframe>
             
             {/* Decorative Overlay */}
             <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-3xl mix-blend-overlay"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-black py-20 px-6 md:px-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="BetterSide Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-display font-bold tracking-tight text-white">BetterSide</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Experience real estate before it's built. The world's leading immersive project experience platform for trusted developers.
          </p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-primary hover:text-white transition-all duration-300">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="text-white font-bold mb-6 font-display">Platform</h4>
          <ul className="space-y-4">
            {["Home", "About Us", "Features", "Pricing", "Login"].map((item) => (
              <li key={item}>
                <a href="#" className="text-white/60 hover:text-primary transition-colors text-sm">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="text-white font-bold mb-6 font-display">Resources</h4>
          <ul className="space-y-4">
            {["For Developers", "For Channel Partners", "For Home Buyers", "Case Studies", "Blog"].map((item) => (
              <li key={item}>
                <a href="#" className="text-white/60 hover:text-primary transition-colors text-sm">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact/Newsletter */}
        <div>
          <h4 className="text-white font-bold mb-6 font-display">Contact</h4>
          <div className="flex flex-col gap-4">
            <a href="mailto:hello@betterside.com" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm">
              <Mail size={16} />
              hello@betterside.com
            </a>
            <p className="text-white/40 text-xs mt-4">
              © 2025 BetterSide Inc.<br />All rights reserved.
            </p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-white/40 hover:text-white text-xs">Privacy Policy</a>
              <a href="#" className="text-white/40 hover:text-white text-xs">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-center">
        <p className="text-white/20 text-xs font-mono">
          DESIGNED WITH PASSION FOR IMMERSIVE EXPERIENCES
        </p>
      </div>
    </footer>
  );
};

const HomePage = () => {
  const handleExploreClick = () => {
    document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContactClick = () => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-accent selection:text-white">
      <Navbar />
      <InteractiveHero 
        heroBg={heroBg}
        onExploreClick={handleExploreClick}
        onContactClick={handleContactClick}
      />
      <DiscoverProjectsSection />
      <FeaturedProjectsList />
      <BlogSection />
      <ContactSection />
      <Footer />
    </div>
  );
//   return (
//   <div style={{ padding: 50 }}>
//     <h1>Welcome Aman 👋</h1>
//     <p>Frontend is now under your control.</p>
//   </div>
// );

};

export default HomePage;
