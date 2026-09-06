import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('http://localhost:3000/auth/register');
console.log('URL after goto', page.url());
await page.fill('input[name="name"]', 'Test User');
await page.fill('input[name="email"]', 'playwright-check-' + Date.now() + '@example.com');
await page.fill('input[name="password"]', 'ValidPass123');
await page.click('button:has-text("Register")');
await page.waitForTimeout(5000);
console.log('URL after submit', page.url());
console.log('BODY START');
console.log((await page.locator('body').innerText()).slice(0, 2000));
console.log('BODY END');
await browser.close();
