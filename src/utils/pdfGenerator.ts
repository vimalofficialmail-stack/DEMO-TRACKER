import { jsPDF } from 'jspdf';
import type { DailyMetrics, TraineeProfile } from '../types/index.ts';
import { formatDisplayDate, calculateCompletionRate, calculateCancellationRate } from './reportGenerator.ts';

/**
 * Generates and downloads a formatted PDF report for a given daily demo record.
 */
export function exportDailyReportToPdf(metrics: DailyMetrics, profile: TraineeProfile): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Header Banner (Deep Royal Blue)
  doc.setFillColor(11, 76, 163); // #0B4CA3
  doc.rect(0, 0, pageWidth, 36, 'F');

  // Orange Accent Stripe
  doc.setFillColor(255, 122, 0); // #FF7A00
  doc.rect(0, 36, pageWidth, 3, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('PRE-SALES DEMO SUMMARY REPORT', margin, 18);

  // Header Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(219, 234, 254); // blue-100
  doc.text('Official End-of-Day (EOD) Performance & Conversion Record', margin, 26);

  // Right-aligned Date Pill in Header
  const formattedDate = formatDisplayDate(metrics.date);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(formattedDate, pageWidth - margin, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text(`Key: ${metrics.date}`, pageWidth - margin, 25, { align: 'right' });

  let cursorY = 46;

  // 2. Trainee Profile & Operations Info Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, 34, 3, 3, 'FD');

  // Card Header / Subheading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 76, 163);
  doc.text('TRAINEE PROFILE & METADATA', margin + 4, cursorY + 7);

  // Left column
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Trainee Name:', margin + 4, cursorY + 15);
  doc.text('Employee ID:', margin + 4, cursorY + 22);
  doc.text('Daily Target:', margin + 4, cursorY + 29);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(profile.name || 'Pre-Sales Trainee', margin + 30, cursorY + 15);
  doc.text(profile.employeeId || 'N/A', margin + 30, cursorY + 22);

  const isTargetMet = metrics.totalBookings >= profile.dailyTarget;
  doc.text(
    `${profile.dailyTarget} demos / day (${isTargetMet ? 'Target Achieved' : 'In Progress'})`,
    margin + 30,
    cursorY + 29
  );

  // Right column
  const rightColX = margin + 96;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Team Lead:', rightColX, cursorY + 15);
  doc.text('Batch Cohort:', rightColX, cursorY + 22);
  doc.text('Report Status:', rightColX, cursorY + 29);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(profile.teamLead || 'Operations Team Lead', rightColX + 26, cursorY + 15);
  doc.text(profile.batch || 'General Batch', rightColX + 26, cursorY + 22);

  doc.setTextColor(isTargetMet ? 22 : 180, isTargetMet ? 101 : 83, isTargetMet ? 52 : 9); // Emerald or Amber
  doc.text(isTargetMet ? 'COMPLETED' : 'LOGGED', rightColX + 26, cursorY + 29);

  cursorY += 42;

  // 3. Core Daily Demo Metrics Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DAILY DEMO METRICS BREAKDOWN', margin, cursorY);
  cursorY += 5;

  const metricCards = [
    { label: 'Total Bookings', value: metrics.totalBookings, sub: 'All Slots', color: [22, 163, 74] }, // Emerald
    { label: 'Today D0', value: metrics.todayD0, sub: 'Immediate Demos', color: [11, 76, 163] }, // Royal Blue
    { label: 'Tomorrow D1', value: metrics.tomorrowD1, sub: 'Next Day Pipeline', color: [124, 58, 237] }, // Purple
    { label: 'Completions', value: metrics.completions, sub: 'Delivered', color: [234, 88, 12] }, // Orange
    { label: 'Cancellations', value: metrics.cancellations, sub: 'No-shows / Drop', color: [225, 29, 72] }, // Rose
  ];

  const cardWidth = (contentWidth - 4 * 3) / 5;
  const cardHeight = 30;

  metricCards.forEach((card, index) => {
    const cardX = margin + index * (cardWidth + 3);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 2.5, 2.5, 'FD');

    // Colored top accent
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(cardX, cursorY, cardWidth, 2.5, 1, 1, 'F');

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.label, cardX + cardWidth / 2, cursorY + 8, { align: 'center' });

    // Numeric Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(String(card.value), cardX + cardWidth / 2, cursorY + 18, { align: 'center' });

    // Subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(card.sub, cardX + cardWidth / 2, cursorY + 25, { align: 'center' });
  });

  cursorY += cardHeight + 10;

  // 4. Performance & Conversion Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CONVERSION & CONDUCTION ANALYSIS', margin, cursorY);
  cursorY += 5;

  const completionRate = calculateCompletionRate(metrics.completions, metrics.todayD0);
  const cancellationRate = calculateCancellationRate(metrics.cancellations, metrics.totalBookings);
  const targetRate = Math.min(100, Math.round((metrics.totalBookings / Math.max(1, profile.dailyTarget)) * 100));

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, 38, 3, 3, 'FD');

  // Completion Rate Progress
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Completion Rate (Done vs Today D0):', margin + 6, cursorY + 10);
  doc.setTextColor(234, 88, 12);
  doc.text(`${completionRate}% (${metrics.completions} of ${metrics.todayD0} slots)`, margin + 80, cursorY + 10);

  // Completion Progress Bar
  const barWidth = contentWidth - 12;
  const barHeight = 4.5;
  doc.setFillColor(226, 232, 240); // empty track
  doc.roundedRect(margin + 6, cursorY + 13, barWidth, barHeight, 2, 2, 'F');
  if (completionRate > 0) {
    doc.setFillColor(234, 88, 12); // orange fill
    const fillWidth = Math.max(4, (barWidth * Math.min(100, completionRate)) / 100);
    doc.roundedRect(margin + 6, cursorY + 13, fillWidth, barHeight, 2, 2, 'F');
  }

  // Row 2: Cancellation Rate & Target Velocity
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Cancellation Ratio:', margin + 6, cursorY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(metrics.cancellations > 0 ? 225 : 100, metrics.cancellations > 0 ? 29 : 116, metrics.cancellations > 0 ? 72 : 139);
  doc.text(`${cancellationRate}% (${metrics.cancellations} cancelled)`, margin + 45, cursorY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Daily Booking Target:', margin + 100, cursorY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isTargetMet ? 22 : 15, isTargetMet ? 163 : 23, isTargetMet ? 74 : 42);
  doc.text(`${targetRate}% (${metrics.totalBookings} / ${profile.dailyTarget} Target)`, margin + 140, cursorY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Benchmark: High performers maintain >75% demo completion rate on D0 pipeline.', margin + 6, cursorY + 33);

  cursorY += 46;

  // 5. Daily Remarks Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DAILY OPERATIONAL REMARKS & NOTES', margin, cursorY);
  cursorY += 5;

  const remarksHeight = 36;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, cursorY, contentWidth, remarksHeight, 3, 3, 'FD');

  const remarksText = metrics.remarks?.trim() || 'No operational issues or custom notes submitted for this date.';
  doc.setFont('helvetica', metrics.remarks ? 'normal' : 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(metrics.remarks ? 51 : 148, metrics.remarks ? 65 : 163, metrics.remarks ? 85 : 184);

  const splitRemarks = doc.splitTextToSize(remarksText, contentWidth - 12);
  doc.text(splitRemarks, margin + 6, cursorY + 9);

  // 6. Professional Footer
  const footerY = pageHeight - 16;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(`Generated: ${timestamp} • Pre-Sales Trainee Demo Tracker`, margin, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 76, 163);
  doc.text('Developed by VIMAL GUPTA', pageWidth - margin, footerY, { align: 'right' });

  // Trigger browser download
  const safeDateStr = metrics.date.replace(/[^0-9-]/g, '');
  const fileName = `demo_report_${safeDateStr}.pdf`;
  doc.save(fileName);
}
