"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useEffect, useState } from "react";

interface EditorProps {
  documentId: string;
  token?: string;
}

export default function CollaborativeEditor({ documentId, token }: EditorProps) {
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    // Generate Yjs document
    const ydoc = new Y.Doc();
    
    // Connect to Hocuspocus
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/collaboration";
    const providerInstance = new WebsocketProvider(wsUrl, documentId, ydoc, {
      params: { token: token || "" }, // Add auth token to WS
    });

    setProvider(providerInstance);

    return () => {
      providerInstance.destroy();
      ydoc.destroy();
    };
  }, [documentId, token]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // History is managed by Yjs
      }),
      TaskList,
      TaskItem,
      Highlight,
      ...(provider ? [
        Collaboration.configure({
          document: provider.doc,
        }),
        CollaborationCursor.configure({
          provider: provider,
          user: {
            name: "Anon " + Math.floor(Math.random() * 100),
            color: "#f783ac",
          },
        }),
      ] : []),
    ],
    content: "<p>Start writing your thoughts...</p>",
  });

  if (!editor || !provider) {
    return <div className="p-8 text-muted-foreground animate-pulse">Connecting to document...</div>;
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none p-8 min-h-[calc(100vh-4rem)]">
      <EditorContent editor={editor} />
    </div>
  );
}
