export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

export interface Sm2State {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface Sm2Result extends Sm2State {
  nextReviewDate: string;
}

const RATING_QUALITY: Record<FlashcardRating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};
// Classic SM-2 quality scale (0-5). Only "again" (quality < 3) triggers the
// lapse branch below — matches the 4-button Errei/Difícil/Bom/Fácil UX.

export function computeNextReview(
  rating: FlashcardRating,
  state: Sm2State,
  today: string,
  addDays: (date: string, days: number) => string,
): Sm2Result {
  const quality = RATING_QUALITY[rating];

  let easeFactor =
    state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  let repetitions: number;
  let intervalDays: number;

  if (quality < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions = state.repetitions + 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(state.intervalDays * easeFactor);
  }

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewDate: addDays(today, intervalDays),
  };
}
