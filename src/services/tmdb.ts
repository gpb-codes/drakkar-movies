import type { OmdbMovie, OmdbSearchResponse } from '../types/tmdb';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';
const BASE_URL = 'https://www.omdbapi.com';

export const getImageUrl = (url: string | null): string => {
  if (!url || url === 'N/A') return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="%231a1030" width="300" height="450"/><text x="150" y="225" fill="%234a3a6a" font-size="14" text-anchor="middle" font-family="sans-serif">Sin imagen</text></svg>`);
  return url;
};

async function fetchOMDB(params: Record<string, string>): Promise<any> {
  const url = new URL(BASE_URL);
  url.searchParams.set('apikey', API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`OMDB API error: ${response.status}`);
  return response.json();
}

export const tmdb = {
  search: async (query: string, page = 1): Promise<OmdbSearchResponse> => {
    try {
      const res = await fetchOMDB({ s: query, page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  searchMovies: async (query: string, page = 1): Promise<OmdbSearchResponse> => {
    try {
      const res = await fetchOMDB({ s: query, type: 'movie', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  searchSeries: async (query: string, page = 1): Promise<OmdbSearchResponse> => {
    try {
      const res = await fetchOMDB({ s: query, type: 'series', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  getById: async (id: string): Promise<OmdbMovie> => {
    return fetchOMDB({ i: id, plot: 'full' });
  },

  getByTitle: async (title: string): Promise<OmdbMovie> => {
    return fetchOMDB({ t: title, plot: 'full' });
  },

  getPopular: async (page = 1): Promise<OmdbSearchResponse> => {
    const queries = ['batman', 'avengers', 'matrix', 'godfather', 'inception', 'interstellar'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    try {
      const res = await fetchOMDB({ s: q, type: 'movie', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  getPopularTV: async (page = 1): Promise<OmdbSearchResponse> => {
    const queries = ['breaking bad', 'stranger things', 'game of thrones', 'the witcher', 'one piece'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    try {
      const res = await fetchOMDB({ s: q, type: 'series', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  getTopRated: async (page = 1): Promise<OmdbSearchResponse> => {
    const queries = ['shawshank', 'dark knight', 'pulp fiction', 'schindler', 'lord rings'];
    const q = queries[Math.floor(Math.random() * queries.length)];
    try {
      const res = await fetchOMDB({ s: q, type: 'movie', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  getUpcoming: async (page = 1): Promise<OmdbSearchResponse> => {
    try {
      const res = await fetchOMDB({ s: 'movie', y: String(new Date().getFullYear()), page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  getByGenre: async (genre: string, page = 1): Promise<OmdbSearchResponse> => {
    try {
      const res = await fetchOMDB({ s: genre, type: 'movie', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  getAllSeries: async (page = 1): Promise<OmdbSearchResponse> => {
    const queries = [
      'breaking bad', 'stranger things', 'game of thrones', 'the witcher',
      'one piece', 'naruto', 'friends', 'the office', 'prison break',
      'lost', 'house', 'dexter', 'sons of anarchy', 'the walking dead',
      'sherlock', 'peaky blinders', 'the crown', 'you', 'wednesday',
      'the last of us', 'house of the dragon', 'rings of power',
      'the mandalorian', 'andor', 'loby legends', 'arcane',
      'attack on titan', 'demon slayer', 'jujutsu kaisen', 'spy x family',
    ];
    const q = queries[Math.floor(Math.random() * queries.length)];
    try {
      const res = await fetchOMDB({ s: q, type: 'series', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  getSeriesByGenre: async (genre: string, page = 1): Promise<OmdbSearchResponse> => {
    try {
      const res = await fetchOMDB({ s: genre, type: 'series', page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },

  searchAll: async (query: string, page = 1): Promise<OmdbSearchResponse> => {
    try {
      const res = await fetchOMDB({ s: query, page: String(page) });
      if (res.Response === 'False') return { Search: [], totalResults: '0', Response: 'False' };
      return res;
    } catch {
      return { Search: [], totalResults: '0', Response: 'False' };
    }
  },
};

export const GENRE_MAP: Record<string, string> = {
  'Action': 'Acción',
  'Adventure': 'Aventura',
  'Animation': 'Animación',
  'Comedy': 'Comedia',
  'Crime': 'Crimen',
  'Documentary': 'Documental',
  'Drama': 'Drama',
  'Family': 'Familia',
  'Fantasy': 'Fantasía',
  'History': 'Historia',
  'Horror': 'Terror',
  'Musical': 'Música',
  'Mystery': 'Misterio',
  'Romance': 'Romance',
  'Sci-Fi': 'Ciencia Ficción',
  'Thriller': 'Thriller',
  'War': 'Bélico',
  'Western': 'Western',
  'Sport': 'Deporte',
};
