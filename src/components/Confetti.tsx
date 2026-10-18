import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; rot: number; spin: number; color: string; round: boolean; life: number; maxLife: number;
}

/** Canvas confetti cannons from both bottom corners. */
export default function Confetti({ colors }: { colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
    };
    resize();
    addEventListener('resize', resize);

    const particles: Particle[] = [];
    const fire = (fromX: number, angle: number, spread: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const speed = (14 + Math.random() * 14) * Math.min(1.4, Math.max(0.8, innerHeight / 800));
        particles.push({
          x: fromX * canvas.width,
          y: canvas.height + 10,
          vx: Math.cos(a) * speed * dpr,
          vy: Math.sin(a) * speed * dpr,
          size: (6 + Math.random() * 8) * dpr,
          rot: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)],
          round: Math.random() < 0.3,
          life: 0,
          maxLife: 200 + Math.random() * 120,
        });
      }
    };

    // A few bursts from the two bottom corners only, so the middle of the podium stays clear.
    const up = -Math.PI / 2;
    const cannons = (count: number) => {
      fire(0, up + 0.22, 0.35, count);
      fire(1, up - 0.22, 0.35, count);
    };
    const timers = [150, 1300, 2600].map((at, i) => setTimeout(() => cannons(i === 0 ? 80 : 55), at));

    // Physics are tuned per 60 fps frame and scaled by elapsed time, so 120 Hz screens
    // and throttled tabs play at the same speed.
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const k = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      const drag = 0.985 ** k;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= drag;
        p.vy = p.vy * drag + 0.28 * dpr * k;
        p.x += p.vx * k;
        p.y += p.vy * k;
        p.rot += p.spin * k;
        p.life += k;
        if (p.life > p.maxLife || p.y > canvas.height + 40) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.min(1, (p.maxLife - p.life) / 40);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      removeEventListener('resize', resize);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [colors]);

  return <canvas ref={ref} className="confetti" aria-hidden />;
}
