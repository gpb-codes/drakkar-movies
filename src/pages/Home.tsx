import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { tmdb, getImageUrl } from '../services/tmdb';
import ScrollRow from '../components/ScrollRow';
import LoadingSpinner from '../components/LoadingSpinner';
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
  const [featured, setFeatured] = useState<OmdbMovie | null>(null);
  const [popular, setPopular] = useState<OmdbSearchResult[]>([]);
  const [topRated, setTopRated] = useState<OmdbSearchResult[]>([]);
  const [series, setSeries] = useState<OmdbSearchResult[]>([]);
  const [action, setAction] = useState<OmdbSearchResult[]>([]);
  const [scifi, setScifi] = useState<OmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [heroes, setHeroes] = useState<OmdbMovie[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
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
            <div className="hero__tag">&#9670; Destacado</div>
            <h1 className="hero__title">{featured.Title}</h1>
            <div className="hero__row">
              {featured.imdbRating !== 'N/A' && (
                <span className="hero__score">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {featured.imdbRating}
                </span>
              )}
              <span className="hero__sep">·</span>
              <span>{featured.Year}</span>
              <span className="hero__sep">·</span>
              {featured.Runtime !== 'N/A' && <span>{featured.Runtime}</span>}
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
                Ver Ahora
              </Link>
              <Link to={`/detail/${featured.Type === 'series' ? 'tv' : 'movie'}/${featured.imdbID}`} className="btn btn--glass">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                Más Info
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
        <ScrollRow title="Películas Populares" movies={popular} />
        <ScrollRow title="Top Rated" movies={topRated} />
        <ScrollRow title="Series" movies={series} />
        <ScrollRow title="Acción" movies={action} />
        <ScrollRow title="Ciencia Ficción" movies={scifi} />

        <div className="home__genres">
          <h2 className="home__label">Explora por Género</h2>
          <div className="home__genre-grid">
            {[
              { id: 'Action', n: 'Acción', i: '🔥', c: '#ef4444' },
              { id: 'Comedy', n: 'Comedia', i: '😂', c: '#fbbf24' },
              { id: 'Drama', n: 'Drama', i: '🎭', c: '#a855f7' },
              { id: 'Horror', n: 'Terror', i: '👻', c: '#22c55e' },
              { id: 'Sci-Fi', n: 'Sci-Fi', i: '🚀', c: '#3b82f6' },
              { id: 'Thriller', n: 'Thriller', i: '🔪', c: '#f97316' },
              { id: 'Animation', n: 'Animación', i: '✨', c: '#ec4899' },
              { id: 'Romance', n: 'Romance', i: '💜', c: '#a855f7' },
              { id: 'Fantasy', n: 'Fantasía', i: '🧙', c: '#14b8a6' },
              { id: 'Crime', n: 'Crimen', i: '🔍', c: '#6366f1' },
            ].map(g => (
              <Link key={g.id} to={`/genre/${g.id}`} className="gtile" style={{ '--gc': g.c } as React.CSSProperties}>
                <span className="gtile__icon">{g.i}</span>
                <span className="gtile__name">{g.n}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .home { min-height: 100vh; }

        /* ─── Hero ─── */
        .hero {
          position: relative;
          height: 88vh;
          min-height: 540px;
          display: flex;
          overflow: hidden;
        }
        .hero__bg {
          position: absolute;
          inset: 0;
          animation: heroFade 0.6s ease-out;
        }
        @keyframes heroFade { from { opacity: 0; } to { opacity: 1; } }
        .hero__bg img {
          width: 100%; height: 100%;
          object-fit: cover;
          filter: blur(3px) brightness(0.35) saturate(1.4);
          transform: scale(1.1);
          animation: heroZoom 8s ease-out forwards;
        }
        @keyframes heroZoom { to { transform: scale(1.04); } }
        .hero__vignette {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 30% 80%, transparent 0%, rgba(6,2,15,0.4) 60%),
            linear-gradient(180deg, rgba(6,2,15,0.1) 0%, rgba(6,2,15,0.55) 50%, var(--bg-primary) 100%),
            linear-gradient(90deg, rgba(6,2,15,0.92) 0%, rgba(6,2,15,0.6) 30%, transparent 60%);
        }

        .hero__main {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 0 clamp(20px, 5vw, 64px) 70px;
          max-width: 620px;
          animation: slideUp 0.7s ease-out;
        }
        .hero__accent {
          width: 40px; height: 3px;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-gold));
          border-radius: 2px;
          margin-bottom: 16px;
        }
        .hero__tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          background: rgba(168,85,247,0.12);
          border: 1px solid rgba(168,85,247,0.15);
          border-radius: 20px;
          font-size: 0.58rem;
          font-weight: 700;
          color: var(--accent-purple);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 14px;
          width: fit-content;
        }
        .hero__title {
          font-size: clamp(2.2rem, 5.5vw, 3.8rem);
          font-weight: 900;
          color: #fff;
          margin: 0 0 12px;
          line-height: 1.02;
          letter-spacing: -0.5px;
        }
        .hero__row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .hero__score { display: flex; align-items: center; gap: 4px; font-weight: 700; color: var(--accent-gold); }
        .hero__sep { opacity: 0.3; }
        .hero__cert {
          padding: 1px 6px;
          border: 1px solid rgba(168,85,247,0.2);
          border-radius: 3px;
          font-size: 0.65rem;
          color: var(--accent-purple);
        }
        .hero__desc {
          color: var(--text-secondary);
          font-size: 0.88rem;
          line-height: 1.65;
          margin: 0 0 14px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .hero__tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 24px; }
        .hero__genre {
          padding: 4px 11px;
          background: rgba(96,165,250,0.08);
          border: 1px solid rgba(96,165,250,0.12);
          border-radius: 20px;
          font-size: 0.66rem;
          font-weight: 600;
          color: var(--accent-blue);
        }
        .hero__btns { display: flex; gap: 10px; }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 26px;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all var(--transition-smooth);
        }
        .btn--primary {
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark));
          color: #fff;
          box-shadow: 0 4px 24px rgba(168,85,247,0.3);
        }
        .btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(168,85,247,0.45); }
        .btn--glass {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-primary);
          backdrop-filter: blur(8px);
        }
        .btn--glass:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

        /* Side picks */
        .hero__rail {
          position: relative; z-index: 3;
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 80px 14px 70px 0;
          justify-content: center;
        }
        .hero__pick {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px;
          background: rgba(255,255,255,0.02);
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          max-width: 200px;
        }
        .hero__pick:hover { background: rgba(255,255,255,0.05); }
        .hero__pick--on {
          background: rgba(168,85,247,0.1);
          border-color: rgba(168,85,247,0.2);
        }
        .hero__pick img {
          width: 36px; height: 50px;
          object-fit: cover;
          border-radius: 5px;
          flex-shrink: 0;
        }
        .hero__pick-info { text-align: left; min-width: 0; }
        .hero__pick-name {
          display: block;
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hero__pick-year { font-size: 0.55rem; color: var(--text-muted); }

        .hero__bar {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: rgba(255,255,255,0.03);
          z-index: 3;
        }
        .hero__bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-gold));
          animation: barFill 6s linear;
          border-radius: 0 1px 1px 0;
        }
        @keyframes barFill { from { width: 0; } to { width: 100%; } }

        /* ─── Body ─── */
        .home__body { padding: 16px 0 60px; }
        .home__genres { padding: 16px clamp(16px, 4vw, 48px) 0; }
        .home__label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .home__genre-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 8px;
        }
        .gtile {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: all 0.25s;
        }
        .gtile:hover {
          background: color-mix(in srgb, var(--gc) 10%, transparent);
          border-color: color-mix(in srgb, var(--gc) 20%, transparent);
          transform: translateY(-2px);
        }
        .gtile__icon { font-size: 1.1rem; }
        .gtile__name { font-size: 0.76rem; font-weight: 600; color: var(--text-secondary); }
        .gtile:hover .gtile__name { color: #fff; }

        @media (max-width: 768px) {
          .hero { flex-direction: column; height: auto; min-height: auto; }
          .hero__bg { position: relative; height: 55vh; min-height: 300px; }
          .hero__main { padding: 16px 16px 36px; max-width: none; }
          .hero__rail { flex-direction: row; padding: 0 16px 16px; overflow-x: auto; }
          .hero__pick { max-width: 160px; }
          .hero__btns { flex-direction: column; }
          .btn { justify-content: center; width: 100%; }
          .home__genre-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); }
        }
      `}</style>
    </div>
  );
}
