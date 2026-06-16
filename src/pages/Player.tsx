import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb } from '../services/tmdb';
import LoadingSpinner from '../components/LoadingSpinner';
import type { OmdbMovie } from '../types/tmdb';

const SERVERS = [
  {
    id: '1', name: 'Servidor 1', icon: '▶',
    url: (id: string, type: string, s?: string, e?: string) =>
      type === 'tv' && s && e
        ? `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`
        : `https://www.2embed.cc/embed/${id}`
  },
  {
    id: '2', name: 'Servidor 2', icon: '◆',
    url: (id: string, type: string, s?: string, e?: string) =>
      type === 'tv' && s && e
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`
  },
  {
    id: '3', name: 'Servidor 3', icon: '⚡',
    url: (id: string, type: string, s?: string, e?: string) =>
      type === 'tv' && s && e
        ? `https://embed.su/embed/tv/${id}/${s}/${e}`
        : `https://embed.su/embed/movie/${id}`
  },
  {
    id: '4', name: 'Servidor 4', icon: '★',
    url: (id: string, type: string, s?: string, e?: string) =>
      type === 'tv' && s && e
        ? `https://autoembed.cc/embed/tv/${id}/${s}/${e}`
        : `https://autoembed.cc/embed/movie/${id}`
  },
];

