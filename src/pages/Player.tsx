import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb } from '../services/tmdb';
import { addToHistory, updateProgress } from '../services/history';
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
  const { type, id, season: urlSeason, episode: urlEpisode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();
  const [detail, setDetail] = useState<OmdbMovie | null>(null);
  const [server, setServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorAnimating, setSelectorAnimating] = useState(false);

  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [currentSeason, setCurrentSeason] = useState(Number(urlSeason) || 1);
  const [currentEpisode, setCurrentEpisode] = useState(Number(urlEpisode) || 1);
  const [seasonLoading, setSeasonLoading] = useState(false);

  const selectorRef = useRef<HTMLDivElement>(null);
  const seasonTabsRef = useRef<HTMLDivElement>(null);

  const isTv = type === 'tv';
  const totalSeasons = detail?.totalSeasons ? parseInt(detail.totalSeasons) : 1;

  const SERVERS = [
    {
      id: '1',
      name: t('player.servidor1'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://www.2embed.cc/embedtv/${mid}&s=${s}&e=${e}`
          : `https://www.2embed.cc/embed/${mid}`,
    },
    {
      id: '2',
      name: t('player.servidor2'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://multiembed.mov/?video_id=${mid}&tmdb=1&s=${s}&e=${e}`
          : `https://multiembed.mov/?video_id=${mid}&tmdb=1`,
    },
    {
      id: '3',
      name: t('player.servidor3'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://embed.su/embed/tv/${mid}/${s}/${e}`
          : `https://embed.su/embed/movie/${mid}`,
    },
    {
      id: '4',
      name: t('player.servidor4'),
      url: (mid: string, tp: string, s?: string, e?: string) =>
        tp === 'tv' && s && e
          ? `https://autoembed.cc/embed/tv/${mid}/${s}/${e}`
          : `https://autoembed.cc/embed/movie/${mid}`,
    },
  ];

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const d = await tmdb.getById(id);
        if (d.Response === 'True') setDetail(d);
      } catch {
      } finally {
        setLoading(false);
      }
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
    tmdb.getSeason(id, currentSeason).then((data) => {
      setSeasonData(data);
      setSeasonLoading(false);
    });
  }, [id, currentSeason, isTv]);

  const selectEpisode = useCallback(
    (ep: number) => {
      setCurrentEpisode(ep);
      setSelectorAnimating(true);
      setTimeout(() => {
        setShowSelector(false);
        setSelectorAnimating(false);
      }, 300);
      if (isTv && id && detail) {
        updateProgress(id, currentSeason, ep);
      }
    },
    [currentSeason, detail, id, isTv]
  );

  useEffect(() => {
    if (!loading && detail && id) {
      addToHistory({
        id,
        media_type: isTv ? 'tv' : 'movie',
        title: detail.Title,
        poster_path: detail.Poster,
        season: isTv ? currentSeason : undefined,
        episode: isTv ? currentEpisode : undefined,
      });
    }
  }, [id, currentSeason, currentEpisode]);

  const nextServer = useCallback(() => {
    setServer((prev) => (prev + 1) % SERVERS.length);
  }, []);

  const toggleSelector = useCallback(() => {
    if (showSelector) {
      setSelectorAnimating(true);
      setTimeout(() => {
        setShowSelector(false);
        setSelectorAnimating(false);
      }, 300);
    } else {
      setShowSelector(true);
    }
  }, [showSelector]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSelector) {
        toggleSelector();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSelector, toggleSelector]);

  if (loading) return <LoadingSpinner />;
  if (!detail)
    return (
      <div className="pl">
        <div className="pl__empty">
          <p>{t('player.noEncontrado')}</p>
        </div>
      </div>
    );

  const src = SERVERS[server].url(
    id || '',
    type || 'movie',
    String(currentSeason),
    String(currentEpisode)
  );
  const title = detail.Title || '';

  return (
    <div className="pl">
      <div className="pl__topbar">
        <Link to={`/detail/${type}/${id}`} className="pl__back">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="pl__topbar-info">
          <h1 className="pl__title">{title}</h1>
          {isTv && (
            <span className="pl__ep-badge">
              T{currentSeason} E{currentEpisode}
            </span>
          )}
        </div>
        {isTv && (
          <button className="pl__selector-btn" onClick={toggleSelector}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="18" rx="2" />
              <path d="M2 8h20M8 3v18" />
            </svg>
            {t('player.capitulos')}
          </button>
        )}
        <button
          className="pl__icon-btn"
          onClick={() => setShowInfo(!showInfo)}
          title={t('player.info')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
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
        <div
          className={`pl__selector ${selectorAnimating ? 'pl__selector--closing' : ''}`}
          ref={selectorRef}
        >
          <div className="pl__selector-backdrop" onClick={toggleSelector} />
          <div className="pl__selector-panel">
            <div className="pl__selector-header">
              <div className="pl__selector-title-row">
                <h3>{t('player.seleccionarCapitulo')}</h3>
                <span className="pl__selector-season-label">
                  {t('player.temporada')} {currentSeason}
                </span>
              </div>
              <button className="pl__selector-close" onClick={toggleSelector}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="pl__season-tabs" ref={seasonTabsRef}>
              {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                <button
                  key={s}
                  className={`pl__season-tab ${s === currentSeason ? 'pl__season-tab--active' : ''}`}
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
                seasonData.Episodes.map((ep) => {
                  const epNum = parseInt(ep.Episode);
                  const isActive = epNum === currentEpisode;
                  return (
                    <button
                      key={ep.imdbID || epNum}
                      className={`pl__ep-card ${isActive ? 'pl__ep-card--active' : ''}`}
                      onClick={() => selectEpisode(epNum)}
                    >
                      <div className="pl__ep-thumb">
                        <div className="pl__ep-num-large">{epNum}</div>
                        <div className="pl__ep-play-overlay">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                      <div className="pl__ep-details">
                        <div className="pl__ep-title-row">
                          <span className="pl__ep-title">{ep.Title}</span>
                        </div>
                        <div className="pl__ep-meta">
                          {ep.Released !== 'N/A' && (
                            <span className="pl__ep-date">{ep.Released}</span>
                          )}
                          {ep.imdbRating !== 'N/A' && (
                            <span className="pl__ep-rating">
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              {ep.imdbRating}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <div className="pl__ep-progress">
                            <div className="pl__ep-progress-bar">
                              <div className="pl__ep-progress-fill" />
                            </div>
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <div className="pl__ep-active-badge">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
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
              <Link
                to={`/player/tv/${id}/${currentSeason}/${currentEpisode - 1}`}
                className="ep-nav ep-nav--prev"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {t('player.episodio')} {currentEpisode - 1}
              </Link>
            )}
            {seasonData?.Episodes && currentEpisode < seasonData.Episodes.length && (
              <Link
                to={`/player/tv/${id}/${currentSeason}/${currentEpisode + 1}`}
                className="ep-nav ep-nav--next"
              >
                {t('player.episodio')} {currentEpisode + 1}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        .pl { min-height: 100vh; background: #070415; display: flex; flex-direction: column; }

        .pl__topbar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px clamp(16px, 4vw, 48px);
          background: rgba(7,4,21,0.88); backdrop-filter: blur(24px) saturate(1.2);
          border-bottom: 1px solid rgba(168,85,247,0.08); position: relative; z-index: 50;
        }
        .pl__back {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: rgba(255,255,255,0.5); text-decoration: none;
          transition: all 0.25s ease; flex-shrink: 0; cursor: pointer;
        }
        .pl__back:hover { background: rgba(168,85,247,0.15); color: #fbbf24; border-color: rgba(168,85,247,0.25); transform: scale(1.05); }
        .pl__topbar-info { flex: 1; display: flex; align-items: center; gap: 12px; min-width: 0; }
        .pl__title {
          font-size: 0.95rem; color: #fff; margin: 0; font-weight: 700;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          letter-spacing: -0.01em;
        }
        .pl__ep-badge {
          font-size: 0.68rem; color: #a855f7; font-weight: 700;
          padding: 4px 12px; background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.2); border-radius: 6px;
          flex-shrink: 0; letter-spacing: 0.8px;
        }
        .pl__selector-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 16px; background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.22); border-radius: 10px;
          color: #a855f7; font-size: 0.75rem; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease; flex-shrink: 0;
        }
        .pl__selector-btn:hover { background: rgba(168,85,247,0.22); transform: scale(1.02); }
        .pl__icon-btn {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: rgba(255,255,255,0.5);
          cursor: pointer; transition: all 0.25s ease; flex-shrink: 0;
        }
        .pl__icon-btn:hover { background: rgba(168,85,247,0.15); color: #fbbf24; }

        .pl__info-panel {
          background: rgba(15,10,30,0.96); border-bottom: 1px solid rgba(168,85,247,0.08);
        }
        .pl__info-content {
          padding: 20px clamp(16px, 4vw, 48px);
          max-width: 900px; color: rgba(255,255,255,0.6);
          font-size: 0.85rem; line-height: 1.7;
        }
        .pl__info-meta {
          display: flex; gap: 18px; margin-top: 12px;
          color: rgba(255,255,255,0.35); font-size: 0.75rem; flex-wrap: wrap;
        }

        /* Episode Selector - Netflix Style */
        .pl__selector {
          position: fixed; inset: 0; z-index: 100;
          display: flex; flex-direction: column; align-items: center;
          animation: selectorFadeIn 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .pl__selector--closing {
          animation: selectorFadeOut 0.3s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes selectorFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes selectorFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .pl__selector-backdrop {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        }

        .pl__selector-panel {
          position: relative; z-index: 1;
          width: 100%; max-width: 680px;
          max-height: 80vh; margin-top: 8vh;
          background: rgba(18,12,36,0.97);
          border: 1px solid rgba(168,85,247,0.12);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 32px 100px rgba(0,0,0,0.6), 0 0 80px rgba(168,85,247,0.08);
          display: flex; flex-direction: column;
          animation: selectorSlideIn 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .pl__selector--closing .pl__selector-panel {
          animation: selectorSlideOut 0.3s cubic-bezier(0.7,0,0.84,0) forwards;
        }
        @keyframes selectorSlideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes selectorSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(20px) scale(0.98); }
        }

        .pl__selector-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 28px 16px; flex-shrink: 0;
        }
        .pl__selector-title-row { display: flex; align-items: baseline; gap: 12px; }
        .pl__selector-header h3 {
          font-size: 1.1rem; font-weight: 700; color: #fff; margin: 0;
          letter-spacing: -0.02em;
        }
        .pl__selector-season-label {
          font-size: 0.75rem; color: rgba(168,85,247,0.6); font-weight: 600;
        }
        .pl__selector-close {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: rgba(255,255,255,0.5);
          cursor: pointer; transition: all 0.25s ease;
        }
        .pl__selector-close:hover { background: rgba(255,255,255,0.12); color: #fff; transform: rotate(90deg); }

        .pl__season-tabs {
          display: flex; gap: 8px; padding: 0 28px 20px;
          overflow-x: auto; flex-shrink: 0;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .pl__season-tabs::-webkit-scrollbar { display: none; }
        .pl__season-tab {
          padding: 8px 20px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; color: rgba(255,255,255,0.5);
          font-size: 0.78rem; font-weight: 600; cursor: pointer;
          transition: all 0.25s ease; white-space: nowrap; flex-shrink: 0;
          letter-spacing: 0.01em;
        }
        .pl__season-tab:hover { background: rgba(168,85,247,0.12); color: rgba(255,255,255,0.9); }
        .pl__season-tab--active {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent; color: #fff;
          box-shadow: 0 4px 16px rgba(168,85,247,0.3);
        }

        .pl__episodes {
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto; padding: 0 16px 20px;
          scrollbar-width: thin; scrollbar-color: rgba(168,85,247,0.3) transparent;
        }
        .pl__episodes::-webkit-scrollbar { width: 6px; }
        .pl__episodes::-webkit-scrollbar-track { background: transparent; }
        .pl__episodes::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 3px; }

        .pl__ep-card {
          display: flex; align-items: center; gap: 16px;
          padding: 12px; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04); border-radius: 14px;
          cursor: pointer; transition: all 0.25s ease; text-align: left; width: 100%;
        }
        .pl__ep-card:hover { background: rgba(168,85,247,0.08); border-color: rgba(168,85,247,0.15); transform: translateX(4px); }
        .pl__ep-card--active {
          background: rgba(168,85,247,0.1);
          border-color: rgba(168,85,247,0.25);
          box-shadow: 0 4px 20px rgba(168,85,247,0.1);
        }

        .pl__ep-thumb {
          width: 80px; height: 50px;
          background: rgba(255,255,255,0.04); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden; flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .pl__ep-card--active .pl__ep-thumb {
          border-color: rgba(168,85,247,0.2);
        }
        .pl__ep-num-large {
          font-size: 1.4rem; font-weight: 800; color: rgba(255,255,255,0.12);
          transition: all 0.25s ease;
        }
        .pl__ep-card:hover .pl__ep-num-large { opacity: 0; }
        .pl__ep-card--active .pl__ep-num-large { color: rgba(168,85,247,0.25); }
        .pl__ep-play-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(168,85,247,0.2); opacity: 0;
          transition: opacity 0.25s ease; color: #fff;
        }
        .pl__ep-card:hover .pl__ep-play-overlay { opacity: 1; }

        .pl__ep-details { flex: 1; min-width: 0; }
        .pl__ep-title-row { display: flex; align-items: center; gap: 8px; }
        .pl__ep-title {
          font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.85);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .pl__ep-card--active .pl__ep-title { color: #fff; }
        .pl__ep-meta {
          display: flex; align-items: center; gap: 12px; margin-top: 4px;
        }
        .pl__ep-date {
          font-size: 0.7rem; color: rgba(255,255,255,0.3);
        }
        .pl__ep-rating {
          display: flex; align-items: center; gap: 4px;
          font-size: 0.7rem; color: #fbbf24; font-weight: 600;
        }

        .pl__ep-progress { margin-top: 8px; }
        .pl__ep-progress-bar {
          width: 100%; height: 3px;
          background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;
        }
        .pl__ep-progress-fill {
          width: 35%; height: 100%;
          background: linear-gradient(90deg, #a855f7, #fbbf24); border-radius: 2px;
          animation: progressPulse 2s ease-in-out infinite;
        }
        @keyframes progressPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .pl__ep-active-badge {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-radius: 8px; color: #fff; flex-shrink: 0;
          box-shadow: 0 2px 10px rgba(168,85,247,0.3);
        }

        .pl__ep-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; padding: 40px; color: rgba(255,255,255,0.3);
          font-size: 0.82rem;
        }
        .pl__ep-spinner {
          width: 22px; height: 22px;
          border: 2.5px solid rgba(168,85,247,0.2);
          border-top-color: #a855f7; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pl__ep-empty {
          text-align: center; padding: 40px;
          color: rgba(255,255,255,0.3); font-size: 0.85rem;
        }

        /* Player */
        .pl__player-wrap {
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 0 clamp(16px, 4vw, 48px); min-height: 0;
        }
        .pl__frame {
          position: relative; width: 100%; max-width: 1100px;
          aspect-ratio: 16/9; background: #000;
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(168,85,247,0.06);
          border: 1px solid rgba(168,85,247,0.08);
          transition: box-shadow 0.3s ease;
        }
        .pl__frame:hover {
          box-shadow: 0 24px 80px rgba(0,0,0,0.7), 0 0 80px rgba(168,85,247,0.1);
        }
        .pl__frame iframe {
          position: absolute; inset: 0; width: 100%; height: 100%; border: none;
        }
        .pl__frame-overlay {
          position: absolute; inset: 0; border-radius: 16px;
          pointer-events: none; box-shadow: inset 0 0 80px rgba(0,0,0,0.35);
        }

        .pl__bottom {
          padding: 16px clamp(16px, 4vw, 48px) 24px;
          max-width: 1100px; margin: 0 auto; width: 100%;
        }
        .pl__servers { margin-bottom: 14px; }
        .pl__servers-label {
          display: block; color: rgba(255,255,255,0.3);
          font-size: 0.68rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.8px; margin-bottom: 10px;
        }
        .pl__servers-grid { display: flex; gap: 8px; flex-wrap: wrap; }

        .srv {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 18px; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 10px;
          color: rgba(255,255,255,0.45); font-size: 0.78rem;
          cursor: pointer; transition: all 0.25s ease; position: relative;
        }
        .srv:hover { background: rgba(168,85,247,0.1); color: #fff; border-color: rgba(168,85,247,0.18); }
        .srv--active {
          background: linear-gradient(135deg, rgba(168,85,247,0.22), rgba(251,191,36,0.1));
          border-color: rgba(168,85,247,0.3); color: #fbbf24;
          box-shadow: 0 2px 16px rgba(168,85,247,0.2);
        }
        .srv__name { font-weight: 600; }
        .srv__live {
          font-size: 0.52rem; font-weight: 800; color: #4ade80;
          background: rgba(34,197,94,0.18); padding: 2px 6px;
          border-radius: 4px; letter-spacing: 0.6px;
        }
        .pl__server-hint {
          margin: 10px 0 0; font-size: 0.7rem; color: rgba(255,255,255,0.22);
        }

        .pl__ep-nav { display: flex; gap: 10px; justify-content: center; }
        .ep-nav {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 20px; background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 10px;
          color: rgba(255,255,255,0.5); text-decoration: none;
          font-size: 0.78rem; font-weight: 600; transition: all 0.25s ease;
        }
        .ep-nav:hover { background: rgba(168,85,247,0.1); color: #fff; transform: translateY(-1px); }
        .ep-nav--next {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent; color: #fff;
        }
        .ep-nav--next:hover { box-shadow: 0 6px 20px rgba(168,85,247,0.35); }

        .pl__empty {
          display: flex; justify-content: center; align-items: center;
          min-height: 60vh; color: rgba(255,255,255,0.3);
        }

        @media (max-width: 768px) {
          .pl__frame { aspect-ratio: auto; height: 55vh; border-radius: 0; }
          .pl__player-wrap { padding: 0; }
          .pl__frame-overlay { border-radius: 0; }
          .pl__selector-panel { max-width: 100%; margin-top: 0; max-height: 100vh; border-radius: 0; }
          .pl__selector-header { padding: 20px 20px 12px; }
          .pl__season-tabs { padding: 0 20px 16px; }
          .pl__episodes { padding: 0 12px 16px; }
          .pl__ep-thumb { width: 64px; height: 40px; }
          .pl__ep-num-large { font-size: 1.1rem; }
          .pl__selector-btn { padding: 8px 12px; }
          .pl__selector-btn svg + * { display: none; }
          .ep-nav { padding: 8px 14px; font-size: 0.72rem; }
        }
      `}</style>
    </div>
  );
}
