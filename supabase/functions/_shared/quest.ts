const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getQuestDay(questStartedAt: string, now = new Date()) {
  const startedAt = new Date(questStartedAt);

  if (Number.isNaN(startedAt.getTime())) {
    return 1;
  }

  const elapsedDays = Math.floor((startOfDay(now).getTime() - startOfDay(startedAt).getTime()) / DAY_IN_MS);
  return Math.min(Math.max(elapsedDays + 1, 1), 49);
}

export function getQuestProgress(questStartedAt: string, now = new Date()) {
  const day = getQuestDay(questStartedAt, now);

  return {
    day,
    total: 49,
    ratio: day / 49,
    isFinalDay: day >= 49,
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
