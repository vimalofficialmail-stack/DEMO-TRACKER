import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDisplayDate,
  calculateCompletionRate,
  calculateCancellationRate,
  generateWhatsAppReportText,
  createDefaultMetrics,
  createDefaultProfile,
} from './reportGenerator.ts';

test('formatDisplayDate formats YYYY-MM-DD correctly', () => {
  const formatted = formatDisplayDate('2026-10-14');
  assert.equal(formatted, 'Wed, 14 Oct 2026');
});

test('calculateCompletionRate calculates correct percentage', () => {
  assert.equal(calculateCompletionRate(4, 5), 80);
  assert.equal(calculateCompletionRate(5, 5), 100);
  assert.equal(calculateCompletionRate(0, 5), 0);
  assert.equal(calculateCompletionRate(3, 0), 100);
});

test('calculateCancellationRate handles edge cases', () => {
  assert.equal(calculateCancellationRate(1, 5), 20);
  assert.equal(calculateCancellationRate(0, 5), 0);
  assert.equal(calculateCancellationRate(0, 0), 0);
});

test('generateWhatsAppReportText matches exact requested format', () => {
  const metrics = createDefaultMetrics('2026-10-14');
  metrics.totalBookings = 13;
  metrics.todayD0 = 5;
  metrics.tomorrowD1 = 3;
  metrics.completions = 4;
  metrics.cancellations = 1;
  const profile = createDefaultProfile();
  profile.name = 'Vimal';
  profile.teamLead = 'Ankit Sharma';

  const report = generateWhatsAppReportText(metrics, profile);

  const expected = [
    ' Name - Vimal',
    ' Team Lead: Ankit Sharma',
    ' Date: Wednesday, 14 October 2026',
    '────────────────────────',
    '📈 DAILY DEMO METRICS:',
    '*  Total Demo Bookings: 13',
    '*  Booking for Today (D0): 5',
    '*  Bookings for Tomorrow (D1): 3',
    '*  Demo Completions: 4',
    '*  Demo Cancellations: 1',
  ].join('\n');

  assert.equal(report, expected);
});
