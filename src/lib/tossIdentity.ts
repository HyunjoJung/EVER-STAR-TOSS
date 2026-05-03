import { getAnonymousKey } from '@apps-in-toss/framework';

export interface AnonymousIdentity {
  hash: string;
  source: 'apps_in_toss' | 'dev_fallback';
}

export async function resolveAnonymousIdentity(): Promise<AnonymousIdentity> {
  try {
    const result = await getAnonymousKey();

    if (isAnonymousHashResponse(result)) {
      return {
        hash: result.hash,
        source: 'apps_in_toss',
      };
    }
  } catch {
    // Local Granite dev and Jest do not provide the Apps in Toss bridge.
  }

  return {
    hash: 'dev-ever-star-anonymous-hash',
    source: 'dev_fallback',
  };
}

export function isAnonymousHashResponse(value: unknown): value is { type: 'HASH'; hash: string } {
  return (
    typeof value === 'object' &&
    value != null &&
    'type' in value &&
    'hash' in value &&
    (value as { type?: unknown }).type === 'HASH' &&
    typeof (value as { hash?: unknown }).hash === 'string' &&
    (value as { hash: string }).hash.length > 0
  );
}
