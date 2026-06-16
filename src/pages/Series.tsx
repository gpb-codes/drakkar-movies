import { useState, useEffect } from 'react';
import { tmdb } from '../services/tmdb';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useI18n } from '../context/I18nContext';
import type { OmdbSearchResult } from '../types/tmdb';

const SERIES_GENRES = [
  { id: 'all', name: 'series.todas', icon: '📺' },
  { id: 'Drama', name: 'genre.drama', icon: '🎭' },
  { id: 'Comedy', name: 'genre.comedia', icon: '😂' },
  { id: 'Action', name: 'genre.accion', icon: '🔥' },
  { id: 'Sci-Fi', name: 'genre.sciFi', icon: '🚀' },
  { id: 'Horror', name: 'genre.terror', icon: '👻' },
  { id: 'Crime', name: 'genre.crimen', icon: '🔍' },
  { id: 'Animation', name: 'genre.animacion', icon: '✨' },
  { id: 'Thriller', name: 'genre.thriller', icon: '🔪' },
  { id: 'Fantasy', name: 'genre.fantasia', icon: '🧙' },
];

const SERIES_QUERIES: Record<string, string[]> = {
  all: [
    'breaking bad', 'stranger things', 'game of thrones', 'the witcher',
    'one piece', 'friends', 'the office', 'prison break', 'lost',
    'house', 'dexter', 'sherlock', 'peaky blinders', 'the crown',
    'you', 'wednesday', 'the last of us', 'house of the dragon',
    'the mandalorian', 'arcane', 'attack on titan', 'demon slayer',
    'the walking dead', 'sons of anarchy', 'big bang theory',
    'how i met your mother', 'the simpsons', 'futurama',
    'westworld', 'black mirror', 'dark', 'money heist',
    'elite', 'lupin', 'squid game', 'all of us are dead',
    'viking', 'vikings valhalla', 'the originals', 'vampire diaries',
  ],
  Drama: ['breaking bad', 'game of thrones', 'the crown', 'this is us', 'the handmaids tale', 'succession', 'grey anatomy', 'house', 'downton abbey', 'orange is new black'],
  Comedy: ['friends', 'the office', 'big bang theory', 'how i met your mother', 'brooklyn nine nine', 'modern family', 'the simpsons', 'futurama', 'south park', 'rick and morty'],
  Action: ['prison break', 'the walking dead', 'sons of anarchy', 'the mandalorian', 'jack ryan', 'reacher', 'lucifer', 'the flash', 'arrow', 'daredevil'],
  'Sci-Fi': ['stranger things', 'the witcher', 'westworld', 'black mirror', 'lost', 'the x files', 'doctor who', 'foundation', 'altered carbon', 'the 100'],
  Horror: ['the haunting of hill house', 'american horror story', 'scream', 'the walking dead', 'chucky', 'midnight mass', 'brand new cherry flavor', 'FROM', 'archive 81', 'channel zero'],
  Crime: ['sherlock', 'peaky blinders', 'dexter', 'true detective', 'mindhunter', 'the mentalist', 'criminal minds', 'ncsi', 'lupin', 'money heist'],
  Animation: ['one piece', 'naruto', 'attack on titan', 'demon slayer', 'jujutsu kaisen', 'spy x family', 'the simpsons', 'futurama', 'arcane', 'castlevania'],
  Thriller: ['you', 'black mirror', 'ozark', 'thenight of', 'mindhunter', 'behind her eyes', 'the sinner', 'dirty john', 'true story', 'kaleidoscope'],
  Fantasy: ['game of thrones', 'the witcher', 'rings of power', 'the originals', 'shadow and bone', 'the magicians', 'sabrina', 'good omens', 'american gods', 'wheel of time'],
};

