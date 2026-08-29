import React, { useEffect, useRef } from 'react';

interface QuantumCoreVisualizerProps {
  mode: 'idle' | 'listening' | 'speaking' | 'processing';
  isListening?: boolean;
  isSpeaking?: boolean;
}

export const QuantumCoreVisualizer: React.FC<QuantumCoreVisualizerProps> = ({
  mode,
  isListening,
  isSpeaking,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const effectiveState = isSpeaking ? 'speaking' : isListening ? 'listening' : mode || 'idle';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = (canvas.offsetWidth || 380) * 2);
    let height = (canvas.height = (canvas.offsetHeight || 220) * 2);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = (canvas.offsetWidth || 380) * 2;
      height = canvas.height = (canvas.offsetHeight || 220) * 2;
    };
    window.addEventListener('resize', handleResize);

    let tick = 0;

    // Define 5 Orbiting Celestial Planets around the Central Sun
    const planets = [
      {
        name: 'Mercury',
        radiusX: 52,
        radiusY: 24,
        tilt: -0.15,
        speed: 0.038,
        angle: 0.2,
        size: 3.5,
        color: '#94a3b8',
        glow: '#cbd5e1',
        trail: [] as { x: number; y: number; alpha: number }[],
      },
      {
        name: 'Venus',
        radiusX: 84,
        radiusY: 38,
        tilt: 0.25,
        speed: 0.026,
        angle: 1.8,
        size: 5.0,
        color: '#fbbf24',
        glow: '#f59e0b',
        trail: [] as { x: number; y: number; alpha: number }[],
      },
      {
        name: 'Earth',
        radiusX: 122,
        radiusY: 54,
        tilt: -0.32,
        speed: 0.018,
        angle: 3.4,
        size: 6.0,
        color: '#38bdf8',
        glow: '#0284c7',
        hasMoon: true,
        moonAngle: 0,
        trail: [] as { x: number; y: number; alpha: number }[],
      },
      {
        name: 'Mars',
        radiusX: 160,
        radiusY: 72,
        tilt: 0.18,
        speed: 0.013,
        angle: 4.9,
        size: 4.5,
        color: '#fb7185',
        glow: '#e11d48',
        trail: [] as { x: number; y: number; alpha: number }[],
      },
      {
        name: 'Jupiter',
        radiusX: 200,
        radiusY: 90,
        tilt: -0.08,
        speed: 0.009,
        angle: 0.8,
        size: 8.5,
        color: '#34d399',
        glow: '#059669',
        hasRing: true,
        trail: [] as { x: number; y: number; alpha: number }[],
      },
    ];

    // Cosmic background stars & solar wind particles
    const starCount = 42;
    const stars = Array.from({ length: starCount }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 1.5,
      blinkSpeed: 0.02 + Math.random() * 0.03,
      alpha: Math.random(),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Speed multipliers based on activity
      const speedMult =
        effectiveState === 'speaking'
          ? 2.0
          : effectiveState === 'listening'
          ? 1.6
          : effectiveState === 'processing'
          ? 3.2
          : 1.0;

      tick += 0.04 * speedMult;

      // 1. Draw Subtle Deep Space Grid & Twinkling Stars
      stars.forEach((star) => {
        star.alpha += star.blinkSpeed;
        const currentAlpha = 0.25 + Math.sin(star.alpha) * 0.25;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${currentAlpha})`;
        ctx.fill();
      });

      // 2. Draw Elliptical Orbit Paths (Behind Sun)
      planets.forEach((p) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(p.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
        ctx.strokeStyle =
          effectiveState === 'listening'
            ? 'rgba(244, 63, 94, 0.22)'
            : effectiveState === 'speaking'
            ? 'rgba(52, 211, 153, 0.25)'
            : 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();
      });

      // 3. Central Sun Solar Core (Radiant Star at Center)
      const sunBaseRadius = 24;
      const sunPulse = Math.sin(tick * 1.5) * (effectiveState === 'speaking' ? 6 : effectiveState === 'listening' ? 4 : 2);
      const currentSunRadius = sunBaseRadius + sunPulse;

      // Solar Corona Outer Plasma Flare
      const coronaGrad = ctx.createRadialGradient(cx, cy, sunBaseRadius * 0.4, cx, cy, currentSunRadius * 2.8);
      if (effectiveState === 'listening') {
        coronaGrad.addColorStop(0, 'rgba(244, 63, 94, 0.95)');
        coronaGrad.addColorStop(0.35, 'rgba(225, 29, 72, 0.45)');
        coronaGrad.addColorStop(0.7, 'rgba(159, 18, 57, 0.15)');
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (effectiveState === 'speaking') {
        coronaGrad.addColorStop(0, 'rgba(52, 211, 153, 0.95)');
        coronaGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.55)');
        coronaGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.2)');
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (effectiveState === 'processing') {
        coronaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
        coronaGrad.addColorStop(0.35, 'rgba(99, 102, 241, 0.5)');
        coronaGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.15)');
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        // Golden Radiant Sun
        coronaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
        coronaGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.45)');
        coronaGrad.addColorStop(0.7, 'rgba(217, 119, 6, 0.15)');
        coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentSunRadius * 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Solar Corona Rays (Sun Flares)
      const rayCount = 12;
      for (let r = 0; r < rayCount; r++) {
        const rayAngle = (r / rayCount) * Math.PI * 2 + tick * 0.3;
        const rayLength = currentSunRadius * 1.6 + Math.sin(tick * 2 + r) * 6;
        const rx = cx + Math.cos(rayAngle) * rayLength;
        const ry = cy + Math.sin(rayAngle) * rayLength;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(rx, ry);
        ctx.strokeStyle =
          effectiveState === 'listening'
            ? 'rgba(254, 205, 211, 0.3)'
            : effectiveState === 'speaking'
            ? 'rgba(167, 243, 208, 0.35)'
            : 'rgba(254, 240, 138, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Inner Solid Sun Sphere
      ctx.beginPath();
      ctx.arc(cx, cy, currentSunRadius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle =
        effectiveState === 'listening'
          ? '#ffe4e6'
          : effectiveState === 'speaking'
          ? '#ecfdf5'
          : '#fef9c3';
      ctx.shadowColor =
        effectiveState === 'listening'
          ? '#f43f5e'
          : effectiveState === 'speaking'
          ? '#10b981'
          : '#fbbf24';
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Draw Orbiting Planets with Real-Time 3D Projection
      planets.forEach((p) => {
        p.angle += p.speed * speedMult;

        // Parametric coordinates with orbit tilt
        const rawX = Math.cos(p.angle) * p.radiusX;
        const rawY = Math.sin(p.angle) * p.radiusY;

        // Apply tilt rotation
        const cosTilt = Math.cos(p.tilt);
        const sinTilt = Math.sin(p.tilt);
        const px = cx + (rawX * cosTilt - rawY * sinTilt);
        const py = cy + (rawX * sinTilt + rawY * cosTilt);

        // Store trail
        p.trail.push({ x: px, y: py, alpha: 0.6 });
        if (p.trail.length > 8) p.trail.shift();

        // Render trail line
        ctx.beginPath();
        p.trail.forEach((pt, idx) => {
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.strokeStyle = p.glow;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Planet Glow Halo
        ctx.beginPath();
        ctx.arc(px, py, p.size * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = p.glow + '44';
        ctx.fill();

        // Planet Core Sphere
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Earth's Moon Orbit
        if (p.hasMoon) {
          p.moonAngle += 0.08 * speedMult;
          const mx = px + Math.cos(p.moonAngle) * 12;
          const my = py + Math.sin(p.moonAngle) * 8;
          ctx.beginPath();
          ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Jupiter's Planetary Ring
        if (p.hasRing) {
          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(0.3);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 2.2, p.size * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      });

      // 5. Audio Waveform Scanner when Voice is Active
      if (effectiveState === 'speaking' || effectiveState === 'listening') {
        ctx.beginPath();
        ctx.strokeStyle =
          effectiveState === 'listening'
            ? 'rgba(244, 63, 94, 0.85)'
            : 'rgba(52, 211, 153, 0.9)';
        ctx.lineWidth = 2.2;
        const waveSegments = 32;
        const waveWidth = width * 0.75;
        const startX = cx - waveWidth / 2;

        for (let i = 0; i <= waveSegments; i++) {
          const x = startX + (i / waveSegments) * waveWidth;
          const env = Math.sin((i / waveSegments) * Math.PI); // Envelope (0 at edges, 1 at center)
          const freq = tick * 4 + i * 0.6;
          const amp = (effectiveState === 'speaking' ? 22 : 14) * env;
          const y = cy + Math.sin(freq) * amp;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [effectiveState]);

  return (
    <div className="relative w-full h-48 sm:h-56 flex items-center justify-center mx-auto select-none pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
