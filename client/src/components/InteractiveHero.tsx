/**
 * InteractiveHero - High-performance immersive hero component
 * 
 * README / CONFIGURATION:
 * ========================
 * 
 * TUNING VARIABLES (adjust at top of component):
 * - PARALLAX_INTENSITY: Scroll parallax strength (0.1 = subtle, 0.5 = strong)
 * - MOUSE_MOVE_FACTOR: Mouse parallax multiplier for layers
 * - PARTICLE_COUNT_DESKTOP / PARTICLE_COUNT_MOBILE: Canvas particle counts
 * 
 * DISABLING ANIMATIONS:
 * - Set ENABLE_PARALLAX = false to disable scroll parallax
 * - Set ENABLE_MOUSE_PARALLAX = false to disable mouse-move effect
 * - Set ENABLE_PARTICLES = false to disable floating particles
 * - Component auto-respects prefers-reduced-motion media query
 * 
 * COLORS:
 * - Primary: #0057FF (CSS variable --color-primary)
 * - Accent: #FF6A00 (CSS variable --color-accent)
 * - Modify in button classNames or CSS custom properties
 * 
 * MOBILE BEHAVIOR:
 * - Mouse parallax disabled on < 768px
 * - Particles reduced or disabled on mobile
 * - Only scroll parallax remains active (simple and performant)
 */

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ParticleSystem } from "./particles";

// ============================================================
// TUNABLE CONFIGURATION - Adjust these values as needed
// ============================================================
const PARALLAX_INTENSITY = 0.15;         // Scroll parallax strength (0.1 - 0.5)
const MOUSE_MOVE_FACTOR = {
  background: 0.02,                       // Background layer (2-6px movement)
  midLayer: 0.04,                         // Decorative shapes (6-12px)
  foreground: 0.015,                      // Content card (2-4px, subtle)
};
const PARTICLE_COUNT_DESKTOP = 30;        // Particles on desktop
const PARTICLE_COUNT_MOBILE = 6;          // Reduced particles on mobile
const ENABLE_PARALLAX = true;             // Toggle scroll parallax
const ENABLE_MOUSE_PARALLAX = true;       // Toggle mouse-move effect
const ENABLE_PARTICLES = true;            // Toggle floating particles
const CONTENT_STAGGER_DELAY = 100;        // Stagger delay between elements (ms)

// ============================================================
// TYPES
// ============================================================
interface InteractiveHeroProps {
  heroBg: string;
  onExploreClick?: () => void;
  onContactClick?: () => void;
}

// ============================================================
// HOOKS
// ============================================================

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  
  return reducedMotion;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  return isMobile;
}

// ============================================================
// COMPONENTS
// ============================================================

const RippleButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  ariaLabel: string;
  testId: string;
}> = ({ children, onClick, variant = "primary", ariaLabel, testId }) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    
    onClick?.();
  };
  
  const baseClasses = "relative overflow-hidden px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent";
  
  const variantClasses = variant === "primary"
    ? "bg-[#0057FF] text-white hover:bg-[#0057FF]/90 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(0,87,255,0.5)] focus:ring-[#0057FF]"
    : "border-2 border-white/30 text-white hover:bg-white/10 hover:border-white hover:scale-[1.03] focus:ring-white/50 backdrop-blur-sm";
  
  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </button>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const InteractiveHero: React.FC<InteractiveHeroProps> = ({
  heroBg,
  onExploreClick,
  onContactClick,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const fgLayerRef = useRef<HTMLDivElement>(null);
  
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  const shouldAnimate = !reducedMotion;
  const enableParallax = ENABLE_PARALLAX && shouldAnimate;
  const enableMouseParallax = ENABLE_MOUSE_PARALLAX && shouldAnimate && !isMobile;
  const enableParticles = ENABLE_PARTICLES && shouldAnimate;

  // Scroll parallax effect
  useEffect(() => {
    if (!enableParallax) return;
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableParallax]);

  // Mouse move parallax effect (desktop only)
  useEffect(() => {
    if (!enableMouseParallax) return;
    
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        setMousePos({
          x: (e.clientX - centerX) / centerX,
          y: (e.clientY - centerY) / centerY,
        });
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [enableMouseParallax]);

  // Particle system initialization
  useEffect(() => {
    if (!enableParticles || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const count = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    
    particleSystemRef.current = new ParticleSystem(canvas, { count });
    
    const handleResize = () => {
      if (containerRef.current && particleSystemRef.current) {
        particleSystemRef.current.resize(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        );
      }
    };
    
    handleResize();
    particleSystemRef.current.start();
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      particleSystemRef.current?.destroy();
    };
  }, [enableParticles, isMobile]);

  // Trigger mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate transforms for parallax layers
  const getTransform = useCallback(
    (layer: "background" | "midLayer" | "foreground") => {
      if (!shouldAnimate) return "none";
      
      const scrollOffset = scrollY * PARALLAX_INTENSITY;
      const mouseX = enableMouseParallax ? mousePos.x * MOUSE_MOVE_FACTOR[layer] * 100 : 0;
      const mouseY = enableMouseParallax ? mousePos.y * MOUSE_MOVE_FACTOR[layer] * 100 : 0;
      
      if (layer === "background") {
        return `translate3d(${mouseX}px, ${scrollOffset + mouseY}px, 0)`;
      }
      return `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    },
    [scrollY, mousePos, shouldAnimate, enableMouseParallax]
  );

  const handleExplore = () => onExploreClick?.();
  const handleContact = () => onContactClick?.();

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden"
      aria-label="Hero section"
      data-testid="hero-section"
    >
      {/* Particle Canvas - Behind everything */}
      {enableParticles && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-[1] pointer-events-none"
          aria-hidden="true"
        />
      )}
      {/* Background Layer - Parallax on scroll + mouse */}
      <div
        ref={bgLayerRef}
        className="absolute inset-0 will-change-transform"
        style={{
          transform: getTransform("background"),
          transition: reducedMotion ? "none" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent z-10" />
        <img
          src={heroBg}
          alt=""
          loading="lazy"
          onLoad={() => setBgLoaded(true)}
          className={`w-full h-full object-cover scale-110 transition-opacity duration-1000 ${
            bgLoaded ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
      </div>
      {/* Mid Layer - Decorative shapes with stronger parallax */}
      <div
        ref={midLayerRef}
        className="absolute inset-0 z-[5] pointer-events-none will-change-transform"
        style={{
          transform: getTransform("midLayer"),
        }}
        aria-hidden="true"
      >
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#0057FF]/10 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/5 w-48 h-48 rounded-full bg-[#FF6A00]/10 blur-3xl" />
      </div>
      {/* Foreground Layer - Content with subtle parallax */}
      <div
        ref={fgLayerRef}
        className="relative z-20 h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 max-w-7xl mx-auto pt-20 will-change-transform"
        style={{
          transform: getTransform("foreground"),
        }}
      >
        {/* Tagline - Stagger 0 */}
        <span
          className="inline-block mb-4 font-bold tracking-widest text-xs uppercase transition-all duration-700 opacity-100 translate-y-0 text-[#efeff0]"
          style={{ transitionDelay: shouldAnimate ? "0ms" : undefined }}
          data-testid="text-tagline"
        >
          Immersive Project Experience (IPX)
        </span>

        {/* Headline - Stagger 1 */}
        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1] mb-6 max-w-4xl transition-all duration-700 ${
            isLoaded && shouldAnimate
              ? "opacity-100 translate-y-0"
              : shouldAnimate
              ? "opacity-0 translate-y-8"
              : ""
          }`}
          style={{ transitionDelay: shouldAnimate ? `${CONTENT_STAGGER_DELAY}ms` : undefined }}
          data-testid="text-headline"
        >
          <span className="text-[#FF6F00]">E</span>xperience{" "}
          <span className="text-[#FF6F00]">R</span>eal{" "}
          <span className="text-[#FF6F00]">E</span>state <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
            <span className="text-[#FF6F00]">B</span>efore{" "}
            <span className="text-[#FF6F00]">I</span>t's{" "}
            <span className="text-[#FF6F00]">B</span>uilt.
          </span>
        </h1>

        {/* Subheading - Stagger 2 */}
        <p
          className={`text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed transition-all duration-700 ${
            isLoaded && shouldAnimate
              ? "opacity-100 translate-y-0"
              : shouldAnimate
              ? "opacity-0 translate-y-8"
              : ""
          }`}
          style={{ transitionDelay: shouldAnimate ? `${CONTENT_STAGGER_DELAY * 2}ms` : undefined }}
          data-testid="text-subheading"
        >
          BetterSide helps you explore trusted pre-launch and under-construction
          projects in full immersive 3D, right from your browser.
        </p>

        {/* CTAs - Stagger 3 & 4 */}
        <div
          className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${
            isLoaded && shouldAnimate
              ? "opacity-100 translate-y-0"
              : shouldAnimate
              ? "opacity-0 translate-y-8"
              : ""
          }`}
          style={{ transitionDelay: shouldAnimate ? `${CONTENT_STAGGER_DELAY * 3}ms` : undefined }}
        >
          <RippleButton
            variant="primary"
            onClick={handleExplore}
            ariaLabel="Explore IPX Projects"
            testId="button-explore"
          >
            Explore IPX Projects
          </RippleButton>
          
          <RippleButton
            variant="secondary"
            onClick={handleContact}
            ariaLabel="Talk to Our Team"
            testId="button-contact"
          >
            Talk to Our Team
          </RippleButton>
        </div>
      </div>
      {/* Slider Indicators */}
      <div className="absolute bottom-12 left-6 md:left-12 flex gap-3 z-30" aria-hidden="true">
        <div className="w-12 h-1 bg-white rounded-full" />
        <div className="w-2 h-1 bg-white/30 rounded-full" />
        <div className="w-2 h-1 bg-white/30 rounded-full" />
      </div>
      {/* Ripple animation keyframes */}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(20);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default InteractiveHero;
