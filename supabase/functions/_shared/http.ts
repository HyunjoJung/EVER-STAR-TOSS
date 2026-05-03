export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-everstar-anonymous-hash',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}

export function handleOptions(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  return null;
}

export async function readJson<T extends Record<string, unknown>>(request: Request): Promise<T> {
  if (request.method !== 'POST') {
    throw new HttpError(405, 'Only POST is supported.');
  }

  return (await request.json()) as T;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return json({ message: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : 'Unexpected edge function error.';
  return json({ message }, { status: 500 });
}
