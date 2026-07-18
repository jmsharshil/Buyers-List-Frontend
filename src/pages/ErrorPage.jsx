import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";
import gsap from "gsap";
import knowCraftLogo from "../assets/Knowcraft-Analytics.png";

// ─── Particle class for canvas ───
class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.radius = Math.random() * 2.5 + 1;
    this.opacity = Math.random() * 0.4 + 0.3;
    const colors = ["#534AB7", "#1D9E75", "#185FA5", "#D85A30"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state || {};

  const isNetwork = state.type === "network";
  const errorCode = state.code || (isNetwork ? "503" : "404");
  const displayTitle =
    state.title || (isNetwork ? "Connection Lost" : "Page Not Found");
  const displayMessage =
    state.message ||
    (isNetwork
      ? "We're having trouble reaching our servers. Check your connection and try again."
      : "The page you're looking for doesn't exist or has been moved.");

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const errorCodeRef = useRef(null);
  const titleRef = useRef(null);
  const messageRef = useRef(null);
  const buttonsRef = useRef(null);
  const terminalRef = useRef(null);
  const terminalLinesRef = useRef([]);
  const cursorRef = useRef(null);
  const scanlineRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameRef = useRef(null);
  const serviceCardsRef = useRef([]);
  const statusDotsRef = useRef([]);

  const terminalLines = isNetwork
    ? [
        "> Connecting to Knowcraft Platform...",
        "> Loading Transaction Screening...",
        "> Initializing Audit AI engine...",
        "> ERROR: Connection refused",
        `> Status: ${errorCode} — Unavailable`,
      ]
    : [
        "> Scanning routes...",
        "> /tsa-screening ...... OK",
        "> /auditai-dashboard .. OK",
        `> ${location.pathname} .. NOT FOUND`,
        `> Status: ${errorCode}`,
      ];

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const count = Math.min(
      120,
      Math.floor((window.innerWidth * window.innerHeight) / 6000),
    );
    particlesRef.current = Array.from(
      { length: count },
      () => new Particle(canvas),
    );

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = (1 - dist / 180) * 0.25;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const cleanupCanvas = initCanvas();

    const container = containerRef.current;
    const errorCodeEl = errorCodeRef.current;
    const title = titleRef.current;
    const message = messageRef.current;
    const buttons = buttonsRef.current;
    const terminal = terminalRef.current;
    const tLines = terminalLinesRef.current;
    const cursor = cursorRef.current;
    const scanline = scanlineRef.current;
    const sCards = serviceCardsRef.current;
    const sDots = statusDotsRef.current;

    if (!container) return;

    gsap.set(container, { opacity: 0 });
    gsap.set(errorCodeEl, { opacity: 0, scale: 2.5, y: -20 });
    gsap.set(title, { opacity: 0, y: 20 });
    gsap.set(message, { opacity: 0, y: 15 });
    gsap.set(buttons, { opacity: 0, y: 15 });
    gsap.set(terminal, { opacity: 0, scaleY: 0, transformOrigin: "top" });
    gsap.set(tLines, { opacity: 0, x: -15 });
    gsap.set(cursor, { opacity: 0 });
    gsap.set(sCards, { opacity: 0, y: 20, scale: 0.9 });
    gsap.set(sDots, { scale: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(container, { opacity: 1, duration: 0.4 });

    // Scanline sweep
    tl.fromTo(
      scanline,
      { y: "-100%", opacity: 0.4 },
      { y: "100vh", opacity: 0, duration: 0.8, ease: "power2.in" },
      0.1,
    );

    // Error code slam
    tl.to(
      errorCodeEl,
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)" },
      0.3,
    );

    // Title & message
    tl.to(title, { opacity: 1, y: 0, duration: 0.4 }, 0.6);
    tl.to(message, { opacity: 1, y: 0, duration: 0.4 }, 0.75);

    // Terminal
    tl.to(
      terminal,
      { opacity: 1, scaleY: 1, duration: 0.4, ease: "back.out(1.4)" },
      0.9,
    );
    tl.to(cursor, { opacity: 1, duration: 0.15 }, 1.0);

    tLines.forEach((line, i) => {
      const isError = i >= tLines.length - 2;
      tl.to(
        line,
        {
          opacity: 1,
          x: 0,
          duration: 0.25,
          onComplete: isError
            ? () => gsap.to(line, { color: "#dc2626", duration: 0.15 })
            : undefined,
        },
        1.1 + i * 0.25,
      );
    });

    tl.to(
      cursor,
      { opacity: 0, duration: 0.4, repeat: -1, yoyo: true, ease: "steps(1)" },
      1.0,
    );

    // Service cards
    const cardStart = 1.1 + terminalLines.length * 0.25 + 0.2;
    sCards.forEach((card, i) => {
      tl.to(
        card,
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.6)" },
        cardStart + i * 0.08,
      );
    });
    sDots.forEach((dot, i) => {
      tl.to(
        dot,
        { scale: 1, duration: 0.25, ease: "elastic.out(1, 0.5)" },
        cardStart + 0.05 + i * 0.08,
      );
    });

    // Buttons
    tl.to(buttons, { opacity: 1, y: 0, duration: 0.4 }, cardStart + 0.4);

    // Persistent subtle glitch on error code
    gsap.to(errorCodeEl, {
      x: 1.5,
      duration: 0.08,
      yoyo: true,
      repeat: -1,
      repeatDelay: 4,
      ease: "steps(2)",
      delay: 2,
    });

    // Dots pulse
    sDots.forEach((dot) => {
      gsap.to(dot, {
        scale: 1.4,
        opacity: 0.5,
        duration: 1.2 + Math.random(),
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: Math.random() * 2,
      });
    });

    return () => {
      tl.kill();
      gsap.killTweensOf([
        container,
        errorCodeEl,
        title,
        message,
        buttons,
        terminal,
        ...tLines,
        cursor,
        scanline,
        ...sCards,
        ...sDots,
      ]);
      if (cleanupCanvas) cleanupCanvas();
    };
  }, [initCanvas, terminalLines.length]);

  return (
    <div
      className="h-screen bg-gray-50 relative overflow-hidden select-none"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* Canvas particle network */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Scanline */}
      <div
        ref={scanlineRef}
        className="absolute left-0 w-full h-[2px] z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #6366f1 30%, #818cf8 50%, #6366f1 70%, transparent 100%)",
          boxShadow: "0 0 12px #6366f140",
        }}
      />

      {/* Main content — compact single screen layout */}
      <div
        ref={containerRef}
        className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-6 gap-4 max-w-2xl mx-auto"
      >
        {/* Error Code */}
        <div
          ref={errorCodeRef}
          className="font-black leading-none tracking-tighter"
          style={{
            fontSize: "clamp(64px, 12vw, 120px)",
            background: "linear-gradient(135deg, #4f46e5, #7c3aed, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 8px rgba(99, 102, 241, 0.15))",
          }}
        >
          {errorCode}
        </div>

        {/* Title & Message */}
        <h1
          ref={titleRef}
          className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight text-center"
        >
          {displayTitle}
        </h1>
        <p
          ref={messageRef}
          className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed text-center -mt-2"
        >
          {displayMessage}
        </p>

        {/* Terminal — compact */}
        <div
          ref={terminalRef}
          className="w-full max-w-md rounded-lg overflow-hidden mt-1"
          style={{
            background: "#1e1e2e",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="flex items-center gap-1.5 px-3 py-1.5"
            style={{ borderBottom: "1px solid #2a2a3e" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span
              className="ml-2 text-[10px] text-gray-500"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              system log
            </span>
          </div>
          <div
            className="px-3 py-2 space-y-0.5"
            style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
          >
            {terminalLines.map((line, i) => (
              <div
                key={i}
                ref={(el) => (terminalLinesRef.current[i] = el)}
                className="text-[11px] leading-snug"
                style={{
                  color: i >= terminalLines.length - 2 ? "#f87171" : "#94a3b8",
                }}
              >
                {line}
              </div>
            ))}
            <span
              ref={cursorRef}
              className="inline-block w-1.5 h-3 bg-indigo-400"
              style={{ verticalAlign: "text-bottom" }}
            />
          </div>
        </div>

        {/*KnowCraft Logo */}
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <img
              src={knowCraftLogo}
              alt="Knowcraft Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div ref={buttonsRef} className="flex flex-row gap-3 mt-2">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" />
            Go Back
          </button>

          {isNetwork && (
            <button
              onClick={() => window.location.reload()}
              className="group inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              }}
            >
              <RefreshCw
                className="w-4 h-4 mr-1.5 transition-transform group-hover:rotate-180"
                style={{ transition: "transform 0.5s" }}
              />
              Retry
            </button>
          )}

          <button
            onClick={() => navigate("/services")}
            className="group inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <Home className="w-4 h-4 mr-1.5" />
            Services
          </button>
        </div>

        <p className="text-[10px] text-gray-400 mt-1 tracking-wide">
          Knowcraft Analytics · Automation Platform
        </p>
      </div>

      {/* Ambient glow orbs — light theme */}
      <div
        className="absolute top-[-15%] left-[-8%] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-15%] right-[-8%] w-[450px] h-[450px] rounded-full pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default ErrorPage;
