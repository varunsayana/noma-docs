"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppContext, type Workspace, type DocMeta, type User } from "./AppContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [documents, setDocuments] = useState<DocMeta[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) { router.replace("/login"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/workspaces", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const ws: Workspace[] = data.workspaces || [];
        setWorkspaces(ws);
        if (ws.length > 0) setActiveWorkspaceState(ws[0]);
      });
  }, [user]);

  const refreshDocuments = useCallback(() => {
    if (!activeWorkspace) return;
    fetch(`/api/documents?workspaceId=${activeWorkspace.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setDocuments(data.documents || []));
  }, [activeWorkspace]);

  useEffect(() => { refreshDocuments(); }, [refreshDocuments]);

  async function createNewDocument() {
    if (!activeWorkspace) return;
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ workspaceId: activeWorkspace.id, title: "Untitled" }),
    });
    const data = await res.json();
    if (data.document) {
      setDocuments((prev) => [data.document, ...prev]);
      router.push(`/d/${data.document.id}`);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDocPage = pathname?.startsWith("/d/");

  return (
    <AppContext.Provider value={{
      user, workspaces, activeWorkspace, documents,
      setActiveWorkspace: setActiveWorkspaceState,
      refreshDocuments,
    }}>
      <div className="min-h-screen bg-[#0f0f0f] text-white flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? "w-60" : "w-0"} flex-shrink-0 transition-all duration-200 overflow-hidden`}>
          <div className="w-60 h-full bg-[#111] border-r border-white/5 flex flex-col fixed top-0 left-0 bottom-0 z-20">
            {/* Workspace header */}
            <div className="px-3 py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-bold">N</span>
                </div>
                <span className="flex-1 text-[13px] font-semibold text-white/80 truncate">
                  {activeWorkspace?.name || "Noma Docs"}
                </span>
              </div>
            </div>

            {/* Nav */}
            <div className="px-3 py-2 space-y-0.5">
              <button
                onClick={() => router.push("/admin")}
                className={`w-full px-2 py-1.5 rounded-md text-left text-[13px] flex items-center gap-2.5 transition-colors ${
                  pathname === "/admin"
                    ? "bg-white/8 text-white/90"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
                </svg>
                Members
              </button>
            </div>

            {/* Documents section */}
            <div className="flex-1 overflow-y-auto px-3 py-1">
              <div className="flex items-center justify-between px-2 py-1.5 group">
                <span className="text-[11px] font-medium text-white/25 uppercase tracking-wider">Pages</span>
                <button
                  onClick={createNewDocument}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/70 p-0.5 rounded"
                  title="New page"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/>
                  </svg>
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="px-2 py-2 text-[12px] text-white/20">
                  No pages yet.{" "}
                  <button onClick={createNewDocument} className="text-violet-400 hover:text-violet-300 underline">
                    Create one
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {documents.map((doc) => {
                    const isActive = pathname === `/d/${doc.id}`;
                    return (
                      <button
                        key={doc.id}
                        onClick={() => router.push(`/d/${doc.id}`)}
                        className={`w-full px-2 py-1.5 rounded-md text-left text-[13px] flex items-center gap-2 transition-colors ${
                          isActive
                            ? "bg-white/8 text-white/90"
                            : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-50" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M4 2h6l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/>
                        </svg>
                        <span className="truncate flex-1">{doc.title || "Untitled"}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="px-3 py-3 border-t border-white/[0.04] space-y-0.5">
              <button
                onClick={createNewDocument}
                className="w-full px-2 py-1.5 rounded-md text-left text-[13px] flex items-center gap-2.5 text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2a1 1 0 0 1 1 1v4h4a1 1 0 010 2H9v4a1 1 0 01-2 0V9H3a1 1 0 010-2h4V3a1 1 0 011-1z"/>
                </svg>
                New page
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-2 py-1.5 rounded-md text-left text-[13px] flex items-center gap-2.5 text-white/25 hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 2a1 1 0 0 0-1 1v1H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2V3a1 1 0 0 0-1-1H6zm0 2h4v1H6V4zM3 6h10v7H3V6z"/>
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar */}
          <div className={`sticky top-0 z-10 ${isDocPage ? "bg-[#0f0f0f]/90 backdrop-blur" : "bg-[#0f0f0f]"} border-b border-white/5 h-11 flex items-center px-4 gap-2`}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
              title="Toggle sidebar"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1zm0 5a1 1 0 0 1 1-1h12a1 1 0 0 1 0 2H2a1 1 0 0 1-1-1z"/>
              </svg>
            </button>
            {user && (
              <div className="ml-auto flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-600/40 border border-white/10 flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-white/70">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-[13px] text-white/40">{user.name || user.email}</span>
              </div>
            )}
          </div>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
