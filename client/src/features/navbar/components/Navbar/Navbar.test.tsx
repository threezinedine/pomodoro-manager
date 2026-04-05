import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from './Navbar';
import { useNavbarStore, isAuthenticated } from '../../stores/navbarStore';

const mockLogout = vi.fn();
const mockToggleStats = vi.fn();
const mockToggleSettings = vi.fn();

vi.mock('../../stores/navbarStore', () => ({
  useNavbarStore: vi.fn(),
  isAuthenticated: vi.fn(),
}));

const defaultStore = {
  isStatsOpen: false,
  isSettingsOpen: false,
  toggleStats: mockToggleStats,
  toggleSettings: mockToggleSettings,
  logout: mockLogout,
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(useNavbarStore).mockReturnValue(defaultStore);
  });

  describe('authenticated', () => {
    beforeEach(() => {
      vi.mocked(isAuthenticated).mockReturnValue(true);
    });

    it('renders the app logo and title', () => {
      render(<Navbar />);
      expect(screen.getByText('🍅')).toBeInTheDocument();
      expect(screen.getByText('Pomodoro Manager')).toBeInTheDocument();
    });

    it('renders stats, settings, and sign out buttons when authenticated', () => {
      render(<Navbar />);
      expect(screen.getByRole('button', { name: /stats panel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('renders stats button with close label when stats is open', () => {
      vi.mocked(useNavbarStore).mockReturnValueOnce({
        ...defaultStore,
        isStatsOpen: true,
      });
      render(<Navbar />);
      expect(
        screen.getByRole('button', { name: /close stats panel/i })
      ).toBeInTheDocument();
    });

    it('renders settings button with close label when settings is open', () => {
      vi.mocked(useNavbarStore).mockReturnValueOnce({
        ...defaultStore,
        isSettingsOpen: true,
      });
      render(<Navbar />);
      expect(
        screen.getByRole('button', { name: /close settings/i })
      ).toBeInTheDocument();
    });

    it('calls toggleStats when stats button is clicked', () => {
      render(<Navbar />);
      screen.getByRole('button', { name: /stats panel/i }).click();
      expect(mockToggleStats).toHaveBeenCalledTimes(1);
    });

    it('calls toggleSettings when settings button is clicked', () => {
      render(<Navbar />);
      screen.getByRole('button', { name: /settings/i }).click();
      expect(mockToggleSettings).toHaveBeenCalledTimes(1);
    });

    it('calls logout when Sign Out button is clicked', () => {
      render(<Navbar />);
      screen.getByRole('button', { name: /sign out/i }).click();
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('unauthenticated', () => {
    beforeEach(() => {
      vi.mocked(isAuthenticated).mockReturnValue(false);
    });

    it('renders logo and title without right-side buttons', () => {
      render(<Navbar />);
      expect(screen.getByText('🍅')).toBeInTheDocument();
      expect(screen.getByText('Pomodoro Manager')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /stats panel/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /settings/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /sign out/i })
      ).not.toBeInTheDocument();
    });
  });
});
