import { createContext, useContext, type ReactNode } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import type { WatchlistItem } from '../types/tmdb';

interface WatchlistContextType {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: Omit<WatchlistItem, 'added_at'>) => void;
  removeFromWatchlist: (id: string, mediaType: 'movie' | 'tv') => void;
  isInWatchlist: (id: string, mediaType: 'movie' | 'tv') => boolean;
  toggleWatchlist: (item: Omit<WatchlistItem, 'added_at'>) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const watchlistHook = useWatchlist();
  return (
    <WatchlistContext.Provider value={watchlistHook}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlistContext must be used within WatchlistProvider');
  return context;
}
