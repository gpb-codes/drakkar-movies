import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tmdb, getImageUrl } from '../services/tmdb';
import { useWatchlistContext } from '../context/WatchlistContext';
import { useI18n } from '../context/I18nContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { OmdbMovie } from '../types/tmdb';

function addToHistory(movie: OmdbMovie, type: string) {
  try {
    const raw = localStorage.getItem('drakkar-history');
    const list: { id: string; media_type: string; title: string; poster_path: string; viewed_at: number }[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(h => h.id !== movie.imdbID);
    filtered.unshift({
      id: movie.imdbID,
      media_type: type === 'series' ? 'tv' : 'movie',
      title: movie.Title,
      poster_path: movie.Poster,
      viewed_at: Date.now(),
    });
    localStorage.setItem('drakkar-history', JSON.stringify(filtered.slice(0, 30)));
  } catch {}
}

function parseActors(actors: string): { name: string }[] {
  if (!actors || actors === 'N/A') return [];
  return actors.split(', ').map(name => ({ name: name.trim() }));
}

function parseProduction(prod: string): string[] {
  if (!prod || prod === 'N/A') return [];
  return prod.split(' · ').map(s => s.trim());
}

export default function Detail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [detail, setDetail] = useState<OmdbMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggleWatchlist, isInWatchlist } = useWatchlistContext();
  const { t } = useI18n();

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdb.getById(id);
        if (data.Response === 'True') {
          setDetail(data);
          addToHistory(data, type || 'movie');
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
    window.scrollTo(0, 0);
  }, [id, type]);

  if (loading) return <LoadingSpinner />;
  if (!detail) return <div className="dp"><div className="dp__empty"><p>{t('detail.noEncontrado')}</p></div></div>;

  const mediaType = type as 'movie' | 'tv';
  const inWatchlist = isInWatchlist(detail.imdbID, mediaType);
  const actors = parseActors(detail.Actors);
  const directors = detail.Director !== 'N/A' ? detail.Director.split(', ') : [];
  const writers = detail.Writer !== 'N/A' ? detail.Writer.split(', ').filter((w: string) => !w.includes('(story') && !w.includes('(screenplay') && !w.includes('(written')).slice(0, 3) : [];
  const production = parseProduction(detail.Production);

  return (
    <div className="dp">
      <div className="dp__bg">
        <img src={getImageUrl(detail.Poster)} alt={detail.Title} />
        <div className="dp__gradient" />
      </div>

      <div className="dp__wrap">
        <div className="dp__hero">
          <div className="dp__poster">
            <img src={getImageUrl(detail.Poster)} alt={detail.Title} />
            <div className="dp__poster-glow" />
          </div>

          <div className="dp__info">
            <h1 className="dp__title">{detail.Title}</h1>
            {detail.Tagline && <p className="dp__tagline">"{detail.Tagline}"</p>}

            <div className="dp__badges">
              {detail.Year && <span className="dp__badge dp__badge--year">{detail.Year}</span>}
              {detail.Rated !== 'N/A' && <span className="dp__badge dp__badge--rated">{detail.Rated}</span>}
              {detail.Runtime !== 'N/A' && <span className="dp__badge dp__badge--runtime">{detail.Runtime}</span>}
              {detail.Type === 'series' && detail.totalSeasons && (
                <span className="dp__badge dp__badge--seasons">{detail.totalSeasons} {t('detail.temporadas')}</span>
              )}
            </div>

            {detail.imdbRating !== 'N/A' && (
              <div className="dp__score">
                <div className="dp__score-circle">
                  <svg viewBox="0 0 36 36" className="dp__score-ring">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="url(#scoreGrad)" strokeWidth="2.5"
                      strokeDasharray={`${parseFloat(detail.imdbRating) * 10}, 100`}
                      strokeLinecap="round" />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="dp__score-num">{detail.imdbRating}</span>
                </div>
                <div className="dp__score-label">
                  <span>IMDb</span>
                  <small>{detail.imdbVotes} {t('detail.votos')}</small>
                </div>
              </div>
            )}

            {detail.Genre !== 'N/A' && (
              <div className="dp__genres">
                {detail.Genre.split(', ').map((g: string) => (
                  <Link key={g} to={`/genre/${g}`} className="dp__genre">{g}</Link>
                ))}
              </div>
            )}

            <p className="dp__plot">{detail.Plot}</p>

            <div className="dp__actions">
              <Link to={`/player/${mediaType}/${detail.imdbID}`} className="dp-btn dp-btn--watch">
                <div className="dp-btn__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div className="dp-btn__text">
                  <span className="dp-btn__label">{detail.Type === 'series' ? t('detail.verSerie') : t('detail.verPelicula')}</span>
                  <span className="dp-btn__sub">{t('detail.reproducir')}</span>
                </div>
              </Link>

              <button className={`dp-btn dp-btn--list ${inWatchlist ? 'dp-btn--listed' : ''}`}
                onClick={() => toggleWatchlist({ id: detail.imdbID, media_type: mediaType, title: detail.Title, poster_path: detail.Poster })}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {inWatchlist ? <path d="M20 6L9 17l-5-5" /> : <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />}
                </svg>
                {inWatchlist ? t('detail.enMiLista') : t('detail.miLista')}
              </button>

              {detail.Website && detail.Website !== 'N/A' && (
                <a href={detail.Website} target="_blank" rel="noopener noreferrer" className="dp-btn dp-btn--web">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  {t('detail.sitioWeb')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="dp__section">
          <h2 className="dp__section-title">{t('detail.informacion')}</h2>
          <div className="dp__info-grid">
            {detail.Runtime !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-icon">🎬</div>
                <div className="dp__info-label">{t('detail.duracion')}</div>
                <div className="dp__info-value">{detail.Runtime}</div>
              </div>
            )}
            {detail.Released !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-icon">📅</div>
                <div className="dp__info-label">{t('detail.estreno')}</div>
                <div className="dp__info-value">{detail.Released}</div>
              </div>
            )}
            {detail.BoxOffice && detail.BoxOffice !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-icon">💰</div>
                <div className="dp__info-label">{t('detail.recaudacion')}</div>
                <div className="dp__info-value">{detail.BoxOffice}</div>
              </div>
            )}
            {detail.Language !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-icon">🌐</div>
                <div className="dp__info-label">{t('detail.idioma')}</div>
                <div className="dp__info-value">{detail.Language}</div>
              </div>
            )}
            {detail.Country !== 'N/A' && (
              <div className="dp__info-card">
                <div className="dp__info-icon">🌍</div>
                <div className="dp__info-label">{t('detail.pais')}</div>
                <div className="dp__info-value">{detail.Country}</div>
              </div>
            )}
            {detail.Awards !== 'N/A' && (
              <div className="dp__info-card dp__info-card--full">
                <div className="dp__info-icon">🏆</div>
                <div className="dp__info-label">{t('detail.premios')}</div>
                <div className="dp__info-value">{detail.Awards}</div>
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {actors.length > 0 && (
          <div className="dp__section">
            <h2 className="dp__section-title">{t('detail.reparto')}</h2>
            <div className="dp__cast-grid">
              {actors.slice(0, 12).map((a, i) => {
                const colors = ['#a855f7','#60a5fa','#fbbf24','#4ade80','#f97316','#ec4899','#14b8a6','#ef4444','#8b5cf6','#06b6d4','#f59e0b','#10b981'];
                const color = colors[i % colors.length];
                return (
                  <div key={i} className="dp__cast-card">
                    <div className="dp__cast-avatar" style={{ borderColor: color + '40', background: `linear-gradient(135deg, ${color}20, ${color}08)` }}>
                      <span style={{ color }}>{a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div className="dp__cast-name">{a.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Language & Availability */}
        <div className="dp__section">
          <h2 className="dp__section-title">{t('detail.idiomasDisponibles')}</h2>
          <div className="dp__lang-info">
            <div className="dp__lang-card">
              <div className="dp__lang-icon">🔊</div>
              <div className="dp__lang-text">
                <div className="dp__lang-label">{t('detail.audioOriginal')}</div>
                <div className="dp__lang-value">{detail.Language !== 'N/A' ? detail.Language : 'No especificado'}</div>
              </div>
            </div>
            <div className="dp__lang-card">
              <div className="dp__lang-icon">💬</div>
              <div className="dp__lang-text">
                <div className="dp__lang-label">{t('detail.subtitulos')}</div>
                <div className="dp__lang-value">{t('detail.disponibleEnReproductor')}</div>
              </div>
            </div>
            <div className="dp__lang-card dp__lang-card--tip">
              <div className="dp__lang-icon">💡</div>
              <div className="dp__lang-text">
                <div className="dp__lang-label">{t('detail.cambiarIdioma')}</div>
                <div className="dp__lang-value">{t('detail.usarConfigReproductor')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Directors & Writers */}
        {(directors.length > 0 || writers.length > 0) && (
          <div className="dp__section">
            <h2 className="dp__section-title">{t('detail.equipo')}</h2>
            <div className="dp__crew-grid">
              {directors.map((d, i) => (
                <div key={`d-${i}`} className="dp__crew-card">
                  <div className="dp__crew-avatar dp__crew-avatar--director">
                    <span>{d.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="dp__crew-name">{d}</div>
                  <div className="dp__crew-role">{t('detail.director')}</div>
                </div>
              ))}
              {writers.map((w, i) => (
                <div key={`w-${i}`} className="dp__crew-card">
                  <div className="dp__crew-avatar">
                    <span>{w.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                  </div>
                  <div className="dp__crew-name">{w}</div>
                  <div className="dp__crew-role">{t('detail.guionista')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Production */}
        {production.length > 0 && (
          <div className="dp__section">
            <h2 className="dp__section-title">{t('detail.produccion')}</h2>
            <div className="dp__prod-list">
              {production.map((p, i) => (
                <span key={i} className="dp__prod-tag">{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Ratings */}
        {detail.Ratings && detail.Ratings.length > 0 && (
          <div className="dp__section">
            <h2 className="dp__section-title">{t('detail.calificaciones')}</h2>
            <div className="dp__ratings">
              {detail.Ratings.map((r, i) => (
                <div key={i} className="dp__rating-card">
                  <span className="dp__rating-src">{r.Source.replace('Internet Movie Database', 'IMDb').replace('Rotten Tomatoes', 'Rotten Tomatoes').replace('Metacritic', 'Metacritic')}</span>
                  <span className="dp__rating-val">{r.Value}</span>
                </div>
              ))}
              {detail.Metascore && detail.Metascore !== 'N/A' && (
                <div className="dp__rating-card dp__rating-card--meta">
                  <span className="dp__rating-src">Metacritic</span>
                  <span className="dp__rating-val">{detail.Metascore}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dp { min-height: 100vh; position: relative; }
        .dp__bg {
          position: absolute;
          inset: 0;
          height: 65vh;
          overflow: hidden;
        }
        .dp__bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(50px) brightness(0.25) saturate(1.4);
          transform: scale(1.3);
        }
        .dp__gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(7,4,21,0.3) 0%, rgba(7,4,21,0.7) 60%, #070415 100%);
        }
        .dp__wrap {
          position: relative;
          z-index: 2;
          padding: 90px clamp(16px, 4vw, 48px) 60px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .dp__hero {
          display: flex;
          gap: 48px;
          align-items: flex-start;
          animation: dpFadeIn 0.6s ease-out;
        }
        @keyframes dpFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Poster */
        .dp__poster {
          flex-shrink: 0;
          width: 280px;
          position: relative;
        }
        .dp__poster img {
          width: 100%;
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.6);
        }
        .dp__poster-glow {
          position: absolute;
          bottom: -24px;
          left: 24px;
          right: 24px;
          height: 80px;
          background: radial-gradient(ellipse, rgba(168,85,247,0.25) 0%, transparent 70%);
          filter: blur(24px);
        }

        /* Info */
        .dp__info { flex: 1; }
        .dp__title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          color: #fff;
          margin: 0 0 8px;
          line-height: 1.1;
        }
        .dp__tagline {
          font-style: italic;
          color: rgba(168,85,247,0.5);
          margin: 0 0 12px;
          font-size: 0.85rem;
        }

        .dp__badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .dp__badge {
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .dp__badge--year { background: rgba(168,85,247,0.15); color: #a855f7; border: 1px solid rgba(168,85,247,0.25); }
        .dp__badge--rated { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }
        .dp__badge--runtime { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
        .dp__badge--seasons { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.25); }

        /* Score */
        .dp__score {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .dp__score-circle {
          position: relative;
          width: 64px;
          height: 64px;
        }
        .dp__score-ring { width: 100%; height: 100%; transform: rotate(-90deg); }
        .dp__score-num {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 900;
          color: #fbbf24;
        }
        .dp__score-label {
          display: flex;
          flex-direction: column;
        }
        .dp__score-label span {
          font-size: 0.75rem;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
        }
        .dp__score-label small {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.3);
        }

        .dp__genres {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .dp__genre {
          padding: 5px 14px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 24px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #60a5fa;
          text-decoration: none;
          transition: all 0.2s;
        }
        .dp__genre:hover { background: rgba(59, 130, 246, 0.2); }

        .dp__plot {
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          margin: 0 0 24px;
          font-size: 0.92rem;
        }

        /* Actions */
        .dp__actions { display: flex; gap: 12px; flex-wrap: wrap; }

        .dp-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border: none;
          border-radius: 14px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dp-btn--watch {
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          color: #fff;
          box-shadow: 0 8px 32px rgba(168, 85, 247, 0.35);
          padding: 16px 32px;
        }
        .dp-btn--watch:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 14px 44px rgba(168, 85, 247, 0.5);
        }
        .dp-btn__icon {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dp-btn__text { display: flex; flex-direction: column; }
        .dp-btn__label { font-size: 1rem; font-weight: 700; }
        .dp-btn__sub { font-size: 0.68rem; opacity: 0.7; font-weight: 400; }

        .dp-btn--list {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
        }
        .dp-btn--list:hover { background: rgba(255,255,255,0.12); color: #fff; transform: translateY(-2px); }
        .dp-btn--listed {
          background: rgba(34,197,94,0.12);
          border-color: rgba(34,197,94,0.25);
          color: #4ade80;
        }

        .dp-btn--web {
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          color: #60a5fa;
        }
        .dp-btn--web:hover { background: rgba(59,130,246,0.2); transform: translateY(-2px); }

        .dp__empty {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
          color: rgba(255,255,255,0.3);
        }

        /* Sections */
        .dp__section {
          margin-top: 48px;
          animation: dpFadeIn 0.6s ease-out;
        }
        .dp__section-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-gold);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(251,191,36,0.1);
        }

        /* Info Grid */
        .dp__info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
        }
        .dp__info-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }
        .dp__info-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }
        .dp__info-card--full { grid-column: 1 / -1; }
        .dp__info-icon { font-size: 1.2rem; margin-bottom: 8px; }
        .dp__info-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .dp__info-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
          line-height: 1.4;
        }

        /* Cast */
        .dp__cast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }
        .dp__cast-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          text-align: center;
          transition: all 0.25s;
        }
        .dp__cast-card:hover {
          background: rgba(168,85,247,0.08);
          border-color: rgba(168,85,247,0.15);
          transform: translateY(-4px);
        }
        .dp__cast-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          transition: all 0.3s;
        }
        .dp__cast-card:hover .dp__cast-avatar {
          transform: scale(1.1);
          box-shadow: 0 4px 20px rgba(168,85,247,0.3);
        }
        .dp__cast-name {
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
          line-height: 1.3;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Crew */
        .dp__crew-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 12px;
        }
        .dp__crew-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          text-align: center;
          transition: all 0.25s;
        }
        .dp__crew-card:hover {
          background: rgba(251,191,36,0.06);
          border-color: rgba(251,191,36,0.12);
          transform: translateY(-4px);
        }
        .dp__crew-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(168,85,247,0.1));
          border: 2px solid rgba(251,191,36,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-gold);
        }
        .dp__crew-avatar--director {
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(251,191,36,0.1));
          border-color: rgba(168,85,247,0.2);
          color: var(--accent-purple-light);
        }
        .dp__crew-name {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }
        .dp__crew-role {
          font-size: 0.6rem;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Production */
        .dp__prod-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dp__prod-tag {
          padding: 8px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          transition: all 0.2s;
        }
        .dp__prod-tag:hover { background: rgba(255,255,255,0.08); color: #fff; }

        /* Language Info */
        .dp__lang-info {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }
        .dp__lang-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          transition: all 0.2s;
        }
        .dp__lang-card:hover { background: rgba(255,255,255,0.05); }
        .dp__lang-card--tip {
          background: rgba(168,85,247,0.06);
          border-color: rgba(168,85,247,0.12);
        }
        .dp__lang-icon {
          font-size: 1.4rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          flex-shrink: 0;
        }
        .dp__lang-text { display: flex; flex-direction: column; gap: 2px; }
        .dp__lang-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .dp__lang-value {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255,255,255,0.85);
        }

        /* Ratings */
        .dp__ratings {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .dp__rating-card {
          padding: 14px 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 100px;
          transition: all 0.2s;
        }
        .dp__rating-card:hover { background: rgba(255,255,255,0.06); }
        .dp__rating-card--meta { border-color: rgba(251,191,36,0.15); }
        .dp__rating-src {
          font-size: 0.58rem;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .dp__rating-val {
          font-size: 1rem;
          font-weight: 800;
          color: #fbbf24;
        }

        @media (max-width: 768px) {
          .dp__hero { flex-direction: column; align-items: center; }
          .dp__poster { width: 200px; }
          .dp__title { font-size: 1.8rem; text-align: center; }
          .dp__wrap { padding-top: 80px; }
          .dp__genres, .dp__badges, .dp__score { justify-content: center; }
          .dp__actions { flex-direction: column; }
          .dp-btn { justify-content: center; width: 100%; }
          .dp__cast-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
          .dp__crew-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
          .dp__info-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
