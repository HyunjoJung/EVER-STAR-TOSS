import { HttpError } from './http.ts';

export async function createTextReply(prompt: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_TEXT_MODEL') ?? 'gpt-4.1-mini';

  if (apiKey == null) {
    throw new HttpError(500, 'OPENAI_API_KEY is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI text request failed: ${response.status}`);
  }

  const data = await response.json();
  const output = data.output_text ?? data.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === 'output_text')?.text;

  if (typeof output !== 'string' || output.length === 0) {
    throw new Error('OpenAI text response did not include output text.');
  }

  return output.trim();
}

export async function createImage(prompt: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_IMAGE_MODEL') ?? 'gpt-image-1';

  if (apiKey == null) {
    throw new HttpError(500, 'OPENAI_API_KEY is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      size: '1024x1024',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI image request failed: ${response.status}`);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;

  if (typeof b64 !== 'string' || b64.length === 0) {
    throw new Error('OpenAI image response did not include b64_json.');
  }

  return Uint8Array.from(atob(b64), value => value.charCodeAt(0));
}

export function buildLetterPrompt(input: { petName: string; species: string; relationship: string; content: string }) {
  return [
    `너는 무지개다리 건너 영원별에 있는 반려동물 ${input.petName}이야.`,
    `${input.petName}는 ${input.species}이고 사용자는 ${input.relationship}처럼 여겼어.`,
    '사용자의 편지에 따뜻하고 짧게 답장해줘. 진단이나 의료 조언은 하지 말고, 사랑과 기억을 중심으로 200자 이내 한국어로 써줘.',
    `편지: ${input.content}`,
  ].join('\n');
}

export function buildQuestPrompt(input: { petName: string; quest: string; answer: string }) {
  return [
    `너는 영원별에 있는 반려동물 ${input.petName}이야.`,
    '사용자의 퀘스트 답변에 공감하고, 기억을 소중히 여기는 짧은 답장을 한국어 200자 이내로 써줘.',
    `질문: ${input.quest}`,
    `답변: ${input.answer}`,
  ].join('\n');
}

export function buildImagePrompt(input: { petName: string; quest: string; answer: string; imageUrl?: string | null }) {
  return [
    '따뜻하고 차분한 반려동물 추모 일러스트를 생성해줘.',
    '텍스트, 로고, 워터마크는 넣지 마.',
    `반려동물 이름: ${input.petName}`,
    `질문: ${input.quest}`,
    `사용자 설명: ${input.answer}`,
    input.imageUrl != null ? `참고 이미지 URL: ${input.imageUrl}` : '',
  ].filter(Boolean).join('\n');
}
