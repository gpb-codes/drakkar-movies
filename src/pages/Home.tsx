import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tmdb, getImageUrl } from '../services/tmdb';
import ScrollRow from '../components/ScrollRow';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../context/I18nContext';
import { getHistory, removeFromHistory, type HistoryEntry } from '../services/history';
import type { OmdbSearchResult, OmdbMovie } from '../types/tmdb';

const HERO_TITLES = [
  { q: 'batman', label: 'Batman' },
  { q: 'avengers', label: 'Avengers' },
  { q: 'matrix', label: 'Matrix' },
  { q: 'interstellar', label: 'Interstellar' },
  { q: 'godfather', label: 'Godfather' },
  { q: 'inception', label: 'Inception' },
];

export default function Home() {
  const { t } = useI18n();
  const [featured, setFeatured] = useState<OmdbMovie | null>(null);
  const [popular, setPopular] = useState<OmdbSearchResult[]>([]);
  const [topRated, setTopRated] = useState<OmdbSearchResult[]>([]);
  const [series, setSeries] = useState<OmdbSearchResult[]>([]);
  const [action, setAction] = useState<OmdbSearchResult[]>([]);
  const [scifi, setScifi] = useState<OmdbSearchResult[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [heroes, setHeroes] = useState<OmdbMovie[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setHistory(getHistory());
    async function load() {
      try {
        const [p, t, s, a, sc] = await Promise.all([
          tmdb.getPopular(), tmdb.getTopRated(), tmdb.getPopularTV(),
          tmdb.getByGenre('Action'), tmdb.getByGenre('Sci-Fi'),
        ]);
        setPopular(p.Search || []);
        setTopRated(t.Search || []);
        setSeries(s.Search || []);
        setAction(a.Search || []);
        setScifi(sc.Search || []);

        const details = await Promise.all(
          HERO_TITLES.map(h => tmdb.getByTitle(h.q).catch(() => null))
        );
        const valid = (details.filter(Boolean) as OmdbMovie[]).filter(d => d.Response === 'True');
        setHeroes(valid);
        if (valid.length > 0) setFeatured(valid[0]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  useEffect(() => {
    if (heroes.length <= 1) return;
    const start = () => {
      timer.current = window.setInterval(() => {
        setSlide(p => { const n = (p + 1) % heroes.length; setFeatured(heroes[n]); return n; });
      }, 6000);
    };
    start();
    return () => clearInterval(timer.current);
  }, [heroes]);

  const go = (i: number) => {
    setSlide(i);
    setFeatured(heroes[i]);
    clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setSlide(p => { const n = (p + 1) % heroes.length; setFeatured(heroes[n]); return n; });
    }, 6000);
  };

  const handleRemoveHistory = useCallback((id: string) => {
    removeFromHistory(id);
    setHistory(getHistory());
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="home">
      {featured && (
        <section className="hero">
          <div className="hero__bg" key={featured.imdbID}>
            <img src={getImageUrl(featured.Poster)} alt={featured.Title} />
            <div className="hero__vignette" />
          </div>

          <div className="hero__main" key={`m-${featured.imdbID}`}>
            <div className="hero__accent" />
            <div className="hero__tag">
              <span className="hero__diamond">&#9670;</span>
              {t('home.destacado')}
            </div>
            <h1 className="hero__title">{featured.Title}</h1>
            <div className="hero__meta">
              {featured.imdbRating !== 'N/A' && (
                <span className="hero__score">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span>{featured.imdbRating}</span>
                </span>
              )}
              <span className="hero__sep">·</span>
              <span className="hero__year">{featured.Year}</span>
              <span className="hero__sep">·</span>
              {featured.Runtime !== 'N/A' && <span className="hero__runtime">{featured.Runtime}</span>}
              {featured.Rated !== 'N/A' && <><span className="hero__sep">·</span><span className="hero__cert">{featured.Rated}</span></>}
            </div>
            <p className="hero__desc">{featured.Plot}</p>
            <div className="hero__tags">
              {featured.Genre?.split(', ').map((g: string) => (
                <span key={g} className="hero__genre">{g}</span>
              ))}
            </div>
            <div className="hero__btns">
              <Link to={`/detail/${featured.Type === 'series' ? 'tv' : 'movie'}/${featured.imdbID}`} className="btn btn--primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {t('home.verAhora')}
              </Link>
              <Link to={`/detail/${featured.Type === 'series' ? 'tv' : 'movie'}/${featured.imdbID}`} className="btn btn--glass">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                {t('home.masInfo')}
              </Link>
            </div>
          </div>

          <div className="hero__rail">
            {heroes.map((m: OmdbMovie, i: number) => (
              <button key={m.imdbID} className={`hero__pick ${i === slide ? 'hero__pick--on' : ''}`} onClick={() => go(i)}>
                <img src={getImageUrl(m.Poster)} alt={m.Title} />
                <div className="hero__pick-info">
                  <span className="hero__pick-name">{m.Title}</span>
                  <span className="hero__pick-year">{m.Year}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="hero__bar"><div className="hero__bar-fill" key={slide} /></div>
        </section>
      )}

      <div className="home__body">
        {history.length > 0 && (
          <section className="home__section home__continue">
            <h2 className="home__label">{t('detail.seguirViendo')}</h2>
            <div className="home__continue-track">
              {history.slice(0, 12).map(h => (
                <div key={h.id} className="cw-card">
                  <Link to={h.media_type === 'tv' && h.season && h.episode
                    ? `/player/tv/${h.id}/${h.season}/${h.episode}`
                    : `/detail/${h.media_type}/${h.id}`
                  } className="cw-card__link">
                    <img src={getImageUrl(h.poster_path)} alt={h.title} loading="lazy" />
                    <div className="cw-card__overlay">
                      <div className="cw-card__play">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    </div>
                    <div className="cw-card__gradient" />
                    <div className="cw-card__progress">
                      <div className="cw-card__progress-fill" style={{ width: `${Math.min(95, 20 + Math.random() * 75)}%` }} />
                    </div>
                  </Link>
                  <button className="cw-card__remove" onClick={() => handleRemoveHistory(h.id)} title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                  <div className="cw-card__info">
                    <span className="cw-card__title">{h.title}</span>
                    {h.media_type === 'tv' && h.season && h.episode && (
                      <span className="cw-card__ep">T{h.season} E{h.episode}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <ScrollRow title={t('home.populares')} movies={popular} />
        <ScrollRow title={t('home.topRated')} movies={topRated} />
        <ScrollRow title={t('home.series')} movies={series} />
        <ScrollRow title={t('home.accion')} movies={action} />
        <ScrollRow title={t('home.scifi')} movies={scifi} />

        <section className="home__section home__genres">
          <h2 className="home__label">{t('home.exploraGenero')}</h2>
          <div className="home__genre-grid">
            {[
              { id: 'Action', c: '#ef4444', k: 'genre.accion', icon: '&#9876;' },
              { id: 'Comedy', c: '#fbbf24', k: 'genre.comedia', icon: '&#9786;' },
              { id: 'Drama', c: '#a855f7', k: 'genre.drama', icon: '&#9830;' },
              { id: 'Horror', c: '#22c55e', k: 'genre.terror', icon: '&#9760;' },
              { id: 'Sci-Fi', c: '#3b82f6', k: 'genre.scifi', icon: '&#9733;' },
              { id: 'Thriller', c: '#f97316', k: 'genre.thriller', icon: '&#9670;' },
              { id: 'Animation', c: '#ec4899', k: 'genre.animacion', icon: '&#9733;' },
              { id: 'Romance', c: '#d946ef', k: 'genre.romance', icon: '&#9829;' },
              { id: 'Fantasy', c: '#14b8a6', k: 'genre.fantasia', icon: '&#10022;' },
              { id: 'Crime', c: '#6366f1', k: 'genre.crimen', icon: '&#9878;' },
            ].map(g => (
              <Link key={g.id} to={`/genre/${g.id}`} className="gtile" style={{ '--gc': g.c } as React.CSSProperties}>
                <div className="gtile__glow" />
                <span className="gtile__icon" dangerouslySetInnerHTML={{ __html: g.icon }} />
                <span className="gtile__name">{t(g.k)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .home { min-height: 100vh; }

        /* ─── Hero ─── */
        .hero {
          position: relative;
          height: 90vh;
          min-height: 560px;
          display: flex;
          overflow: hidden;
        }

        .hero__bg {
          position: absolute;
          inset: 0;
          animation: heroFade 0.8s ease-out;
        }
        @keyframes heroFade { from { opacity: 0; } to { opacity: 1; } }

        .hero__bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(4px) brightness(0.3) saturate(1.5);
          transform: scale(1.12);
          animation: heroZoom 10s ease-out forwards;
        }
        @keyframes heroZoom { to { transform: scale(1.02); } }

        .hero__vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 30% 90%, transparent 0%, rgba(6,2,15,0.5) 65%),
            linear-gradient(180deg, rgba(6,2,15,0.15) 0%, rgba(6,2,15,0.6) 50%, var(--bg-primary) 100%),
            linear-gradient(90deg, rgba(6,2,15,0.95) 0%, rgba(6,2,15,0.65) 35%, transparent 65%);
        }

        .hero__main {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 clamp(24px, 6vw, 80px) 80px;
          max-width: 640px;
          animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero__accent {
          width: 48px;
          height: 3px;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-gold));
          border-radius: 2px;
          margin-bottom: 20px;
          box-shadow: 0 0 20px rgba(168,85,247,0.4);
        }

        .hero__tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          background: rgba(168,85,247,0.1);
          border: 1px solid rgba(168,85,247,0.15);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--accent-purple);
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 18px;
          width: fit-content;
        }
        .hero__diamond { font-size: 0.5rem; }

        .hero__title {
          font-size: clamp(2.4rem, 5.8vw, 4.2rem);
          font-weight: 900;
          color: #fff;
          margin: 0 0 16px;
          line-height: 1.02;
          letter-spacing: -1px;
          text-shadow: 0 2px 30px rgba(0,0,0,0.4);
        }

        .hero__meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-weight: 500;
        }
        .hero__score {
          display: flex;
          align-items: center;
          gap: 5px;
          font-weight: 700;
          color: var(--accent-gold);
        }
        .hero__score span { text-shadow: 0 0 12px rgba(251,191,36,0.3); }
        .hero__sep { opacity: 0.25; font-size: 0.6rem; }
        .hero__year, .hero__runtime { color: var(--text-secondary); }
        .hero__cert {
          padding: 2px 8px;
          border: 1px solid rgba(168,85,247,0.2);
          border-radius: 4px;
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--accent-purple);
          backdrop-filter: blur(4px);
        }

        .hero__desc {
          color: rgba(240,238,245,0.7);
          font-size: 0.92rem;
          line-height: 1.7;
          margin: 0 0 18px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 520px;
        }

        .hero__tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
        .hero__genre {
          padding: 5px 13px;
          background: rgba(96,165,250,0.07);
          border: 1px solid rgba(96,165,250,0.1);
          border-radius: 20px;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--accent-blue);
          backdrop-filter: blur(4px);
          transition: all 0.25s;
        }
        .hero__genre:hover {
          background: rgba(96,165,250,0.15);
          border-color: rgba(96,165,250,0.25);
        }

        .hero__btns { display: flex; gap: 12px; }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 30px;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-smooth);
          letter-spacing: 0.3px;
        }
        .btn--primary {
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark));
          color: #fff;
          box-shadow:
            0 4px 24px rgba(168,85,247,0.35),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .btn--primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 8px 40px rgba(168,85,247,0.5),
            inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .btn--glass {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--text-primary);
          backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .btn--glass:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }

        /* Side picks */
        .hero__rail {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 90px 16px 80px 0;
          justify-content: center;
          align-items: flex-end;
        }
        .hero__pick {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px 6px 6px;
          background: rgba(255,255,255,0.02);
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 220px;
          backdrop-filter: blur(8px);
        }
        .hero__pick:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.06);
        }
        .hero__pick--on {
          background: rgba(168,85,247,0.12);
          border-color: rgba(168,85,247,0.25);
          box-shadow: 0 0 20px rgba(168,85,247,0.1);
        }
        .hero__pick img {
          width: 38px;
          height: 52px;
          object-fit: cover;
          border-radius: 5px;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .hero__pick-info { text-align: left; min-width: 0; }
        .hero__pick-name {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 140px;
        }
        .hero__pick--on .hero__pick-name { color: var(--text-primary); }
        .hero__pick-year { font-size: 0.56rem; color: var(--text-muted); }

        .hero__bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.04);
          z-index: 3;
        }
        .hero__bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-gold));
          animation: barFill 6s linear;
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 12px rgba(168,85,247,0.4);
        }
        @keyframes barFill { from { width: 0; } to { width: 100%; } }

        /* ─── Body ─── */
        .home__body { padding: 20px 0 80px; }
        .home__section { margin-bottom: 44px; }

        .home__label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 18px;
          padding: 0 clamp(16px, 4vw, 48px);
        }

        /* ─── Continue Watching (Netflix-style horizontal scroll) ─── */
        .home__continue-track {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 8px clamp(16px, 4vw, 48px) 16px;
          scrollbar-width: none;
          scroll-snap-type: x proximity;
        }
        .home__continue-track::-webkit-scrollbar { display: none; }

        .cw-card {
          position: relative;
          flex-shrink: 0;
          width: 200px;
          scroll-snap-align: start;
        }
        .cw-card__link {
          display: block;
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 2/3;
          text-decoration: none;
        }
        .cw-card__link img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cw-card:hover .cw-card__link img { transform: scale(1.05); }

        .cw-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 30%, rgba(6,2,15,0.85) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.35s;
        }
        .cw-card:hover .cw-card__overlay { opacity: 1; }

        .cw-card__play {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(168,85,247,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow:
            0 4px 24px rgba(168,85,247,0.5),
            0 0 40px rgba(168,85,247,0.2);
          transform: scale(0.8);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .cw-card:hover .cw-card__play { transform: scale(1); }

        .cw-card__gradient {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, transparent 0%, rgba(6,2,15,0.9) 100%);
          pointer-events: none;
        }

        .cw-card__progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.1);
          z-index: 1;
        }
        .cw-card__progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a855f7, #fbbf24);
          border-radius: 0 2px 2px 0;
          transition: width 0.4s;
          box-shadow: 0 0 8px rgba(168,85,247,0.4);
        }

        .cw-card__remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50%;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          opacity: 0;
          transition: all 0.25s;
          z-index: 3;
        }
        .cw-card:hover .cw-card__remove { opacity: 1; }
        .cw-card__remove:hover {
          background: rgba(239,68,68,0.85);
          border-color: rgba(239,68,68,0.5);
          color: #fff;
          transform: scale(1.1);
        }

        .cw-card__info {
          padding: 10px 4px 4px;
        }
        .cw-card__title {
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 3px;
        }
        .cw-card__ep {
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--accent-purple-light, #c084fc);
          letter-spacing: 0.8px;
        }

        /* ─── Genre Grid ─── */
        .home__genres { }
        .home__genre-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .gtile {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .gtile__glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          background: radial-gradient(circle at 20% 50%, color-mix(in srgb, var(--gc) 12%, transparent), transparent 70%);
          transition: opacity 0.35s;
          pointer-events: none;
        }
        .gtile:hover .gtile__glow { opacity: 1; }
        .gtile:hover {
          background: color-mix(in srgb, var(--gc) 8%, var(--bg-card));
          border-color: color-mix(in srgb, var(--gc) 20%, transparent);
          transform: translateY(-3px);
          box-shadow:
            0 4px 20px color-mix(in srgb, var(--gc) 15%, transparent),
            0 0 30px color-mix(in srgb, var(--gc) 8%, transparent);
        }
        .gtile__icon {
          font-size: 1.1rem;
          color: var(--gc);
          filter: drop-shadow(0 0 6px color-mix(in srgb, var(--gc) 30%, transparent));
          transition: filter 0.3s;
          flex-shrink: 0;
          z-index: 1;
        }
        .gtile:hover .gtile__icon {
          filter: drop-shadow(0 0 12px color-mix(in srgb, var(--gc) 50%, transparent));
        }
        .gtile__name {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: color 0.25s;
          z-index: 1;
        }
        .gtile:hover .gtile__name { color: #fff; }

        /* ─── Responsive ─── */
        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            height: auto;
            min-height: auto;
          }
          .hero__bg {
            position: relative;
            height: 58vh;
            min-height: 320px;
          }
          .hero__main {
            padding: 20px 16px 40px;
            max-width: none;
          }
          .hero__title {
            font-size: clamp(1.8rem, 7vw, 2.6rem);
            letter-spacing: -0.5px;
          }
          .hero__rail {
            flex-direction: row;
            padding: 0 16px 16px;
            overflow-x: auto;
            scrollbar-width: none;
            gap: 8px;
          }
          .hero__rail::-webkit-scrollbar { display: none; }
          .hero__pick { max-width: 170px; }
          .hero__btns { flex-direction: column; gap: 10px; }
          .btn { justify-content: center; width: 100%; padding: 13px 24px; }
          .home__genre-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 8px;
          }
          .cw-card { width: 150px; }
          .home__label { font-size: 0.66rem; }
        }

        @media (max-width: 480px) {
          .hero__main { padding: 16px 14px 32px; }
          .hero__desc { font-size: 0.82rem; }
          .hero__meta { font-size: 0.72rem; }
          .home__genre-grid {
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 6px;
          }
          .gtile { padding: 10px 12px; gap: 8px; }
          .gtile__name { font-size: 0.68rem; }
          .cw-card { width: 130px; }
        }
      `}</style>
    </div>
  );
}
