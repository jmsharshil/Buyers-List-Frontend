import React, { useEffect, useState } from "react";
import { X, Check, Edit2, Search } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { getAuthHeaders } from "../../utils/helper";

export const UserManagementModal = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const roleOptions = ["user", "admin"]; // Common roles, adjust if needed

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/auth/users/`,
        { headers: getAuthHeaders() },
      );
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        setSearchQuery("");
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleRoleChange = async (userId) => {
    try {
      setLoading(true);
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/auth/users/${userId}/change-role/`,
        { role: selectedRole },
        { headers: getAuthHeaders() },
      );
      // Optimistic update
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, role: selectedRole } : u,
        ),
      );
      setEditingUserId(null);
      setSelectedRole("");
    } catch (error) {
      console.error("Error changing role:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter((user) => !user?.username?.toLowerCase().includes("jms"))
    .filter((user) => {
      const term = searchQuery.toLowerCase();
      return (
        user?.first_name?.toLowerCase().includes(term) ||
        user?.last_name?.toLowerCase().includes(term) ||
        user?.email?.toLowerCase().includes(term) ||
        user?.role?.toLowerCase().includes(term)
      );
    });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Manage Users</h3>
          <button
            onClick={() => {
              onClose();
              setSearchQuery("");
            }}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-shadow"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <h4 className="text-sm font-semibold text-slate-700">
                Existing Users ({filteredUsers.length})
              </h4>
              <button
                onClick={fetchUsers}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loading && users.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No users found.</p>
            ) : (
              <div className="overflow-y-auto border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[50vh] overflow-y-auto bg-slate-50/50">
                {filteredUsers?.length > 0 &&
                  filteredUsers?.map((user) => {
                    const isEditing = editingUserId === user.id;
                    return (
                      <div
                        key={user.id}
                        className="px-4 py-3 flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">
                            {user?.first_name} {user?.last_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {user?.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedRole}
                                onChange={(e) =>
                                  setSelectedRole(e.target.value)
                                }
                                className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                              >
                                <option value="" disabled>
                                  Select Role
                                </option>
                                {roleOptions.map((role) => (
                                  <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() +
                                      role.slice(1)}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleRoleChange(user.id)}
                                disabled={loading || !selectedRole}
                                className={`p-1.5 rounded-lg transition ${
                                  loading || !selectedRole
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-150 cursor-pointer"
                                }`}
                                title="Save"
                              >
                                {loading ? (
                                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUserId(null);
                                  setSelectedRole("");
                                }}
                                className="p-1.5 bg-slate-150 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                                {user.role
                                  ? user.role.charAt(0).toUpperCase() +
                                    user.role.slice(1)
                                  : "Unknown"}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setSelectedRole(user.role || "");
                                }}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                title="Change Role"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserManagementModal;
