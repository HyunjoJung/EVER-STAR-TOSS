import { adminClient, petPersonalitiesByPetId, requireAppUser, requireOwnedPet } from '../_shared/db.ts';
import { handleOptions, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapPet } from '../_shared/mapper.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<{ anonymousHash?: unknown; petId?: unknown }>(request);
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);
    const pet = await requireOwnedPet(supabase, user.id, body.petId);
    const personalityMap = await petPersonalitiesByPetId(supabase, [pet.id]);

    return json(mapPet(pet, personalityMap.get(pet.id) ?? []));
  } catch (error) {
    return toErrorResponse(error);
  }
});
