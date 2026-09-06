'use server';

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { randomBytes, createHash } from 'crypto';
import * as z from 'zod';

// ─── Schemas ──────────────────────────────────────────────────

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ─── Helpers ──────────────────────────────────────────────────

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a cryptographically secure random token and its hash.
 * The raw token is sent to the user (via email link);
 * only the hash is stored in the database.
 */
function generateResetToken(): { rawToken: string; hashedToken: string } {
  const rawToken = randomBytes(32).toString('hex');
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}

// ─── Server Actions ───────────────────────────────────────────

/**
 * Request a password reset.
 * Always returns success even if email is not found (to prevent enumeration).
 */
export async function requestPasswordReset(values: z.infer<typeof requestResetSchema>) {
  const validated = requestResetSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid email address' };
  }

  const { email } = validated.data;

  try {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

    if (user) {
      // Delete any existing tokens for this email
      await db.passwordResetToken.deleteMany({ where: { email: email.toLowerCase() } });

      const { rawToken, hashedToken } = generateResetToken();
      const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await db.passwordResetToken.create({
        data: {
          email: email.toLowerCase(),
          token: hashedToken,
          expires,
        },
      });

      // Create audit event
      await db.auditEvent.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          resourceType: 'User',
          resourceId: user.id,
          metadata: { email: user.email },
        },
      });

      // In a real application, send an email with the reset link:
      // await sendEmail({ to: email, subject: 'Reset your password', link: `/auth/reset-password/${rawToken}` });
      // For development, log the token
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);
      }
    }

    // Always return success (prevent email enumeration)
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Complete password reset using a valid token.
 */
export async function resetPassword(values: z.infer<typeof resetPasswordSchema>) {
  const validated = resetPasswordSchema.safeParse(values);
  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  const { token, password } = validated.data;

  try {
    // Hash the incoming token to compare with stored hash
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const resetToken = await db.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!resetToken) {
      return { error: 'Invalid or expired reset link' };
    }

    // Check expiry
    if (new Date() > resetToken.expires) {
      // Clean up expired token
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { error: 'This reset link has expired. Please request a new one.' };
    }

    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    const hashedPassword = await hashPassword(password);

    await db.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Invalidate all sessions for this user
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // Delete the used reset token
      await tx.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      // Create audit event
      await tx.auditEvent.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_COMPLETED',
          resourceType: 'User',
          resourceId: user.id,
          metadata: { email: user.email },
        },
      });
    });

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
