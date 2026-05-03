import { adminClient, requireAppUser, requireOwnedPet } from '../_shared/db.ts';
import { handleOptions, HttpError, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapLetter } from '../_shared/mapper.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const action = body.action ?? 'create';
    const supabase = adminClient();
    const user = await requireAppUser(supabase, body.anonymousHash);

    if (action === 'list') {
      const pet = await requireOwnedPet(supabase, user.id, body.petId);
      const { data: letters, error } = await supabase.from('letters').select('*').eq('pet_id', pet.id).order('created_at', { ascending: false });
      if (error != null) throw error;
      return json(await mapLettersWithAi(supabase, letters ?? []));
    }

    if (action === 'get') {
      const { data: letter, error } = await supabase.from('letters').select('*').eq('id', body.letterId).eq('app_user_id', user.id).single();
      if (error != null || letter == null) throw new HttpError(404, 'Letter not found.');
      const [mapped] = await mapLettersWithAi(supabase, [letter]);
      return json(mapped);
    }

    const pet = await requireOwnedPet(supabase, user.id, body.petId);
    const content = String(body.content ?? '').trim();
    if (content.length === 0) {
      throw new HttpError(400, 'content is required.');
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .insert({
        app_user_id: user.id,
        pet_id: pet.id,
        content,
        image_url: typeof body.imageUrl === 'string' && body.imageUrl.length > 0 ? body.imageUrl : null,
      })
      .select('*')
      .single();
    if (error != null) throw error;

    const { data: aiAnswer, error: aiError } = await supabase
      .from('ai_answers')
      .insert({
        app_user_id: user.id,
        pet_id: pet.id,
        source_type: 'letter',
        source_id: letter.id,
        kind: 'letter_text_reply',
        status: 'pending',
        prompt: content,
      })
      .select('*')
      .single();
    if (aiError != null) throw aiError;

    const { data: notification } = await supabase
      .from('notifications')
      .insert({ app_user_id: user.id, title: '답장 준비', body: `${pet.name}의 편지`, kind: 'letter' })
      .select('id')
      .single();

    if (notification != null) {
      await supabase.from('notification_jobs').insert({ app_user_id: user.id, notification_id: notification.id, template_code: 'LETTER_READY' });
    }

    return json(mapLetter(letter, aiAnswer));
  } catch (error) {
    return toErrorResponse(error);
  }
});

async function mapLettersWithAi(supabase: any, letters: any[]) {
  if (letters.length === 0) {
    return [];
  }

  const ids = letters.map(letter => letter.id);
  const { data: aiRows, error } = await supabase.from('ai_answers').select('*').eq('source_type', 'letter').in('source_id', ids);
  if (error != null) throw error;

  return letters.map(letter => {
    const aiAnswer = (aiRows ?? [])
      .filter((row: any) => row.source_id === letter.id)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null;
    return mapLetter(letter, aiAnswer);
  });
}
