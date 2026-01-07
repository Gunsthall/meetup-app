/**
 * Generates a random 6-character alphanumeric session code
 * Format: ABC123
 */
export function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * Validates session code format
 * Must be 6 alphanumeric characters
 */
export function isValidCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}
