import React, { useState, useRef, useEffect } from "react";
import { FiLogOut, FiUser, FiMail, FiShield, FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { User } from "../../icons/AnimatedIcons";
import { fetchUserProfile } from "../../store/slice/userProfileSlice";
import { useDispatch, useSelector } from "react-redux";

const UserProfile = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    username,
    email,
    first_name,
    last_name,
    role,
    loading,
    error,
    id,
  } = useSelector((state) => state.userProfile);

  // Fetch user profile only once when component mounts and only if user profile is not already loaded
  useEffect(() => {
    // Only fetch if we don't already have user data (id is null or undefined)
    if (!id) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);



  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    // Clear profile data from store
    dispatch({ type: 'userProfile/clearProfile' });
    console.log("Logged out successfully");
    setIsOpen(false);
    navigate("/");
  };

  // Get role color based on role
  const getRoleColor = (role) => {
    const normalized = role?.toLowerCase() || "user";
    switch (normalized) {
      case "admin": return "bg-red-100 text-red-700";
      case "manager": return "bg-purple-100 text-purple-700";
      case "user": return "bg-blue-100 text-blue-700";
      case "guest": return "bg-gray-100 text-gray-700";
      default: return "bg-green-100 text-green-700";
    }
  };

  // Compute display name and initials
  const displayName = first_name && last_name ? `${first_name} ${last_name}` : username || "User";
  const initials = first_name && last_name
    ? `${first_name[0]}${last_name[0]}`.toUpperCase()
    : username?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  if (loading && !id) {
    return <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>;
  }

  if (error && !id) {
    return (
      <div className="text-red-500 text-sm" title={error.message || "Error loading profile"}>
        Failed to load profile
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Profile Icon Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 transition-all duration-300 hover:shadow-md"
        aria-label="User profile menu"
      >
        <User stroke="#000" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200">
          {/* Header Section */}
          {/* <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-300 rounded-t-xl border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-base">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{displayName}</h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                    <FiShield size={10} className="mr-1" />
                    {role || "User"}
                  </span>
                </div>
              </div>
            </div>
          </div> */}

          {/* User Details Section */}
          <div className="p-4 space-y-3">
            {/* <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FiUser size={14} className="text-gray-400" />
              <span className="font-medium">Name:</span>
              <span className="truncate">{displayName}</span>
            </div> */}
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <FiMail size={14} className="text-gray-400" />
              <span className="font-medium">Email:</span>
              <span className="truncate">{email || "N/A"}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Actions Section */}
          <div className="p-2 space-y-1">
            {/* <button
              onClick={handleSettings}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-sm group"
            >
              <FiSettings className="mr-3 group-hover:rotate-12 transition-transform duration-200" size={16} />
              <span className="font-medium">Profile Settings</span>
            </button> */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-sm group cursor-pointer"
            >
              <FiLogOut className="mr-3 group-hover:translate-x-0.5 transition-transform duration-200" size={16} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
