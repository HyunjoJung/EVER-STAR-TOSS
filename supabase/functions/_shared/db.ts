import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { HttpError } from './http.ts';

export function adminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (supabaseUrl == null || serviceRoleKey == null) {
    throw new HttpError(500, 'Supabase service role is not configured.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireAppUser(supabase: ReturnType<typeof adminClient>, anonymousHash: unknown) {
  if (typeof anonymousHash !== 'string' || anonymousHash.length === 0) {
    throw new HttpError(401, 'anonymousHash is required.');
  }

  const { data, error } = await supabase.from('app_users').select('*').eq('anonymous_hash', anonymousHash).single();

  if (error != null || data == null) {
    throw new HttpError(401, 'Unknown anonymous user.');
  }

  return data;
}

export async function requireOwnedPet(supabase: ReturnType<typeof adminClient>, appUserId: string, petId: unknown) {
  if (typeof petId !== 'string' || petId.length === 0) {
    throw new HttpError(400, 'petId is required.');
  }

  const { data, error } = await supabase.from('pets').select('*').eq('id', petId).eq('app_user_id', appUserId).single();

  if (error != null || data == null) {
    throw new HttpError(404, 'Pet not found.');
  }

  return data;
}

export async function petPersonalitiesByPetId(supabase: ReturnType<typeof adminClient>, petIds: string[]) {
  if (petIds.length === 0) {
    return new Map<string, string[]>();
  }

  const { data, error } = await supabase.from('pet_personalities').select('pet_id,value').in('pet_id', petIds);

  if (error != null) {
    throw error;
  }

  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    const values = map.get(row.pet_id) ?? [];
    values.push(row.value);
    map.set(row.pet_id, values);
  }

  return map;
}
