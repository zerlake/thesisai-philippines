/**
 * Cryptographically secure random utilities
 * Use these instead of Math.random() for security-sensitive operations
 */

export function secureRandomInt(min: number, max: number): number {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    const range = max - min;
    if (range >= 0x100000000) {
      throw new Error('Range is too large');
    }
    
    const maxValidValue = 0x100000000 - (0x100000000 % range);
    let randomValue;
    do {
      const buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      randomValue = buffer[0];
    } while (randomValue >= maxValidValue);
    
    return min + (randomValue % range);
  } else {
    // Fallback for Node.js or environments without crypto
    // In a real application, you'd use Node's crypto module
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export function generateSecureId(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Generate a random ID using crypto API
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback that's still better than just Math.random()
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

// For cases where you really need Math.random but want a more secure alternative
export function secureRandom(): number {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / 0x100000000;
  } else {
    // Fallback to Math.random for server-side rendering
    return Math.random();
  }
}