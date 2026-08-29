import React, { useEffect, useRef } from 'react';

interface QuantumCoreVisualizerProps {
  state: 'idle' | 'listening' | 'speaking' | 'processing';
  interactive?: boolean;
}

export const QuantumCoreVisualizer: React.FC<QuantumCoreVisualizerProps> = ({
  state,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth * 2 || 400);
    let height = (canvas.height = canvas.offsetHeight * 2 || 400);

    let angle1 = 0;
    let angle2 = 0;
    let angle3 = 0;
    let pulse = 0;

    // Particle nodes for holographic orbit
    const particleCount = 48;
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      radius: 60 + Math.random() * 50,
      speed: 0.01 + Math.random() * 0.02,
      size: 1.5 + Math.random() * 2,
      z: Math.random() * 2 - 1,
      hue: i % 2 === 0 ? 190 : 42, // Cyan & Gold/Amber Space theme
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Speed multipliers based on activity
      const speedMult = state === 'speaking' ? 2.2 : state === 'listening' ? 1.8 : state === 'processing' ? 3.0 : 1.0;
      angle1 += 0.015 * speedMult;
      angle2 -= 0.02 * speedMult;
      angle3 += 0.025 * speedMult;
      pulse += 0.05 * speedMult;

      const dynamicRadius = 45 + Math.sin(pulse) * (state === 'speaking' ? 12 : state === 'listening' ? 8 : 4);

      // Core Glowing Aura
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, dynamicRadius * 1.8);
      if (state === 'listening') {
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.9)'); // Rose Neon Listening
        grad.addColorStop(0.5, 'rgba(225, 29, 72, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'speaking') {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.9)'); // Emerald Speaking Aura
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.4)'); // Amber Core
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (state === 'processing') {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.9)'); // Cyan AI Processing
        grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.8)'); // Amber Gold Idle
        grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Inner Singularity Sphere
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = state === 'listening' ? '#ffe4e6' : state === 'speaking' ? '#ecfdf5' : '#fef3c7';
      ctx.shadowColor = state === 'listening' ? '#f43f5e' : state === 'speaking' ? '#10b981' : '#f59e0b';
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 3D Orbital Rings (Space Station Gyroscope Reactor)
      const drawRing = (tiltX: number, tiltY: number, angle: number, radius: number, strokeColor: string, dash = false) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.scale(tiltX, tiltY);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.0;
        if (dash) {
          ctx.setLineDash([8, 6, 2, 6]);
        }
        ctx.stroke();

        // Marker Nodes on ring
        const nodeX = Math.cos(angle * 2) * radius;
        const nodeY = Math.sin(angle * 2) * radius;
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor;
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.restore();
      };

      // Ring 1 (Horizontal Inclined)
      drawRing(1.0, 0.35, angle1, dynamicRadius * 1.5, state === 'listening' ? '#fb7185' : '#38bdf8', true);

      // Ring 2 (Vertical Inclined)
      drawRing(0.35, 1.0, angle2, dynamicRadius * 1.8, state === 'speaking' ? '#34d399' : '#fbbf24');

      // Ring 3 (Diagonal Outer Gyro)
      drawRing(0.7, 0.7, angle3, dynamicRadius * 2.2, state === 'listening' ? '#f43f5e' : '#a78bfa', true);

      // Orbital Hologram Particles
      particles.forEach((p) => {
        p.angle += p.speed * speedMult;
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * (p.radius * 0.45);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${0.4 + Math.sin(p.angle) * 0.4})`;
        ctx.fill();
      });

      // Frequency Audio Sine Wave / Scanner line
      if (state === 'speaking' || state === 'listening') {
        ctx.beginPath();
        ctx.strokeStyle = state === 'listening' ? 'rgba(244, 63, 94, 0.75)' : 'rgba(52, 211, 153, 0.85)';
        ctx.lineWidth = 2;
        const segments = 24;
        for (let i = 0; i <= segments; i++) {
          const x = cx - 90 + (i / segments) * 180;
          const waveAmp = (state === 'speaking' ? 16 : 10) * Math.sin((i / segments) * Math.PI);
          const y = cy + Math.sin(pulse * 3 + i * 0.8) * waveAmp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [state]);

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center mx-auto select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
