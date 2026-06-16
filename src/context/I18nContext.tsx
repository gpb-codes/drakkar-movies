import { createContext, useContext, useState, type ReactNode } from 'react';

type Lang = 'es' | 'en';

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  es: {
    // Navbar
    'nav.inicio': 'Inicio',
    'nav.series': 'Series',
    'nav.estrenos': 'Estrenos',
    'nav.miLista': 'Mi Lista',
    'nav.categorias': 'Categorías',
    'nav.donar': 'Donar',
    'nav.buscar': 'Buscar',
    'nav.menu': 'Menu',

    // Home
    'home.destacado': 'Destacado',
    'home.verAhora': 'Ver Ahora',
    'home.masInfo': 'Más Info',
    'home.populares': 'Películas Populares',
    'home.topRated': 'Top Rated',
    'home.series': 'Series',
    'home.accion': 'Acción',
    'home.scifi': 'Ciencia Ficción',
    'home.exploraGenero': 'Explora por Género',

    // Genres
    'genre.accion': 'Acción',
    'genre.comedia': 'Comedia',
    'genre.drama': 'Drama',
    'genre.terror': 'Terror',
    'genre.scifi': 'Sci-Fi',
    'genre.thriller': 'Thriller',
    'genre.animacion': 'Animación',
    'genre.romance': 'Romance',
    'genre.fantasia': 'Fantasía',
    'genre.crimen': 'Crimen',

    // Search
    'search.title': 'Buscar',
    'search.subtitle': 'Encuentra cualquier película o serie',
    'search.placeholder': 'Escribe el nombre de una película o serie...',
    'search.todo': 'Todo',
    'search.peliculas': 'Películas',
    'search.series': 'Series',
    'search.populares': 'Búsquedas populares:',
    'search.resultados': 'resultados',
    'search.noResults': 'No se encontraron resultados',
    'search.noResultsHint': 'Intenta con otros términos o cambia el filtro',
    'search.startTyping': 'Escribe para comenzar a buscar',

    // Detail
    'detail.noEncontrado': 'No encontrado',
    'detail.temporadas': 'Temp.',
    'detail.votos': 'votos',
    'detail.director': 'Director',
    'detail.reparto': 'Reparto',
    'detail.idioma': 'Idioma',
    'detail.pais': 'País',
    'detail.premios': 'Premios',
    'detail.verSerie': 'Ver Serie',
    'detail.verPelicula': 'Ver Película',
    'detail.reproducir': 'Reproducir ahora',
    'detail.enMiLista': 'En Mi Lista',
    'detail.miLista': 'Mi Lista',
    'detail.sitioWeb': 'Sitio Web',
    'detail.informacion': 'Información',
    'detail.duracion': 'Duración',
    'detail.estreno': 'Estreno',
    'detail.recaudacion': 'Recaudación',
    'detail.equipo': 'Equipo',
    'detail.guionista': 'Guionista',
    'detail.produccion': 'Producción',
    'detail.calificaciones': 'Calificaciones',
    'detail.seguirViendo': 'Seguir Viendo',
    'detail.continueWatching': 'Continue Watching',
    'detail.idiomasDisponibles': 'Idiomas Disponibles',
    'detail.audioOriginal': 'Audio Original',
    'detail.subtitulos': 'Subtítulos',
    'detail.disponibleEnReproductor': 'Disponible en el reproductor',
    'detail.cambiarIdioma': 'Cambiar Idioma',
    'detail.usarConfigReproductor': 'Usa el ícono de configuración del reproductor para cambiar audio y subtítulos',
    'detail.disponibleEn': 'Disponible en',

    // Player
    'player.servidor1': 'Servidor 1',
    'player.servidor2': 'Servidor 2',
    'player.servidor3': 'Servidor 3',
    'player.servidor4': 'Servidor 4',
    'player.info': 'Info',
    'player.servidor': 'Servidor',
    'player.live': 'EN VIVO',
    'player.noReproduce': '¿No reproduce? Prueba otro servidor',
    'player.episodio': 'Ep.',
    'player.noEncontrado': 'No encontrado',
    'player.capitulos': 'Capítulos',
    'player.temporada': 'Temporada',
    'player.seleccionarCapitulo': 'Seleccionar Capítulo',
    'player.cargando': 'Cargando...',
    'player.noEpisodios': 'No hay episodios disponibles',

    // Series
    'series.title': 'Series',
    'series.subtitle': 'Descubre las mejores series para bingewatching',
    'series.todas': 'Todas',
    'series.anterior': 'Anterior',
    'series.siguiente': 'Siguiente',
    'series.pagina': 'Página',
    'series.noSeries': 'No se encontraron series',
    'series.series': 'series',

    // Watchlist
    'watchlist.title': 'Mi Lista',
    'watchlist.elemento': 'elemento',
    'watchlist.elementos': 'elementos',
    'watchlist.vacia': 'Tu lista está vacía',
    'watchlist.vaciaSub': 'Guarda películas y series para verlas después',
    'watchlist.explorar': 'Explorar Inicio',
    'watchlist.remover': 'Remover',

    // Genre page
    'genrePage.categoria': 'Categoría',
    'genrePage.anterior': '← Anterior',
    'genrePage.siguiente': 'Siguiente →',

    // Upcoming
    'upcoming.title': 'Próximos Estrenos',

    // MovieCard
    'card.serie': 'Serie',
    'card.pelicula': 'Película',

    // Donation
    'donate.apoya': 'Apoya al proyecto con una donación',

    // Footer
    'footer.tagline': 'Tu plataforma de streaming favorita. Películas y series al alcance de un clic.',
    'footer.navegacion': 'Navegación',
    'footer.generos': 'Géneros',
    'footer.soporte': 'Soporte',
    'footer.derechos': 'Todos los derechos reservados.',

    // Not Found
    'notFound.title': 'Página No Encontrada',
    'notFound.desc': 'La página que buscas no existe o fue movida.',
    'notFound.home': 'Volver al Inicio',
  },
  en: {
    // Navbar
    'nav.inicio': 'Home',
    'nav.series': 'Series',
    'nav.estrenos': 'Releases',
    'nav.miLista': 'My List',
    'nav.categorias': 'Categories',
    'nav.donar': 'Donate',
    'nav.buscar': 'Search',
    'nav.menu': 'Menu',

    // Home
    'home.destacado': 'Featured',
    'home.verAhora': 'Watch Now',
    'home.masInfo': 'More Info',
    'home.populares': 'Popular Movies',
    'home.topRated': 'Top Rated',
    'home.series': 'Series',
    'home.accion': 'Action',
    'home.scifi': 'Sci-Fi',
    'home.exploraGenero': 'Explore by Genre',

    // Genres
    'genre.accion': 'Action',
    'genre.comedia': 'Comedy',
    'genre.drama': 'Drama',
    'genre.terror': 'Horror',
    'genre.scifi': 'Sci-Fi',
    'genre.thriller': 'Thriller',
    'genre.animacion': 'Animation',
    'genre.romance': 'Romance',
    'genre.fantasia': 'Fantasy',
    'genre.crimen': 'Crime',

    // Search
    'search.title': 'Search',
    'search.subtitle': 'Find any movie or series',
    'search.placeholder': 'Type a movie or series name...',
    'search.todo': 'All',
    'search.peliculas': 'Movies',
    'search.series': 'Series',
    'search.populares': 'Popular searches:',
    'search.resultados': 'results',
    'search.noResults': 'No results found',
    'search.noResultsHint': 'Try different terms or change the filter',
    'search.startTyping': 'Start typing to search',

    // Detail
    'detail.noEncontrado': 'Not found',
    'detail.temporadas': 'Seasons',
    'detail.votos': 'votes',
    'detail.director': 'Director',
    'detail.reparto': 'Cast',
    'detail.idioma': 'Language',
    'detail.pais': 'Country',
    'detail.premios': 'Awards',
    'detail.verSerie': 'Watch Series',
    'detail.verPelicula': 'Watch Movie',
    'detail.reproducir': 'Play now',
    'detail.enMiLista': 'In My List',
    'detail.miLista': 'My List',
    'detail.sitioWeb': 'Website',
    'detail.informacion': 'Information',
    'detail.duracion': 'Runtime',
    'detail.estreno': 'Release Date',
    'detail.recaudacion': 'Box Office',
    'detail.equipo': 'Team',
    'detail.guionista': 'Writer',
    'detail.produccion': 'Production',
    'detail.calificaciones': 'Ratings',
    'detail.seguirViendo': 'Continue Watching',
    'detail.continueWatching': 'Continue Watching',
    'detail.idiomasDisponibles': 'Available Languages',
    'detail.audioOriginal': 'Original Audio',
    'detail.subtitulos': 'Subtitles',
    'detail.disponibleEnReproductor': 'Available in the player',
    'detail.cambiarIdioma': 'Change Language',
    'detail.usarConfigReproductor': 'Use the settings icon in the player to change audio and subtitles',
    'detail.disponibleEn': 'Available on',

    // Player
    'player.servidor1': 'Server 1',
    'player.servidor2': 'Server 2',
    'player.servidor3': 'Server 3',
    'player.servidor4': 'Server 4',
    'player.info': 'Info',
    'player.servidor': 'Server',
    'player.live': 'LIVE',
    'player.noReproduce': "Not playing? Try another server",
    'player.episodio': 'Ep.',
    'player.noEncontrado': 'Not found',
    'player.capitulos': 'Episodes',
    'player.temporada': 'Season',
    'player.seleccionarCapitulo': 'Select Episode',
    'player.cargando': 'Loading...',
    'player.noEpisodios': 'No episodes available',

    // Series
    'series.title': 'Series',
    'series.subtitle': 'Discover the best series for bingewatching',
    'series.todas': 'All',
    'series.anterior': 'Previous',
    'series.siguiente': 'Next',
    'series.pagina': 'Page',
    'series.noSeries': 'No series found',
    'series.series': 'series',

    // Watchlist
    'watchlist.title': 'My List',
    'watchlist.elemento': 'item',
    'watchlist.elementos': 'items',
    'watchlist.vacia': 'Your list is empty',
    'watchlist.vaciaSub': 'Save movies and series to watch later',
    'watchlist.explorar': 'Browse Home',
    'watchlist.remover': 'Remove',

    // Genre page
    'genrePage.categoria': 'Category',
    'genrePage.anterior': '← Previous',
    'genrePage.siguiente': 'Next →',

    // Upcoming
    'upcoming.title': 'Upcoming Releases',

    // MovieCard
    'card.serie': 'Series',
    'card.pelicula': 'Movie',

    // Donation
    'donate.apoya': 'Support the project with a donation',

    // Footer
    'footer.tagline': 'Your favorite streaming platform. Movies and series at your fingertips.',
    'footer.navegacion': 'Navigation',
    'footer.generos': 'Genres',
    'footer.soporte': 'Support',
    'footer.derechos': 'All rights reserved.',

    // Not Found
    'notFound.title': 'Page Not Found',
    'notFound.desc': 'The page you are looking for does not exist or was moved.',
    'notFound.home': 'Back to Home',
  },
};

const I18nContext = createContext<I18nContextType>({} as I18nContextType);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('drakkar-lang');
    return (saved === 'en' || saved === 'es') ? saved : 'es';
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('drakkar-lang', l);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
