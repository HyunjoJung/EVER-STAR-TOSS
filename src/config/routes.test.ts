import { APP_ROUTES, DEEP_LINKS } from './routes';

describe('Apps in Toss routes', () => {
  it('keeps v1 routes focused on the approved app surface', () => {
    expect(Object.values(APP_ROUTES)).toEqual([
      '/',
      '/onboarding',
      '/pets',
      '/pet-create',
      '/letters',
      '/letter-detail',
      '/quest-today',
      '/memorial-book',
      '/notifications',
      '/settings',
    ]);
  });

  it('does not expose excluded v1 entry points', () => {
    const allRoutes = Object.values(APP_ROUTES).join(' ');

    expect(allRoutes).not.toMatch(/video|call|chat|community|cheer|random|pdf/i);
  });

  it('uses the fixed ever-star app name in deep links', () => {
    expect(DEEP_LINKS.home).toBe('intoss://ever-star');
    expect(DEEP_LINKS.questToday).toBe('intoss://ever-star/quest-today');
    expect(DEEP_LINKS.letters).toBe('intoss://ever-star/letters');
  });
});
