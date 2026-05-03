import { adminClient, petPersonalitiesByPetId, requireAppUser } from '../_shared/db.ts';
import { handleOptions, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapPet } from '../_shared/mapper.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<{ anonymousHash?: unknown }>(request);
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);
    const { data, error } = await supabase.from('pets').select('*').eq('app_user_id', user.id).order('created_at', { ascending: false });

    if (error != null) throw error;

    const petIds = (data ?? []).map(pet => pet.id);
    const personalityMap = await petPersonalitiesByPetId(supabase, petIds);

    return json((data ?? []).map(pet => mapPet(pet, personalityMap.get(pet.id) ?? [])));
  } catch (error) {
    return toErrorResponse(error);
  }
});
