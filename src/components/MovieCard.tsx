import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/tmdb';
import type { OmdbSearchResult } from '../types/tmdb';
import './MovieCard.css';

interface Props {
  movie: OmdbSearchResult;
  size?: 'sm' | 'md' | 'lg';
}

export default function MovieCard({ movie, size = 'md' }: Props) {
  const mediaType = movie.Type === 'series' ? 'tv' : 'movie';

  return (
    <Link to={`/detail/${mediaType}/${movie.imdbID}`} className={`card card--${size}`}>
      <div className="card__visual">
        <img src={getImageUrl(movie.Poster)} alt={movie.Title} loading="lazy" />
        <div className="card__shimmer" />
        <div className="card__overlay">
          <div className="card__play">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        <div className="card__year">{movie.Year}</div>
      </div>
      <div className="card__text">
        <h3 className="card__title">{movie.Title}</h3>
        <span className={`card__type card__type--${movie.Type}`}>
          {movie.Type === 'series' ? 'Serie' : 'Película'}
        </span>
      </div>
    </Link>
  );
}
