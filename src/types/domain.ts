export type QuestType = 'TEXT' | 'TEXT_IMAGE';
export type AiAnswerStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type IdentityProvider = 'apps_in_toss_anonymous' | 'toss_login';

export interface AppUser {
  id: string;
  identityProvider: IdentityProvider;
  anonymousHash: string;
  tossUserKey: string | null;
}

export interface Pet {
  id: string;
  appUserId: string;
  name: string;
  age: number | null;
  species: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  relationship: string;
  memorialDate: string;
  profileImageUrl: string | null;
  introduction: string | null;
  personalities: string[];
  questStartedAt: string;
  questIndex: number;
  isQuestCompleted: boolean;
}

export interface Quest {
  id: number;
  day: number;
  content: string;
  type: QuestType;
}

export interface QuestAnswer {
  id: string;
  petId: string;
  questId: number;
  content: string;
  imageUrl: string | null;
  type: QuestType;
  createdAt: string;
  aiAnswer?: AiAnswer | null;
}

export interface AiAnswer {
  id: string;
  sourceType: 'quest_answer' | 'letter';
  sourceId: string;
  kind: 'quest_text_reply' | 'letter_text_reply' | 'image_generation';
  status: AiAnswerStatus;
  content: string | null;
  imagePath: string | null;
  error: string | null;
  createdAt: string;
}

export interface Letter {
  id: string;
  petId: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  aiAnswer?: AiAnswer | null;
}

export interface MemorialBook {
  id: string;
  pet: Pet;
  isActive: boolean;
  isOpen: boolean;
  psychologicalTestResult: string | null;
  sentimentSummary: {
    week1Result: number | null;
    week2Result: number | null;
    week3Result: number | null;
    week4Result: number | null;
    week5Result: number | null;
    week6Result: number | null;
    week7Result: number | null;
    totalResult: string | null;
  };
  quests: Quest[];
  questAnswers: QuestAnswer[];
  letters: Letter[];
  diaries: Array<{
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
    createdAt: string;
  }>;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  kind: 'quest' | 'letter' | 'ai' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface CreatePetInput {
  name: string;
  age: number | null;
  species: string;
  gender: Pet['gender'];
  relationship: string;
  memorialDate: string;
  profileImageUrl?: string | null;
  introduction?: string | null;
  personalities: string[];
}

export interface SubmitQuestAnswerInput {
  petId: string;
  questId: number;
  content: string;
  imageUrl?: string | null;
}

export interface SendLetterInput {
  petId: string;
  content: string;
  imageUrl?: string | null;
}
