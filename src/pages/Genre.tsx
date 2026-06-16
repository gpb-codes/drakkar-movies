import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tmdb, GENRE_MAP } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { OmdbSearchResult } from '../types/tmdb';

export default function Genre() {
  const { id } = useParams<{ id: string }>();
  const [movies, setMovies] = useState<OmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const genreName = GENRE_MAP[id || ''] || id || 'Categoría';

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await tmdb.getByGenre(id, page);
        setMovies(res.Search || []);
      } catch { setMovies([]); }
      finally { setLoading(false); }
    }
    load();
    window.scrollTo(0, 0);
  }, [id, page]);

  return (
    <div className="page">
      <h1 className="page__title">{genreName}</h1>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid">
            {movies.map(m => <MovieCard key={m.imdbID} movie={m} />)}
          </div>
          <div className="pagination">
            <button className="pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
            <span className="pg-info">{page}</span>
            <button className="pg-btn" onClick={() => setPage(p => p + 1)}>Siguiente →</button>
          </div>
        </>
      )}

      <style>{`
        .page { padding: 90px clamp(16px, 4vw, 48px) 60px; min-height: 100vh; }
        .page__title { font-size: 1.8rem; font-weight: 900; color: #fff; margin: 0 0 32px; letter-spacing: 1px; }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
          gap: 16px;
        }
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 40px 0;
        }
        .pg-btn {
          padding: 10px 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pg-btn:hover:not(:disabled) { background: rgba(168,85,247,0.2); color: #fbbf24; }
        .pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pg-info { color: rgba(255,255,255,0.4); font-size: 0.85rem; }
        @media (max-width: 768px) {
          .grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        }
      `}</style>
    </div>
  );
}
