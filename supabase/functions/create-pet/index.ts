import { adminClient, petPersonalitiesByPetId, requireAppUser } from '../_shared/db.ts';
import { handleOptions, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapPet } from '../_shared/mapper.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);

    const { data: pet, error } = await supabase
      .from('pets')
      .insert({
        app_user_id: user.id,
        name: body.name,
        age: body.age,
        species: body.species,
        gender: body.gender ?? 'UNKNOWN',
        relationship: body.relationship,
        memorial_date: body.memorialDate,
        profile_image_url: body.profileImageUrl ?? null,
        introduction: body.introduction ?? null,
      })
      .select('*')
      .single();

    if (error != null) throw error;

    const personalities = Array.isArray(body.personalities) ? body.personalities.filter(value => typeof value === 'string') : [];
    if (personalities.length > 0) {
      const { error: personalityError } = await supabase
        .from('pet_personalities')
        .insert(personalities.map(value => ({ pet_id: pet.id, value })));
      if (personalityError != null) throw personalityError;
    }

    await supabase.from('memorial_books').insert({ app_user_id: user.id, pet_id: pet.id });
    await supabase.from('sentiment_summaries').insert({ app_user_id: user.id, pet_id: pet.id });
    await supabase.from('notifications').insert({ app_user_id: user.id, title: '등록 완료', body: `${pet.name} 기록 시작`, kind: 'system' });

    const personalityMap = await petPersonalitiesByPetId(supabase, [pet.id]);
    return json(mapPet(pet, personalityMap.get(pet.id) ?? []));
  } catch (error) {
    return toErrorResponse(error);
  }
});
