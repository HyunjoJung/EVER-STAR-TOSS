import { adminClient, requireAppUser } from '../_shared/db.ts';
import { handleOptions, json, readJson, toErrorResponse } from '../_shared/http.ts';
import { mapNotification } from '../_shared/mapper.ts';

Deno.serve(async request => {
  const options = handleOptions(request);
  if (options != null) return options;

  try {
    const body = await readJson<Record<string, unknown>>(request);
    const action = body.action ?? 'dispatch';
    const supabase = adminClient();

    if (action === 'list' || action === 'mark-read') {
      const user = await requireAppUser(supabase, body.anonymousHash);

      if (action === 'mark-read') {
        await supabase.from('notifications').update({ is_read: true }).eq('app_user_id', user.id);
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('app_user_id', user.id)
        .order('created_at', { ascending: false });
      if (error != null) throw error;
      return json((data ?? []).map(mapNotification));
    }

    const pushEnabled = Deno.env.get('TOSS_PUSH_ENABLED') === 'true';
    const { data: jobs, error } = await supabase
      .from('notification_jobs')
      .select('*, notifications(title, body, kind), app_users(toss_user_key)')
      .eq('status', 'pending')
      .limit(20);
    if (error != null) throw error;

    const results = [];
    for (const job of jobs ?? []) {
      const tossUserKey = job.toss_user_key ?? job.app_users?.toss_user_key;

      if (!pushEnabled || tossUserKey == null) {
        await supabase
          .from('notification_jobs')
          .update({ status: 'skipped', error: pushEnabled ? 'toss_user_key missing' : 'TOSS_PUSH_ENABLED=false' })
          .eq('id', job.id);
        results.push({ id: job.id, status: 'skipped' });
        continue;
      }

      const sent = await sendViaProxy({
        tossUserKey,
        title: job.notifications?.title,
        body: job.notifications?.body,
        templateCode: job.template_code,
        payload: job.payload,
      });

      await supabase.from('notification_jobs').update({ status: sent ? 'sent' : 'failed' }).eq('id', job.id);
      results.push({ id: job.id, status: sent ? 'sent' : 'failed' });
    }

    return json({ processed: results });
  } catch (error) {
    return toErrorResponse(error);
  }
});

async function sendViaProxy(payload: Record<string, unknown>) {
  const proxyUrl = Deno.env.get('TOSS_PUSH_PROXY_URL');
  const proxyToken = Deno.env.get('TOSS_PUSH_PROXY_TOKEN');

  if (proxyUrl == null || proxyToken == null) {
    return false;
  }

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${proxyToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.ok;
}
