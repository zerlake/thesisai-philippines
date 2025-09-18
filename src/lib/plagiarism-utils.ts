export function preprocess(text: string): string {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

export function getShingles(text: string, k = 5): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const shingles = new Set<string>();
  if (words.length < k) {
    if (words.length > 0) {
      shingles.add(words.join(' '));
    }
    return Array.from(shingles);
  }
  for (let i = 0; i <= words.length - k; i++) {
    shingles.add(words.slice(i, i + k).join(' '));
  }
  return Array.from(shingles);
}

export function jaccardSimilarity(setA: string[], setB: string[]): number {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}