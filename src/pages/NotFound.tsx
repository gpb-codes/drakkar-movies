import { Link } from 'react-router-dom';
import { useI18n } from '../context/I18nContext';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="nf">
      <div className="nf__content">
        <div className="nf__code">404</div>
        <h1 className="nf__title">{t('notFound.title')}</h1>
        <p className="nf__desc">{t('notFound.desc')}</p>
        <Link to="/" className="nf__btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          {t('notFound.home')}
        </Link>
      </div>

      <style>{`
        .nf {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
        }
        .nf__content { max-width: 400px; }
        .nf__code {
          font-size: 8rem;
          font-weight: 900;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-gold));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 16px;
          opacity: 0.15;
        }
        .nf__title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 12px;
        }
        .nf__desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .nf__btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-purple-dark));
          color: #fff;
          border-radius: var(--radius-md);
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          transition: all var(--transition-smooth);
        }
        .nf__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(168,85,247,0.4);
        }
      `}</style>
    </div>
  );
}
