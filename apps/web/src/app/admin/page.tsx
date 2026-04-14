"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminPanel() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError("Failed to load users. Make sure the API container is running.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail, password: newPassword, name: newName, isAdmin: newIsAdmin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create user");
        return;
      }
      setUsers((prev) => [...prev, data.user]);
      setShowAddUser(false);
      setNewEmail(""); setNewPassword(""); setNewName(""); setNewIsAdmin(false);
    } catch {
      setFormError("Network error");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Are you sure you want to remove this user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-60 bg-[#131313] border-r border-white/5 flex flex-col z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">N</span>
          </div>
          <span className="font-semibold text-white/90 text-sm tracking-tight">Noma Docs</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          <div className="px-2 py-1.5 rounded-md bg-white/5 text-white text-sm font-medium flex items-center gap-2.5">
            <svg className="w-4 h-4 text-white/50" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
            </svg>
            Users
          </div>
          <button
            onClick={() => router.push("/d/home")}
            className="w-full px-2 py-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 text-sm text-left flex items-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h5v5H2V2zm7 0h5v5H9V2zM2 9h5v5H2V9zm7 0h5v5H9V9z"/>
            </svg>
            Workspace
          </button>
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full px-2 py-1.5 rounded-md text-white/30 hover:text-red-400 hover:bg-red-500/5 text-sm text-left flex items-center gap-2.5 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 0 0-1 1v1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h5v1a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3zM9 5H4v6h5V5zm1 1h2v4h-2V6z" clipRule="evenodd"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="pl-60">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-[15px] font-semibold text-white/90">Users</h1>
              <p className="text-[13px] text-white/30 mt-0.5">
                Manage who can access this workspace
              </p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-violet-500/20"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 0 1 0 2H9v4a1 1 0 0 1-2 0V9H3a1 1 0 0 1 0-2h4V3a1 1 0 0 1 1-1z"/>
              </svg>
              Add user
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24 text-white/20 text-sm animate-pulse">
              Loading users...
            </div>
          ) : (
            <div className="rounded-xl border border-white/5 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_80px] items-center px-5 py-3 bg-white/[0.02] border-b border-white/5">
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">User</span>
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Role</span>
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider">Joined</span>
                <span className="text-[11px] font-medium text-white/30 uppercase tracking-wider text-right">Action</span>
              </div>

              {users.length === 0 && (
                <div className="py-16 text-center text-white/20 text-sm">
                  No users yet. Add your first user above.
                </div>
              )}

              {users.map((user, i) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_80px] items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${i > 0 ? "border-t border-white/[0.04]" : ""}`}
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-600/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-semibold text-white/70">
                        {(user.name || user.email)[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-white/80 font-medium truncate">{user.name || "—"}</div>
                      <div className="text-[12px] text-white/30 truncate">{user.email}</div>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    {user.isAdmin ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.05] text-white/30 border border-white/[0.08]">
                        Member
                      </span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="text-[13px] text-white/30">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>

                  {/* Action */}
                  <div className="text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-[12px] text-white/20 hover:text-red-400 font-medium transition-colors px-2 py-1 rounded hover:bg-red-500/5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-[12px] text-white/20">
            {users.length} {users.length === 1 ? "user" : "users"} total
          </p>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddUser(false); }}
        >
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-white">Add a user</h2>
                <p className="text-[13px] text-white/30 mt-0.5">Create login credentials for a new team member.</p>
              </div>
              <button onClick={() => setShowAddUser(false)} className="text-white/20 hover:text-white/60 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 px-3.5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/50">Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-9 px-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/50">Email</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full h-9 px-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-white/50">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-9 px-3.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-500 bg-white/5 border border-white/10"
                />
                <span className="text-[13px] text-white/60">Grant admin privileges</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 h-9 border border-white/10 text-white/50 rounded-lg text-sm hover:bg-white/5 hover:text-white/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 h-9 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
                >
                  {formLoading ? "Creating..." : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
