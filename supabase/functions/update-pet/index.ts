import { adminClient, petPersonalitiesByPetId, requireAppUser, requireOwnedPet } from '../_shared/db.ts';
import { handleOptions, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapPet } from '../_shared/mapper.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);
    const pet = await requireOwnedPet(supabase, user.id, body.petId);

    const { data: updatedPet, error } = await supabase
      .from('pets')
      .update({
        name: body.name ?? pet.name,
        age: body.age ?? pet.age,
        species: body.species ?? pet.species,
        gender: body.gender ?? pet.gender,
        relationship: body.relationship ?? pet.relationship,
        memorial_date: body.memorialDate ?? pet.memorial_date,
        profile_image_url: body.profileImageUrl ?? pet.profile_image_url,
        introduction: body.introduction ?? pet.introduction,
      })
      .eq('id', pet.id)
      .select('*')
      .single();

    if (error != null) throw error;

    if (Array.isArray(body.personalities)) {
      await supabase.from('pet_personalities').delete().eq('pet_id', pet.id);
      const personalities = body.personalities.filter(value => typeof value === 'string');
      if (personalities.length > 0) {
        const { error: personalityError } = await supabase
          .from('pet_personalities')
          .insert(personalities.map(value => ({ pet_id: pet.id, value })));
        if (personalityError != null) throw personalityError;
      }
    }

    const personalityMap = await petPersonalitiesByPetId(supabase, [pet.id]);
    return json(mapPet(updatedPet, personalityMap.get(pet.id) ?? []));
  } catch (error) {
    return toErrorResponse(error);
  }
});
