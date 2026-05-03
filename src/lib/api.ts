import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env, isSupabaseConfigured } from 'config/env';
import { QUESTS } from 'data/quests';
import { getQuestByDay, getQuestProgress } from 'lib/quest';
import type {
  AiAnswer,
  AppUser,
  CreatePetInput,
  Letter,
  MemorialBook,
  NotificationItem,
  Pet,
  Quest,
  QuestAnswer,
  SendLetterInput,
  SubmitQuestAnswerInput,
} from 'types/domain';

const supabase = isSupabaseConfigured() ? createClient(env.supabaseUrl, env.supabaseAnonKey) : null;

const createPetSchema = z.object({
  name: z.string().trim().min(1),
  age: z.number().int().positive().nullable(),
  species: z.string().trim().min(1),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN']),
  relationship: z.string().trim().min(1),
  memorialDate: z.string().trim().min(1),
  profileImageUrl: z.string().trim().url().nullable().optional(),
  introduction: z.string().trim().nullable().optional(),
  personalities: z.array(z.string().trim().min(1)).max(8),
});

export const everStarApi = {
  async bootstrapUser(anonymousHash: string): Promise<AppUser> {
    if (supabase != null) {
      return invokeEdge<AppUser>('bootstrap-user', { anonymousHash });
    }

    mockStore.user = {
      ...mockStore.user,
      anonymousHash,
    };
    return clone(mockStore.user);
  },

  async listPets(anonymousHash: string): Promise<Pet[]> {
    if (supabase != null) {
      return invokeEdge<Pet[]>('list-pets', { anonymousHash });
    }

    return clone(mockStore.pets);
  },

  async getPet(anonymousHash: string, petId: string): Promise<Pet> {
    if (supabase != null) {
      return invokeEdge<Pet>('get-pet', { anonymousHash, petId });
    }

    return clone(requirePet(petId));
  },

  async createPet(anonymousHash: string, input: CreatePetInput): Promise<Pet> {
    const payload = createPetSchema.parse(input);

    if (supabase != null) {
      return invokeEdge<Pet>('create-pet', { anonymousHash, ...payload });
    }

    const pet: Pet = {
      id: createId('pet'),
      appUserId: mockStore.user.id,
      name: payload.name,
      age: payload.age,
      species: payload.species,
      gender: payload.gender,
      relationship: payload.relationship,
      memorialDate: payload.memorialDate,
      profileImageUrl: payload.profileImageUrl ?? null,
      introduction: payload.introduction ?? null,
      personalities: payload.personalities,
      questStartedAt: new Date().toISOString(),
      questIndex: 1,
      isQuestCompleted: false,
    };

    mockStore.pets.unshift(pet);
    pushNotification('system', '등록 완료', `${pet.name} 기록 시작`);
    return clone(pet);
  },

  async getTodayQuest(anonymousHash: string, petId: string): Promise<{ pet: Pet; quest: Quest; progress: ReturnType<typeof getQuestProgress>; answer: QuestAnswer | null }> {
    if (supabase != null) {
      return invokeEdge('get-today-quest', { anonymousHash, petId });
    }

    const pet = requirePet(petId);
    const progress = getQuestProgress(pet.questStartedAt);
    const quest = getQuestByDay(progress.day);
    const answer = mockStore.questAnswers.find(item => item.petId === petId && item.questId === quest.id) ?? null;

    return clone({ pet, quest, progress, answer });
  },

  async submitQuestAnswer(anonymousHash: string, input: SubmitQuestAnswerInput): Promise<QuestAnswer> {
    if (supabase != null) {
      return invokeEdge<QuestAnswer>('submit-quest-answer', { anonymousHash, ...input });
    }

    const pet = requirePet(input.petId);
    const quest = getQuestByDay(input.questId);
    const existingIndex = mockStore.questAnswers.findIndex(item => item.petId === input.petId && item.questId === input.questId);
    const answer: QuestAnswer = {
      id: existingIndex >= 0 ? mockStore.questAnswers[existingIndex]?.id ?? createId('answer') : createId('answer'),
      petId: input.petId,
      questId: quest.id,
      content: input.content.trim(),
      imageUrl: input.imageUrl ?? null,
      type: quest.type,
      createdAt: new Date().toISOString(),
      aiAnswer: buildMockAiAnswer(quest.type === 'TEXT_IMAGE' ? 'image_generation' : 'quest_text_reply', input.content),
    };

    if (existingIndex >= 0) {
      mockStore.questAnswers[existingIndex] = answer;
    } else {
      mockStore.questAnswers.push(answer);
    }

    pet.questIndex = Math.max(pet.questIndex, quest.day);
    pet.isQuestCompleted = mockStore.questAnswers.filter(item => item.petId === input.petId).length >= QUESTS.length;
    pushNotification('quest', '퀘스트 완료', `${quest.day}일차 기록 저장`);
    return clone(answer);
  },

  async listLetters(anonymousHash: string, petId: string): Promise<Letter[]> {
    if (supabase != null) {
      return invokeEdge<Letter[]>('send-letter', { anonymousHash, petId, action: 'list' });
    }

    return clone(mockStore.letters.filter(letter => letter.petId === petId).sort(sortNewest));
  },

  async getLetter(anonymousHash: string, letterId: string): Promise<Letter> {
    if (supabase != null) {
      return invokeEdge<Letter>('send-letter', { anonymousHash, letterId, action: 'get' });
    }

    const letter = mockStore.letters.find(item => item.id === letterId);
    if (letter == null) {
      throw new Error('편지를 찾을 수 없습니다.');
    }
    return clone(letter);
  },

  async sendLetter(anonymousHash: string, input: SendLetterInput): Promise<Letter> {
    if (supabase != null) {
      return invokeEdge<Letter>('send-letter', { anonymousHash, ...input, action: 'create' });
    }

    const pet = requirePet(input.petId);
    const letter: Letter = {
      id: createId('letter'),
      petId: input.petId,
      content: input.content.trim(),
      imageUrl: input.imageUrl ?? null,
      createdAt: new Date().toISOString(),
      aiAnswer: buildMockAiAnswer('letter_text_reply', `${pet.name}가 ${input.content.trim()}`),
    };
    mockStore.letters.unshift(letter);
    pushNotification('letter', '답장 도착', `${pet.name}의 편지`);
    return clone(letter);
  },

  async getMemorialBook(anonymousHash: string, petId: string): Promise<MemorialBook> {
    if (supabase != null) {
      return invokeEdge<MemorialBook>('get-memorial-book', { anonymousHash, petId });
    }

    const pet = requirePet(petId);
    const questAnswers = mockStore.questAnswers.filter(answer => answer.petId === petId).sort((a, b) => a.questId - b.questId);
    const letters = mockStore.letters.filter(letter => letter.petId === petId).sort(sortNewest);
    const completedWeeks = Math.max(1, Math.ceil(questAnswers.length / 7));

    return clone({
      id: `memorial-${pet.id}`,
      pet,
      isActive: questAnswers.length >= QUESTS.length,
      isOpen: true,
      psychologicalTestResult: questAnswers.length >= QUESTS.length ? '49일 기록을 완료했어요. 천천히 회복해온 마음이 기록에 남아 있어요.' : null,
      sentimentSummary: {
        week1Result: scoreWeek(completedWeeks, 1),
        week2Result: scoreWeek(completedWeeks, 2),
        week3Result: scoreWeek(completedWeeks, 3),
        week4Result: scoreWeek(completedWeeks, 4),
        week5Result: scoreWeek(completedWeeks, 5),
        week6Result: scoreWeek(completedWeeks, 6),
        week7Result: scoreWeek(completedWeeks, 7),
        totalResult: '기록이 쌓일수록 감정의 흐름이 더 선명하게 보일 거예요.',
      },
      quests: QUESTS,
      questAnswers,
      letters,
      diaries: [],
    });
  },

  async listNotifications(anonymousHash: string): Promise<NotificationItem[]> {
    if (supabase != null) {
      return invokeEdge<NotificationItem[]>('dispatch-notifications', { anonymousHash, action: 'list' });
    }

    return clone(mockStore.notifications.sort(sortNewest));
  },

  async markNotificationsRead(anonymousHash: string): Promise<NotificationItem[]> {
    if (supabase != null) {
      return invokeEdge<NotificationItem[]>('dispatch-notifications', { anonymousHash, action: 'mark-read' });
    }

    mockStore.notifications = mockStore.notifications.map(item => ({ ...item, isRead: true }));
    return clone(mockStore.notifications);
  },
};

