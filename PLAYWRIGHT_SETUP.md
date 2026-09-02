# Playwright Browser Setup

## Installation Required

Playwright requires browser binaries to be installed before running E2E tests.

### Install Browsers

Run the following command to install all required browsers:

```bash
npx playwright install
```

This will install:
- Chromium
- Firefox
- WebKit (Safari)

### Install Specific Browser

To install only a specific browser:

```bash
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
```

### System Dependencies (Linux)

On Linux systems, you may also need to install system dependencies:

```bash
npx playwright install-deps
```

## Verification

After installation, verify everything works:

```bash
# List tests without running them
npm run test:e2e -- --list

# Run tests
npm run test:e2e
```

## Troubleshooting

### Network Issues

If you encounter network connection errors during installation:

1. Check your internet connection
2. Check if a proxy is required
3. Try using a different network
4. Check firewall settings

### Disk Space

Browser binaries require approximately 1GB of disk space. Ensure you have sufficient space available.

### Environment Variables

You can configure the browser installation location:

```bash
# Set custom browsers path
export PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
```

## CI/CD

In CI environments, add the installation step before running tests:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e
```

## Resources

- [Playwright Installation Guide](https://playwright.dev/docs/browsers)
- [System Requirements](https://playwright.dev/docs/intro#system-requirements)
