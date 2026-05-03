export const queryKeys = {
  pets: (anonymousHash: string | null) => ['pets', anonymousHash] as const,
  pet: (anonymousHash: string | null, petId: string | null) => ['pet', anonymousHash, petId] as const,
  todayQuest: (anonymousHash: string | null, petId: string | null) => ['today-quest', anonymousHash, petId] as const,
  letters: (anonymousHash: string | null, petId: string | null) => ['letters', anonymousHash, petId] as const,
  letter: (anonymousHash: string | null, letterId: string | null) => ['letter', anonymousHash, letterId] as const,
  memorialBook: (anonymousHash: string | null, petId: string | null) => ['memorial-book', anonymousHash, petId] as const,
  notifications: (anonymousHash: string | null) => ['notifications', anonymousHash] as const,
};
