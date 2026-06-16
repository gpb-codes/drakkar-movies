import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, getImageUrl } from '../services/tmdb';
import { useWatchlistContext } from '../context/WatchlistContext';
import { useI18n } from '../context/I18nContext';
import { addToHistory } from '../services/history';
import LoadingSpinner from '../components/LoadingSpinner';
import type { OmdbMovie } from '../types/tmdb';

function parseActors(actors: string): { name: string }[] {
  if (!actors || actors === 'N/A') return [];
  return actors.split(', ').map(name => ({ name: name.trim() }));
}

function parseProduction(prod: string): string[] {
  if (!prod || prod === 'N/A') return [];
  return prod.split(' · ').map(s => s.trim());
}

const AVATAR_COLORS = [
  '#a855f7','#60a5fa','#fbbf24','#4ade80','#f97316',
  '#ec4899','#14b8a6','#ef4444','#8b5cf6','#06b6d4',
  '#f59e0b','#10b981',
];

function getRatingColor(value: string): string {
  const num = parseFloat(value);
  if (!isNaN(num)) {
    if (num >= 75 || num >= 7.5) return '#4ade80';
    if (num >= 50 || num >= 5.5) return '#fbbf24';
    return '#ef4444';
  }
  return '#fbbf24';
}

export default function Detail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [detail, setDetail] = useState<OmdbMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleWatchlist, isInWatchlist } = useWatchlistContext();
  const { t } = useI18n();
  const castRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdb.getById(id);
        if (data.Response === 'True') {
          setDetail(data);
          addToHistory({
            id: data.imdbID,
            media_type: (type === 'series' ? 'tv' : 'movie') as 'movie' | 'tv',
            title: data.Title,
            poster_path: data.Poster,
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
    window.scrollTo(0, 0);
  }, [id, type]);

  if (loading) return <LoadingSpinner />;
  if (!detail) return (
    <div className="dp">
      <div className="dp__empty">
        <div className="dp__empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <p>{t('detail.noEncontrado')}</p>
      </div>
    </div>
  );

  const mediaType = type as 'movie' | 'tv';
  const inWatchlist = isInWatchlist(detail.imdbID, mediaType);
  const actors = parseActors(detail.Actors);
  const directors = detail.Director !== 'N/A' ? detail.Director.split(', ') : [];
  const writers = detail.Writer !== 'N/A'
    ? detail.Writer.split(', ').filter((w: string) => !w.includes('(story') && !w.includes('(screenplay') && !w.includes('(written')).slice(0, 3)
    : [];
  const production = parseProduction(detail.Production);
  const scoreNum = parseFloat(detail.imdbRating) || 0;
  const scoreColor = scoreNum >= 7.5 ? '#4ade80' : scoreNum >= 5.5 ? '#fbbf24' : '#ef4444';

  return (
    <div className="dp">
      {/* === HERO BACKDROP === */}
      <div className="dp__hero-bg">
        <img
          src={getImageUrl(detail.Poster)}
          alt=""
          className="dp__hero-img"
          loading="eager"
        />
        <div className="dp__hero-layer dp__hero-layer--vignette" />
        <div className="dp__hero-layer dp__hero-layer--depth" />
        <div className="dp__hero-layer dp__hero-layer--fade" />
        <div className="dp__hero-noise" />
      </div>

      {/* === MAIN CONTENT === */}
      <div className="dp__content">

        {/* --- HERO SECTION --- */}
        <div className="dp__hero">
          <div className="dp__poster-wrapper">
            <div className="dp__poster-ring" />
            <div className="dp__poster">
              <img
                src={getImageUrl(detail.Poster)}
                alt={detail.Title}
                loading="eager"
              />
            </div>
            <div className="dp__poster-reflection" />
          </div>

          <div className="dp__hero-info">
            {/* Title */}
            <div className="dp__title-block">
              {detail.Year && <span className="dp__year-badge">{detail.Year}</span>}
              <h1 className="dp__title">{detail.Title}</h1>
            </div>
            {detail.Tagline && (
              <p className="dp__tagline">"{detail.Tagline}"</p>
            )}

            {/* Badges */}
            <div className="dp__badges">
              {detail.Rated !== 'N/A' && (
                <span className="dp__badge dp__badge--rated">{detail.Rated}</span>
              )}
              {detail.Runtime !== 'N/A' && (
                <span className="dp__badge dp__badge--runtime">{detail.Runtime}</span>
              )}
              {detail.Type === 'series' && detail.totalSeasons && (
                <span className="dp__badge dp__badge--seasons">
                  {detail.totalSeasons} {t('detail.temporadas')}
                </span>
              )}
              {detail.Year && (
                <span className="dp__badge dp__badge--type">
                  {detail.Type === 'series' ? 'TV' : 'Film'}
                </span>
              )}
            </div>

            {/* Score */}
            {detail.imdbRating !== 'N/A' && (
              <div className="dp__score">
                <div className="dp__score-ring-wrap">
                  <svg viewBox="0 0 120 120" className="dp__score-svg">
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={scoreColor} />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                      <filter id="scoreGlow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke="url(#scoreGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${scoreNum * 3.267} 326.7`}
                      className="dp__score-arc"
                      filter="url(#scoreGlow)"
                    />
                  </svg>
                  <span className="dp__score-value">{detail.imdbRating}</span>
                </div>
                <div className="dp__score-meta">
                  <div className="dp__score-source">IMDb</div>
                  <div className="dp__score-votes">{detail.imdbVotes} {t('detail.votos')}</div>
                </div>
              </div>
            )}

            {/* Genres */}
            {detail.Genre !== 'N/A' && (
              <div className="dp__genres">
                {detail.Genre.split(', ').map((g: string) => (
                  <Link key={g} to={`/genre/${g}`} className="dp__genre-chip">{g}</Link>
                ))}
              </div>
            )}

            {/* Plot */}
            <p className="dp__plot">{detail.Plot}</p>

            {/* Actions */}
            <div className="dp__actions">
              <Link to={`/player/${mediaType}/${detail.imdbID}`} className="dp-btn dp-btn--play">
                <div className="dp-btn__play-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <div className="dp-btn__play-text">
                  <span className="dp-btn__label">
                    {detail.Type === 'series' ? t('detail.verSerie') : t('detail.verPelicula')}
                  </span>
                  <span className="dp-btn__sub">{t('detail.reproducir')}</span>
                </div>
              </Link>

              <button
                className={`dp-btn dp-btn--list ${inWatchlist ? 'dp-btn--listed' : ''}`}
                onClick={() => toggleWatchlist({
                  id: detail.imdbID,
                  media_type: mediaType,
                  title: detail.Title,
                  poster_path: detail.Poster,
                })}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {inWatchlist
                    ? <path d="M20 6L9 17l-5-5" />
                    : <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />}
                </svg>
                {inWatchlist ? t('detail.enMiLista') : t('detail.miLista')}
              </button>

              {detail.Website && detail.Website !== 'N/A' && (
                <a href={detail.Website} target="_blank" rel="noopener noreferrer" className="dp-btn dp-btn--web">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {t('detail.sitioWeb')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* --- INFO GRID --- */}
        <section className="dp__section dp__section--animate">
          <h2 className="dp__section-heading">
            <span className="dp__section-heading-text">{t('detail.informacion')}</span>
            <span className="dp__section-heading-line" />
          </h2>
          <div className="dp__info-grid">
            {detail.Runtime !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="dp__info-card-data">
                  <span className="dp__info-card-label">{t('detail.duracion')}</span>
                  <span className="dp__info-card-value">{detail.Runtime}</span>
                </div>
              </div>
            )}
            {detail.Released !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="dp__info-card-data">
                  <span className="dp__info-card-label">{t('detail.estreno')}</span>
                  <span className="dp__info-card-value">{detail.Released}</span>
                </div>
              </div>
            )}
            {detail.BoxOffice && detail.BoxOffice !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="dp__info-card-data">
                  <span className="dp__info-card-label">{t('detail.recaudacion')}</span>
                  <span className="dp__info-card-value">{detail.BoxOffice}</span>
                </div>
              </div>
            )}
            {detail.Language !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="dp__info-card-data">
                  <span className="dp__info-card-label">{t('detail.idioma')}</span>
                  <span className="dp__info-card-value">{detail.Language}</span>
                </div>
              </div>
            )}
            {detail.Country !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="dp__info-card-data">
                  <span className="dp__info-card-label">{t('detail.pais')}</span>
                  <span className="dp__info-card-value">{detail.Country}</span>
                </div>
              </div>
            )}
            {detail.Awards !== 'N/A' && (
              <div className="dp__info-card dp__info-card--full">
                <div className="dp__info-card-icon dp__info-card-icon--gold">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                <div className="dp__info-card-data">
                  <span className="dp__info-card-label">{t('detail.premios')}</span>
                  <span className="dp__info-card-value">{detail.Awards}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* --- CAST --- */}
        {actors.length > 0 && (
          <section className="dp__section dp__section--animate">
            <h2 className="dp__section-heading">
              <span className="dp__section-heading-text">{t('detail.reparto')} ({actors.length})</span>
              <span className="dp__section-heading-line" />
            </h2>
            <div className="dp__cast-scroll" ref={castRef}>
              <div className="dp__cast-track">
                {actors.map((a, i) => {
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const initials = a.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                  return (
                    <div key={i} className="dp__cast-card" style={{ '--cast-color': color } as React.CSSProperties}>
                      <div className="dp__cast-avatar" style={{ background: `linear-gradient(135deg, ${color}25, ${color}0a)`, borderColor: color + '30' }}>
                        <span style={{ color }}>{initials}</span>
                      </div>
                      <div className="dp__cast-name">{a.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* --- CREW --- */}
        {(directors.length > 0 || writers.length > 0) && (
          <section className="dp__section dp__section--animate">
            <h2 className="dp__section-heading">
              <span className="dp__section-heading-text">{t('detail.equipo')}</span>
              <span className="dp__section-heading-line" />
            </h2>
            <div className="dp__crew-grid">
              {directors.map((d, i) => (
                <div key={`d-${i}`} className="dp__crew-card dp__crew-card--director">
                  <div className="dp__crew-avatar dp__crew-avatar--director">
                    <span>{d.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="dp__crew-info">
                    <div className="dp__crew-name">{d}</div>
                    <div className="dp__crew-role">{t('detail.director')}</div>
                  </div>
                </div>
              ))}
              {writers.map((w, i) => (
                <div key={`w-${i}`} className="dp__crew-card dp__crew-card--writer">
                  <div className="dp__crew-avatar dp__crew-avatar--writer">
                    <span>{w.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="dp__crew-info">
                    <div className="dp__crew-name">{w}</div>
                    <div className="dp__crew-role">{t('detail.guionista')}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- PRODUCTION --- */}
        {production.length > 0 && (
          <section className="dp__section dp__section--animate">
            <h2 className="dp__section-heading">
              <span className="dp__section-heading-text">{t('detail.produccion')}</span>
              <span className="dp__section-heading-line" />
            </h2>
            <div className="dp__prod-list">
              {production.map((p, i) => (
                <span key={i} className="dp__prod-tag">{p}</span>
              ))}
            </div>
          </section>
        )}

        {/* --- RATINGS --- */}
        {detail.Ratings && detail.Ratings.length > 0 && (
          <section className="dp__section dp__section--animate">
            <h2 className="dp__section-heading">
              <span className="dp__section-heading-text">{t('detail.calificaciones')}</span>
              <span className="dp__section-heading-line" />
            </h2>
            <div className="dp__ratings-row">
              {detail.Ratings.map((r, i) => {
                const color = getRatingColor(r.Value);
                const sourceName = r.Source
                  .replace('Internet Movie Database', 'IMDb')
                  .replace('Rotten Tomatoes', 'Rotten Tomatoes')
                  .replace('Metacritic', 'Metacritic');
                return (
                  <div key={i} className="dp__rating-card" style={{ '--rating-color': color } as React.CSSProperties}>
                    <div className="dp__rating-icon" style={{ background: color + '18', color }}>
                      {r.Source.includes('IMDb') && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      )}
                      {r.Source.includes('Rotten') && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                      )}
                      {r.Source.includes('Metacritic') && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                      )}
                    </div>
                    <div className="dp__rating-data">
                      <span className="dp__rating-source">{sourceName}</span>
                      <span className="dp__rating-value">{r.Value}</span>
                    </div>
                  </div>
                );
              })}
              {detail.Metascore && detail.Metascore !== 'N/A' && (
                <div className="dp__rating-card dp__rating-card--meta" style={{ '--rating-color': getRatingColor(detail.Metascore) } as React.CSSProperties}>
                  <div className="dp__rating-icon" style={{ background: getRatingColor(detail.Metascore) + '18', color: getRatingColor(detail.Metascore) }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
                  </div>
                  <div className="dp__rating-data">
                    <span className="dp__rating-source">Metacritic</span>
                    <span className="dp__rating-value">{detail.Metascore}</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- LANGUAGE --- */}
        <section className="dp__section dp__section--animate">
          <h2 className="dp__section-heading">
            <span className="dp__section-heading-text">{t('detail.idiomasDisponibles')}</span>
            <span className="dp__section-heading-line" />
          </h2>
          <div className="dp__lang-grid">
            <div className="dp__lang-card">
              <div className="dp__lang-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
              <div className="dp__lang-card-text">
                <span className="dp__lang-card-label">{t('detail.audioOriginal')}</span>
                <span className="dp__lang-card-value">{detail.Language !== 'N/A' ? detail.Language : '—'}</span>
              </div>
            </div>
            <div className="dp__lang-card">
              <div className="dp__lang-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="dp__lang-card-text">
                <span className="dp__lang-card-label">{t('detail.subtitulos')}</span>
                <span className="dp__lang-card-value">{t('detail.disponibleEnReproductor')}</span>
              </div>
            </div>
            <div className="dp__lang-card dp__lang-card--tip">
              <div className="dp__lang-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18h6" />
                  <path d="M10 22h4" />
                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                </svg>
              </div>
              <div className="dp__lang-card-text">
                <span className="dp__lang-card-label">{t('detail.cambiarIdioma')}</span>
                <span className="dp__lang-card-value">{t('detail.usarConfigReproductor')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER SPACER --- */}
        <div className="dp__footer-spacer" />
      </div>

      {/* === GLOBAL STYLES === */}
      <style>{`
        /* ========================================
           DETAIL PAGE — PREMIUM DESIGN SYSTEM
           ======================================== */

        /* --- Reset & Base --- */
        .dp {
          --dp-purple: #a855f7;
          --dp-purple-dark: #7c3aed;
          --dp-gold: #fbbf24;
          --dp-blue: #60a5fa;
          --dp-green: #4ade80;
          --dp-red: #ef4444;
          --dp-orange: #f97316;
          --dp-pink: #ec4899;
          --dp-surface: rgba(255,255,255,0.04);
          --dp-surface-hover: rgba(255,255,255,0.08);
          --dp-border: rgba(255,255,255,0.06);
          --dp-border-hover: rgba(255,255,255,0.12);
          --dp-text: rgba(255,255,255,0.92);
          --dp-text-muted: rgba(255,255,255,0.55);
          --dp-text-dim: rgba(255,255,255,0.3);
          --dp-radius: 16px;
          --dp-radius-sm: 10px;
          --dp-radius-pill: 999px;
          --dp-blur: 20px;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          color: var(--dp-text);
        }

        .dp__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 70vh;
          gap: 20px;
          color: var(--dp-text-dim);
        }
        .dp__empty-icon { opacity: 0.3; }
        .dp__empty p { font-size: 1.1rem; font-weight: 500; }

        /* --- Hero Background --- */
        .dp__hero-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        .dp__hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(60px) brightness(0.2) saturate(1.6);
          transform: scale(1.4);
          will-change: transform;
        }
        .dp__hero-layer {
          position: absolute;
          inset: 0;
        }
        .dp__hero-layer--vignette {
          background: radial-gradient(ellipse 120% 80% at 50% 30%, transparent 0%, rgba(0,0,0,0.5) 100%);
        }
        .dp__hero-layer--depth {
          background: linear-gradient(
            180deg,
            rgba(7,4,21,0.1) 0%,
            rgba(7,4,21,0.5) 35%,
            rgba(7,4,21,0.85) 60%,
            #070415 80%
          );
        }
        .dp__hero-layer--fade {
          background: linear-gradient(0deg, #070415 0%, transparent 15%);
        }
        .dp__hero-noise {
          position: absolute;
          inset: 0;
          opacity: 0.015;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
          pointer-events: none;
        }

        /* --- Content Wrapper --- */
        .dp__content {
          position: relative;
          z-index: 1;
          padding: clamp(20px, 5vw, 80px) clamp(16px, 4vw, 64px) 0;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* --- Hero Section --- */
        .dp__hero {
          display: flex;
          gap: clamp(32px, 4vw, 56px);
          align-items: flex-start;
          animation: dpSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes dpSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Poster --- */
        .dp__poster-wrapper {
          flex-shrink: 0;
          width: 280px;
          position: relative;
        }
        .dp__poster {
          position: relative;
          border-radius: var(--dp-radius);
          overflow: hidden;
          box-shadow:
            0 20px 60px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.08);
        }
        .dp__poster img {
          width: 100%;
          display: block;
          aspect-ratio: 2/3;
          object-fit: cover;
        }
        .dp__poster-ring {
          position: absolute;
          inset: -3px;
          border-radius: calc(var(--dp-radius) + 3px);
          background: linear-gradient(135deg, rgba(168,85,247,0.4), transparent 40%, transparent 60%, rgba(251,191,36,0.3));
          z-index: -1;
          animation: dpRingPulse 4s ease-in-out infinite;
        }
        @keyframes dpRingPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .dp__poster-reflection {
          position: absolute;
          bottom: -40px;
          left: 10%;
          right: 10%;
          height: 40px;
          background: linear-gradient(180deg, rgba(168,85,247,0.12) 0%, transparent 100%);
          filter: blur(20px);
          pointer-events: none;
        }

        /* --- Hero Info --- */
        .dp__hero-info { flex: 1; min-width: 0; }

        .dp__title-block {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .dp__year-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.08));
          border: 1px solid rgba(168,85,247,0.25);
          border-radius: var(--dp-radius-pill);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--dp-purple);
          letter-spacing: 0.5px;
          backdrop-filter: blur(10px);
        }
        .dp__title {
          font-size: clamp(2rem, 5vw, 3.4rem);
          font-weight: 900;
          margin: 0;
          line-height: 1.05;
          letter-spacing: -0.02em;
          text-shadow: 0 0 60px rgba(168,85,247,0.15);
        }
        .dp__tagline {
          font-style: italic;
          color: rgba(251,191,36,0.5);
          margin: 0 0 16px;
          font-size: 0.88rem;
          letter-spacing: 0.3px;
        }

        /* --- Badges --- */
        .dp__badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .dp__badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 14px;
          border-radius: var(--dp-radius-pill);
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          backdrop-filter: blur(12px);
        }
        .dp__badge--rated {
          background: rgba(251,191,36,0.1);
          color: var(--dp-gold);
          border: 1px solid rgba(251,191,36,0.2);
        }
        .dp__badge--runtime {
          background: rgba(96,165,250,0.1);
          color: var(--dp-blue);
          border: 1px solid rgba(96,165,250,0.2);
        }
        .dp__badge--seasons {
          background: rgba(74,222,128,0.1);
          color: var(--dp-green);
          border: 1px solid rgba(74,222,128,0.2);
        }
        .dp__badge--type {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* --- Score --- */
        .dp__score {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: var(--dp-radius);
          width: fit-content;
          backdrop-filter: blur(10px);
        }
        .dp__score-ring-wrap {
          position: relative;
          width: 72px;
          height: 72px;
        }
        .dp__score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .dp__score-arc {
          transition: stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dp__score-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          font-weight: 900;
          color: var(--dp-gold);
          text-shadow: 0 0 20px rgba(251,191,36,0.3);
        }
        .dp__score-meta { display: flex; flex-direction: column; gap: 2px; }
        .dp__score-source {
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .dp__score-votes {
          font-size: 0.7rem;
          color: var(--dp-text-dim);
        }

        /* --- Genres --- */
        .dp__genres {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .dp__genre-chip {
          padding: 6px 16px;
          background: rgba(96,165,250,0.08);
          border: 1px solid rgba(96,165,250,0.18);
          border-radius: var(--dp-radius-pill);
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--dp-blue);
          text-decoration: none;
          transition: all 0.25s;
          backdrop-filter: blur(8px);
        }
        .dp__genre-chip:hover {
          background: rgba(96,165,250,0.18);
          border-color: rgba(96,165,250,0.35);
          transform: translateY(-1px);
        }

        /* --- Plot --- */
        .dp__plot {
          color: var(--dp-text-muted);
          line-height: 1.8;
          margin: 0 0 28px;
          font-size: 0.92rem;
          max-width: 600px;
        }

        /* --- Action Buttons --- */
        .dp__actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .dp-btn {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 14px 24px;
          border: none;
          border-radius: var(--dp-radius);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }

        .dp-btn--play {
          background: linear-gradient(135deg, var(--dp-purple), var(--dp-purple-dark));
          color: #fff;
          box-shadow:
            0 8px 32px rgba(168,85,247,0.35),
            0 0 0 1px rgba(168,85,247,0.2) inset;
          padding: 16px 32px;
        }
        .dp-btn--play::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .dp-btn--play:hover::before { opacity: 1; }
        .dp-btn--play:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow:
            0 16px 48px rgba(168,85,247,0.5),
            0 0 0 1px rgba(168,85,247,0.3) inset;
        }
        .dp-btn__play-icon {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .dp-btn__play-text { display: flex; flex-direction: column; }
        .dp-btn__label { font-size: 1rem; font-weight: 700; }
        .dp-btn__sub { font-size: 0.68rem; opacity: 0.7; font-weight: 400; }

        .dp-btn--list {
          background: var(--dp-surface);
          border: 1px solid var(--dp-border);
          color: rgba(255,255,255,0.7);
          backdrop-filter: blur(12px);
        }
        .dp-btn--list:hover {
          background: var(--dp-surface-hover);
          border-color: var(--dp-border-hover);
          color: #fff;
          transform: translateY(-2px);
        }
        .dp-btn--listed {
          background: rgba(74,222,128,0.1);
          border-color: rgba(74,222,128,0.25);
          color: var(--dp-green);
        }
        .dp-btn--listed:hover {
          background: rgba(74,222,128,0.18);
          border-color: rgba(74,222,128,0.4);
          color: var(--dp-green);
        }

        .dp-btn--web {
          background: rgba(96,165,250,0.08);
          border: 1px solid rgba(96,165,250,0.18);
          color: var(--dp-blue);
          backdrop-filter: blur(12px);
        }
        .dp-btn--web:hover {
          background: rgba(96,165,250,0.16);
          transform: translateY(-2px);
        }

        /* --- Section --- */
        .dp__section {
          margin-top: 56px;
        }
        .dp__section--animate {
          animation: dpSectionIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: 0.1s;
        }
        @keyframes dpSectionIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dp__section-heading {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .dp__section-heading-text {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--dp-gold);
          text-transform: uppercase;
          letter-spacing: 2.5px;
          white-space: nowrap;
        }
        .dp__section-heading-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(251,191,36,0.15), transparent);
        }

        /* --- Info Grid --- */
        .dp__info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .dp__info-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid var(--dp-border);
          border-radius: var(--dp-radius-sm);
          transition: all 0.3s;
          backdrop-filter: blur(8px);
        }
        .dp__info-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border-color: var(--dp-border-hover);
          transform: translateY(-2px);
        }
        .dp__info-card--full {
          grid-column: 1 / -1;
        }
        .dp__info-card-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border-radius: var(--dp-radius-sm);
          flex-shrink: 0;
          color: var(--dp-text-muted);
        }
        .dp__info-card-icon--gold {
          color: var(--dp-gold);
          background: rgba(251,191,36,0.1);
        }
        .dp__info-card-data { display: flex; flex-direction: column; gap: 3px; }
        .dp__info-card-label {
          font-size: 0.58rem;
          font-weight: 700;
          color: var(--dp-text-dim);
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }
        .dp__info-card-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--dp-text);
          line-height: 1.4;
        }

        /* --- Cast (Horizontal Scroll) --- */
        .dp__cast-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          margin: 0 calc(-1 * clamp(16px, 4vw, 64px));
          padding: 16px clamp(16px, 4vw, 64px) 24px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .dp__cast-scroll::-webkit-scrollbar { display: none; }
        .dp__cast-track {
          display: flex;
          gap: 12px;
          width: max-content;
        }
        .dp__cast-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 16px;
          width: 110px;
          background: var(--dp-surface);
          border: 1px solid var(--dp-border);
          border-radius: var(--dp-radius);
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        .dp__cast-card:hover {
          background: rgba(var(--cast-color), 0.08);
          border-color: var(--dp-border-hover);
          transform: translateY(-6px) scale(1.04);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
        }
        .dp__cast-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.82rem;
          font-weight: 800;
          transition: all 0.3s;
        }
        .dp__cast-card:hover .dp__cast-avatar {
          transform: scale(1.12);
          box-shadow: 0 4px 24px rgba(168,85,247,0.25);
        }
        .dp__cast-name {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--dp-text-muted);
          line-height: 1.3;
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.3s;
        }
        .dp__cast-card:hover .dp__cast-name { color: var(--dp-text); }

        /* --- Crew --- */
        .dp__crew-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .dp__crew-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: var(--dp-surface);
          border: 1px solid var(--dp-border);
          border-radius: var(--dp-radius-sm);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dp__crew-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .dp__crew-card--director {
          border-color: rgba(168,85,247,0.15);
        }
        .dp__crew-card--director:hover {
          background: rgba(168,85,247,0.06);
          border-color: rgba(168,85,247,0.3);
        }
        .dp__crew-card--writer {
          border-color: rgba(251,191,36,0.1);
        }
        .dp__crew-card--writer:hover {
          background: rgba(251,191,36,0.05);
          border-color: rgba(251,191,36,0.25);
        }
        .dp__crew-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .dp__crew-avatar--director {
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05));
          border: 2px solid rgba(168,85,247,0.2);
          color: var(--dp-purple);
        }
        .dp__crew-avatar--writer {
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05));
          border: 2px solid rgba(251,191,36,0.15);
          color: var(--dp-gold);
        }
        .dp__crew-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .dp__crew-name {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--dp-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dp__crew-role {
          font-size: 0.58rem;
          font-weight: 700;
          color: var(--dp-text-dim);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* --- Production Tags --- */
        .dp__prod-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .dp__prod-tag {
          padding: 8px 18px;
          background: var(--dp-surface);
          border: 1px solid var(--dp-border);
          border-radius: var(--dp-radius-pill);
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--dp-text-muted);
          transition: all 0.25s;
          backdrop-filter: blur(8px);
        }
        .dp__prod-tag:hover {
          background: var(--dp-surface-hover);
          border-color: var(--dp-border-hover);
          color: var(--dp-text);
        }

        /* --- Ratings --- */
        .dp__ratings-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dp__rating-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid var(--dp-border);
          border-radius: var(--dp-radius-sm);
          min-width: 140px;
          transition: all 0.3s;
          backdrop-filter: blur(8px);
        }
        .dp__rating-card:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          transform: translateY(-2px);
        }
        .dp__rating-card--meta {
          border-color: rgba(251,191,36,0.12);
        }
        .dp__rating-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .dp__rating-data { display: flex; flex-direction: column; gap: 2px; }
        .dp__rating-source {
          font-size: 0.58rem;
          font-weight: 700;
          color: var(--dp-text-dim);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .dp__rating-value {
          font-size: 1rem;
          font-weight: 800;
          color: var(--dp-gold);
        }

        /* --- Language Cards --- */
        .dp__lang-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }
        .dp__lang-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: var(--dp-surface);
          border: 1px solid var(--dp-border);
          border-radius: var(--dp-radius-sm);
          transition: all 0.3s;
          backdrop-filter: blur(8px);
        }
        .dp__lang-card:hover {
          background: var(--dp-surface-hover);
          transform: translateY(-2px);
        }
        .dp__lang-card--tip {
          background: rgba(168,85,247,0.05);
          border-color: rgba(168,85,247,0.12);
        }
        .dp__lang-card--tip:hover {
          background: rgba(168,85,247,0.1);
          border-color: rgba(168,85,247,0.25);
        }
        .dp__lang-card-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border-radius: var(--dp-radius-sm);
          flex-shrink: 0;
          color: var(--dp-text-muted);
        }
        .dp__lang-card--tip .dp__lang-card-icon { color: var(--dp-purple); }
        .dp__lang-card-text { display: flex; flex-direction: column; gap: 3px; }
        .dp__lang-card-label {
          font-size: 0.58rem;
          font-weight: 700;
          color: var(--dp-text-dim);
          text-transform: uppercase;
          letter-spacing: 1.2px;
        }
        .dp__lang-card-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--dp-text);
          line-height: 1.4;
        }

        /* --- Footer Spacer --- */
        .dp__footer-spacer { height: 80px; }

        /* === RESPONSIVE === */
        @media (max-width: 768px) {
          .dp__hero {
            flex-direction: column;
            align-items: center;
          }
          .dp__poster-wrapper { width: 200px; }
          .dp__title { font-size: 1.9rem; text-align: center; }
          .dp__title-block { justify-content: center; }
          .dp__tagline { text-align: center; }
          .dp__badges { justify-content: center; }
          .dp__score { justify-content: center; width: 100%; }
          .dp__genres { justify-content: center; }
          .dp__plot { text-align: center; max-width: none; }
          .dp__actions { flex-direction: column; width: 100%; }
          .dp-btn { justify-content: center; width: 100%; }
          .dp__info-grid { grid-template-columns: 1fr; }
          .dp__crew-grid { grid-template-columns: 1fr; }
          .dp__lang-grid { grid-template-columns: 1fr; }
          .dp__ratings-row { flex-direction: column; }
          .dp__rating-card { min-width: 0; width: 100%; }
        }

        @media (max-width: 480px) {
          .dp__poster-wrapper { width: 160px; }
          .dp__title { font-size: 1.5rem; }
          .dp__score-ring-wrap { width: 60px; height: 60px; }
          .dp__score-value { font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
}
