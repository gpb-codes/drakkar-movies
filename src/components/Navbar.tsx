import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWatchlistContext } from '../context/WatchlistContext';
import { useI18n } from '../context/I18nContext';
import { DONATION_CONFIG } from '../config';

const GENRES = [
  { id: 'Action', color: '#ef4444' },
  { id: 'Comedy', color: '#fbbf24' },
  { id: 'Drama', color: '#a855f7' },
  { id: 'Horror', color: '#22c55e' },
  { id: 'Sci-Fi', color: '#3b82f6' },
  { id: 'Thriller', color: '#f97316' },
  { id: 'Animation', color: '#ec4899' },
  { id: 'Romance', color: '#d946ef' },
  { id: 'Fantasy', color: '#14b8a6' },
  { id: 'Crime', color: '#6366f1' },
];

const GENRE_KEYS: Record<string, string> = {
  Action: 'genre.accion',
  Comedy: 'genre.comedia',
  Drama: 'genre.drama',
  Horror: 'genre.terror',
  'Sci-Fi': 'genre.scifi',
  Thriller: 'genre.thriller',
  Animation: 'genre.animacion',
  Romance: 'genre.romance',
  Fantasy: 'genre.fantasia',
  Crime: 'genre.crimen',
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const { watchlist } = useWatchlistContext();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 120 && y > lastY);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setGenresOpen(false);
  }, [location]);

  const handleGenre = (genre: string) => navigate(`/genre/${genre}`);

  return (
    <>
      <nav className={`nb ${scrolled ? 'nb--solid' : ''} ${hidden ? 'nb--hidden' : ''}`}>
        <Link to="/" className="nb__brand">
          <div className="nb__logo">
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#c084fc"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
              <rect width="36" height="36" rx="10" fill="url(#lg1)"/>
              <path d="M11 9L18 18L11 27" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 9L25 18L18 27" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
            </svg>
          </div>
          <div className="nb__wordmark">
            <span className="nb__name">DRAKKAR</span>
            <span className="nb__sub">MOVIES</span>
          </div>
        </Link>

        <div className={`nb__nav ${mobileOpen ? 'nb__nav--open' : ''}`}>
          <Link to="/" className={`nb__item ${location.pathname === '/' ? 'nb__item--on' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            {t('nav.inicio')}
          </Link>
          <Link to="/series" className={`nb__item ${location.pathname === '/series' ? 'nb__item--on' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
            {t('nav.series')}
          </Link>
          <Link to="/upcoming" className={`nb__item ${location.pathname === '/upcoming' ? 'nb__item--on' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {t('nav.estrenos')}
          </Link>
          <Link to="/watchlist" className={`nb__item ${location.pathname === '/watchlist' ? 'nb__item--on' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            {t('nav.miLista')}
            {watchlist.length > 0 && <span className="nb__dot">{watchlist.length}</span>}
          </Link>

          <div className="nb__drop" onMouseEnter={() => setGenresOpen(true)} onMouseLeave={() => setGenresOpen(false)}>
            <button className={`nb__item nb__item--btn ${genresOpen ? 'nb__item--on' : ''}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              {t('nav.categorias')}
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div className={`nb__panel ${genresOpen ? 'nb__panel--show' : ''}`}>
              {GENRES.map(g => (
                <button key={g.id} className="nb__genre" onClick={() => handleGenre(g.id)}>
                  <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill={g.color}/></svg>
                  <span>{t(GENRE_KEYS[g.id])}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="nb__actions">
          <button className="nb__lang" onClick={() => setLang(lang === 'es' ? 'en' : 'es')} title={lang === 'es' ? 'English' : 'Español'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            <span>{lang === 'es' ? 'EN' : 'ES'}</span>
          </button>
          <a href={DONATION_CONFIG.paypalUrl} target="_blank" rel="noopener noreferrer" className="nb__donate" title={t('donate.apoya')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {t('nav.donar')}
          </a>
          <Link to="/search" className="nb__search" aria-label={t('nav.buscar')}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </Link>
          <button className="nb__burger" onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('nav.menu')}>
            <span className={`nb__bar ${mobileOpen ? 'nb__bar--x' : ''}`} /><span className={`nb__bar ${mobileOpen ? 'nb__bar--x' : ''}`} /><span className={`nb__bar ${mobileOpen ? 'nb__bar--x' : ''}`} />
          </button>
        </div>
      </nav>

      {mobileOpen && <div className="nb__overlay" onClick={() => setMobileOpen(false)} />}

      {/* Bottom Nav - Mobile */}
      <nav className="nb-bottom">
        <Link to="/" className={`nb-bottom__item ${location.pathname === '/' ? 'nb-bottom__item--on' : ''}`}>
          <div className="nb-bottom__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          </div>
          <span>{t('nav.inicio')}</span>
        </Link>
        <Link to="/series" className={`nb-bottom__item ${location.pathname === '/series' ? 'nb-bottom__item--on' : ''}`}>
          <div className="nb-bottom__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
          </div>
          <span>{t('nav.series')}</span>
        </Link>
        <Link to="/search" className={`nb-bottom__item ${location.pathname === '/search' ? 'nb-bottom__item--on' : ''}`}>
          <div className="nb-bottom__icon nb-bottom__icon--search">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <span>{t('nav.buscar')}</span>
        </Link>
        <Link to="/watchlist" className={`nb-bottom__item ${location.pathname === '/watchlist' ? 'nb-bottom__item--on' : ''}`}>
          <div className="nb-bottom__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            {watchlist.length > 0 && <span className="nb-bottom__dot">{watchlist.length}</span>}
          </div>
          <span>{t('nav.miLista')}</span>
        </Link>
        <a href={DONATION_CONFIG.paypalUrl} target="_blank" rel="noopener noreferrer" className="nb-bottom__item">
          <div className="nb-bottom__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <span>{t('nav.donar')}</span>
        </a>
      </nav>

      <style>{`
        @keyframes nbGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(168,85,247,0.3)); }
          50% { filter: drop-shadow(0 0 14px rgba(168,85,247,0.5)); }
        }
        @keyframes nbPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.3); }
          50% { box-shadow: 0 0 0 4px rgba(251,191,36,0.08); }
        }

        .nb {
          --h: 56px;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 3vw, 40px);
          height: var(--h);
          background: transparent;
          transition: background 0.4s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s cubic-bezier(0.4,0,0.2,1), backdrop-filter 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .nb--solid {
          background: rgba(6, 2, 15, 0.82);
          backdrop-filter: blur(24px) saturate(1.6);
          box-shadow: 0 1px 0 rgba(168,85,247,0.06), 0 4px 24px rgba(0,0,0,0.25);
        }
        .nb--hidden {
          transform: translateY(-100%);
        }

        /* Brand */
        .nb__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1002;
          text-decoration: none;
        }
        .nb__logo {
          flex-shrink: 0;
          filter: drop-shadow(0 0 8px rgba(168,85,247,0.3));
          transition: filter 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .nb__brand:hover .nb__logo {
          animation: nbGlow 2s ease-in-out infinite;
        }
        .nb__wordmark { display: flex; flex-direction: column; line-height: 1; gap: 1px; }
        .nb__name {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 3.5px;
          background: linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: filter 0.3s;
        }
        .nb__brand:hover .nb__name {
          filter: brightness(1.2);
        }
        .nb__sub {
          font-size: 0.48rem;
          font-weight: 500;
          letter-spacing: 5px;
          color: var(--text-muted);
        }

        /* Nav links */
        .nb__nav {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .nb__item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.73rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-sm);
          border: none;
          background: none;
          cursor: pointer;
          transition: color 0.2s cubic-bezier(0.4,0,0.2,1), background 0.2s cubic-bezier(0.4,0,0.2,1);
          white-space: nowrap;
          position: relative;
        }
        .nb__item::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--accent-purple-light);
          border-radius: 1px;
          transform: translateX(-50%);
          transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
          opacity: 0;
        }
        .nb__item:hover {
          color: #fff;
          background: rgba(255,255,255,0.04);
        }
        .nb__item:hover::after {
          width: calc(100% - 16px);
          opacity: 1;
        }
        .nb__item--on {
          color: var(--accent-purple-light);
        }
        .nb__item--on::after {
          width: calc(100% - 16px);
          opacity: 1;
          background: var(--accent-purple-light);
        }
        .nb__item--btn { font-family: inherit; }
        .nb__dot {
          font-size: 0.55rem;
          font-weight: 700;
          background: var(--accent-gold);
          color: #000;
          padding: 1px 5px;
          border-radius: 8px;
          line-height: 1;
          animation: nbPulse 2s ease-in-out infinite;
        }

        /* Dropdown */
        .nb__drop { position: relative; }
        .nb__panel {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          min-width: 380px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px;
          padding: 8px;
          background: rgba(14,8,28,0.97);
          backdrop-filter: blur(24px);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          z-index: 1010;
        }
        .nb__panel--show { opacity: 1; visibility: visible; pointer-events: auto; transform: translateX(-50%) translateY(0); }
        .nb__genre {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4,0,0.2,1);
          text-align: left;
          font-family: inherit;
        }
        .nb__genre:hover { background: rgba(255,255,255,0.06); color: #fff; transform: translateX(2px); }

        /* Actions */
        .nb__actions {
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 1002;
        }
        .nb__lang {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 30px;
          padding: 0 10px;
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--accent-gold);
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.15);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          letter-spacing: 0.5px;
        }
        .nb__lang svg {
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .nb__lang:hover {
          background: rgba(251,191,36,0.15);
          border-color: rgba(251,191,36,0.3);
          transform: scale(1.05);
        }
        .nb__lang:hover svg {
          opacity: 1;
        }
        .nb__donate {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--accent-gold);
          background: rgba(251,191,36,0.06);
          border: 1px solid rgba(251,191,36,0.12);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .nb__donate::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(236,72,153,0.06) 100%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .nb__donate:hover {
          background: rgba(251,191,36,0.12);
          border-color: rgba(251,191,36,0.25);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(251,191,36,0.15);
          backdrop-filter: blur(12px);
        }
        .nb__donate:hover::before {
          opacity: 1;
        }
        .nb__donate svg, .nb__donate span {
          position: relative;
          z-index: 1;
        }
        .nb__search {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          border-radius: 8px;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .nb__search:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .nb__burger {
          display: none;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 1002;
        }
        .nb__bar {
          display: block;
          width: 18px;
          height: 1.5px;
          background: var(--text-secondary);
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          transform-origin: center;
        }
        .nb__bar--x:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
        .nb__bar--x:nth-child(2) { opacity: 0; }
        .nb__bar--x:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }
        .nb__overlay {
          position: fixed;
          inset: 0;
          background: rgba(6,2,15,0.6);
          backdrop-filter: blur(6px);
          z-index: 999;
        }

        @media (max-width: 768px) {
          .nb__burger { display: flex; }
          .nb__nav {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(6, 2, 15, 0.97);
            backdrop-filter: blur(32px);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            opacity: 0; visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
            z-index: 1001;
          }
          .nb__nav--open { opacity: 1; visibility: visible; }
          .nb__item {
            font-size: 0.95rem;
            padding: 14px 28px;
            gap: 10px;
            width: 220px;
            justify-content: center;
            border-radius: var(--radius-md);
          }
          .nb__drop { width: auto; }
          .nb__panel {
            position: static; transform: none;
            opacity: 1; visibility: visible;
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border-subtle);
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 3px; padding: 6px; min-width: auto;
            box-shadow: none;
          }
          .nb__genre { justify-content: center; font-size: 0.72rem; padding: 10px 6px; }
          .nb__overlay { display: block; }
        }

        /* Bottom Nav - Mobile */
        .nb-bottom {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: rgba(6,2,15,0.95);
          backdrop-filter: blur(24px) saturate(1.6);
          border-top: 1px solid rgba(168,85,247,0.1);
          z-index: 1000;
          justify-content: space-around;
          align-items: center;
          padding: 0 8px;
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        .nb-bottom__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 6px 10px;
          text-decoration: none;
          color: var(--text-muted);
          font-size: 0.55rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          min-width: 52px;
        }
        .nb-bottom__icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }
        .nb-bottom__icon--search {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-radius: 50%;
          margin-top: -12px;
          box-shadow: 0 4px 16px rgba(168,85,247,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .nb-bottom__icon--search svg {
          width: 18px;
          height: 18px;
          color: #fff;
        }
        .nb-bottom__item:active .nb-bottom__icon--search {
          transform: scale(0.92);
        }
        .nb-bottom__item svg { width: 20px; height: 20px; }
        .nb-bottom__item--on { color: var(--accent-purple-light); }
        .nb-bottom__item--on .nb-bottom__icon {
          filter: drop-shadow(0 0 6px rgba(168,85,247,0.4));
        }
        .nb-bottom__item--on::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 2px;
          background: var(--accent-purple-light);
          border-radius: 1px;
        }
        .nb-bottom__dot {
          position: absolute;
          top: -4px;
          right: -6px;
          font-size: 0.5rem;
          font-weight: 700;
          background: var(--accent-gold);
          color: #000;
          padding: 1px 4px;
          border-radius: 6px;
          line-height: 1;
        }

        @media (max-width: 768px) {
          .nb-bottom { display: flex; }
        }
      `}</style>
    </>
  );
}