export default function Player() {
  const { type, id, season, episode } = useParams<{ type: string; id: string; season?: string; episode?: string }>();
  const [detail, setDetail] = useState<OmdbMovie | null>(null);
  const [server, setServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [triedServers, setTriedServers] = useState<number[]>([0]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try { const d = await tmdb.getById(id); if (d.Response === 'True') setDetail(d); }
      catch {} finally { setLoading(false); }
    }
    load();
  }, [id]);

  const nextServer = () => {
    const next = (server + 1) % SERVERS.length;
    setServer(next);
    setTriedServers(prev => [...new Set([...prev, next])]);
  };

  if (loading) return <LoadingSpinner />;
  if (!detail) return <div className="pl"><div className="pl__empty"><p>No encontrado</p></div></div>;

  const src = SERVERS[server].url(id || '', type || 'movie', season, episode);
  const isTv = type === 'tv';
  const title = detail.Title || '';

  return (
    <div className="pl">
      <div className="pl__topbar">
        <Link to={`/detail/${type}/${id}`} className="pl__back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <div className="pl__topbar-info">
          <h1 className="pl__title">{title}</h1>
          {isTv && season && episode && (
            <span className="pl__ep-badge">T{season} · E{episode}</span>
          )}
        </div>
        <button className="pl__icon-btn" onClick={() => setShowInfo(!showInfo)} title="Info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </button>
      </div>

      {showInfo && (
        <div className="pl__info-panel">
          <div className="pl__info-content">
            <p>{detail.Plot}</p>
            <div className="pl__info-meta">
              {detail.imdbRating !== 'N/A' && <span>⭐ {detail.imdbRating}</span>}
              {detail.Year && <span>{detail.Year}</span>}
              {detail.Genre !== 'N/A' && <span>{detail.Genre}</span>}
              {detail.Actors !== 'N/A' && <span>{detail.Actors}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="pl__player-wrap">
        <div className="pl__frame">
          <iframe
            key={`${server}-${src}`}
            src={src}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            onError={() => nextServer()}
          />
          <div className="pl__frame-overlay" />
        </div>
      </div>

      <div className="pl__bottom">
        <div className="pl__servers">
          <span className="pl__servers-label">Servidor</span>
          <div className="pl__servers-grid">
            {SERVERS.map((s, i) => (
              <button
                key={s.id}
                className={`srv ${i === server ? 'srv--active' : ''} ${triedServers.includes(i) && i !== server ? 'srv--tried' : ''}`}
                onClick={() => { setServer(i); setTriedServers(prev => [...new Set([...prev, i])]); }}
              >
                <span className="srv__icon">{s.icon}</span>
                <span className="srv__name">{s.name}</span>
                {i === server && <span className="srv__live">LIVE</span>}
              </button>
            ))}
          </div>
          <p className="pl__server-hint">¿No reproduce? Prueba otro servidor</p>
        </div>

        {isTv && (
          <div className="pl__ep-nav">
            {Number(episode) > 1 && (
              <Link to={`/player/tv/${id}/${season}/${Number(episode) - 1}`} className="ep-nav ep-nav--prev">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                Ep. {Number(episode) - 1}
              </Link>
            )}
            {Number(episode) < (detail.totalSeasons ? parseInt(detail.totalSeasons) * 10 : 100) && (
              <Link to={`/player/tv/${id}/${season}/${Number(episode) + 1}`} className="ep-nav ep-nav--next">
                Ep. {Number(episode) + 1}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        .pl { min-height: 100vh; background: #070415; display: flex; flex-direction: column; }

        /* Top bar */
        .pl__topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px clamp(12px, 3vw, 48px);
          background: rgba(7,4,21,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(168,85,247,0.06);
        }
        .pl__back {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .pl__back:hover { background: rgba(168,85,247,0.15); color: #fbbf24; border-color: rgba(168,85,247,0.2); }
        .pl__topbar-info { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; }
        .pl__title {
          font-size: 0.9rem;
          color: #fff;
          margin: 0;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pl__ep-badge {
          font-size: 0.68rem;
          color: #a855f7;
          font-weight: 700;
          padding: 3px 10px;
          background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.18);
          border-radius: 6px;
          flex-shrink: 0;
          letter-spacing: 0.5px;
        }
        .pl__icon-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .pl__icon-btn:hover { background: rgba(168,85,247,0.15); color: #fbbf24; }

        /* Info panel */
        .pl__info-panel {
          background: rgba(15,10,30,0.95);
          border-bottom: 1px solid rgba(168,85,247,0.08);
        }
        .pl__info-content {
          padding: 16px clamp(12px, 3vw, 48px);
          max-width: 900px;
          color: rgba(255,255,255,0.55);
          font-size: 0.82rem;
          line-height: 1.6;
        }
        .pl__info-meta {
          display: flex;
          gap: 16px;
          margin-top: 10px;
          color: rgba(255,255,255,0.3);
          font-size: 0.72rem;
          flex-wrap: wrap;
        }

        /* Player */
        .pl__player-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 clamp(12px, 3vw, 48px);
          min-height: 0;
        }
        .pl__frame {
          position: relative;
          width: 100%;
          max-width: 1100px;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.05);
          border: 1px solid rgba(168,85,247,0.06);
        }
        .pl__frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
        .pl__frame-overlay {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          pointer-events: none;
          box-shadow: inset 0 0 60px rgba(0,0,0,0.3);
        }

        /* Bottom controls */
        .pl__bottom {
          padding: 14px clamp(12px, 3vw, 48px) 20px;
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }
        .pl__servers { margin-bottom: 12px; }
        .pl__servers-label {
          display: block;
          color: rgba(255,255,255,0.25);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .pl__servers-grid { display: flex; gap: 6px; flex-wrap: wrap; }

        .srv {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          color: rgba(255,255,255,0.45);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .srv:hover { background: rgba(168,85,247,0.1); color: #fff; border-color: rgba(168,85,247,0.15); }
        .srv--active {
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(251,191,36,0.08));
          border-color: rgba(168,85,247,0.25);
          color: #fbbf24;
          box-shadow: 0 2px 12px rgba(168,85,247,0.15);
        }
        .srv--tried { opacity: 0.5; }
        .srv__icon { font-size: 0.6rem; }
        .srv__name { font-weight: 600; }
        .srv__live {
          font-size: 0.5rem;
          font-weight: 800;
          color: #4ade80;
          background: rgba(34,197,94,0.15);
          padding: 1px 5px;
          border-radius: 3px;
          letter-spacing: 0.5px;
        }
        .pl__server-hint {
          margin: 8px 0 0;
          font-size: 0.68rem;
          color: rgba(255,255,255,0.2);
        }

        .pl__ep-nav {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .ep-nav {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .ep-nav:hover { background: rgba(168,85,247,0.1); color: #fff; }
        .ep-nav--next {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent;
          color: #fff;
        }
        .ep-nav--next:hover { box-shadow: 0 4px 16px rgba(168,85,247,0.3); }

        .pl__empty { display: flex; justify-content: center; align-items: center; min-height: 60vh; color: rgba(255,255,255,0.3); }

        @media (max-width: 768px) {
          .pl__frame { aspect-ratio: auto; height: 55vh; border-radius: 0; }
          .pl__player-wrap { padding: 0; }
          .pl__frame-overlay { border-radius: 0; }
        }
      `}</style>
    </div>
  );
}
