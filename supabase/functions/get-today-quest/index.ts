import { adminClient, petPersonalitiesByPetId, requireAppUser, requireOwnedPet } from '../_shared/db.ts';
import { handleOptions, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapAiAnswer, mapPet, mapQuest, mapQuestAnswer } from '../_shared/mapper.ts';
import { getQuestProgress } from '../_shared/quest.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<{ anonymousHash?: unknown; petId?: unknown }>(request);
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);
    const pet = await requireOwnedPet(supabase, user.id, body.petId);
    const progress = getQuestProgress(pet.quest_started_at);

    const { data: quest, error: questError } = await supabase.from('quests').select('*').eq('day', progress.day).single();
    if (questError != null) throw questError;

    const { data: answer } = await supabase
      .from('quest_answers')
      .select('*')
      .eq('pet_id', pet.id)
      .eq('quest_id', quest.id)
      .maybeSingle();

    let aiAnswer = null;
    if (answer != null) {
      const { data } = await supabase
        .from('ai_answers')
        .select('*')
        .eq('source_type', 'quest_answer')
        .eq('source_id', answer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      aiAnswer = data;
    }

    const personalityMap = await petPersonalitiesByPetId(supabase, [pet.id]);

    return json({
      pet: mapPet(pet, personalityMap.get(pet.id) ?? []),
      quest: mapQuest(quest),
      progress,
      answer: answer == null ? null : mapQuestAnswer(answer, aiAnswer),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
});
