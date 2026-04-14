"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Layout, PenTool, Share } from "lucide-react";

// Dynamically import heavy editors to avoid SSR issues
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });
const Canvas = dynamic(() => import("@/components/Canvas"), { ssr: false });

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [isCanvas, setIsCanvas] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center space-x-4">
          <div className="font-semibold text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded bg-gradient-to-br from-primary to-accent"></div>
            Noma docs
          </div>
          <span className="text-muted-foreground text-sm">/ {params.id}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Mode Toggle */}
          <div className="flex items-center bg-muted rounded-md p-1">
            <button 
              onClick={() => setIsCanvas(false)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-all ${!isCanvas ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              <PenTool className="w-4 h-4" /> Page
            </button>
            <button 
              onClick={() => setIsCanvas(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-all ${isCanvas ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Layout className="w-4 h-4" /> Edgeless
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md text-sm font-medium ml-4">
            <Share className="w-4 h-4" /> Share
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Space (collapsed for now) */}
        <div className="w-64 border-r border-border hidden md:block bg-card/30 p-4">
           <div className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Workspace</div>
           <ul className="space-y-1">
             <li className="px-2 py-1.5 bg-accent/50 text-accent-foreground rounded-md text-sm font-medium flex items-center gap-2">
               <Copy className="w-4 h-4" /> {params.id}
             </li>
           </ul>
        </div>
        
        {/* Editor Wrapper */}
        <div className="flex-1 overflow-y-auto w-full relative">
          <div className="max-w-4xl mx-auto w-full">
            {isCanvas ? (
              <Canvas documentId={params.id} />
            ) : (
              <div className="py-12">
                <h1 className="text-4xl font-bold mb-8 px-8 outline-none" contentEditable suppressContentEditableWarning>Untitled Document</h1>
                <Editor documentId={params.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
