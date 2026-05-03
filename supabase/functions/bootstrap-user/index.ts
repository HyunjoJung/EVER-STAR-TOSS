import { adminClient } from '../_shared/db.ts';
import { handleOptions, json, readJson, toErrorResponse } from '../_shared/http.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<{ anonymousHash?: unknown }>(request);
    const anonymousHash = String(body.anonymousHash ?? '');

    if (anonymousHash.length === 0) {
      return json({ message: 'anonymousHash is required.' }, { status: 400 });
    }

    const supabase = adminClient();
    const { data, error } = await supabase
      .from('app_users')
      .upsert({ anonymous_hash: anonymousHash, identity_provider: 'apps_in_toss_anonymous' }, { onConflict: 'anonymous_hash' })
      .select('*')
      .single();

    if (error != null) throw error;

    return json({
      id: data.id,
      identityProvider: data.identity_provider,
      anonymousHash: data.anonymous_hash,
      tossUserKey: data.toss_user_key,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
});
