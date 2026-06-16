import { useRef, useState } from 'react';
import MovieCard from './MovieCard';
import type { OmdbSearchResult } from '../types/tmdb';

interface Props {
  title: string;
  movies: OmdbSearchResult[];
  size?: 'sm' | 'md' | 'lg';
}

export default function ScrollRow({ movies, size = 'md' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  const check = () => {
    const el = ref.current;
    if (!el) return;
    setCanL(el.scrollLeft > 10);
    setCanR(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir: 'l' | 'r') => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'l' ? -el.clientWidth * 0.7 : el.clientWidth * 0.7, behavior: 'smooth' });
  };

  if (!movies.length) return null;

  return (
    <section className="sr">
      <div className="sr__track" ref={ref} onScroll={check}>
        {movies.map((m: OmdbSearchResult) => <MovieCard key={m.imdbID} movie={m} size={size} />)}
      </div>
      <div className="sr__fade sr__fade--l" style={{ opacity: canL ? 1 : 0 }} />
      <div className="sr__fade sr__fade--r" style={{ opacity: canR ? 1 : 0 }} />
      {canL && (
        <button className="sr__arrow sr__arrow--l" onClick={() => scroll('l')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      )}
      {canR && (
        <button className="sr__arrow sr__arrow--r" onClick={() => scroll('r')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      )}
      <style>{`
        .sr {
          position: relative;
          margin-bottom: 36px;
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .sr__track {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 8px 4px 12px;
          scrollbar-width: none;
          scroll-snap-type: x proximity;
        }
        .sr__track::-webkit-scrollbar { display: none; }
        .sr__track > * { scroll-snap-align: start; }

        .sr__fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          pointer-events: none;
          transition: opacity 0.3s;
          z-index: 2;
        }
        .sr__fade--l {
          left: 0;
          background: linear-gradient(90deg, #070415 0%, transparent 100%);
        }
        .sr__fade--r {
          right: 0;
          background: linear-gradient(-90deg, #070415 0%, transparent 100%);
        }

        .sr__arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(7, 4, 21, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(168, 85, 247, 0.15);
          border-radius: 10px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.25s;
          z-index: 3;
        }
        .sr__arrow:hover {
          background: rgba(168, 85, 247, 0.25);
          border-color: rgba(168, 85, 247, 0.4);
          color: #fbbf24;
          transform: translateY(-50%) scale(1.1);
        }
        .sr__arrow--l { left: 16px; }
        .sr__arrow--r { right: 16px; }
      `}</style>
    </section>
  );
}
