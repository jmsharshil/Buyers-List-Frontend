import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion as Motion } from "framer-motion";
import { getAdminAnalytics } from "../store/slice/userAnalyticsSlice";
import {
  Bot,
  LayoutDashboard,
  ShieldCheck,
  FileSearch,
  Globe,
  File,
  BarChart3,
} from "lucide-react";
import knowcraftLogo from "../assets/Knowcraft-Analytics.png";

const services = [
  {
    name: "GPC Screening",
    path: "/gpc-dashboard",
    icon: LayoutDashboard,
    // description:
    //   "Manage and monitor GPC automation workflows with real-time insights and controls.",
    accent: "#534AB7",
    iconBg: "#EEEDFE",
    iconColor: "text-[#534AB7]",
    borderColor: "border-[#534AB7]",
    cardBorder: "border-indigo-300",
    color: "#534AB7",
  },
  {
    name: "Ask AI",
    path: "/ask-ai",
    icon: Bot,
    // description:
    //   "Get AI-powered answers and assistance instantly across any business domain.",
    accent: "#1D9E75",
    iconBg: "#E1F5EE",
    iconColor: "text-[#1D9E75]",
    borderColor: "border-[#1D9E75]",
    cardBorder: "border-green-300",
    color: "#1D9E75",
  },
  {
    name: "Transaction Screening",
    path: "/tsa-dashboard",
    icon: ShieldCheck,
    // description:
    //   "Automate compliance screening and flag anomalies across transaction flows.",
    accent: "#185FA5",
    iconBg: "#E6F1FB",
    iconColor: "text-[#185FA5]",
    borderColor: "border-[#185FA5]",
    cardBorder: "border-blue-300",
    color: "#185FA5",
  },
  {
    name: "Audit AI",
    path: "/auditai-dashboard",
    icon: FileSearch,
    // description:
    //   "An advanced audit management software designed to streamline audit workflows",
    accent: "#D85A30",
    iconBg: "#FAECE7",
    iconColor: "text-[#D85A30]",
    borderColor: "border-[#D85A30]",
    cardBorder: "border-orange-300",
    color: "#D85A30",
  },
  {
    name: "Article Interpretation AI",
    // path: "/ask-ai-test",
    icon: Globe,
    description: "Coming Soon",
    accent: "#FF0015",
    iconBg: "#FAECE7",
    iconColor: "text-[#FF0015]",
    borderColor: "border-[#FF0015]",
    cardBorder: "border-red-300",
    color: "#FF0015",
  },
  {
    name: "Ask Valuation Guide",
    path: "/ask-valuation-guide",
    icon: File,
    // description: "Coming Soon",
    accent: "#14B8A6",
    iconBg: "#E6FFFB",
    iconColor: "text-[#14B8A6]",
    borderColor: "border-[#14B8A6]",
    cardBorder: "border-teal-300",
    color: "#14B8A6",
  },
  {
    name: "User Analytics",
    path: "/user-analytics",
    icon: BarChart3,
    // description:
    //   "Get key insights from across all modules and track your usage patterns.",
    accent: "#F59E0B",
    iconBg: "#FEF3C7",
    iconColor: "text-[#F59E0B]",
    borderColor: "border-[#F59E0B]",
    cardBorder: "border-amber-300",
    color: "#F59E0B",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// --- Moving Border Card ---
function MovingBorderCard({ service, onClick }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({ t: 0, opacity: 0, hovering: false });
  const Icon = service.icon;
  const isComingSoon =
    service.description === "Coming Soon" || service.isDisabled;

  const draw = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const state = stateRef.current;
    const W = wrap.offsetWidth;
    const H = wrap.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    // Fade in/out
    if (state.hovering) state.opacity = Math.min(1, state.opacity + 0.06);
    else state.opacity = Math.max(0, state.opacity - 0.04);

    if (state.opacity > 0) {
      // Dim full border base
      ctx.save();
      ctx.globalAlpha = state.opacity * 0.18;
      drawRoundedRect(ctx, 1, 1, W - 2, H - 2, 15);
      ctx.strokeStyle = service.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Sweeping bright gradient stroke
      ctx.save();
      ctx.globalAlpha = state.opacity;

      const cx = W / 2,
        cy = H / 2;
      const angle = state.t * Math.PI * 2;
      const dist = Math.sqrt(cx * cx + cy * cy) * 1.6;
      const gx1 = cx + Math.cos(angle) * dist;
      const gy1 = cy + Math.sin(angle) * dist;
      const gx2 = cx + Math.cos(angle + Math.PI) * dist;
      const gy2 = cy + Math.sin(angle + Math.PI) * dist;

      const grad = ctx.createLinearGradient(gx2, gy2, gx1, gy1);
      grad.addColorStop(0, service.color + "00");
      grad.addColorStop(0.3, service.color + "00");
      grad.addColorStop(0.48, service.color + "cc");
      grad.addColorStop(0.5, service.color + "ff");
      grad.addColorStop(0.52, service.color + "cc");
      grad.addColorStop(0.7, service.color + "00");
      grad.addColorStop(1, service.color + "00");

      drawRoundedRect(ctx, 1, 1, W - 2, H - 2, 15);
      ctx.lineWidth = 2;
      ctx.strokeStyle = grad;
      ctx.stroke();
      ctx.restore();
    }

    state.t += 0.006;
    if (state.t > 1) state.t -= 1;

    if (state.opacity > 0 || state.hovering) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      animRef.current = null;
    }
  }, [service.color]);

  const handleMouseEnter = useCallback(() => {
    stateRef.current.hovering = true;
    if (!animRef.current) animRef.current = requestAnimationFrame(draw);
  }, [draw]);

  const handleMouseLeave = useCallback(() => {
    stateRef.current.hovering = false;
    if (!animRef.current) animRef.current = requestAnimationFrame(draw);
  }, [draw]);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  return (
    <div
      ref={wrapRef}
      className="relative rounded-2xl p-[2px] cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Sweeping border canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded-2xl pointer-events-none z-10"
      />

      {/* Card */}
      <div
        className={`group relative bg-white rounded-[14px] overflow-hidden duration-200 border ${service.cardBorder} hover:border-transparent ${isComingSoon ? "opacity-80 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center justify-between p-4 min-h-[76px] gap-4">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 border ${service.borderColor} rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
              style={{ background: service.iconBg }}
            >
              <Icon className={`w-5 h-5 ${service.iconColor}`} />
            </div>
            <h2 className="text-sm font-bold text-gray-800 tracking-tight transition-colors duration-200 group-hover:text-indigo-950">
              {service.name}
            </h2>
          </div>

          {/* Right: Badge or Arrow */}
          {isComingSoon ? (
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase select-none shrink-0"
              style={{
                background: service.iconBg,
                color: service.accent,
                border: `1px solid ${service.accent}33`,
              }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: service.accent }}
              />
              {service.disabledText || "Coming Soon"}
            </span>
          ) : (
            <span className="absolute bottom-3 right-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150 text-sm select-none">
              ↗
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Page ---
const Services = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = localStorage.getItem("user_role");
  const isAdmin = role?.toLowerCase() === "admin";

  const [selectedService, setSelectedService] = useState(null);

  const handleServiceClick = async (service) => {
    if (service.path) {
      if (service.name === "User Analytics") {
        navigate(service.path);
        window.scrollTo(0, 0);
      } else if (service.name === "Ask Valuation Guide") {
        sessionStorage.setItem("skipWorkflowModal", "true");
        navigate(service.path);
        window.scrollTo(0, 0);
      } else {
        const sessionId = localStorage.getItem("session_id");
        const payload = {
          workflow: service.name.toLowerCase().replace(/\s+/g, "_"),
          session_id: sessionId ? parseInt(sessionId, 10) : 1, // Fallback to 1 if no session ID exists, as per user's prompt
        };

        try {
          const resultAction = await dispatch(getAdminAnalytics(payload));
          if (getAdminAnalytics.fulfilled.match(resultAction)) {
            const data = resultAction.payload;

            let latestActivity = data;
            if (data?.results?.tracking?.length > 0) {
              latestActivity = data.results.tracking[0];
            }

            if (latestActivity) {
              const {
                activity_id,
                workflow,
                workflow_key,
                project_name,
                client_name,
              } = latestActivity;

              if (activity_id) localStorage.setItem("activity_id", activity_id);
              if (workflow) localStorage.setItem("workflow", workflow);
              if (workflow_key)
                localStorage.setItem("workflow_key", workflow_key);
              if (project_name) localStorage.setItem("projectName", project_name);
              if (client_name) localStorage.setItem("clientName", client_name);
            }
          }
        } catch (error) {
          console.error("Failed to start workflow activity:", error);
        }

        sessionStorage.setItem("skipWorkflowModal", "true");
        navigate(service.path);
        window.scrollTo(0, 0);
      }
    }
  };

  useEffect(() => {
    document.title = "Knowcraft Services";
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      navigate("/client-session");
    }
  }, [navigate]);

  useEffect(() => {
    const handleCtrl5 = (e) => {
      if (e.ctrlKey && e.key === "5") {
        e.preventDefault();
        const target = selectedService;
        if (target?.path) {
          sessionStorage.setItem("skipWorkflowModal", "true");
          navigate(target.path);
          window.scrollTo(0, 0);
        }
      }
    };

    window.addEventListener("keydown", handleCtrl5);
    return () => window.removeEventListener("keydown", handleCtrl5);
  }, [selectedService]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5 bg-gray-50">
      <div className="w-full py-10 px-4 max-w-4xl mx-auto bg-gray-100 flex flex-col items-center justify-center border border-gray-200 rounded-3xl shadow-sm">
        <Motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <img
                src={knowcraftLogo}
                alt="Knowcraft Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-800">
            Automation Platform
          </h1>
          <p className="text-base text-gray-600 mx-auto">
            Select a service below to streamline your workflow with AI-powered
            insights and automated processes.
          </p>
        </Motion.div>

        <Motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl"
        >
          {services
            .filter(
              (service) => !(service.name === "User Analytics" && !isAdmin),
            )
            .map((service, index, filteredServices) => {
              const isLast = index === filteredServices.length - 1;
              const isOdd = filteredServices.length % 2 !== 0;

              return (
                <Motion.div
                  key={index}
                  variants={itemVariants}
                  className={isLast && isOdd ? "md:col-span-2" : ""}
                >
                  {service.path ? (
                    <MovingBorderCard
                      service={service}
                      onClick={() => handleServiceClick(service)}
                    />
                  ) : (
                    <MovingBorderCard service={service} />
                  )}
                </Motion.div>
              );
            })}
        </Motion.div>
      </div>
    </div>
  );
};

export default Services;
