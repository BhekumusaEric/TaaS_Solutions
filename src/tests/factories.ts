/**
 * Test data factories for creating mock data
 * These will be expanded as entities are added to the system
 */

/**
 * Generate a random UUID for testing
 */
export function generateId(): string {
  return `test-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a random email for testing
 */
export function generateEmail(prefix = 'user'): string {
  return `${prefix}-${generateId()}@example.com`;
}

/**
 * Generate a timestamp
 */
export function generateTimestamp(offset = 0): Date {
  return new Date(Date.now() + offset);
}

/**
 * Create a mock user (basic structure - will be expanded)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: generateId(),
    email: generateEmail(),
    name: 'Test User',
    createdAt: generateTimestamp(),
    updatedAt: generateTimestamp(),
    ...overrides,
  };
}

/**
 * Create a mock organization (basic structure - will be expanded)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockOrganisation(overrides: Partial<any> = {}) {
  return {
    id: generateId(),
    name: 'Test Organisation',
    type: 'CLIENT',
    status: 'ACTIVE',
    createdAt: generateTimestamp(),
    updatedAt: generateTimestamp(),
    ...overrides,
  };
}

/**
 * Create mock audit event (basic structure - will be expanded)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockAuditEvent(overrides: Partial<any> = {}) {
  return {
    id: generateId(),
    userId: generateId(),
    action: 'TEST_ACTION',
    resourceType: 'Test',
    resourceId: generateId(),
    timestamp: generateTimestamp(),
    ...overrides,
  };
}
