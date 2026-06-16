import { useWatchlistContext } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist } = useWatchlistContext();

  return (
    <div className="wl">
      <div className="wl__header">
        <h1 className="wl__title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Mi Lista
        </h1>
        {watchlist.length > 0 && (
          <span className="wl__count">{watchlist.length} {watchlist.length === 1 ? 'elemento' : 'elementos'}</span>
        )}
      </div>

      {watchlist.length === 0 ? (
        <div className="wl__empty">
          <div className="wl__empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <p className="wl__empty-title">Tu lista está vacía</p>
          <p className="wl__empty-sub">Guarda películas y series para verlas después</p>
          <Link to="/" className="wl__empty-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Explorar Inicio
          </Link>
        </div>
      ) : (
        <div className="wl__grid">
          {watchlist.map(item => (
            <div key={`${item.id}-${item.media_type}`} className="wl__item">
              <MovieCard movie={{
                imdbID: item.id,
                Title: item.title,
                Year: '',
                Poster: item.poster_path || '',
                Type: item.media_type === 'tv' ? 'series' : 'movie',
              }} />
              <button
                className="wl__remove"
                onClick={() => removeFromWatchlist(item.id, item.media_type)}
                title="Remover"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .wl {
          padding: 90px clamp(16px, 4vw, 48px) 60px;
          min-height: 100vh;
        }
        .wl__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .wl__title {
          font-size: 1.8rem;
          font-weight: 900;
          color: #fff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .wl__count {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          padding: 4px 12px;
          background: rgba(255,255,255,0.04);
          border-radius: 20px;
        }
        .wl__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
          gap: 16px;
          animation: wlIn 0.4s ease-out;
        }
        @keyframes wlIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wl__item { position: relative; }
        .wl__remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          background: rgba(7,4,21,0.8);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.2s;
          z-index: 5;
        }
        .wl__item:hover .wl__remove { opacity: 1; }
        .wl__remove:hover { background: #a855f7; color: #fff; border-color: transparent; }

        .wl__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 20px;
          text-align: center;
        }
        .wl__empty-icon {
          color: rgba(168,85,247,0.15);
          margin-bottom: 16px;
        }
        .wl__empty-title {
          color: rgba(255,255,255,0.5);
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 8px;
        }
        .wl__empty-sub {
          color: rgba(255,255,255,0.25);
          font-size: 0.85rem;
          margin: 0 0 24px;
        }
        .wl__empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          color: #fff;
          border-radius: 10px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.25s;
        }
        .wl__empty-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(168,85,247,0.3); }

        @media (max-width: 768px) {
          .wl__grid { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; }
        }
      `}</style>
    </div>
  );
}
