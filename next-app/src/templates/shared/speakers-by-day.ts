import type { Speaker } from '../types';

/**
 * Group a summit's speakers by their `dayNumber` pivot value. Speakers with
 * `dayNumber === null` are excluded. Each bucket is sorted by `sortOrder`.
 * Buckets themselves come back in ascending day order.
 *
 * Used by every template's speakers section — adding a new speaker with a
 * new day_number in the Speaker admin automatically surfaces a new day
 * block on every funnel for that summit without touching page_content.
 */
export function groupSpeakersByDay(
  speakers: Record<string, Speaker>,
): Array<{ dayNumber: number; speakers: Speaker[] }> {
  const grouped = new Map<number, Speaker[]>();
  for (const s of Object.values(speakers)) {
    if (s.dayNumber === null) continue;
    const bucket = grouped.get(s.dayNumber) ?? [];
    bucket.push(s);
    grouped.set(s.dayNumber, bucket);
  }
  return [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayNumber, list]) => ({
      dayNumber,
      speakers: list.sort((a, b) => a.sortOrder - b.sortOrder),
    }));
}
