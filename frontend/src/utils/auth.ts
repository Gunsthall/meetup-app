/**
 * API Key authentication utilities
 */

const API_KEY_STORAGE_KEY = 'meetup_api_key';

/**
 * Save API key to sessionStorage
 */
export function saveApiKey(apiKey: string): void {
  sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

/**
 * Get API key from sessionStorage
 */
export function getApiKey(): string | null {
  return sessionStorage.getItem(API_KEY_STORAGE_KEY);
}

/**
 * Remove API key from sessionStorage
 */
export function clearApiKey(): void {
  sessionStorage.removeItem(API_KEY_STORAGE_KEY);
}

/**
 * Check if user is authenticated (has valid API key)
 */
export function isAuthenticated(): boolean {
  const apiKey = getApiKey();
  return apiKey !== null && apiKey.trim().length > 0;
}

/**
 * Validate API key format (basic client-side check)
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // Check for basic format: prefix_hexstring
  const pattern = /^(admin|test|user)_[a-f0-9]{48}$/;
  return pattern.test(apiKey);
}
