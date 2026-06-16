import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';
import { DONATION_CONFIG } from '../config';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="ft">
      <div className="ft__inner">
        <div className="ft__brand">
          <div className="ft__logo">
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="ftlg" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#c084fc"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
              <rect width="36" height="36" rx="10" fill="url(#ftlg)"/>
              <path d="M11 9L18 18L11 27" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="ft__name">DRAKKAR MOVIES</span>
          </div>
          <p className="ft__tagline">{t('footer.tagline')}</p>
        </div>

        <div className="ft__links">
          <div className="ft__col">
            <h4 className="ft__col-title">{t('footer.navegacion')}</h4>
            <Link to="/">{t('nav.inicio')}</Link>
            <Link to="/series">{t('nav.series')}</Link>
            <Link to="/upcoming">{t('nav.estrenos')}</Link>
            <Link to="/search">{t('nav.buscar')}</Link>
          </div>
          <div className="ft__col">
            <h4 className="ft__col-title">{t('footer.generos')}</h4>
            <Link to="/genre/Action">{t('genre.accion')}</Link>
            <Link to="/genre/Comedy">{t('genre.comedia')}</Link>
            <Link to="/genre/Drama">{t('genre.drama')}</Link>
            <Link to="/genre/Sci-Fi">{t('genre.scifi')}</Link>
          </div>
          <div className="ft__col">
            <h4 className="ft__col-title">{t('footer.soporte')}</h4>
            <a href={DONATION_CONFIG.paypalUrl} target="_blank" rel="noopener noreferrer">{t('nav.donar')}</a>
            <Link to="/watchlist">{t('nav.miLista')}</Link>
          </div>
        </div>
      </div>

      <div className="ft__bottom">
        <span>&copy; {new Date().getFullYear()} Drakkar Movies. {t('footer.derechos')}</span>
      </div>

      <style>{`
        .ft {
          margin-top: 60px;
          border-top: 1px solid var(--border-subtle);
          background: rgba(6, 2, 15, 0.5);
          backdrop-filter: blur(12px);
        }
        .ft__inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px clamp(16px, 4vw, 48px) 32px;
          display: grid;
          grid-template-columns: 1.5fr 2fr;
          gap: 48px;
        }
        .ft__brand { display: flex; flex-direction: column; gap: 12px; }
        .ft__logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ft__name {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(135deg, #c084fc, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ft__tagline {
          color: var(--text-muted);
          font-size: 0.8rem;
          line-height: 1.6;
          margin: 0;
          max-width: 280px;
        }
        .ft__links {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ft__col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ft__col-title {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 0 0 4px;
        }
        .ft__col a {
          font-size: 0.78rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ft__col a:hover { color: var(--accent-purple); }
        .ft__bottom {
          max-width: 1100px;
          margin: 0 auto;
          padding: 16px clamp(16px, 4vw, 48px);
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }
        .ft__bottom span {
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .ft__inner { grid-template-columns: 1fr; gap: 32px; padding: 32px 16px 24px; }
          .ft__links { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        @media (max-width: 480px) {
          .ft__links { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </footer>
  );
}
