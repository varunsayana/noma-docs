"use client";

import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

interface CanvasProps {
  documentId: string;
}

export default function EdgelessCanvas({ documentId }: CanvasProps) {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <Tldraw persistenceKey={`noma-canvas-${documentId}`} />
    </div>
  );
}
