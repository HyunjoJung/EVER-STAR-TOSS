import { adminClient, requireAppUser, requireOwnedPet } from '../_shared/db.ts';
import { handleOptions, HttpError, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapQuestAnswer } from '../_shared/mapper.ts';
import { getQuestProgress } from '../_shared/quest.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);
    const pet = await requireOwnedPet(supabase, user.id, body.petId);

    const questId = Number(body.questId);
    if (!Number.isInteger(questId)) {
      throw new HttpError(400, 'questId is required.');
    }

    const { data: quest, error: questError } = await supabase.from('quests').select('*').eq('id', questId).single();
    if (questError != null || quest == null) throw new HttpError(404, 'Quest not found.');

    const progress = getQuestProgress(pet.quest_started_at);
    if (quest.day > progress.day) {
      throw new HttpError(403, 'Future quest is not available yet.');
    }

    const content = String(body.content ?? '').trim();
    if (content.length === 0) {
      throw new HttpError(400, 'content is required.');
    }

    const { data: answer, error } = await supabase
      .from('quest_answers')
      .upsert(
        {
          app_user_id: user.id,
          pet_id: pet.id,
          quest_id: quest.id,
          content,
          image_url: typeof body.imageUrl === 'string' && body.imageUrl.length > 0 ? body.imageUrl : null,
          type: quest.type,
        },
        { onConflict: 'pet_id,quest_id' },
      )
      .select('*')
      .single();

    if (error != null) throw error;

    const kind = quest.type === 'TEXT_IMAGE' ? 'image_generation' : 'quest_text_reply';
    const { data: aiAnswer, error: aiError } = await supabase
      .from('ai_answers')
      .insert({
        app_user_id: user.id,
        pet_id: pet.id,
        source_type: 'quest_answer',
        source_id: answer.id,
        kind,
        status: 'pending',
        prompt: content,
      })
      .select('*')
      .single();
    if (aiError != null) throw aiError;

    const { count } = await supabase
      .from('quest_answers')
      .select('*', { count: 'exact', head: true })
      .eq('pet_id', pet.id);

    await supabase
      .from('pets')
      .update({
        quest_index: Math.max(pet.quest_index, quest.day),
        is_quest_completed: (count ?? 0) >= 49,
      })
      .eq('id', pet.id);

    const { data: notification } = await supabase
      .from('notifications')
      .insert({ app_user_id: user.id, title: '퀘스트 완료', body: `${quest.day}일차 기록 저장`, kind: 'quest' })
      .select('id')
      .single();

    if (notification != null) {
      await supabase.from('notification_jobs').insert({ app_user_id: user.id, notification_id: notification.id, template_code: 'QUEST_DONE' });
    }

    return json(mapQuestAnswer(answer, aiAnswer));
  } catch (error) {
    return toErrorResponse(error);
  }
});
