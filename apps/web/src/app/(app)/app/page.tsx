"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/(app)/layout";

export default function AppHome() {
  const router = useRouter();
  const { documents, activeWorkspace } = useApp();

  useEffect(() => {
    if (documents.length > 0) {
      router.replace(`/d/${documents[0].id}`);
    }
  }, [documents, router]);

  async function createFirstDoc() {
    if (!activeWorkspace) return;
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ workspaceId: activeWorkspace.id, title: "Getting Started" }),
    });
    const data = await res.json();
    if (data.document) router.push(`/d/${data.document.id}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-2.75rem)] text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-white/10 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 012-2h4l6 6v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
        </svg>
      </div>
      <h2 className="text-[15px] font-semibold text-white/60 mb-1">No pages yet</h2>
      <p className="text-[13px] text-white/25 mb-6">Create your first page to get started</p>
      <button
        onClick={createFirstDoc}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium rounded-lg transition-colors"
      >
        Create first page
      </button>
    </div>
  );
}
