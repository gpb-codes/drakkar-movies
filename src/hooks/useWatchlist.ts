import { useState, useEffect, useCallback } from 'react';
import type { WatchlistItem } from '../types/tmdb';

const STORAGE_KEY = 'drakker_watchlist';

function loadWatchlist(): WatchlistItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(items: WatchlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(loadWatchlist);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const addToWatchlist = useCallback((item: Omit<WatchlistItem, 'added_at'>) => {
    setWatchlist(prev => {
      if (prev.some(i => i.id === item.id && i.media_type === item.media_type)) return prev;
      return [{ ...item, added_at: Date.now() }, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string, mediaType: 'movie' | 'tv') => {
    setWatchlist(prev => prev.filter(i => !(i.id === id && i.media_type === mediaType)));
  }, []);

  const isInWatchlist = useCallback((id: string, mediaType: 'movie' | 'tv') => {
    return watchlist.some(i => i.id === id && i.media_type === mediaType);
  }, [watchlist]);

  const toggleWatchlist = useCallback((item: Omit<WatchlistItem, 'added_at'>) => {
    if (isInWatchlist(item.id, item.media_type)) {
      removeFromWatchlist(item.id, item.media_type);
      return false;
    } else {
      addToWatchlist(item);
      return true;
    }
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist };
}