async function invokeEdge<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (supabase == null) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase.functions.invoke<T>(name, { body });

  if (error != null) {
    throw new Error(error.message);
  }

  return data as T;
}

const mockStore: {
  user: AppUser;
  pets: Pet[];
  questAnswers: QuestAnswer[];
  letters: Letter[];
  notifications: NotificationItem[];
} = {
  user: {
    id: 'mock-user',
    identityProvider: 'apps_in_toss_anonymous',
    anonymousHash: 'mock-anonymous-hash',
    tossUserKey: null,
  },
  pets: [
    {
      id: 'pet-sepi',
      appUserId: 'mock-user',
      name: '쎄피',
      age: 15,
      species: '말티즈',
      gender: 'MALE',
      relationship: '동생',
      memorialDate: '2024-08-01',
      profileImageUrl: null,
      introduction: '산책과 간식을 좋아하던 밝은 아이',
      personalities: ['활발한', '친화적인'],
      questStartedAt: new Date().toISOString(),
      questIndex: 1,
      isQuestCompleted: false,
    },
  ],
  questAnswers: [],
  letters: [],
  notifications: [
    {
      id: 'notification-welcome',
      title: '기록 시작',
      body: '오늘 퀘스트 도착',
      kind: 'quest',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
};

function requirePet(petId: string): Pet {
  const pet = mockStore.pets.find(item => item.id === petId);

  if (pet == null) {
    throw new Error('반려동물을 찾을 수 없습니다.');
  }

  return pet;
}

function buildMockAiAnswer(kind: AiAnswer['kind'], content: string): AiAnswer {
  const isImage = kind === 'image_generation';

  return {
    id: createId('ai'),
    sourceType: kind === 'letter_text_reply' ? 'letter' : 'quest_answer',
    sourceId: 'mock-source',
    kind,
    status: 'completed',
    content: isImage ? null : `너의 마음이 잘 전해졌어. "${content.slice(0, 32)}" 이 기억을 영원별에서도 따뜻하게 간직할게.`,
    imagePath: isImage ? 'mock://generated-ever-star-image' : null,
    error: null,
    createdAt: new Date().toISOString(),
  };
}

function pushNotification(kind: NotificationItem['kind'], title: string, body: string) {
  mockStore.notifications.unshift({
    id: createId('notification'),
    title,
    body,
    kind,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
}

function scoreWeek(completedWeeks: number, week: number) {
  if (week > completedWeeks) {
    return null;
  }

  return Math.min(95, 42 + week * 7);
}

function sortNewest(a: { createdAt: string }, b: { createdAt: string }) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
