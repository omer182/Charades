import React, { useEffect, useRef } from 'react';

const NEON_COLORS = ['#c6ff3d', '#3df0ff', '#ff3d8a', '#ff8a3d', '#d63dff', '#6366f1'];

const Confetti = ({ active, accent }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d');
    const palette = accent ? [accent, ...NEON_COLORS] : NEON_COLORS;

    const makeParticle = (originX, spread) => {
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * spread;
      const speed = 7 + Math.random() * 10;
      return {
        x: originX * dpr,
        y: window.innerHeight * 0.6 * dpr,
        vx: Math.cos(angle) * speed * dpr,
        vy: Math.sin(angle) * speed * dpr,
        gravity: 0.16 * dpr,
        drag: 0.994,
        size: (5 + Math.random() * 7) * dpr,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: Math.random() < 0.5 ? 'rect' : 'circle',
        opacity: 1,
        life: 0,
        maxLife: 280 + Math.random() * 100,
      };
    };

    const particles = [];
    const burst = (originXRatio, count = 70, spread = Math.PI / 2.5) => {
      const originX = window.innerWidth * originXRatio;
      for (let i = 0; i < count; i++) particles.push(makeParticle(originX, spread));
    };

    // Staggered bursts over 5s for a sustained celebration
    const schedule = [
      { delay: 0,    fire: () => { burst(0.25); burst(0.75); } },
      { delay: 250,  fire: () => burst(0.5, 60, Math.PI * 0.9) },
      { delay: 1100, fire: () => { burst(0.18, 50); burst(0.82, 50); } },
      { delay: 2200, fire: () => { burst(0.35, 50); burst(0.65, 50); } },
      { delay: 3300, fire: () => burst(0.5, 80, Math.PI * 0.9) },
    ];
    const timers = schedule.map(({ delay, fire }) => setTimeout(fire, delay));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.life += 1;
        p.opacity = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12 * dpr;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        if (p.life > p.maxLife || p.y > canvas.height + 50 * dpr) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      timers.forEach(clearTimeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, accent]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2100,
      }}
    />
  );
};

export default Confetti;
