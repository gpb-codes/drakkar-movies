const STORAGE_KEY = 'drakkar-history';

export interface HistoryEntry {
  id: string;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string;
  viewed_at: number;
  season?: number;
  episode?: number;
  progress?: number;
  duration?: number;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addToHistory(entry: Omit<HistoryEntry, 'viewed_at'>) {
  try {
    const list = getHistory();
    const existing = list.findIndex(h => h.id === entry.id);

    if (existing >= 0) {
      list[existing] = {
        ...list[existing],
        ...entry,
        viewed_at: Date.now(),
      };
    } else {
      list.unshift({
        ...entry,
        viewed_at: Date.now(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {}
}

export function updateProgress(id: string, season: number, episode: number) {
  try {
    const list = getHistory();
    const idx = list.findIndex(h => h.id === id);
    if (idx >= 0) {
      list[idx].season = season;
      list[idx].episode = episode;
      list[idx].viewed_at = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  } catch {}
}

export function removeFromHistory(id: string) {
  try {
    const list = getHistory().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function getNextEpisode(id: string): { season: number; episode: number } | null {
  try {
    const list = getHistory();
    const entry = list.find(h => h.id === id);
    if (entry && entry.media_type === 'tv' && entry.season && entry.episode) {
      return { season: entry.season, episode: entry.episode + 1 };
    }
    return null;
  } catch { return null; }
}
