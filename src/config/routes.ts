export const APP_ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  pets: '/pets',
  petCreate: '/pet-create',
  letters: '/letters',
  letterDetail: '/letter-detail',
  questToday: '/quest-today',
  memorialBook: '/memorial-book',
  notifications: '/notifications',
  settings: '/settings',
} as const;

export const DEEP_LINKS = {
  home: 'intoss://ever-star',
  questToday: 'intoss://ever-star/quest-today',
  letters: 'intoss://ever-star/letters',
} as const;
