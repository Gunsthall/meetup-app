/**
 * Trigger vibration pattern
 */
export function vibrate(pattern: number[]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * Stop vibration
 */
export function stopVibration(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}
