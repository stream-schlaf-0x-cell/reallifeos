import { useEffect } from "react";

// ==========================================
// PARTIKEL ENGINE HOOK
// Reads particle colors from CSS variables injected by ThemeProvider.
// ==========================================

/**
 * Reads particle config from CSS variables on :root.
 * Returns { hueMin, hueMax, saturation, lightness, count, opacity }.
 */
function getParticleConfig() {
  const styles = getComputedStyle(document.documentElement);
  const getVar = (name, fallback) => {
    const v = styles.getPropertyValue(name).trim();
    return v ? Number(v) : fallback;
  };
  return {
    hueMin: getVar('--particle-hue-min', 200),
    hueMax: getVar('--particle-hue-max', 300),
    saturation: getVar('--particle-saturation', 50),
    lightness: getVar('--particle-lightness', 60),
    count: getVar('--particle-count', 70),
    opacity: getVar('--particle-opacity', 0.4),
  };
}

class Particle {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    const hue = config.hueMin + Math.random() * (config.hueMax - config.hueMin);
    this.color = `hsla(${hue}, ${config.saturation}%, ${config.lightness}%, ${Math.random() * config.opacity + 0.1})`;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > this.canvas.width) this.x = 0;
    else if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    else if (this.y < 0) this.y = this.canvas.height;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const useParticles = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const initParticles = () => {
      const config = getParticleConfig();
      particles = [];
      for (let i = 0; i < config.count; i++) {
        particles.push(new Particle(canvas, config));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);
};