export default function Series() {
  const { t } = useI18n();
  const [series, setSeries] = useState<OmdbSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const queries = SERIES_QUERIES[activeGenre] || SERIES_QUERIES.all;
        const startIdx = ((page - 1) * 3) % queries.length;
        const batch = queries.slice(startIdx, startIdx + 3);

        const results = await Promise.all(
          batch.map(q => tmdb.searchSeries(q))
        );

        const all = results.flatMap(r => r.Search || []);
        const unique = all.filter((item: OmdbSearchResult, idx: number, arr: OmdbSearchResult[]) =>
          arr.findIndex((a: OmdbSearchResult) => a.imdbID === item.imdbID) === idx
        );

        setSeries(unique);
      } catch {
        setSeries([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeGenre, page]);

  const handleGenreChange = (g: string) => {
    setActiveGenre(g);
    setPage(1);
  };

  return (
    <div className="series-page">
      <div className="series-hero">
        <div className="series-hero__glow" />
        <h1 className="series-hero__title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
            <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
          </svg>
          {t('series.title')}
        </h1>
        <p className="series-hero__sub">{t('series.subtitle')}</p>
      </div>

      <div className="series-filters">
        {SERIES_GENRES.map(g => (
          <button
            key={g.id}
            className={`series-filter ${activeGenre === g.id ? 'series-filter--active' : ''}`}
            onClick={() => handleGenreChange(g.id)}
          >
            <span className="series-filter__icon">{g.icon}</span>
            <span className="series-filter__name">{t(g.name)}</span>
          </button>
        ))}
      </div>

      <div className="series-content">
        {loading ? (
          <LoadingSpinner />
        ) : series.length > 0 ? (
          <>
            <div className="series-header">
              <span className="series-count">{series.length} {t('series.series')}</span>
            </div>
            <div className="series-grid">
              {series.map((s: OmdbSearchResult) => (
                <MovieCard key={s.imdbID} movie={s} />
              ))}
            </div>
            <div className="series-pagination">
              <button className="pg-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                {t('series.anterior')}
              </button>
              <span className="pg-info">{t('series.pagina')} {page}</span>
              <button className="pg-btn" onClick={() => setPage(p => p + 1)}>
                {t('series.siguiente')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </>
        ) : (
          <div className="series-empty">
            <p>{t('series.noSeries')}</p>
          </div>
        )}
      </div>

      <style>{`
        .series-page { min-height: 100vh; padding-bottom: 60px; }

        .series-hero {
          position: relative;
          padding: 90px clamp(16px, 4vw, 48px) 30px;
          text-align: center;
          overflow: hidden;
        }
        .series-hero__glow {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .series-hero__title {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          margin: 0 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
        }
        .series-hero__sub {
          color: rgba(255,255,255,0.3);
          font-size: 0.88rem;
          margin: 0;
          position: relative;
        }

        .series-filters {
          display: flex;
          gap: 8px;
          padding: 16px clamp(16px, 4vw, 48px);
          overflow-x: auto;
          scrollbar-width: none;
          justify-content: center;
          flex-wrap: wrap;
        }
        .series-filters::-webkit-scrollbar { display: none; }

        .series-filter {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          color: rgba(255,255,255,0.5);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .series-filter:hover {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.8);
        }
        .series-filter--active {
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(251,191,36,0.08));
          border-color: rgba(168,85,247,0.3);
          color: #fbbf24;
        }
        .series-filter__icon { font-size: 0.85rem; }

        .series-content {
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .series-header { margin-bottom: 14px; }
        .series-count {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.25);
          font-weight: 600;
        }

        .series-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 14px;
          animation: seriesIn 0.4s ease-out;
        }
        @keyframes seriesIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .series-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 32px 0;
        }
        .pg-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          color: rgba(255,255,255,0.6);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pg-btn:hover:not(:disabled) {
          background: rgba(168,85,247,0.15);
          color: #fbbf24;
          border-color: rgba(168,85,247,0.2);
        }
        .pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pg-info {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
        }

        .series-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.3);
        }

        @media (max-width: 768px) {
          .series-grid { grid-template-columns: repeat(auto-fill, minmax(115px, 1fr)); gap: 10px; }
          .series-filters { justify-content: flex-start; flex-wrap: nowrap; }
        }
      `}</style>
    </div>
  );
}
