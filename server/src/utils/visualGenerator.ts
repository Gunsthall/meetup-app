/**
 * Generate a visually distinct color from session code
 * Uses HSL for better visual distinction
 */
export function colorFromCode(code: string): string {
  // Simple hash
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use HSL for better visual distinction
  // Hue: 0-360, Saturation: 70-90%, Lightness: 50-60%
  const hue = Math.abs(hash % 360);
  const saturation = 70 + Math.abs((hash >> 8) % 20);
  const lightness = 50 + Math.abs((hash >> 16) % 10);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate unique vibration pattern from code
 * Returns array of millisecond durations [on, off, on, off...]
 */
export function patternFromCode(code: string): number[] {
  const patterns = [
    [200, 100, 200],           // short-short
    [400, 100, 200],           // long-short
    [200, 100, 400],           // short-long
    [200, 100, 200, 100, 200], // short-short-short
    [400, 100, 400],           // long-long
    [200, 100, 400, 100, 200], // short-long-short
  ];

  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }

  return patterns[Math.abs(hash) % patterns.length];
}

/**
 * Generate contrasting text color for background
 */
export function textColorForBackground(bgColor: string): string {
  // Extract lightness from HSL
  const match = bgColor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
  const lightness = match ? parseInt(match[1]) : 50;
  return lightness > 55 ? '#000000' : '#FFFFFF';
}
