import { create } from 'zustand';

const AUTH_KEY = 'auth_token';

export const isAuthenticated = (): boolean => !!localStorage.getItem(AUTH_KEY);

interface NavbarStore {
  isStatsOpen: boolean;
  isSettingsOpen: boolean;
  toggleStats: () => void;
  closeStats: () => void;
  toggleSettings: () => void;
  closeSettings: () => void;
  logout: () => void;
}

export const useNavbarStore = create<NavbarStore>((set) => ({
  isStatsOpen: false,
  isSettingsOpen: false,

  toggleStats: () =>
    set((state) => ({ isStatsOpen: !state.isStatsOpen })),

  closeStats: () =>
    set({ isStatsOpen: false }),

  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  closeSettings: () =>
    set({ isSettingsOpen: false }),

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/';
  },
}));
