"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/app/(app)/AppContext";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/components/TiptapEditor"), { ssr: false });

interface Document {
  id: string;
  title: string;
  contentJson: any;
  creator: { id: string; name: string };
  updatedAt: string;
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { refreshDocuments } = useApp();
  const [doc, setDoc] = useState<Document | null>(null);
  const [title, setTitle] = useState("Untitled");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/documents/${params.id}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 404) { router.push("/d/new"); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.document) {
          setDoc(data.document);
          setTitle(data.document.title || "Untitled");
        }
      })
      .catch(() => setError("Failed to load document"));
  }, [params.id, router]);

  const save = useCallback(async (updatedTitle: string, contentJson: any) => {
    if (!params.id) return;
    setSaving(true);
    try {
      await fetch(`/api/documents/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: updatedTitle, contentJson }),
      });
      refreshDocuments();
    } finally {
      setSaving(false);
    }
  }, [params.id, refreshDocuments]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save(newTitle, null);
    }, 800);
  };

  const handleContentChange = useCallback((contentJson: any) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      save(title, contentJson);
    }, 1000);
  }, [title, save]);

  const handleDelete = async () => {
    if (!confirm("Delete this page permanently?")) return;
    await fetch(`/api/documents/${params.id}`, { method: "DELETE", credentials: "include" });
    refreshDocuments();
    router.push("/app");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-400 text-sm">{error}</div>
    );
  }

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-12 pb-32">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 text-[12px] text-white/20">
        <span>{saving ? "Saving..." : "Saved"}</span>
        <button
          onClick={handleDelete}
          className="hover:text-red-400 transition-colors"
        >
          Delete page
        </button>
      </div>

      {/* Page title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled"
        className="w-full bg-transparent text-[36px] font-bold text-white/90 placeholder-white/15 border-none outline-none mb-6 leading-tight"
      />

      {/* Editor */}
      <TiptapEditor
        key={doc.id}
        initialContent={doc.contentJson}
        onChange={handleContentChange}
      />
    </div>
  );
}
