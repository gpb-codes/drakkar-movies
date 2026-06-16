export interface OmdbMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
  totalResults?: string;
  totalSeasons?: string;
  Tagline?: string;
  error?: string;
}

export interface OmdbSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbSearchResponse {
  Search: OmdbSearchResult[];
  totalResults: string;
  Response: string;
  Error?: string;
}

export interface WatchlistItem {
  id: string;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  added_at: number;
}

export interface HistoryItem {
  id: string;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  watched_at: number;
  season?: number;
  episode?: number;
}
