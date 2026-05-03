import { adminClient, petPersonalitiesByPetId, requireAppUser, requireOwnedPet } from '../_shared/db.ts';
import { handleOptions, HttpError, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapLetter, mapPet, mapQuest, mapQuestAnswer } from '../_shared/mapper.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<{ anonymousHash?: unknown; petId?: unknown }>(request);
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);
    const pet = await requireOwnedPet(supabase, user.id, body.petId);

    const [{ data: book }, { data: sentiment }, { data: quests }, { data: answers }, { data: letters }, { data: diaries }] = await Promise.all([
      supabase.from('memorial_books').select('*').eq('pet_id', pet.id).single(),
      supabase.from('sentiment_summaries').select('*').eq('pet_id', pet.id).maybeSingle(),
      supabase.from('quests').select('*').order('day'),
      supabase.from('quest_answers').select('*').eq('pet_id', pet.id).order('quest_id'),
      supabase.from('letters').select('*').eq('pet_id', pet.id).order('created_at', { ascending: false }),
      supabase.from('diaries').select('*').eq('app_user_id', user.id).order('created_at', { ascending: false }),
    ]);

    if (book == null) {
      throw new HttpError(404, 'Memorial book not found.');
    }

    const sourceIds = [...(answers ?? []).map((answer: any) => answer.id), ...(letters ?? []).map((letter: any) => letter.id)];
    const { data: aiRows, error: aiError } = sourceIds.length > 0
      ? await supabase.from('ai_answers').select('*').in('source_id', sourceIds)
      : { data: [], error: null };
    if (aiError != null) throw aiError;

    const personalityMap = await petPersonalitiesByPetId(supabase, [pet.id]);

    return json({
      id: book.id,
      pet: mapPet(pet, personalityMap.get(pet.id) ?? []),
      isActive: book.is_active,
      isOpen: book.is_open,
      psychologicalTestResult: book.psychological_test_result,
      sentimentSummary: {
        week1Result: sentiment?.week1_result ?? null,
        week2Result: sentiment?.week2_result ?? null,
        week3Result: sentiment?.week3_result ?? null,
        week4Result: sentiment?.week4_result ?? null,
        week5Result: sentiment?.week5_result ?? null,
        week6Result: sentiment?.week6_result ?? null,
        week7Result: sentiment?.week7_result ?? null,
        totalResult: sentiment?.total_result ?? null,
      },
      quests: (quests ?? []).map(mapQuest),
      questAnswers: (answers ?? []).map((answer: any) => mapQuestAnswer(answer, findLatestAi(aiRows ?? [], answer.id))),
      letters: (letters ?? []).map((letter: any) => mapLetter(letter, findLatestAi(aiRows ?? [], letter.id))),
      diaries: (diaries ?? []).map((diary: any) => ({
        id: diary.id,
        title: diary.title,
        content: diary.content,
        imageUrl: diary.image_url,
        createdAt: diary.created_at,
      })),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
});

function findLatestAi(aiRows: any[], sourceId: string) {
  return aiRows
    .filter(row => row.source_id === sourceId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
}
