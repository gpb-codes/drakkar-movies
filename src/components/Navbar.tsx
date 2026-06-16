import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWatchlistContext } from '../context/WatchlistContext';
import { DONATION_CONFIG } from '../config';

const GENRES = [
  { id: 'Action', name: 'Acción', icon: '🔥' },
  { id: 'Comedy', name: 'Comedia', icon: '😂' },
  { id: 'Drama', name: 'Drama', icon: '🎭' },
  { id: 'Horror', name: 'Terror', icon: '👻' },
  { id: 'Sci-Fi', name: 'Sci-Fi', icon: '🚀' },
  { id: 'Thriller', name: 'Thriller', icon: '🔪' },
  { id: 'Animation', name: 'Animación', icon: '✨' },
  { id: 'Romance', name: 'Romance', icon: '💜' },
  { id: 'Fantasy', name: 'Fantasía', icon: '🧙' },
  { id: 'Crime', name: 'Crimen', icon: '🔍' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const { watchlist } = useWatchlistContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
      <nav className={`nb ${scrolled ? 'nb--solid' : ''}`}>
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
            Inicio
          </Link>
          <Link to="/series" className={`nb__item ${location.pathname === '/series' ? 'nb__item--on' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>
            Series
          </Link>
          <Link to="/upcoming" className={`nb__item ${location.pathname === '/upcoming' ? 'nb__item--on' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Estrenos
          </Link>
          <Link to="/watchlist" className={`nb__item ${location.pathname === '/watchlist' ? 'nb__item--on' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
            Mi Lista
            {watchlist.length > 0 && <span className="nb__dot">{watchlist.length}</span>}
          </Link>

          <div className="nb__drop" onMouseEnter={() => setGenresOpen(true)} onMouseLeave={() => setGenresOpen(false)}>
            <button className={`nb__item nb__item--btn ${genresOpen ? 'nb__item--on' : ''}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Categorías
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div className={`nb__panel ${genresOpen ? 'nb__panel--show' : ''}`}>
              {GENRES.map(g => (
                <button key={g.id} className="nb__genre" onClick={() => handleGenre(g.id)}>
                  <span>{g.icon}</span> {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="nb__actions">
          <button className="nb__donate" onClick={() => setDonateOpen(true)} title={DONATION_CONFIG.message}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Donar
          </button>
          <Link to="/search" className="nb__search" aria-label="Buscar">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </Link>
          <button className="nb__burger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span className={`nb__bar ${mobileOpen ? 'nb__bar--x' : ''}`} /><span className={`nb__bar ${mobileOpen ? 'nb__bar--x' : ''}`} /><span className={`nb__bar ${mobileOpen ? 'nb__bar--x' : ''}`} />
          </button>
        </div>
      </nav>

      {mobileOpen && <div className="nb__overlay" onClick={() => setMobileOpen(false)} />}

      {donateOpen && (
        <div className="donate-modal" onClick={() => setDonateOpen(false)}>
          <div className="donate-card" onClick={e => e.stopPropagation()}>
            <button className="donate-close" onClick={() => setDonateOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <div className="donate-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>

            <h2 className="donate-title">Apoya el Proyecto</h2>
            <p className="donate-sub">Si te gusta Drakkar Movies, considera una donación ☕</p>

            <div className="donate-method">
              <div className="donate-label">Mach</div>
              <a href={DONATION_CONFIG.mach.user} target="_blank" rel="noopener noreferrer" className="donate-web-btn">
                Donar con Mach
              </a>
            </div>

            <div className="donate-method">
              <div className="donate-label">Cuenta RUT - BancoEstado</div>
              <div className="donate-value">{DONATION_CONFIG.cuentaRut.rut}</div>
              <div className="donate-holder">Titular: {DONATION_CONFIG.cuentaRut.holder}</div>
              <button className="donate-copy" onClick={() => navigator.clipboard.writeText(DONATION_CONFIG.cuentaRut.rut)}>
                Copiar RUT
              </button>
            </div>

            <p className="donate-thanks">¡Gracias por tu apoyo! ❤️</p>
          </div>
        </div>
      )}

      <style>{`
        .nb {
          --h: 56px;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(12px, 3vw, 36px);
          height: var(--h);
          background: transparent;
          transition: background 0.4s, box-shadow 0.4s, backdrop-filter 0.4s;
        }
        .nb--solid {
          background: rgba(6, 2, 15, 0.82);
          backdrop-filter: blur(24px) saturate(1.6);
          box-shadow: 0 1px 0 rgba(168,85,247,0.06), 0 4px 24px rgba(0,0,0,0.25);
        }

        /* Brand */
        .nb__brand { display: flex; align-items: center; gap: 10px; z-index: 1002; text-decoration: none; }
        .nb__logo { flex-shrink: 0; filter: drop-shadow(0 0 8px rgba(168,85,247,0.3)); }
        .nb__wordmark { display: flex; flex-direction: column; line-height: 1; gap: 1px; }
        .nb__name {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 3.5px;
          background: linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nb__sub {
          font-size: 0.48rem;
          font-weight: 500;
          letter-spacing: 5px;
          color: var(--text-muted);
        }

        /* Nav links */
        .nb__nav { display: flex; align-items: center; gap: 2px; }
        .nb__item {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.3px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          border: none;
          background: none;
          cursor: pointer;
          white-space: nowrap;
          text-decoration: none;
        }
        .nb__item:hover { color: var(--text-primary); background: rgba(255,255,255,0.04); }
        .nb__item--on { color: var(--accent-gold); background: rgba(251,191,36,0.06); }
        .nb__item--btn { gap: 4px; }

        .nb__dot {
          background: var(--accent-purple);
          color: #fff;
          font-size: 0.5rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 6px;
          line-height: 1.2;
        }

        /* Dropdown */
        .nb__drop { position: relative; }
        .nb__panel {
          position: absolute;
          top: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px);
          background: rgba(12, 6, 24, 0.96);
          backdrop-filter: blur(32px) saturate(1.4);
          border: 1px solid rgba(168,85,247,0.1);
          border-radius: var(--radius-lg);
          padding: 6px;
          min-width: 190px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.22s;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03);
        }
        .nb__panel--show { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
        .nb__genre {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .nb__genre:hover { background: rgba(168,85,247,0.1); color: var(--accent-gold); }

        /* Actions */
        .nb__actions { display: flex; align-items: center; gap: 6px; z-index: 1002; }
        .nb__search {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        .nb__search:hover { background: rgba(168,85,247,0.12); color: var(--accent-gold); border-color: rgba(168,85,247,0.2); }

        .nb__donate {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: linear-gradient(135deg, rgba(239,68,68,0.12), rgba(251,191,36,0.08));
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-sm);
          color: #f87171;
          font-size: 0.7rem;
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .nb__donate:hover {
          background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(251,191,36,0.12));
          color: #fbbf24;
          border-color: rgba(251,191,36,0.3);
          transform: translateY(-1px);
        }

        .nb__burger {
          display: none;
          width: 34px; height: 34px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }
        .nb__bar {
          display: block;
          width: 14px; height: 1.5px;
          background: var(--text-secondary);
          border-radius: 1px;
          transition: all 0.25s;
        }
        .nb__bar--x:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
        .nb__bar--x:nth-child(2) { opacity: 0; }
        .nb__bar--x:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

        .nb__overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(6,2,15,0.6);
          backdrop-filter: blur(6px);
          z-index: 999;
        }

        /* Donate modal */
        .donate-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(6,2,15,0.8);
          backdrop-filter: blur(8px);
          z-index: 2000;
          animation: fadeIn 0.2s;
          padding: 20px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .donate-card {
          position: relative;
          background: linear-gradient(160deg, rgba(20,12,40,0.98), rgba(10,6,22,0.98));
          border: 1px solid rgba(168,85,247,0.15);
          border-radius: var(--radius-xl);
          padding: 36px 32px 28px;
          max-width: 380px;
          width: 100%;
          text-align: center;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(168,85,247,0.08);
          animation: scaleIn 0.25s;
        }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .donate-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .donate-close:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .donate-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(251,191,36,0.1));
          border-radius: 50%;
          color: #f87171;
        }
        .donate-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          margin: 0 0 6px;
        }
        .donate-sub {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0 0 24px;
        }
        .donate-method {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 16px;
          margin-bottom: 20px;
        }
        .donate-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-purple);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }
        .donate-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--accent-gold);
          letter-spacing: 1px;
          margin-bottom: 4px;
          word-break: break-all;
        }
        .donate-holder {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .donate-copy {
          padding: 7px 18px;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark));
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .donate-copy:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(168,85,247,0.3); }
        .donate-web-btn {
          display: inline-block;
          padding: 10px 24px;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark));
          border-radius: 10px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 20px;
          transition: all 0.2s;
        }
        .donate-web-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(168,85,247,0.3); }
        .donate-thanks {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
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
            transition: all 0.3s;
            z-index: 1001;
          }
          .nb__nav--open { opacity: 1; visibility: visible; }
          .nb__item { font-size: 0.95rem; padding: 14px 28px; gap: 10px; width: 220px; justify-content: center; border-radius: var(--radius-md); }
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
      `}</style>
    </>
  );
}
