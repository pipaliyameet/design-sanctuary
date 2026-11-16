import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BusinessCard3DProps {
  className?: string;
}

export function BusinessCard3D({ className }: BusinessCard3DProps) {
  // Proper resting states:
  // Front: rotX = -4°, rotY = 8°
  // Back: rotX = -4°, rotY = 188°
  const [rotX, setRotX] = useState<number>(-4);
  const [rotY, setRotY] = useState<number>(8);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isShowingBack, setIsShowingBack] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotStartRef = useRef<{ x: number; y: number }>({ x: -4, y: 8 });
  const currentRotRef = useRef<{ x: number; y: number }>({ x: -4, y: 8 });
  const restRotRef = useRef<{ x: number; y: number }>({ x: -4, y: 8 });
  const isInteractingRef = useRef<boolean>(false);
  const idleAnimRef = useRef<number | null>(null);

  // Subtle organic idle floating animation when untouched
  useEffect(() => {
    let startTime = performance.now();

    const animateIdle = (now: number) => {
      if (!isInteractingRef.current && !isDraggingRef.current) {
        const elapsed = (now - startTime) / 1000;
        const floatPitch = Math.sin(elapsed * 1.1) * 2;
        const floatYaw = Math.cos(elapsed * 0.8) * 2;
        const floatY = Math.sin(elapsed * 1.2) * 5;

        if (containerRef.current) {
          const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
          if (card) {
            const pitch = restRotRef.current.x + floatPitch;
            const yaw = restRotRef.current.y + floatYaw;
            card.style.transform = `translateY(${floatY}px) rotateX(${pitch}deg) rotateY(${yaw}deg)`;
          }
          const shadow = containerRef.current.querySelector(".card-ground-shadow") as HTMLElement;
          if (shadow) {
            const shadowScale = 1 - floatY * 0.015;
            const shadowOpacity = 0.32 - floatY * 0.01;
            shadow.style.transform = `translateY(180px) rotateX(88deg) scale(${shadowScale})`;
            shadow.style.opacity = `${Math.max(0.18, shadowOpacity)}`;
          }
        }
      }
      idleAnimRef.current = requestAnimationFrame(animateIdle);
    };

    idleAnimRef.current = requestAnimationFrame(animateIdle);
    return () => {
      if (idleAnimRef.current) cancelAnimationFrame(idleAnimRef.current);
    };
  }, []);

  // Pointer Down (Mouse click or Finger touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isInteractingRef.current = true;
    isDraggingRef.current = true;
    setIsDragging(true);

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    rotStartRef.current = { ...currentRotRef.current };

    if (containerRef.current) {
      const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
      if (card) card.style.transition = "none";
      const shadow = containerRef.current.querySelector(".card-ground-shadow") as HTMLElement;
      if (shadow) shadow.style.transition = "none";
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
  };

  // Pointer Move (Fully Unrestricted 360° Continuous Movement!)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Natural fluid sensitivity: 0.85 degrees per pixel
    const sensitivity = 0.85;

    // FULL, COMPLETELY UNRESTRICTED ROTATION ON ALL AXES:
    const newY = rotStartRef.current.y + dx * sensitivity;
    const newX = rotStartRef.current.x - dy * sensitivity;

    currentRotRef.current = { x: newX, y: newY };
    setRotX(newX);
    setRotY(newY);

    if (containerRef.current) {
      const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
      if (card) {
        card.style.transform = `rotateX(${newX}deg) rotateY(${newY}deg)`;
      }
    }
  };

  // Pointer Up / Touch Removed: Automatically Restates to Proper Upright State!
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    const totalMove = Math.hypot(
      e.clientX - dragStartRef.current.x,
      e.clientY - dragStartRef.current.y
    );

    // If simply tapped/clicked without dragging (< 6px), flip between front and back
    if (totalMove < 6) {
      const nextBack = !isShowingBack;
      setIsShowingBack(nextBack);
      const baseYaw = nextBack ? 188 : 8;
      const basePitch = -4;

      const deltaY = ((((baseYaw - currentRotRef.current.y) % 360) + 540) % 360) - 180;
      const targetY = currentRotRef.current.y + deltaY;
      const deltaX = ((((basePitch - currentRotRef.current.x) % 360) + 540) % 360) - 180;
      const targetX = currentRotRef.current.x + deltaX;

      currentRotRef.current = { x: targetX, y: targetY };
      restRotRef.current = { x: targetX, y: targetY };
      setRotX(targetX);
      setRotY(targetY);

      const duration = 1.4;
      if (containerRef.current) {
        const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
        if (card) {
          card.style.transition = `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease`;
          card.style.transform = `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
        }
      }

      setTimeout(() => {
        if (containerRef.current) {
          const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
          if (card) card.style.transition = "none";
        }
        isInteractingRef.current = false;
      }, duration * 1000 + 50);
      return;
    }

    // Touch removed after dragging:
    // Determine which side the card was left facing
    const normY = ((currentRotRef.current.y % 360) + 360) % 360;
    const normX = ((currentRotRef.current.x % 360) + 360) % 360;

    const isUpsideDown = normX > 90 && normX < 270;
    let isFacingBack = normY > 90 && normY < 270;
    if (isUpsideDown) {
      isFacingBack = !isFacingBack;
    }

    // Target proper upright presentation angle:
    const baseYaw = isFacingBack ? 188 : 8;
    const basePitch = -4;

    // Guaranteed shortest path unwinding (strictly between -180° and +180° on both axes)
    // This completely eliminates any high-speed multi-revolution spinning!
    const deltaY = ((((baseYaw - currentRotRef.current.y) % 360) + 540) % 360) - 180;
    const targetY = currentRotRef.current.y + deltaY;
    const deltaX = ((((basePitch - currentRotRef.current.x) % 360) + 540) % 360) - 180;
    const targetX = currentRotRef.current.x + deltaX;

    setIsShowingBack(isFacingBack);
    currentRotRef.current = { x: targetX, y: targetY };
    restRotRef.current = { x: targetX, y: targetY };
    setRotX(targetX);
    setRotY(targetY);

    // Calm, slow, architectural reshape animation:
    // Dynamically scales duration from 1.35s to 1.8s based on distance moved
    // so it never feels rushed or jerky.
    const maxDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
    const duration = Math.min(1.8, Math.max(1.35, 1.35 + (maxDelta / 180) * 0.45));

    if (containerRef.current) {
      const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
      if (card) {
        card.style.transition = `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease`;
        card.style.transform = `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
      }
      const shadow = containerRef.current.querySelector(".card-ground-shadow") as HTMLElement;
      if (shadow) {
        shadow.style.transition = `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease`;
        shadow.style.transform = "translateY(180px) rotateX(88deg) scale(1)";
        shadow.style.opacity = "0.35";
      }
    }

    // Allow calm transition to complete fully before returning to idle float
    setTimeout(() => {
      if (containerRef.current) {
        const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
        if (card) card.style.transition = "none";
      }
      isInteractingRef.current = false;
    }, duration * 1000 + 50);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="button"
      tabIndex={0}
      aria-label="Interactive Right Angle Design Studio Business Card. Touch and drag anywhere to freely rotate in full 360° 3D. Release to automatically restate to proper presentation view. Tap to flip."
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          const nextBack = !isShowingBack;
          setIsShowingBack(nextBack);
          const baseYaw = nextBack ? 188 : 8;
          const basePitch = -4;

          const deltaY = ((((baseYaw - currentRotRef.current.y) % 360) + 540) % 360) - 180;
          const targetY = currentRotRef.current.y + deltaY;
          const deltaX = ((((basePitch - currentRotRef.current.x) % 360) + 540) % 360) - 180;
          const targetX = currentRotRef.current.x + deltaX;

          currentRotRef.current = { x: targetX, y: targetY };
          restRotRef.current = { x: targetX, y: targetY };
          setRotX(targetX);
          setRotY(targetY);

          const duration = 1.4;
          if (containerRef.current) {
            const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
            if (card) {
              card.style.transition = `transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease`;
              card.style.transform = `rotateX(${targetX}deg) rotateY(${targetY}deg)`;
            }
          }

          setTimeout(() => {
            if (containerRef.current) {
              const card = containerRef.current.querySelector(".card-3d-element") as HTMLElement;
              if (card) card.style.transition = "none";
            }
            isInteractingRef.current = false;
          }, duration * 1000 + 50);
        }
      }}
      className={cn(
        "relative w-full aspect-square max-w-[380px] sm:max-w-[420px] lg:max-w-[460px]",
        "flex items-center justify-center select-none outline-none",
        "touch-none cursor-grab active:cursor-grabbing",
        className
      )}
      style={{
        perspective: "1200px",
        WebkitPerspective: "1200px",
      }}
    >
      {/* Ground Contact Shadow */}
      <div
        className="card-ground-shadow absolute pointer-events-none w-[280px] sm:w-[320px] h-[140px] rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(20, 15, 10, 0.44) 0%, rgba(30, 20, 15, 0.16) 48%, transparent 72%)",
          transform: "translateY(180px) rotateX(88deg)",
          filter: "blur(18px)",
          opacity: 0.35,
          transition: isDragging
            ? "none"
            : "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease",
        }}
      />

      {/* 3D Rotating Card Element */}
      <div
        className="card-3d-element relative w-[300px] sm:w-[340px] lg:w-[370px] aspect-square"
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          // While dragging: 0ms lag instant tracking!
          // When touch is removed: calm, dignified 1.5s ease-out smoothly restates to proper orientation!
          transition: isDragging
            ? "none"
            : "transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease",
        }}
      >
        {/* Physical Paper Core Edge (Heavyweight 450gsm card thickness) */}
        <div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            transform: "translateZ(0px)",
            backgroundColor: "#8a6e50",
            boxShadow: "0 0 2px 1px rgba(0,0,0,0.38)",
          }}
        />

        {/* ================================================================== */}
        {/* FRONT FACE (Pure Code Vector: Logo & "DESIGN")                    */}
        {/* ================================================================== */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden bg-[#be9f7b]"
          style={{
            transform: "translateZ(1.5px)",
            WebkitTransform: "translateZ(1.5px)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: isDragging
              ? "0 28px 56px -12px rgba(0,0,0,0.42), 0 0 1px 1px rgba(0,0,0,0.45)"
              : "0 18px 38px -10px rgba(0,0,0,0.28), 0 0 1px 1px rgba(0,0,0,0.35)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <CodeCardFront />
        </div>

        {/* ================================================================== */}
        {/* BACK FACE (Pure Code Vector: Contact, Address, Socials)           */}
        {/* ================================================================== */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden bg-[#be9f7b]"
          style={{
            transform: "rotateY(180deg) translateZ(1.5px)",
            WebkitTransform: "rotateY(180deg) translateZ(1.5px)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            boxShadow: isDragging
              ? "0 28px 56px -12px rgba(0,0,0,0.42), 0 0 1px 1px rgba(0,0,0,0.45)"
              : "0 18px 38px -10px rgba(0,0,0,0.28), 0 0 1px 1px rgba(0,0,0,0.35)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <CodeCardBack />
        </div>
      </div>
    </div>
  );
}

/**
 * PURE CODE FRONT FACE
 * Exact reproduction in vector SVG & CSS:
 * - Solid black outer framing border
 * - Warm kraft sand tactile paper background
 * - Geometric Right-Angle Symbol (Black top-right right-angle + Orange inner left right-angle)
 * - "DESIGN" wordmark in City Blueprint drafting font
 */
function CodeCardFront() {
  return (
    <div className="relative size-full p-4 sm:p-5 flex flex-col items-center justify-center bg-[#be9f7b] text-[#111111] select-none">
      {/* Tactile Kraft Paper Texture Gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(circle at 45% 40%, rgba(255,255,255,0.18) 0%, transparent 60%), linear-gradient(145deg, #c5a684 0%, #be9f7b 55%, #b1906a 100%)",
        }}
      />

      {/* Solid Black Framing Border */}
      <div className="absolute inset-0 border-[11px] sm:border-[13px] border-[#111111] rounded-lg pointer-events-none" />

      {/* Content Composition */}
      <div className="relative z-10 flex flex-col items-center justify-center -mt-1 sm:-mt-2">
        {/* Right-Angle Architectural Symbol (Exact Geometry from Logo Mark) */}
        <svg
          viewBox="0 0 100 160"
          className="w-24 h-36 sm:w-28 sm:h-44 shrink-0 drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer Black Right-Angle "Γ" */}
          <path d="M 0 0 H 100 V 160 H 80 V 20 H 0 Z" fill="#111111" />
          {/* Inner Orange Right-Angle "Γ" */}
          <path d="M 0 38 H 62 V 58 H 20 V 160 H 0 Z" fill="#e86b20" />
        </svg>

        {/* Handcrafted Architectural "DESIGN" Typography */}
        <span
          className="mt-4 sm:mt-5 text-2xl sm:text-3xl text-[#111111] uppercase tracking-[0.26em] font-normal"
          style={{
            fontFamily: "'City Blueprint', 'CityBlueprint', 'Caveat', cursive, sans-serif",
            letterSpacing: "0.26em",
          }}
        >
          DESIGN
        </span>
      </div>
    </div>
  );
}

/**
 * PURE CODE BACK FACE
 * Exact reproduction in vector HTML & CSS:
 * - Solid black outer framing border
 * - Ravi Pipaliya : +91 - 95375 86804 ( INTERIOR DESIGNER )
 * - Divider line
 * - Sagar Pipaliya : +91 - 90995 05804 ( B.E. CIVIL )
 * - 919 RK EMPIRE, NEAR MAVDI BRIDGE, 150 FT. RING ROAD, RAJKOT. 360004
 * - rightangle011@gmail.com
 * - Vector Social Icons (Facebook, YouTube, Instagram, Pinterest)
 * - "RIGHT ANGLE DESIGN STUDIO" in City Blueprint drafting font
 */
function CodeCardBack() {
  return (
    <div className="relative size-full p-4 sm:p-5 flex flex-col justify-between bg-[#be9f7b] text-[#111111] select-none font-sans">
      {/* Tactile Kraft Paper Texture Gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(circle at 55% 60%, rgba(255,255,255,0.18) 0%, transparent 60%), linear-gradient(145deg, #c5a684 0%, #be9f7b 55%, #b1906a 100%)",
        }}
      />

      {/* Solid Black Framing Border */}
      <div className="absolute inset-0 border-[11px] sm:border-[13px] border-[#111111] rounded-lg pointer-events-none" />

      {/* Card Content Layout */}
      <div className="relative z-10 px-2 sm:px-3 py-1 sm:py-2 flex flex-col h-full justify-between">
        {/* Top: Principals & Roles */}
        <div className="space-y-1 pt-0.5">
          <div>
            <div className="flex items-baseline justify-between text-[11px] sm:text-[12.5px] font-bold tracking-tight text-[#111111]">
              <span className="font-extrabold">RAVI PIPALIYA</span>
              <span className="font-semibold">: +91 - 95375 86804</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-[#222222] tracking-wider uppercase font-semibold mt-0.5">
              ( INTERIOR DESIGNER )
            </p>
          </div>

          {/* Architectural divider line */}
          <div className="w-full h-[1.5px] bg-[#111111] my-1 sm:my-1.5 opacity-95" />

          <div>
            <div className="flex items-baseline justify-between text-[11px] sm:text-[12.5px] font-bold tracking-tight text-[#111111]">
              <span className="font-extrabold">SAGAR PIPALIYA</span>
              <span className="font-semibold">: +91 - 90995 05804</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-[#222222] tracking-wider uppercase font-semibold mt-0.5">
              ( B.E. CIVIL )
            </p>
          </div>
        </div>

        {/* Middle: Studio Address & Email */}
        <div className="my-auto py-1 sm:py-1.5 space-y-0.5">
          <p className="text-base sm:text-lg font-black tracking-tight text-[#111111] leading-none mb-1">
            919
          </p>
          <p className="text-[9.5px] sm:text-[11px] font-bold leading-tight text-[#111111] uppercase tracking-wide">
            RK EMPIRE, NEAR MAVDI BRIDGE,
            <br />
            150 FT. RING ROAD, RAJKOT. 360004
          </p>
          <div className="pt-1 sm:pt-1.5 flex items-center gap-1.5 text-[9.5px] sm:text-[11px] font-semibold text-[#111111]">
            <svg
              className="size-3.5 fill-[#111111] shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <span className="tracking-wide">rightangle011@gmail.com</span>
          </div>
        </div>

        {/* Bottom: Authentic Social Media Icons & Studio Name */}
        <div className="pt-0.5 flex flex-col items-center space-y-1.5 sm:space-y-2">
          {/* Social Icons Row */}
          <div className="flex items-center justify-center gap-3">
            {/* Facebook */}
            <div className="size-5 sm:size-5.5 rounded-sm bg-[#1877F2] text-white flex items-center justify-center text-[11px] font-bold shadow-xs">
              f
            </div>

            {/* YouTube */}
            <div className="w-6 sm:w-6.5 h-4.5 sm:h-5 rounded-sm bg-[#FF0000] text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
              ▶
            </div>

            {/* Instagram */}
            <div
              className="size-5 sm:size-5.5 rounded-md text-white flex items-center justify-center text-[10px] shadow-xs"
              style={{
                background:
                  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
              }}
            >
              <svg className="size-3.5 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.79-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>

            {/* Pinterest */}
            <div className="size-5 sm:size-5.5 rounded-full bg-[#E60023] text-white flex items-center justify-center text-[11px] font-black shadow-xs">
              P
            </div>
          </div>

          {/* Architectural Studio Name in City Blueprint drafting font */}
          <p
            className="text-xs sm:text-[13px] font-normal tracking-[0.16em] text-[#111111] text-center uppercase"
            style={{
              fontFamily: "'City Blueprint', 'CityBlueprint', 'Caveat', cursive, sans-serif",
              letterSpacing: "0.16em",
            }}
          >
            RIGHT ANGLE DESIGN STUDIO
          </p>
        </div>
      </div>
    </div>
  );
}
