/**
 * Password Hashing Utilities
 *
 * Provides secure password hashing and verification using bcrypt.
 * Configured with appropriate salt rounds for security and performance balance.
 */

import bcrypt from 'bcryptjs';

/**
 * Number of salt rounds for bcrypt hashing.
 * Range: 10-12 is recommended for balance between security and performance.
 * - 10: ~100ms per hash (recommended for most applications)
 * - 12: ~250ms per hash (higher security, acceptable for authentication)
 *
 * Higher rounds = more secure but slower performance.
 */
const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt.
 *
 * @param password - The plain text password to hash
 * @returns Promise resolving to the bcrypt hash string
 * @throws {Error} If password is empty or hashing fails
 *
 * @example
 * ```typescript
 * const hash = await hashPassword('SecurePassword123!');
 * // Returns: '$2a$12$...' (60 character bcrypt hash)
 * ```
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error(
      `Failed to hash password: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify a plain text password against a bcrypt hash.
 *
 * @param password - The plain text password to verify
 * @param hash - The bcrypt hash to verify against
 * @returns Promise resolving to true if password matches, false otherwise
 * @throws {Error} If inputs are invalid or verification fails
 *
 * @example
 * ```typescript
 * const isValid = await verifyPassword('SecurePassword123!', storedHash);
 * if (isValid) {
 *   // Password is correct
 * }
 * ```
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || password.trim().length === 0) {
    throw new Error('Password cannot be empty');
  }

  if (!hash || hash.trim().length === 0) {
    throw new Error('Hash cannot be empty');
  }

  // Validate hash format (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (!hash.match(/^\$2[aby]\$\d{2}\$/)) {
    throw new Error('Invalid bcrypt hash format');
  }

  try {
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    throw new Error(
      `Failed to verify password: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get the configured salt rounds.
 * Exported for testing purposes.
 *
 * @returns The number of salt rounds used for hashing
 */
export function getSaltRounds(): number {
  return SALT_ROUNDS;
}
