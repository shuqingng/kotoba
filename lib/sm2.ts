/**
 * SM-2 spaced repetition algorithm (the same core used by Anki).
 *
 * Quality mapping:
 *   again → 1   (fail  – reset progress)
 *   hard  → 3   (pass with difficulty)
 *   good  → 4   (pass comfortably)
 *   easy  → 5   (trivial)
 */

export type ReviewQuality = 'again' | 'hard' | 'good' | 'easy'

const QUALITY: Record<ReviewQuality, number> = {
  again: 1,
  hard:  3,
  good:  4,
  easy:  5,
}

export interface SM2Result {
  next_review: string  // ISO 8601
  interval:    number  // days until next review
  ease_factor: number
  repetitions: number
}

export function applyReview(
  quality:     ReviewQuality,
  interval:    number,
  easeFactor:  number,
  repetitions: number,
): SM2Result {
  const q = QUALITY[quality]

  // Update ease factor regardless of pass/fail
  const newEF = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  )

  let newInterval:    number
  let newRepetitions: number

  if (q < 3) {
    // Failed – restart from scratch
    newRepetitions = 0
    newInterval    = 1
  } else {
    newRepetitions = repetitions + 1
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * newEF)
    }
  }

  const next = new Date()
  next.setDate(next.getDate() + newInterval)

  return {
    next_review: next.toISOString(),
    interval:    newInterval,
    ease_factor: newEF,
    repetitions: newRepetitions,
  }
}

/** Cards whose next_review is on or before now */
export function isDue(nextReview: string): boolean {
  return new Date(nextReview) <= new Date()
}
