/**
 * Password Hashing Utilities Tests
 *
 * Comprehensive test suite for password hashing and verification functions.
 * Tests security requirements, edge cases, and error handling.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword, getSaltRounds } from './password';

describe('Password Hashing Utilities', () => {
  describe('getSaltRounds', () => {
    it('should return salt rounds between 10-12', () => {
      const rounds = getSaltRounds();
      expect(rounds).toBeGreaterThanOrEqual(10);
      expect(rounds).toBeLessThanOrEqual(12);
    });

    it('should return 12 rounds (recommended configuration)', () => {
      const rounds = getSaltRounds();
      expect(rounds).toBe(12);
    });
  });

  describe('hashPassword', () => {
    it('should return a valid bcrypt hash', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      // Bcrypt hash format: $2a$12$[22 character salt][31 character hash]
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(60); // Standard bcrypt hash length
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/); // Bcrypt format
    });

    it('should include salt rounds in hash', async () => {
      const password = 'TestPassword456';
      const hash = await hashPassword(password);

      // Extract rounds from hash (format: $2a$12$...)
      const rounds = hash.split('$')[2];
      expect(rounds).toBe('12');
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword789';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Different salts should produce different hashes
      expect(hash1).not.toBe(hash2);
    });

    it('should hash passwords of various lengths', async () => {
      const passwords = [
        'Short123', // Short password
        'AverageLength_Password_123!', // Average length
        'Very_Long_Password_With_Many_Characters_And_Numbers_123456789!@#$%^&*()_+', // Long password
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        expect(hash).toBeDefined();
        expect(hash.length).toBe(60);
      }
    });

    it('should hash passwords with special characters', async () => {
      const specialPasswords = [
        'Pass!@#$%^&*()',
        'Spëcïål_Çhàrs',
        '密码123', // Unicode characters
        'emoji_👍_password',
      ];

      for (const password of specialPasswords) {
        const hash = await hashPassword(password);
        expect(hash).toBeDefined();
        expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
      }
    });

    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for whitespace-only password', async () => {
      await expect(hashPassword('   ')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for null password', async () => {
      // @ts-expect-error - Testing invalid input
      await expect(hashPassword(null)).rejects.toThrow();
    });

    it('should throw error for undefined password', async () => {
      // @ts-expect-error - Testing invalid input
      await expect(hashPassword(undefined)).rejects.toThrow();
    });

    it('should complete hashing within reasonable time', async () => {
      const password = 'PerformanceTest123!';
      const startTime = Date.now();

      await hashPassword(password);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // With 12 rounds, should complete in under 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('verifyPassword', () => {
    let testPassword: string;
    let testHash: string;

    beforeAll(async () => {
      testPassword = 'TestPassword123!';
      testHash = await hashPassword(testPassword);
    });

    it('should return true for correct password', async () => {
      const isValid = await verifyPassword(testPassword, testHash);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const isValid = await verifyPassword('WrongPassword', testHash);
      expect(isValid).toBe(false);
    });

    it('should return false for similar but incorrect password', async () => {
      const isValid = await verifyPassword('TestPassword123', testHash); // Missing !
      expect(isValid).toBe(false);
    });

    it('should return false for password with different case', async () => {
      const isValid = await verifyPassword('testpassword123!', testHash);
      expect(isValid).toBe(false);
    });

    it('should handle password with leading/trailing spaces', async () => {
      const passwordWithSpaces = '  TestPassword456  ';
      const hash = await hashPassword(passwordWithSpaces);

      // Should match with spaces
      const isValid1 = await verifyPassword(passwordWithSpaces, hash);
      expect(isValid1).toBe(true);

      // Should not match without spaces (strict comparison)
      const isValid2 = await verifyPassword('TestPassword456', hash);
      expect(isValid2).toBe(false);
    });

    it('should verify passwords with special characters', async () => {
      const specialPassword = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(specialPassword);

      const isValid = await verifyPassword(specialPassword, hash);
      expect(isValid).toBe(true);
    });

    it('should verify passwords with unicode characters', async () => {
      const unicodePassword = 'Pässwörd_密码_👍';
      const hash = await hashPassword(unicodePassword);

      const isValid = await verifyPassword(unicodePassword, hash);
      expect(isValid).toBe(true);
    });

    it('should throw error for empty password', async () => {
      await expect(verifyPassword('', testHash)).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for empty hash', async () => {
      await expect(verifyPassword(testPassword, '')).rejects.toThrow('Hash cannot be empty');
    });

    it('should throw error for whitespace-only password', async () => {
      await expect(verifyPassword('   ', testHash)).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for whitespace-only hash', async () => {
      await expect(verifyPassword(testPassword, '   ')).rejects.toThrow('Hash cannot be empty');
    });

    it('should throw error for invalid hash format', async () => {
      const invalidHashes = [
        'not_a_hash',
        'invalid_bcrypt_format',
        '$1$invalid$hash', // Wrong algorithm
        'plain_text_password',
      ];

      for (const invalidHash of invalidHashes) {
        await expect(verifyPassword(testPassword, invalidHash)).rejects.toThrow(
          'Invalid bcrypt hash format'
        );
      }
    });

    it('should throw error for null password', async () => {
      // @ts-expect-error - Testing invalid input
      await expect(verifyPassword(null, testHash)).rejects.toThrow();
    });

    it('should throw error for null hash', async () => {
      // @ts-expect-error - Testing invalid input
      await expect(verifyPassword(testPassword, null)).rejects.toThrow();
    });

    it('should complete verification within reasonable time', async () => {
      const startTime = Date.now();

      await verifyPassword(testPassword, testHash);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verification should be faster than hashing (under 500ms)
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Integration: Hash and Verify', () => {
    it('should successfully hash and verify multiple passwords', async () => {
      const passwords = [
        'Password1!',
        'AnotherSecurePass@2023',
        'Très_Sécurisé_Mot_de_Passe',
        'emoji_password_🔒',
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);

        // Correct password should verify
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);

        // Wrong password should not verify
        const isInvalid = await verifyPassword('WrongPassword', hash);
        expect(isInvalid).toBe(false);
      }
    });

    it('should maintain security with rapid successive operations', async () => {
      const password = 'RapidTest123!';

      // Generate multiple hashes rapidly
      const hashes = await Promise.all([
        hashPassword(password),
        hashPassword(password),
        hashPassword(password),
        hashPassword(password),
        hashPassword(password),
      ]);

      // All hashes should be different (unique salts)
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(hashes.length);

      // All should verify correctly
      for (const hash of hashes) {
        const isValid = await verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });

    it('should work with minimum secure password length', async () => {
      // 12 characters minimum (as per security requirements)
      const minPassword = 'SecurePass1!';
      expect(minPassword.length).toBeGreaterThanOrEqual(12);

      const hash = await hashPassword(minPassword);
      const isValid = await verifyPassword(minPassword, hash);

      expect(isValid).toBe(true);
    });

    it('should work with maximum reasonable password length', async () => {
      // 72 bytes is bcrypt's maximum input length
      const longPassword = 'A'.repeat(72) + '!';
      const hash = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('Security Properties', () => {
    it('should produce cryptographically secure hashes', async () => {
      const password = 'SecurityTest123!';
      const hash = await hashPassword(password);

      // Bcrypt hash should have all components
      const parts = hash.split('$');
      expect(parts).toHaveLength(4); // ['', '2a', '12', 'saltAndHash']

      // Algorithm identifier
      expect(['2a', '2b', '2y']).toContain(parts[1]);

      // Salt rounds
      expect(parts[2]).toBe('12');

      // Salt and hash combined (53 characters: 22 salt + 31 hash)
      expect(parts[3]).toHaveLength(53);
    });

    it('should not reveal password length in hash', async () => {
      const shortPassword = 'Short1!';
      const longPassword = 'VeryLongPasswordWithManyCharacters123!@#';

      const shortHash = await hashPassword(shortPassword);
      const longHash = await hashPassword(longPassword);

      // All bcrypt hashes are the same length regardless of input
      expect(shortHash.length).toBe(longHash.length);
      expect(shortHash.length).toBe(60);
    });

    it('should be resistant to timing attacks', async () => {
      const password = 'TimingTest123!';
      const hash = await hashPassword(password);

      // Measure verification time for correct password
      const start1 = Date.now();
      await verifyPassword(password, hash);
      const time1 = Date.now() - start1;

      // Measure verification time for incorrect password
      const start2 = Date.now();
      await verifyPassword('WrongPassword', hash);
      const time2 = Date.now() - start2;

      // Times should be similar (within 50ms margin for constant-time comparison)
      // Note: bcrypt's compare is designed to be constant-time
      const timeDiff = Math.abs(time1 - time2);
      expect(timeDiff).toBeLessThan(50);
    });
  });

  describe('Error Handling', () => {
    it('should provide descriptive error messages', async () => {
      try {
        await hashPassword('');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Password cannot be empty');
      }
    });

    it('should handle bcrypt errors gracefully', async () => {
      const validPassword = 'Test123!';
      const corruptedHash = '$2a$12$invalid_corrupted_hash_data';

      // Should not crash, should throw informative error
      await expect(verifyPassword(validPassword, corruptedHash)).rejects.toThrow();
    });
  });
});
