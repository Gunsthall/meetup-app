/**
 * Returns blink interval in milliseconds based on distance
 * Closer = faster blinking
 */
export function blinkIntervalFromDistance(distanceMeters: number): number {
  if (distanceMeters > 500) return 2000; // Very far: slow pulse
  if (distanceMeters > 200) return 1500;
  if (distanceMeters > 100) return 1000;
  if (distanceMeters > 50) return 600;
  if (distanceMeters > 20) return 300;
  if (distanceMeters > 10) return 150;
  return 80; // Very close: rapid flash
}
