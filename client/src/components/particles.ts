/**
 * Lightweight particle system for hero background
 * 
 * TUNING GUIDE:
 * - DESKTOP_PARTICLE_COUNT: Number of particles on desktop (default: 30)
 * - MOBILE_PARTICLE_COUNT: Reduced count for mobile (default: 8)
 * - BASE_SPEED: Base drift speed multiplier (default: 0.3)
 * - PARTICLE_COLORS: Array of RGBA color strings for particles
 * - MIN_SIZE / MAX_SIZE: Particle size range in pixels
 */

export interface ParticleConfig {
  count?: number;
  colors?: string[];
  baseSpeed?: number;
  minSize?: number;
  maxSize?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

const DEFAULT_COLORS = [
  'rgba(0, 87, 255, 0.4)',   // Primary blue
  'rgba(255, 106, 0, 0.3)',  // Accent orange
  'rgba(255, 255, 255, 0.2)' // Subtle white
];

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private config: Required<ParticleConfig>;

  constructor(canvas: HTMLCanvasElement, config: ParticleConfig = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;

    this.config = {
      count: config.count ?? 30,
      colors: config.colors ?? DEFAULT_COLORS,
      baseSpeed: config.baseSpeed ?? 0.3,
      minSize: config.minSize ?? 1,
      maxSize: config.maxSize ?? 3,
    };

    this.initParticles();
  }

  private initParticles(): void {
    this.particles = [];
    const { count, colors, baseSpeed, minSize, maxSize } = this.config;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: minSize + Math.random() * (maxSize - minSize),
        speedX: (Math.random() - 0.5) * baseSpeed,
        speedY: (Math.random() - 0.5) * baseSpeed,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.initParticles();
  }

  private update(): void {
    const { width, height } = this.canvas;

    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    });
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p) => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
    });

    this.ctx.globalAlpha = 1;
  }

  start(): void {
    const loop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.particles = [];
  }
}
