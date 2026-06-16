import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb } from '../services/tmdb';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../context/I18nContext';
import type { OmdbMovie } from '../types/tmdb';

interface Episode {
  Episode: string;
  Title: string;
  Released: string;
  imdbRating: string;
  imdbID: string;
}

interface SeasonData {
  Season: string;
  Episodes: Episode[];
  totalSeasons: string;
}

export default function Player() {
  const { t } = useI18n();
  const { type, id, season: urlSeason, episode: urlEpisode } = useParams<{ type: string; id: string; season?: string; episode?: string }>();
  const [detail, setDetail] = useState<OmdbMovie | null>(null);
  const [server, setServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [currentSeason, setCurrentSeason] = useState(Number(urlSeason) || 1);
  const [currentEpisode, setCurrentEpisode] = useState(Number(urlEpisode) || 1);
  const [seasonLoading, setSeasonLoading] = useState(false);

  const isTv = type === 'tv';
  const totalSeasons = detail?.totalSeasons ? parseInt(detail.totalSeasons) : 1;

  const SERVERS = [
    {
      id: '1', name: t('player.servidor1'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://www.2embed.cc/embedtv/${mid}&s=${s}&e=${e}`
          : `https://www.2embed.cc/embed/${mid}`
    },
    {
      id: '2', name: t('player.servidor2'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://multiembed.mov/?video_id=${mid}&tmdb=1&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${mid}&tmdb=1`
    },
    {
      id: '3', name: t('player.servidor3'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://embed.su/embed/tv/${mid}/${s}/${e}`
          : `https://embed.su/embed/movie/${mid}`
    },
    {
      id: '4', name: t('player.servidor4'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://autoembed.cc/embed/tv/${mid}/${s}/${e}`
          : `https://autoembed.cc/embed/movie/${mid}`
    },
  ];

  useEffect(() => {
    async function load() {
      if (!id) return;
      try { const d = await tmdb.getById(id); if (d.Response === 'True') setDetail(d); }
      catch {} finally { setLoading(false); }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (urlSeason) setCurrentSeason(Number(urlSeason));
    if (urlEpisode) setCurrentEpisode(Number(urlEpisode));
  }, [urlSeason, urlEpisode]);

  useEffect(() => {
    if (!isTv || !id) return;
    setSeasonLoading(true);
    tmdb.getSeason(id, currentSeason).then(data => {
      setSeasonData(data);
      setSeasonLoading(false);
    });
  }, [id, currentSeason, isTv]);

  const selectEpisode = (ep: number) => {
    setCurrentEpisode(ep);
    setShowSelector(false);
  };

  const nextServer = () => {
    setServer((server + 1) % SERVERS.length);
  };

  if (loading) return <LoadingSpinner />;
  if (!detail) return <div className="pl"><div className="pl__empty"><p>{t('player.noEncontrado')}</p></div></div>;

  const src = SERVERS[server].url(id || '', type || 'movie', String(currentSeason), String(currentEpisode));
  const title = detail.Title || '';

  return (
    <div className="pl">
      <div className="pl__topbar">
        <Link to={`/detail/${type}/${id}`} className="pl__back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <div className="pl__topbar-info">
          <h1 className="pl__title">{title}</h1>
          {isTv && (
            <span className="pl__ep-badge">T{currentSeason} E{currentEpisode}</span>
          )}
        </div>
        {isTv && (
          <button className="pl__selector-btn" onClick={() => setShowSelector(!showSelector)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 8h20M8 3v18"/></svg>
            {t('player.capitulos')}
          </button>
        )}
        <button className="pl__icon-btn" onClick={() => setShowInfo(!showInfo)} title={t('player.info')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        </button>
      </div>

      {showInfo && (
        <div className="pl__info-panel">
          <div className="pl__info-content">
            <p>{detail.Plot}</p>
            <div className="pl__info-meta">
              {detail.imdbRating !== 'N/A' && <span>{detail.imdbRating}</span>}
              {detail.Year && <span>{detail.Year}</span>}
              {detail.Genre !== 'N/A' && <span>{detail.Genre}</span>}
            </div>
          </div>
        </div>
      )}

      {showSelector && isTv && (
        <div className="pl__selector">
          <div className="pl__selector-inner">
            <div className="pl__selector-header">
              <h3>{t('player.seleccionarCapitulo')}</h3>
              <button className="pl__selector-close" onClick={() => setShowSelector(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="pl__season-tabs">
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map(s => (
                <button
                  key={s}
                  className={`pl__season-tab ${s === currentSeason ? 'pl__season-tab--on' : ''}`}
                  onClick={() => setCurrentSeason(s)}
                >
                  {t('player.temporada')} {s}
                </button>
              ))}
            </div>

            <div className="pl__episodes">
              {seasonLoading ? (
                <div className="pl__ep-loading">
                  <div className="pl__ep-spinner" />
                  <span>{t('player.cargando')}</span>
                </div>
              ) : seasonData?.Episodes ? (
                seasonData.Episodes.map(ep => {
                  const epNum = parseInt(ep.Episode);
                  const isActive = epNum === currentEpisode;
                  return (
                    <button
                      key={ep.imdbID || epNum}
                      className={`pl__ep-card ${isActive ? 'pl__ep-card--on' : ''}`}
                      onClick={() => selectEpisode(epNum)}
                    >
                      <div className="pl__ep-num">{epNum}</div>
                      <div className="pl__ep-info">
                        <div className="pl__ep-title">{ep.Title}</div>
                        <div className="pl__ep-meta">
                          {ep.Released !== 'N/A' && <span>{ep.Released}</span>}
                          {ep.imdbRating !== 'N/A' && <span>{ep.imdbRating}</span>}
                        </div>
                      </div>
                      {isActive && (
                        <div className="pl__ep-playing">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="pl__ep-empty">{t('player.noEpisodios')}</div>
              )}
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
          <span className="pl__servers-label">{t('player.servidor')}</span>
          <div className="pl__servers-grid">
            {SERVERS.map((s, i) => (
              <button
                key={s.id}
                className={`srv ${i === server ? 'srv--active' : ''}`}
                onClick={() => setServer(i)}
              >
                <span className="srv__name">{s.name}</span>
                {i === server && <span className="srv__live">{t('player.live')}</span>}
              </button>
            ))}
          </div>
          <p className="pl__server-hint">{t('player.noReproduce')}</p>
        </div>

        {isTv && (
          <div className="pl__ep-nav">
            {currentEpisode > 1 && (
              <Link to={`/player/tv/${id}/${currentSeason}/${currentEpisode - 1}`} className="ep-nav ep-nav--prev">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                {t('player.episodio')} {currentEpisode - 1}
              </Link>
            )}
            {seasonData?.Episodes && currentEpisode < seasonData.Episodes.length && (
              <Link to={`/player/tv/${id}/${currentSeason}/${currentEpisode + 1}`} className="ep-nav ep-nav--next">
                {t('player.episodio')} {currentEpisode + 1}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        .pl { min-height: 100vh; background: #070415; display: flex; flex-direction: column; }

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
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
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
          font-size: 0.9rem; color: #fff; margin: 0; font-weight: 600;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .pl__ep-badge {
          font-size: 0.68rem; color: #a855f7; font-weight: 700;
          padding: 3px 10px; background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.18); border-radius: 6px;
          flex-shrink: 0; letter-spacing: 0.5px;
        }
        .pl__selector-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px; background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.2); border-radius: 8px;
          color: #a855f7; font-size: 0.72rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .pl__selector-btn:hover { background: rgba(168,85,247,0.2); }
        .pl__icon-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px; color: rgba(255,255,255,0.5);
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
        }
        .pl__icon-btn:hover { background: rgba(168,85,247,0.15); color: #fbbf24; }

        .pl__info-panel {
          background: rgba(15,10,30,0.95);
          border-bottom: 1px solid rgba(168,85,247,0.08);
        }
        .pl__info-content {
          padding: 16px clamp(12px, 3vw, 48px);
          max-width: 900px; color: rgba(255,255,255,0.55);
          font-size: 0.82rem; line-height: 1.6;
        }
        .pl__info-meta {
          display: flex; gap: 16px; margin-top: 10px;
          color: rgba(255,255,255,0.3); font-size: 0.72rem; flex-wrap: wrap;
        }

        /* Episode Selector */
        .pl__selector {
          background: rgba(10,6,22,0.98);
          border-bottom: 1px solid rgba(168,85,247,0.1);
          max-height: 50vh;
          overflow-y: auto;
        }
        .pl__selector-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 16px clamp(12px, 3vw, 48px);
        }
        .pl__selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .pl__selector-header h3 {
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        .pl__selector-close {
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border: none; border-radius: 6px;
          color: rgba(255,255,255,0.4); cursor: pointer;
          transition: all 0.2s;
        }
        .pl__selector-close:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .pl__season-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 14px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .pl__season-tab {
          padding: 6px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .pl__season-tab:hover { background: rgba(168,85,247,0.1); color: #fff; }
        .pl__season-tab--on {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent;
          color: #fff;
        }

        .pl__episodes {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pl__ep-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
        .pl__ep-card:hover { background: rgba(168,85,247,0.08); border-color: rgba(168,85,247,0.12); }
        .pl__ep-card--on {
          background: rgba(168,85,247,0.1);
          border-color: rgba(168,85,247,0.2);
        }
        .pl__ep-num {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          font-size: 0.8rem; font-weight: 700;
          color: rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
        .pl__ep-card--on .pl__ep-num {
          background: rgba(168,85,247,0.2);
          color: #a855f7;
        }
        .pl__ep-info { flex: 1; min-width: 0; }
        .pl__ep-title {
          font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.85);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .pl__ep-card--on .pl__ep-title { color: #fff; }
        .pl__ep-meta {
          display: flex; gap: 10px; margin-top: 2px;
          font-size: 0.65rem; color: rgba(255,255,255,0.3);
        }
        .pl__ep-playing {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          background: #a855f7; border-radius: 50%;
          color: #fff; flex-shrink: 0;
        }
        .pl__ep-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 30px; color: rgba(255,255,255,0.3);
          font-size: 0.8rem;
        }
        .pl__ep-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(168,85,247,0.2);
          border-top-color: #a855f7;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pl__ep-empty {
          text-align: center; padding: 30px;
          color: rgba(255,255,255,0.3); font-size: 0.8rem;
        }

        /* Player */
        .pl__player-wrap {
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 0 clamp(12px, 3vw, 48px);
          min-height: 0;
        }
        .pl__frame {
          position: relative; width: 100%; max-width: 1100px;
          aspect-ratio: 16/9; background: #000;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.05);
          border: 1px solid rgba(168,85,247,0.06);
        }
        .pl__frame iframe {
          position: absolute; inset: 0; width: 100%; height: 100%; border: none;
        }
        .pl__frame-overlay {
          position: absolute; inset: 0; border-radius: 14px;
          pointer-events: none; box-shadow: inset 0 0 60px rgba(0,0,0,0.3);
        }

        .pl__bottom {
          padding: 14px clamp(12px, 3vw, 48px) 20px;
          max-width: 1100px; margin: 0 auto; width: 100%;
        }
        .pl__servers { margin-bottom: 12px; }
        .pl__servers-label {
          display: block; color: rgba(255,255,255,0.25);
          font-size: 0.65rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;
        }
        .pl__servers-grid { display: flex; gap: 6px; flex-wrap: wrap; }

        .srv {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;
          color: rgba(255,255,255,0.45); font-size: 0.75rem;
          cursor: pointer; transition: all 0.2s; position: relative;
        }
        .srv:hover { background: rgba(168,85,247,0.1); color: #fff; border-color: rgba(168,85,247,0.15); }
        .srv--active {
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(251,191,36,0.08));
          border-color: rgba(168,85,247,0.25); color: #fbbf24;
          box-shadow: 0 2px 12px rgba(168,85,247,0.15);
        }
        .srv__name { font-weight: 600; }
        .srv__live {
          font-size: 0.5rem; font-weight: 800; color: #4ade80;
          background: rgba(34,197,94,0.15); padding: 1px 5px;
          border-radius: 3px; letter-spacing: 0.5px;
        }
        .pl__server-hint {
          margin: 8px 0 0; font-size: 0.68rem; color: rgba(255,255,255,0.2);
        }

        .pl__ep-nav { display: flex; gap: 8px; justify-content: center; }
        .ep-nav {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
          color: rgba(255,255,255,0.5); text-decoration: none;
          font-size: 0.75rem; font-weight: 600; transition: all 0.2s;
        }
        .ep-nav:hover { background: rgba(168,85,247,0.1); color: #fff; }
        .ep-nav--next {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent; color: #fff;
        }
        .ep-nav--next:hover { box-shadow: 0 4px 16px rgba(168,85,247,0.3); }

        .pl__empty { display: flex; justify-content: center; align-items: center; min-height: 60vh; color: rgba(255,255,255,0.3); }

        @media (max-width: 768px) {
          .pl__frame { aspect-ratio: auto; height: 55vh; border-radius: 0; }
          .pl__player-wrap { padding: 0; }
          .pl__frame-overlay { border-radius: 0; }
          .pl__selector { max-height: 60vh; }
          .pl__selector-btn span { display: none; }
        }
      `}</style>
    </div>
  );
}
