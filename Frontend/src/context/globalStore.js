import { create } from 'zustand';

const useGlobalStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));

export default useGlobalStore;
