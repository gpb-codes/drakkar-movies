const STREAMING_API_KEY = import.meta.env.VITE_STREAMING_AVAILABILITY_KEY || '';
const BASE_URL = 'https://api.movieofthenight.com/v4';

export interface StreamingOption {
  service: string;
  logo: string;
  type: 'subscription' | 'free' | 'ads' | 'rent' | 'buy';
  link: string;
}

export interface StreamingAvailability {
  imdbId: string;
  options: StreamingOption[];
}

const SERVICE_LOGOS: Record<string, string> = {
  netflix: 'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.ico',
  disney: 'https://www.disneyplus.com/favicon.ico',
  hbo: 'https://www.max.com/favicon.ico',
  max: 'https://www.max.com/favicon.ico',
  amazon: 'https://www.primevideo.com/favicon.ico',
  prime: 'https://www.primevideo.com/favicon.ico',
  hulu: 'https://www.hulu.com/favicon.ico',
  apple: 'https://tv.apple.com/favicon.ico',
  paramount: 'https://www.paramountplus.com/favicon.ico',
  peacock: 'https://www.peacocktv.com/favicon.ico',
  starz: 'https://www.starz.com/favicon.ico',
  crunchyroll: 'https://www.crunchyroll.com/favicon.ico',
  tubi: 'https://tubitv.com/favicon.ico',
  pluto: 'https://pluto.tv/favicon.ico',
  vix: 'https://www.vix.com/favicon.ico',
};

const SERVICE_COLORS: Record<string, string> = {
  netflix: '#E50914',
  disney: '#113CCF',
  hbo: '#B537F2',
  max: '#B537F2',
  amazon: '#00A8E1',
  prime: '#00A8E1',
  hulu: '#1CE783',
  apple: '#000000',
  paramount: '#0064FF',
  peacock: '#000000',
  starz: '#000000',
  crunchyroll: '#F47521',
  tubi: '#FA382F',
  pluto: '#FAD502',
  vix: '#E4007C',
};

export async function getStreamingAvailability(imdbId: string): Promise<StreamingOption[]> {
  if (!STREAMING_API_KEY) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/shows/${imdbId}?country=us`,
      {
        headers: { 'X-API-Key': STREAMING_API_KEY },
      }
    );
    if (!response.ok) return [];

    const data = await response.json();
    const options: StreamingOption[] = [];

    if (data.streamingOptions) {
      for (const [service, opts] of Object.entries(data.streamingOptions)) {
        const serviceLower = service.toLowerCase();
        const optArray = Array.isArray(opts) ? opts : [opts];
        for (const opt of optArray) {
          options.push({
            service,
            logo: SERVICE_LOGOS[serviceLower] || '',
            type: opt.type || 'subscription',
            link: opt.link || '',
          });
        }
      }
    }

    return options;
  } catch {
    return [];
  }
}

export function getServiceColor(service: string): string {
  return SERVICE_COLORS[service.toLowerCase()] || '#6B7280';
}

export function getServiceName(service: string): string {
  const names: Record<string, string> = {
    netflix: 'Netflix',
    disney: 'Disney+',
    hbo: 'HBO Max',
    max: 'Max',
    amazon: 'Amazon Prime',
    prime: 'Prime Video',
    hulu: 'Hulu',
    apple: 'Apple TV+',
    paramount: 'Paramount+',
    peacock: 'Peacock',
    starz: 'Starz',
    crunchyroll: 'Crunchyroll',
    tubi: 'Tubi',
    pluto: 'Pluto TV',
    vix: 'ViX',
  };
  return names[service.toLowerCase()] || service;
}
