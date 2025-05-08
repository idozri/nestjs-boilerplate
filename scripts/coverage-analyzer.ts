import * as fs from 'fs';
import * as path from 'path';

interface CoverageMetrics {
  lines: { total: number; covered: number; skipped: number; pct: number };
  functions: { total: number; covered: number; skipped: number; pct: number };
  branches: { total: number; covered: number; skipped: number; pct: number };
  statements: { total: number; covered: number; skipped: number; pct: number };
}

const THRESHOLDS = {
  lines: 85,
  functions: 80,
  branches: 80,
  statements: 85,
};

const coverageFile = path.resolve(__dirname, '../coverage/coverage-summary.json');

if (!fs.existsSync(coverageFile)) {
  console.error('❌ No coverage-summary.json file found. Run "npm run test -- --coverage" first.');
  process.exit(1);
}

const rawData = fs.readFileSync(coverageFile, 'utf-8');
const coverage = JSON.parse(rawData);

console.log('\n📋 Coverage Gaps Report\n');

let foundGap = false;

for (const [file, data] of Object.entries<any>(coverage)) {
  if (file === 'total') continue;

  const metrics: CoverageMetrics = data;

  const failed = Object.entries(THRESHOLDS).filter(([key, threshold]) => {
    const actual = metrics[key as keyof CoverageMetrics]?.pct;
    return actual !== undefined && actual < threshold;
  });

  if (failed.length > 0) {
    foundGap = true;
    console.log(`🟥 ${file}`);
    failed.forEach(([key, threshold]) => {
      const actual = metrics[key as keyof CoverageMetrics].pct;
      console.log(`   - ${key}: ${actual}% < ${threshold}%`);
    });
    console.log('');
  }
}

if (!foundGap) {
  console.log('✅ All files meet the configured coverage thresholds!\n');
}