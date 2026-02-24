"use client";

import { useEffect, useRef } from "react";

export default function DitherCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;
    let animId: number;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width;
      canvas!.height = height;
    }

    window.addEventListener("resize", resize);
    resize();

    function draw() {
      ctx!.fillStyle = "#000000";
      ctx!.fillRect(0, 0, width, height);

      const gridSize = 4;
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      const waveCenterY = rows * 0.4;
      const waveAmplitude = rows / 5;
      const frequency = 0.04;
      const speed = 0.015;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const wave1 = Math.sin(x * frequency + time) * waveAmplitude;
          const wave2 =
            Math.cos(x * frequency * 0.6 - time * 0.8) * (waveAmplitude * 0.6);
          const wave3 =
            Math.sin((x + y * 0.3) * frequency * 0.3 + time * 0.5) *
            (waveAmplitude * 0.3);
          const combinedWave = wave1 + wave2 + wave3;

          const distFromWave = Math.abs(y - (waveCenterY + combinedWave));

          let intensity = Math.max(0, 1 - distFromWave / 20);
          intensity *= intensity;

          // Add subtle noise
          intensity += (Math.random() - 0.5) * 0.03;

          if (intensity > 0.15) {
            const alpha = Math.min(intensity * 0.55, 0.45);
            // Solana gradient: green (#14F195) on left → purple (#9945FF) on right
            const t = x / cols;
            const r = Math.floor(20 + t * 133);   // 20 → 153
            const g = Math.floor(241 - t * 172);   // 241 → 69
            const b = Math.floor(149 + t * 106);   // 149 → 255
            ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx!.fillRect(
              x * gridSize,
              y * gridSize,
              gridSize - 1,
              gridSize - 1
            );
          }
        }
      }

      time += speed;
      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="dither-canvas" />;
}
