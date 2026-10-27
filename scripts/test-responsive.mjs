import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BREAKPOINTS = [
  { width: 360, height: 740, label: '360px (Compact Mobile)' },
  { width: 390, height: 844, label: '390px (Standard Phone)' },
  { width: 768, height: 1024, label: '768px (Tablet Portrait)' },
  { width: 1024, height: 768, label: '1024px (Laptop)' },
  { width: 1280, height: 800, label: '1280px (Desktop)' },
  { width: 1440, height: 900, label: '1440px (Wide Desktop)' },
];

const ADMIN_USER = {
  id: 'usr_super_admin',
  email: 'admin@demo.com',
  name: 'Alexander Sterling',
  role: 'super_admin',
  roleLabel: 'Super Admin',
  department: 'Executive Operations',
  company: 'UK Property Surveying Practice HQ',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  phone: '+44 20 7946 0912',
  currency: 'GBP',
};

const CUSTOMER_USER = {
  id: 'usr_customer',
  email: 'customer@demo.com',
  name: 'Emma Watson',
  role: 'customer',
  roleLabel: 'Property Client',
  department: 'Private Client',
  company: 'Watson Holdings UK',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  phone: '+44 7700 900147',
  currency: 'GBP',
};

const SCREENS = [
  {
    id: 'Login',
    path: '/login',
    user: null,
  },
  {
    id: 'Dashboard',
    path: '/admin/dashboard',
    user: ADMIN_USER,
  },
  {
    id: 'Leads',
    path: '/admin/crm-and-leads',
    user: ADMIN_USER,
  },
  {
    id: 'JobDetails',
    path: '/admin/survey-jobs/JOB-2026-080',
    user: ADMIN_USER,
  },
  {
    id: 'Calendar',
    path: '/admin/booking-calendar',
    user: ADMIN_USER,
  },
  {
    id: 'CustomerPortal',
    path: '/customer/my-dashboard',
    user: CUSTOMER_USER,
  },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:5174';
const SCREENSHOT_DIR = path.resolve('test-results/screenshots');

async function runAudit() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log(`\n======================================================`);
  console.log(`🚀 Starting Playwright Responsive & Mobile-First Audit`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📐 Breakpoints: 360, 390, 768, 1024, 1280, 1440`);
  console.log(`📸 Target Screens: Login, Dashboard, Leads, Job Details, Calendar, Customer Portal`);
  console.log(`======================================================\n`);

  const browser = await chromium.launch();
  const results = [];

  for (const screen of SCREENS) {
    console.log(`\n--- Auditing: ${screen.id} (${screen.path}) ---`);

    for (const bp of BREAKPOINTS) {
      const context = await browser.newContext({
        viewport: { width: bp.width, height: bp.height },
        userAgent:
          bp.width < 768
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      // Inject auth session if needed
      if (screen.user) {
        await context.addInitScript((user) => {
          localStorage.setItem('property_group_user_session', JSON.stringify(user));
        }, screen.user);
      }

      const page = await context.newPage();

      try {
        await page.goto(`${BASE_URL}${screen.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(400); // Allow render settlement

        // Verify No Horizontal Page Scroll
        const scrollData = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientWidth = doc.clientWidth;
          const innerWidth = window.innerWidth;
          const hasScroll = scrollWidth > innerWidth + 1; // 1px threshold for sub-pixel antialiasing
          return { scrollWidth, clientWidth, innerWidth, hasScroll };
        });

        const filename = `${screen.id.toLowerCase()}_${bp.width}.png`;
        const filepath = path.join(SCREENSHOT_DIR, filename);

        await page.screenshot({ path: filepath, fullPage: false });

        const pass = !scrollData.hasScroll;
        results.push({
          screen: screen.id,
          width: bp.width,
          label: bp.label,
          scrollWidth: scrollData.scrollWidth,
          clientWidth: scrollData.clientWidth,
          pass,
          screenshot: filename,
        });

        console.log(
          `  [${pass ? 'PASS' : 'FAIL'}] ${bp.width}px: scrollWidth=${scrollData.scrollWidth}px, innerWidth=${scrollData.innerWidth}px -> ${filename}`
        );
      } catch (err) {
        console.error(`  [ERROR] ${bp.width}px on ${screen.id}: ${err.message}`);
        results.push({
          screen: screen.id,
          width: bp.width,
          label: bp.label,
          pass: false,
          error: err.message,
        });
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();

  // Save JSON report
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'audit-results.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`\n======================================================`);
  console.log(`📋 AUDIT SUMMARY TABLE`);
  console.log(`======================================================`);
  console.table(
    results.map((r) => ({
      Screen: r.screen,
      Width: r.width,
      'No H-Scroll': r.pass ? '✅ PASS' : '❌ FAIL',
      'Doc Width': `${r.scrollWidth}px`,
      Screenshot: r.screenshot || r.error,
    }))
  );

  const allPassed = results.every((r) => r.pass);
  console.log(
    `\n🎯 Overall Result: ${allPassed ? 'ALL 36 TESTS PASSED (100% RESPONSIVE, ZERO HORIZONTAL SCROLL) ✅' : 'SOME TESTS FAILED ❌'}\n`
  );
}

runAudit().catch((err) => {
  console.error('Audit failed to complete:', err);
  process.exit(1);
});
