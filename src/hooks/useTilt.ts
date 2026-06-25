"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";

const REST = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";

// 3D-Tilt für die Poster-Karte: folgt dem Mauszeiger (rAF-gedrosselt),
// inkl. wanderndem Glanz. Deaktiviert sich bei prefers-reduced-motion.
export function useTilt(maxTiltDeg = 14) {
  const [transform, setTransform] = useState(REST);
  const [glare, setGlare] = useState<CSSProperties>({ opacity: 0 });
  const frame = useRef<number | null>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (reduced.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height; // 0..1
      const ry = (px - 0.5) * 2 * maxTiltDeg; // links/rechts
      const rx = -(py - 0.5) * 2 * maxTiltDeg; // oben/unten
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setTransform(
          `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(
            2
          )}deg) scale(1.05)`
        );
        setGlare({
          opacity: 1,
          background: `radial-gradient(circle at ${(px * 100).toFixed(0)}% ${(
            py * 100
          ).toFixed(0)}%, color-mix(in oklab, white 38%, transparent), transparent 55%)`,
        });
      });
    },
    [maxTiltDeg]
  );

  const onMouseLeave = useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current);
    setTransform(REST);
    setGlare({ opacity: 0 });
  }, []);

  return { transform, glare, onMouseMove, onMouseLeave };
}
