"use client";

import { createContext, useContext } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Workspace {
  id: string;
  name: string;
}

export interface DocMeta {
  id: string;
  title: string;
  folderId: string | null;
  updatedAt: string;
}

export interface AppContextType {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  documents: DocMeta[];
  setActiveWorkspace: (w: Workspace) => void;
  refreshDocuments: () => void;
}

export const AppContext = createContext<AppContextType>({
  user: null,
  workspaces: [],
  activeWorkspace: null,
  documents: [],
  setActiveWorkspace: () => {},
  refreshDocuments: () => {},
});

export function useApp() {
  return useContext(AppContext);
}
