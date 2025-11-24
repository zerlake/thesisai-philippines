/**
 * Text Similarity Algorithms for Originality Checking
 * Implements various similarity algorithms to be used when external APIs are unavailable
 */

// Cosine Similarity Algorithm
export function cosineSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const words1 = text1.toLowerCase().split(/\s+/).filter(Boolean);
  const words2 = text2.toLowerCase().split(/\s+/).filter(Boolean);
  
  // Create frequency vectors
  const vec1: Record<string, number> = {};
  const vec2: Record<string, number> = {};
  
  words1.forEach(word => vec1[word] = (vec1[word] || 0) + 1);
  words2.forEach(word => vec2[word] = (vec2[word] || 0) + 1);
  
  // Calculate cosine similarity
  const intersection = Object.keys(vec1).filter(word => vec2.hasOwnProperty(word));
  const dotProduct = intersection.reduce((sum, word) => sum + (vec1[word] * vec2[word]), 0);
  
  const magnitude1 = Math.sqrt(Object.values(vec1).reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vec2).reduce((sum, val) => sum + val * val, 0));
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
}

// Levenshtein Distance Algorithm (Edit Distance)
export function levenshteinDistance(str1: string, str2: string): number {
  if (!str1) return str2.length || 0;
  if (!str2) return str1.length || 0;
  
  const matrix = Array(str2.length + 1).fill(0).map(() => Array(str1.length + 1).fill(0));

  // Initialize matrix
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  // Fill matrix
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,         // deletion
        matrix[j - 1][i] + 1,         // insertion
        matrix[j - 1][i - 1] + cost   // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Normalized Levenshtein-based similarity
export function normalizedLevenshteinSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return text1 === text2 ? 1 : 0;
  
  const distance = levenshteinDistance(text1, text2);
  const maxLength = Math.max(text1.length, text2.length);
  
  if (maxLength === 0) return 1;
  
  return 1 - distance / maxLength;
}

// Overlap Coefficient Algorithm
export function overlapCoefficient(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const set1 = new Set(text1.toLowerCase().split(/\s+/).filter(Boolean));
  const set2 = new Set(text2.toLowerCase().split(/\s+/).filter(Boolean));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const minSize = Math.min(set1.size, set2.size);
  
  if (minSize === 0) return 0;
  
  return intersection.size / minSize;
}

// Sorensen-Dice Coefficient Algorithm
export function sorensenDiceCoefficient(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const set1 = new Set(text1.toLowerCase().split(/\s+/).filter(Boolean));
  const set2 = new Set(text2.toLowerCase().split(/\s+/).filter(Boolean));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const sumSizes = set1.size + set2.size;
  
  if (sumSizes === 0) return 0;
  
  return (2 * intersection.size) / sumSizes;
}

// Longest Common Subsequence Algorithm
export function longestCommonSubsequence(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  
  const words1 = text1.toLowerCase().split(/\s+/).filter(Boolean);
  const words2 = text2.toLowerCase().split(/\s+/).filter(Boolean);
  
  const dp: number[][] = Array(words1.length + 1).fill(0).map(() => Array(words2.length + 1).fill(0));
  
  for (let i = 1; i <= words1.length; i++) {
    for (let j = 1; j <= words2.length; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const lcsLength = dp[words1.length][words2.length];
  const maxLength = Math.max(words1.length, words2.length);
  
  return maxLength === 0 ? 1 : lcsLength / maxLength;
}

// MinHash approximation of Jaccard similarity
export function minHashSimilarity(text1: string, text2: string, numHashes: number = 100): number {
  if (!text1 || !text2) return 0;
  
  const set1 = new Set(text1.toLowerCase().split(/\s+/).filter(Boolean));
  const set2 = new Set(text2.toLowerCase().split(/\s+/).filter(Boolean));
  
  // Simple hash function
  const hash = (str: string, seed: number): number => {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };
  
  // Generate signatures
  const sig1 = Array(numHashes).fill(Number.MAX_SAFE_INTEGER);
  const sig2 = Array(numHashes).fill(Number.MAX_SAFE_INTEGER);
  
  for (let i = 0; i < numHashes; i++) {
    let minHash1 = Number.MAX_SAFE_INTEGER;
    let minHash2 = Number.MAX_SAFE_INTEGER;
    
    for (const word of set1) {
      const h = hash(word, i);
      if (h < minHash1) minHash1 = h;
    }
    sig1[i] = minHash1;
    
    for (const word of set2) {
      const h = hash(word, i);
      if (h < minHash2) minHash2 = h;
    }
    sig2[i] = minHash2;
  }
  
  // Compare signatures
  let matches = 0;
  for (let i = 0; i < numHashes; i++) {
    if (sig1[i] === sig2[i]) matches++;
  }
  
  return matches / numHashes;
}

// Preprocessor for text cleaning
export function preprocessText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}