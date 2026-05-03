import { QUESTS } from 'data/quests';
import type { Quest } from 'types/domain';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getQuestDay(questStartedAt: string, now = new Date()): number {
  const startedAt = new Date(questStartedAt);

  if (Number.isNaN(startedAt.getTime())) {
    return 1;
  }

  const elapsedDays = Math.floor((startOfDay(now).getTime() - startOfDay(startedAt).getTime()) / DAY_IN_MS);
  return clamp(elapsedDays + 1, 1, QUESTS.length);
}

export function getQuestByDay(day: number): Quest {
  return QUESTS[clamp(day, 1, QUESTS.length) - 1] ?? QUESTS[0]!;
}

export function getQuestProgress(questStartedAt: string, now = new Date()) {
  const day = getQuestDay(questStartedAt, now);

  return {
    day,
    total: QUESTS.length,
    ratio: day / QUESTS.length,
    isFinalDay: day >= QUESTS.length,
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
