import { QUESTS } from '../data/quests';
import { getQuestByDay, getQuestDay, getQuestProgress } from './quest';

describe('49-day quest schedule', () => {
  it('contains exactly 49 seeded quests with sequential days', () => {
    expect(QUESTS).toHaveLength(49);
    expect(QUESTS.map(quest => quest.day)).toEqual(Array.from({ length: 49 }, (_, index) => index + 1));
  });

  it('opens one quest per calendar day from the pet start date', () => {
    const startedAt = new Date(2026, 4, 1, 15).toISOString();

    expect(getQuestDay(startedAt, new Date(2026, 4, 1, 23))).toBe(1);
    expect(getQuestDay(startedAt, new Date(2026, 4, 2, 12))).toBe(2);
    expect(getQuestDay(startedAt, new Date(2026, 4, 10, 12))).toBe(10);
  });

  it('clamps invalid, past, and far-future quest days safely', () => {
    expect(getQuestDay('not-a-date')).toBe(1);
    expect(getQuestDay(new Date(2026, 4, 10).toISOString(), new Date(2026, 4, 1))).toBe(1);
    expect(getQuestDay(new Date(2026, 4, 1).toISOString(), new Date(2026, 11, 31))).toBe(49);
    expect(getQuestByDay(0).day).toBe(1);
    expect(getQuestByDay(999).day).toBe(49);
  });

  it('reports progress for memorial book completion', () => {
    expect(getQuestProgress(new Date(2026, 4, 1).toISOString(), new Date(2026, 5, 1)).total).toBe(49);
    expect(getQuestProgress(new Date(2026, 4, 1).toISOString(), new Date(2026, 5, 18)).isFinalDay).toBe(true);
  });
});
