import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function that wraps components with providers
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  // Add providers here as they're implemented
  // Example: const Wrapper = ({ children }: { children: React.ReactNode }) => (
  //   <ThemeProvider>{children}</ThemeProvider>
  // );

  return render(ui, { ...options });
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Create a delay for testing async behavior
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock a successful API response
 */
export function mockApiSuccess<T>(data: T) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as Response;
}

/**
 * Mock an API error response
 */
export function mockApiError(status: number, message: string) {
  return {
    ok: false,
    status,
    json: async () => ({ error: message }),
  } as Response;
}

/**
 * Re-export commonly used testing utilities
 */
export * from '@testing-library/react';
// export { default as userEvent } from '@testing-library/user-event'; // Uncomment when package is installed
