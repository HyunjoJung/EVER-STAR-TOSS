export const env = {
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? '',
  useMocks: process.env.EVERSTAR_USE_MOCKS !== 'false',
  tossPushEnabled: process.env.TOSS_PUSH_ENABLED === 'true',
};

export function isSupabaseConfigured() {
  return env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0 && env.useMocks === false;
}
