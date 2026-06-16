import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import { WatchlistProvider } from './context/WatchlistContext';

const Home = lazy(() => import('./pages/Home'));
const Series = lazy(() => import('./pages/Series'));
const Search = lazy(() => import('./pages/Search'));
const Detail = lazy(() => import('./pages/Detail'));
const Player = lazy(() => import('./pages/Player'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const Genre = lazy(() => import('./pages/Genre'));
const Upcoming = lazy(() => import('./pages/Upcoming'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <BrowserRouter>
      <WatchlistProvider>
        <div className="app">
          <Navbar />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/series" element={<Series />} />
              <Route path="/search" element={<Search />} />
              <Route path="/detail/:type/:id" element={<Detail />} />
              <Route path="/player/:type/:id" element={<Player />} />
              <Route path="/player/:type/:id/:season/:episode" element={<Player />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/genre/:id" element={<Genre />} />
              <Route path="/upcoming" element={<Upcoming />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </WatchlistProvider>
    </BrowserRouter>
  );
}
