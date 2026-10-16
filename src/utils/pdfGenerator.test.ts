import test from 'node:test';
import assert from 'node:assert/strict';
import { exportDailyReportToPdf } from './pdfGenerator.ts';

test('exportDailyReportToPdf is defined as a function', () => {
  assert.equal(typeof exportDailyReportToPdf, 'function');
});
