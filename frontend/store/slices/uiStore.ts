import { create } from "zustand";

interface UIState {
  commandPaletteOpen: boolean;
  aiDrawerOpen: boolean;
  sidebarCollapsed: boolean;
  activeModal: string | null;
  notifications: Notification[];

  setCommandPaletteOpen: (open: boolean) => void;
  setAIDrawerOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addNotification: (n: Notification) => void;
  clearNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

export const useUIStore = create<UIState>((set) => ({
  commandPaletteOpen: false,
  aiDrawerOpen: false,
  sidebarCollapsed: false,
  activeModal: null,
  notifications: [],

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setAIDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  addNotification: (n) =>
    set((state) => ({ notifications: [...state.notifications, n] })),
  clearNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
