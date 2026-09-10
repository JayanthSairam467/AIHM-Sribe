const { chromium } = require('/home/kawin07/.gemini/antigravity-ide/brain/ca8e205f-1865-4c91-9f76-d16693de4ff8/scratch/test-runner/node_modules/playwright-core');

async function debug() {
  const browser = await chromium.launch({
    executablePath: '/opt/brave.com/brave/brave',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:4200', { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', 'reception@scribe.ai');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  console.log('Clicking Book Walk-In Patient button...');
  const btn = await page.waitForSelector('text=Book Walk-In Patient');
  await btn.click();
  await page.waitForTimeout(1000);

  const modal = await page.$('text=Register Walk-In Patient');
  console.log('Modal found:', !!modal);

  await browser.close();
}

debug();
