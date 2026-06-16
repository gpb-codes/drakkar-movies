import { useState, useEffect, useCallback, useRef } from 'react';
import { tmdb } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { useI18n } from '../context/I18nContext';
import type { OmdbSearchResult } from '../types/tmdb';

export default function Search() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movie' | 'series'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 350);

  const doSearch = useCallback(async (q: string, f: string) => {
    if (!q.trim()) { setResults([]); setTotal(0); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      let res;
      if (f === 'movie') res = await tmdb.searchMovies(q);
      else if (f === 'series') res = await tmdb.searchSeries(q);
      else res = await tmdb.search(q);

      setResults(res.Search || []);
      setTotal(parseInt(res.totalResults || '0'));
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery, filter);
  }, [debouncedQuery, filter, doSearch]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const quickSearches = ['Batman', 'Marvel', 'Anime', 'Comedia', 'Acción', 'Terror', 'Sci-Fi', 'Netflix', 'Disney', 'Star Wars'];

  return (
    <div className="search">
      <div className="search__hero">
        <div className="search__glow" />
        <h1 className="search__title">{t('search.title')}</h1>
        <p className="search__subtitle">{t('search.subtitle')}</p>

        <div className="search__bar">
          <div className="search__input-wrap">
            <svg className="search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="search__input"
              placeholder={t('search.placeholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className="search__clear" onClick={() => { setQuery(''); setResults([]); setSearched(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          <div className="search__filters">
            {[
              { key: 'all', label: t('search.todo') },
              { key: 'movie', label: t('search.peliculas') },
              { key: 'series', label: t('search.series') },
            ].map(f => (
              <button
                key={f.key}
                className={`search__filter ${filter === f.key ? 'search__filter--active' : ''}`}
                onClick={() => setFilter(f.key as typeof filter)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {!searched && (
          <div className="search__quick">
            <span className="search__quick-label">{t('search.populares')}</span>
            <div className="search__quick-tags">
              {quickSearches.map(s => (
                <button key={s} className="search__tag" onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="search__results">
        {loading ? (
          <LoadingSpinner />
        ) : results.length > 0 ? (
          <>
            <div className="search__results-header">
              <span className="search__results-count">{total.toLocaleString()} {t('search.resultados')}</span>
            </div>
            <div className="search__grid">
              {results.map((m: OmdbSearchResult) => (
                <MovieCard key={m.imdbID} movie={m} />
              ))}
            </div>
          </>
        ) : searched ? (
          <div className="search__empty">
            <div className="search__empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M8 11h6"/>
              </svg>
            </div>
            <p className="search__empty-text">{t('search.noResults')}</p>
            <p className="search__empty-hint">{t('search.noResultsHint')}</p>
          </div>
        ) : (
          <div className="search__suggestions">
            <div className="search__suggest-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
            <p className="search__suggest-text">{t('search.startTyping')}</p>
          </div>
        )}
      </div>

      <style>{`
        .search {
          min-height: 100vh;
          padding-bottom: 60px;
        }

        .search__hero {
          position: relative;
          padding: 100px clamp(16px, 4vw, 48px) 40px;
          text-align: center;
          overflow: hidden;
        }
        .search__glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .search__title {
          font-size: 2.2rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 8px;
          position: relative;
        }
        .search__subtitle {
          color: rgba(255,255,255,0.35);
          font-size: 0.9rem;
          margin: 0 0 32px;
        }

        .search__bar {
          max-width: 600px;
          margin: 0 auto;
        }
        .search__input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 0 16px;
          transition: all 0.3s;
        }
        .search__input-wrap:focus-within {
          border-color: rgba(168,85,247,0.4);
          box-shadow: 0 0 0 4px rgba(168,85,247,0.08), 0 12px 40px rgba(0,0,0,0.3);
          background: rgba(255,255,255,0.07);
        }
        .search__icon { color: rgba(255,255,255,0.25); flex-shrink: 0; }
        .search__input {
          flex: 1;
          padding: 16px 14px;
          background: none;
          border: none;
          color: #fff;
          font-size: 1rem;
          outline: none;
        }
        .search__input::placeholder { color: rgba(255,255,255,0.2); }
        .search__clear {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.08);
          border: none;
          border-radius: 8px;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.2s;
        }
        .search__clear:hover { background: rgba(168,85,247,0.2); color: #fbbf24; }

        .search__filters {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 14px;
        }
        .search__filter {
          padding: 7px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          color: rgba(255,255,255,0.4);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .search__filter:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
        .search__filter--active {
          background: linear-gradient(135deg, rgba(168,85,247,0.25), rgba(251,191,36,0.08));
          border-color: rgba(168,85,247,0.3);
          color: #fbbf24;
        }

        .search__quick {
          margin-top: 28px;
        }
        .search__quick-label {
          display: block;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .search__quick-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .search__tag {
          padding: 6px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          color: rgba(255,255,255,0.35);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .search__tag:hover {
          background: rgba(168,85,247,0.1);
          border-color: rgba(168,85,247,0.15);
          color: #a855f7;
          transform: translateY(-1px);
        }

        .search__results {
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .search__results-header {
          margin-bottom: 16px;
        }
        .search__results-count {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          font-weight: 600;
        }
        .search__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
          gap: 14px;
          max-width: 1100px;
          margin: 0 auto;
          animation: sFadeIn 0.35s ease-out;
        }
        @keyframes sFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .search__empty, .search__suggestions {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }
        .search__empty-icon, .search__suggest-icon {
          color: rgba(168,85,247,0.12);
          margin-bottom: 16px;
        }
        .search__empty-text {
          color: rgba(255,255,255,0.4);
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 6px;
        }
        .search__empty-hint {
          color: rgba(255,255,255,0.2);
          font-size: 0.82rem;
          margin: 0;
        }
        .search__suggest-text {
          color: rgba(255,255,255,0.25);
          font-size: 0.9rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .search__title { font-size: 1.6rem; }
          .search__grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        }
      `}</style>
    </div>
  );
}
