import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Trash2, Edit2, Plus, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient, updateClient, deleteClient } from "../../store/slice/userAnalyticsSLice";

export const ClientManagementModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { clientNames, loading } = useSelector((state) => state.userAnalytics);
  const clientsList = clientNames?.clients || [];

  const [newClientName, setNewClientName] = useState("");
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newClientName.trim()) {
      await dispatch(createClient({ name: newClientName.trim() }));
      setNewClientName("");
    }
  };

  const handleSaveEdit = async (id) => {
    if (editingName.trim()) {
      await dispatch(updateClient({ id, name: editingName.trim() }));
      setEditingClientId(null);
      setEditingName("");
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteClient(id));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
  
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">
            Manage Clients
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Create Form */}
          <form onSubmit={handleCreate} className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Add New Client
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="Enter new client name..."
                className="flex-grow border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-shadow"
              />
              <button
                type="submit"
                disabled={loading || !newClientName.trim()}
                className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </form>

          {/* List Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">
              Existing Clients ({clientsList.length})
            </h4>

            {clientsList.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No clients registered.</p>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[40vh] overflow-y-auto bg-slate-50/50">
                {clientsList.map((client) => {
                  const isEditing = editingClientId === client.id;
                  return (
                    <div
                      key={client.id}
                      className="px-4 py-3 flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors"
                    >
                      {isEditing ? (
                        <div className="flex-grow flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-grow border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(client.id)}
                            disabled={loading || !editingName.trim()}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-150 rounded-lg transition cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingClientId(null);
                              setEditingName("");
                            }}
                            className="p-2 bg-slate-150 text-slate-600 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer"
                            title="Cancel"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {client.name}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingClientId(client.id);
                                setEditingName(client.name);
                              }}
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Edit Client"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="Delete Client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
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

export default ClientManagementModal;
