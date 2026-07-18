import React from 'react';
import {
  Home,
  Filter,
  FileText,
  Users,
  LogOut,
  LayoutDashboard,
  Lightbulb
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

// Derive which service we're in based on the current URL path
const getServiceFromPath = (path) => {
  if (!path) return "default";
  if (path.startsWith("/buyerslist-")) return "buyerslist";
  if (path.startsWith("/tsa-")) return "tsa";
  if (path.startsWith("/auditai-")) return "auditai";
  return "default";
};

// Navigation config per service
const NAV_CONFIG = {
  buyerslist: [
    { icon: LayoutDashboard, name: "Dashboard", path: "/buyerslist-dashboard", isImage: false },
    { icon: Filter, name: "Screening", path: "/buyerslist-screening", isImage: false },
    { icon: FileText, name: "Results", path: "/buyerslist-results", isImage: false },
    // { icon: Users, name: 'Users', path: '/users', isImage: false },
    // { icon: Lightbulb, name: "Ask-Ai", path: "/ask-ai", isImage: false },
    // {
    //   icon: Home,
    //   name: "Services",
    //   path: "/services",
    //   isImage: false,
    // },
  ],
  tsa: [
    { icon: LayoutDashboard, name: "Dashboard", path: "/tsa-dashboard", isImage: false },
    { icon: Filter, name: "Screening", path: "/tsa-screening", isImage: false },
    { icon: FileText, name: "Results", path: "/tsa-results", isImage: false },
    // { icon: Lightbulb, name: "Ask-Ai", path: "/ask-ai", isImage: false },
    {
      icon: Home,
      name: "Services",
      path: "/services",
      isImage: false,
    },
  ],
  auditai: [
    {
      icon: LayoutDashboard,
      name: "Dashboard",
      path: "/auditai-dashboard",
      isImage: false,
    },
    {
      icon: Filter,
      name: "Screening",
      path: "/auditai-screening",
      isImage: false,
    },
    {
      icon: FileText,
      name: "AI Analysis",
      path: "/auditai-analysis",
      isImage: false,
    },
    // { icon: Lightbulb, name: "Ask-Ai", path: "/ask-ai", isImage: false },
    {
      icon: Home,
      name: "Services",
      path: "/services",
      isImage: false,
    },
  ],
};

const getNavItems = (currentPath) => {
  const service = getServiceFromPath(currentPath);
  return NAV_CONFIG[service];
};

const BottomNavBar = ({ currentPath = '/dashboard' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleClick = (path) => {
    navigate(path);
  };


    const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    // Clear profile data from store
    dispatch({ type: 'userProfile/clearProfile' });
    console.log("Logged out successfully");
    navigate("/");
  };

  const navItems = getNavItems(currentPath.toLowerCase());

  return (
    <div className="fixed top-1/2 left-6 transform -translate-y-1/2 z-50 flex flex-col items-center">
      <span className="inline-block px-3 mb-3 py-1 text-xs font-bold tracking-wider text-gray-700 bg-gray-100 border border-gray-200 rounded-full shadow-sm">
        {getServiceFromPath(currentPath.toLowerCase()).toUpperCase()}
      </span>
      <div className="bg-white rounded-3xl px-3 py-6 flex flex-col justify-between items-center gap-5">
        {navItems?.map(({ icon, name, path, isImage }) => {
          const isActive = currentPath === path;
          const Icon = icon;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => {
                if (path !== currentPath) {
                  window.scrollTo(0, 0);
                }
              }}
              className={`flex flex-col items-center text-[12px] font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-indigo-600 font-semibold"
                  : "text-black hover:text-indigo-500"
              }`}
            >
              {isImage ? (
                <img src={icon} alt={name} className="w-5 h-5 mb-1 object-contain" />
              ) : (
                <Icon className="w-5 h-5 mb-1" />
              )}
              {name}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center cursor-pointer text-[12px] text-black font-semibold hover:text-red-500 transition-all"
        >
          <LogOut className="w-6 h-6 mb-1" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default BottomNavBar;
