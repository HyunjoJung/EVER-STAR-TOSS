import { adminClient } from '../_shared/db.ts';
import { handleOptions, json, toErrorResponse } from '../_shared/http.ts';
import { buildImagePrompt, buildLetterPrompt, buildQuestPrompt, createImage, createTextReply } from '../_shared/openai.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const supabase = adminClient();
    const { data: jobs, error } = await supabase
      .from('ai_answers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (error != null) throw error;

    const results = [];

    for (const job of jobs ?? []) {
      await supabase.from('ai_answers').update({ status: 'processing', error: null }).eq('id', job.id);

      try {
        const result = await processJob(supabase, job);
        await supabase.from('ai_answers').update({ ...result, status: 'completed' }).eq('id', job.id);

        const { data: notification } = await supabase
          .from('notifications')
          .insert({
            app_user_id: job.app_user_id,
            title: job.kind === 'image_generation' ? '이미지 완료' : '답장 도착',
            body: job.kind === 'image_generation' ? '그림 생성 완료' : 'AI 답장 완료',
            kind: 'ai',
          })
          .select('id')
          .single();

        if (notification != null) {
          await supabase
            .from('notification_jobs')
            .insert({ app_user_id: job.app_user_id, notification_id: notification.id, template_code: 'AI_READY' });
        }

        results.push({ id: job.id, status: 'completed' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI job failed.';
        await supabase.from('ai_answers').update({ status: 'failed', error: message }).eq('id', job.id);
        results.push({ id: job.id, status: 'failed', error: message });
      }
    }

    return json({ processed: results });
  } catch (error) {
    return toErrorResponse(error);
  }
});

async function processJob(supabase: any, job: any) {
  const { data: pet, error: petError } = await supabase.from('pets').select('*').eq('id', job.pet_id).single();
  if (petError != null || pet == null) throw new Error('Pet not found for AI job.');

  if (job.kind === 'letter_text_reply') {
    const { data: letter, error } = await supabase.from('letters').select('*').eq('id', job.source_id).single();
    if (error != null || letter == null) throw new Error('Letter not found for AI job.');
    const content = await createTextReply(
      buildLetterPrompt({
        petName: pet.name,
        species: pet.species,
        relationship: pet.relationship,
        content: letter.content,
      }),
    );
    return { content, image_path: null };
  }

  const { data: answer, error: answerError } = await supabase.from('quest_answers').select('*').eq('id', job.source_id).single();
  if (answerError != null || answer == null) throw new Error('Quest answer not found for AI job.');

  const { data: quest, error: questError } = await supabase.from('quests').select('*').eq('id', answer.quest_id).single();
  if (questError != null || quest == null) throw new Error('Quest not found for AI job.');

  if (job.kind === 'image_generation') {
    if (Deno.env.get('OPENAI_IMAGE_ENABLED') !== 'true') {
      throw new Error('OpenAI image generation is disabled.');
    }

    const bytes = await createImage(
      buildImagePrompt({
        petName: pet.name,
        quest: quest.content,
        answer: answer.content,
        imageUrl: answer.image_url,
      }),
    );
    const path = `${pet.id}/${answer.id}.png`;
    const { error: uploadError } = await supabase.storage.from('ai-images').upload(path, bytes, {
      contentType: 'image/png',
      upsert: true,
    });
    if (uploadError != null) throw uploadError;

    const { data } = supabase.storage.from('ai-images').getPublicUrl(path);
    return { content: null, image_path: data.publicUrl };
  }

  const content = await createTextReply(
    buildQuestPrompt({
      petName: pet.name,
      quest: quest.content,
      answer: answer.content,
    }),
  );
  return { content, image_path: null };
}
