/**
 * Logger Usage Examples
 *
 * This file demonstrates how to use the logger utility
 * in the TaaS Solutions platform.
 */

import { logger } from './logger';

// ==========================================
// Basic Logging
// ==========================================

// DEBUG level - verbose development information
logger.debug('Detailed debugging information', {
  queryParams: { page: 1, limit: 10 },
  cacheHit: true,
});

// INFO level - normal operations
logger.info('User signed in successfully', {
  userId: 'user-123',
  email: 'user@example.com',
});

// WARN level - recoverable issues
logger.warn('Rate limit approaching', {
  userId: 'user-456',
  requestCount: 95,
  limit: 100,
});

// ERROR level - unrecoverable errors
logger.error('Failed to process payment', {
  userId: 'user-789',
  orderId: 'order-123',
  error: 'Payment gateway timeout',
});

// ==========================================
// Security - Sensitive Data Redaction
// ==========================================

// Passwords are automatically redacted
logger.info('User registration attempt', {
  email: 'newuser@example.com',
  password: 'secret123', // Will be logged as [REDACTED]
});

// API keys and tokens are redacted
logger.info('External API call', {
  service: 'stripe',
  apiKey: 'sk_test_123456', // Will be logged as [REDACTED]
  endpoint: '/v1/charges',
});

// Multiple sensitive fields in nested objects
logger.info('OAuth authentication', {
  user: {
    id: 'user-123',
    email: 'user@example.com',
    password: 'secret', // [REDACTED]
  },
  tokens: {
    accessToken: 'token123', // [REDACTED]
    refreshToken: 'refresh456', // [REDACTED]
  },
});

// ==========================================
// Real-World Usage Patterns
// ==========================================

// Audit Event Logging
logger.info('Organisation created', {
  userId: 'admin-123',
  action: 'ORGANISATION_CREATED',
  resourceType: 'Organisation',
  resourceId: 'org-456',
  organisationId: 'org-456',
  metadata: {
    name: 'Acme Corp',
    type: 'CLIENT',
  },
});

// Permission Denied
logger.warn('Permission denied', {
  userId: 'user-123',
  action: 'PERMISSION_DENIED',
  attemptedAction: 'project:delete',
  resourceId: 'project-456',
  reason: 'User does not have required role',
});

// Error Handling with Context
try {
  // Some operation that might fail
  throw new Error('Database connection failed');
} catch (error) {
  logger.error('Failed to create opportunity', {
    userId: 'user-123',
    organisationId: 'org-456',
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// State Transitions
logger.info('Project state changed', {
  projectId: 'project-789',
  oldState: 'MOBILISING',
  newState: 'ACTIVE',
  changedBy: 'delivery-lead-123',
  timestamp: new Date().toISOString(),
});

// Performance Monitoring
const startTime = Date.now();
// ... some operation ...
const duration = Date.now() - startTime;

logger.info('Database query completed', {
  query: 'getUsersByOrganisation',
  organisationId: 'org-123',
  resultCount: 15,
  durationMs: duration,
});

// ==========================================
// Development vs Production Output
// ==========================================

// In DEVELOPMENT (NODE_ENV=development):
// Output is human-readable with colors:
// [12:30:45] INFO  User signed in
//   {
//     "userId": "user-123",
//     "email": "user@example.com"
//   }

// In PRODUCTION (NODE_ENV=production):
// Output is structured JSON:
// {"timestamp":"2026-09-01T12:30:45.123Z","level":"INFO","message":"User signed in","userId":"user-123","email":"user@example.com"}

// ==========================================
// Log Level Configuration
// ==========================================

// Set via environment variable LOG_LEVEL:
// LOG_LEVEL=DEBUG  - Shows all logs (DEBUG, INFO, WARN, ERROR)
// LOG_LEVEL=INFO   - Shows INFO, WARN, ERROR (default)
// LOG_LEVEL=WARN   - Shows WARN, ERROR only
// LOG_LEVEL=ERROR  - Shows ERROR only

// Example: Only log errors in production
// LOG_LEVEL=ERROR NODE_ENV=production npm start

// ==========================================
// Best Practices
// ==========================================

// ✅ DO: Log user actions and state changes
logger.info('Deliverable submitted for review', {
  deliverableId: 'deliv-123',
  projectId: 'project-456',
  submittedBy: 'talent-789',
});

// ✅ DO: Log authorization failures for security monitoring
logger.warn('Unauthorized access attempt', {
  userId: 'user-123',
  attemptedResource: 'organisation/org-456/projects',
  userOrganisations: ['org-789'],
});

// ✅ DO: Include relevant context in every log
logger.error('External API failure', {
  service: 'email-provider',
  endpoint: '/send',
  statusCode: 503,
  retryCount: 3,
});

// ❌ DON'T: Log sensitive data that isn't automatically redacted
// (The logger handles most cases, but be cautious with custom sensitive data)
logger.info('Payment processed', {
  userId: 'user-123',
  amount: 1000,
  // cvv: '123', // ❌ Avoid logging credit card CVV
  last4Digits: '4242', // ✅ OK to log last 4 digits
});

// ❌ DON'T: Log too verbosely in production
// Use DEBUG level for verbose information
logger.debug('Processing batch item', { itemIndex: 5, totalItems: 100 });
// This won't appear in production if LOG_LEVEL=INFO

// ❌ DON'T: Use console.log directly
// console.log('This is unstructured'); // ❌ Bad
logger.info('This is structured'); // ✅ Good
