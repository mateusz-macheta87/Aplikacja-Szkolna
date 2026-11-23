export function normalizeText(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[’`´]/g, "'")
    .replace(/[.!?,]/g, "")
    .replace(/\s+/g, " ");
}

export function isSpellingMatch(attempt: string, expected: string): boolean {
  const cleanAttempt = normalizeText(attempt).replace(/[-\s]/g, "");
  const cleanExpected = normalizeText(expected).replace(/[-\s]/g, "");
  return cleanAttempt.length > 0 && cleanAttempt === cleanExpected;
}

export function isSentenceMatch(attemptWords: string[], expectedSentence: string): boolean {
  const joined = normalizeText(attemptWords.join(" "));
  const target = normalizeText(expectedSentence);
  if (joined === target) return true;

  // Accept expanded/contracted forms gracefully (I'm <-> I am, It's <-> It is, What's <-> What is)
  const expand = (s: string) =>
    s
      .replace(/\bi'm\b/g, "i am")
      .replace(/\bit's\b/g, "it is")
      .replace(/\bwhat's\b/g, "what is")
      .replace(/\bdon't\b/g, "do not")
      .replace(/\bhere's\b/g, "here is");

  return expand(joined) === expand(target);
}

export function computeStars(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0 || correct <= 0) return 0;
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  return 1;
}

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
