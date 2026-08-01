import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   Auralis Parabola Parallax Background
   Multiple thin parabolic lines from top-left to top-right,
   opening upward (U-shape). Mouse-reactive parallax drift.
   Canvas 2D — clean, tidy, no noise.
───────────────────────────────────────────────────────────────*/

interface LineConfig {
  yOffset: number;       // vertical shift of this line
  opacity: number;       // stroke opacity
  width: number;         // stroke width
  depth: number;         // how deep the parabola dips (% of canvas height)
  parallaxFactor: number; // how much it reacts to mouse
  speed: number;         // drift animation speed
  phase: number;         // animation phase offset
}

// Family of tidy parabolic lines — subtle variation creates depth
const LINES: LineConfig[] = [
  { yOffset: -0,   opacity: 0.13, width: 1.0, depth: 0.42, parallaxFactor: 0.018, speed: 0.0004, phase: 0.0 },
  { yOffset: 18,   opacity: 0.09, width: 0.8, depth: 0.44, parallaxFactor: 0.024, speed: 0.0003, phase: 1.2 },
  { yOffset: -20,  opacity: 0.07, width: 0.7, depth: 0.40, parallaxFactor: 0.012, speed: 0.0005, phase: 2.4 },
  { yOffset: 40,   opacity: 0.06, width: 0.6, depth: 0.46, parallaxFactor: 0.030, speed: 0.0003, phase: 0.8 },
  { yOffset: -38,  opacity: 0.05, width: 0.6, depth: 0.38, parallaxFactor: 0.009, speed: 0.0006, phase: 3.1 },
  { yOffset: 62,   opacity: 0.04, width: 0.5, depth: 0.48, parallaxFactor: 0.036, speed: 0.0002, phase: 1.6 },
  { yOffset: -60,  opacity: 0.03, width: 0.5, depth: 0.36, parallaxFactor: 0.006, speed: 0.0007, phase: 4.2 },
];

export function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Track mouse (normalized -1..1 relative to center)
    let mouseX = 0; // raw px
    let mouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });

    // Resize
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(() => {
      ctx.resetTransform();
      resize();
    });
    ro.observe(canvas);

    /* ── Draw one parabola ──────────────────────────────── */
    function drawParabola(
      ctx: CanvasRenderingContext2D,
      t: number,
      line: LineConfig,
      cw: number, // canvas logical width
      ch: number, // canvas logical height
      pxOffset: number, // parallax X pixel offset
      pyOffset: number, // parallax Y pixel offset
    ) {
      // Breathing drift: ±8px vertical oscillation per line
      const drift = Math.sin(t * line.speed * Math.PI * 2 + line.phase) * 8;

      // Parabola vertex = (cw/2, ch * depth) from top — deepest point
      // Endpoints at (0, 0) top-left and (cw, 0) top-right
      // y(x) = a*(x - cx)^2 + vertex_y
      // At x=0: 0 = a*cx^2 + vertex_y → a = -vertex_y / cx^2 (opens upward means vertex is min)
      // Wait — we want endpoints at the top and the middle to dip down:
      // That's actually opens DOWNWARD in screen coords (y increases downward).
      // "Opens upward" in screen space = vertex at TOP, arms go DOWN = ∩ shape
      // But user says "parabola opens upward" which visually = U shape from top corners dipping down through middle.
      // In screen coords (y=0 at top): y = a*(x-cx)^2 where a > 0 gives the U shape, vertex at the top.
      // We want: starts at top-left (0, edge_y), dips down to (cx, deep_y), back up to (cw, edge_y).

      const cx = cw / 2;
      const edgeY = line.yOffset + drift + pyOffset; // y at the left and right endpoints
      const deepY = ch * line.depth + line.yOffset + drift + pyOffset; // y at the vertex (deepest point)

      // Parabola: y = a*(x - cx)^2 + deepY where a = (edgeY - deepY) / cx^2
      const a = (edgeY - deepY) / (cx * cx);

      // Draw with bezier for smoothness — use the vertex as control point
      // Quadratic bezier through (0, edgeY), (cx, deepY), (cw, edgeY)
      // Control point of a quadratic bezier that passes through the vertex:
      // For a true parabola through P0, P1(vertex), P2:
      // control = 2*P1 - 0.5*(P0+P2) — this makes the bezier pass exactly through P1
      const ctrlX = cx + pxOffset * 0.5;
      const ctrlY = 2 * deepY - 0.5 * (edgeY + edgeY); // = 2*deepY - edgeY

      // Amber color: rgb(185, 138, 69) for warm golden tone
      ctx.beginPath();
      ctx.moveTo(pxOffset * -0.2, edgeY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, cw + pxOffset * 0.2, edgeY);
      ctx.strokeStyle = `rgba(185, 138, 69, ${line.opacity})`;
      ctx.lineWidth = line.width;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    /* ── Render loop ────────────────────────────────────── */
    let raf = 0;
    const start = performance.now();

    const render = () => {
      const elapsed = performance.now() - start;

      // Smooth mouse lerp
      smoothMouseX += (mouseX - smoothMouseX) * 0.05;
      smoothMouseY += (mouseY - smoothMouseY) * 0.05;

      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;

      ctx.clearRect(0, 0, cw, ch);

      // Draw each line
      for (const line of LINES) {
        // Parallax: offset based on mouse distance from center
        const pxOffset = (smoothMouseX - cw / 2) * line.parallaxFactor;
        const pyOffset = (smoothMouseY - ch * 0.3) * line.parallaxFactor * 0.5;

        drawParabola(ctx, elapsed, line, cw, ch, pxOffset, pyOffset);
      }

      raf = requestAnimationFrame(render);
    };

    // Respect reduced motion — still draw, just no animation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Draw once, static
      for (const line of LINES) {
        drawParabola(ctx, 0, line, canvas.offsetWidth, canvas.offsetHeight, 0, 0);
      }
    } else {
      render();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouse);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      {/* Canvas — full-bleed behind page content */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Amber haze fallback (always rendered, canvas overlays it) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(255,232,184,0.28) 0%, rgba(255,248,234,0.08) 55%, transparent 80%)",
        }}
      />
    </>
  );
}
