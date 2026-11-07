export const GENRE_THEME_MAP = {
  Fantasy: {
    className: 'theme-fantasy',
    accent: '#355d4d',
    accentStrong: '#254637',
    soft: '#edf3ee',
    glow: 'rgba(53, 93, 77, 0.18)',
  },
  Romance: {
    className: 'theme-romance',
    accent: '#b95d72',
    accentStrong: '#7d3850',
    soft: '#fbeef2',
    glow: 'rgba(185, 93, 114, 0.18)',
  },
  Mystery: {
    className: 'theme-mystery',
    accent: '#4b3d60',
    accentStrong: '#2c213a',
    soft: '#efeaf7',
    glow: 'rgba(75, 61, 96, 0.18)',
  },
  Classics: {
    className: 'theme-classics',
    accent: '#a97a43',
    accentStrong: '#785730',
    soft: '#f8f0e3',
    glow: 'rgba(169, 122, 67, 0.18)',
  },
  'Non-fiction': {
    className: 'theme-non-fiction',
    accent: '#406783',
    accentStrong: '#2e465c',
    soft: '#eaf3fa',
    glow: 'rgba(64, 103, 131, 0.18)',
  },
}

export function getGenreTheme(genre) {
  return GENRE_THEME_MAP[genre] || GENRE_THEME_MAP.Fantasy
}

export function getGenreThemeClass(genre) {
  return getGenreTheme(genre).className
}
