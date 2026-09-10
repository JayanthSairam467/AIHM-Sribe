const { chromium } = require('/home/kawin07/.gemini/antigravity-ide/brain/ca8e205f-1865-4c91-9f76-d16693de4ff8/scratch/test-runner/node_modules/playwright-core');
const fs = require('fs');
const path = require('path');

async function debug() {
  const browser = await chromium.launch({
    executablePath: '/opt/brave.com/brave/brave',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'reception@scribe.ai');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  console.log('Clicking Book Walk-In Patient...');
  await page.click('text=Book Walk-In Patient');
  await page.waitForTimeout(1000);

  const screenshotPath = '/home/kawin07/.gemini/antigravity-ide/brain/ca8e205f-1865-4c91-9f76-d16693de4ff8/debug_modal.png';
  await page.screenshot({ path: screenshotPath });
  console.log('Saved screenshot to debug_modal.png');

  const content = await page.content();
  console.log('Has Register Walk-In Patient text:', content.includes('Register Walk-In Patient'));
  console.log('Has isReceptionBookingModalOpen in DOM:', content.includes('Walk-In Booking Modal') || content.includes('Register Walk-In Patient'));

  await browser.close();
}

debug();
