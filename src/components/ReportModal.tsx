import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, Send, FileDown } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';
import { generateWhatsAppReportText, getWhatsAppShareUrl } from '../utils/reportGenerator.ts';
import { exportDailyReportToPdf } from '../utils/pdfGenerator.ts';

export const ReportModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, currentMetrics, profile, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isReportModalOpen) return null;

  const reportText = generateWhatsAppReportText(currentMetrics, profile);
  const shareUrl = getWhatsAppShareUrl(reportText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      showToast('EOD Report copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy automatically. Please copy the text directly.');
    }
  };

  const handleShare = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPdf = () => {
    try {
      exportDailyReportToPdf(currentMetrics, profile);
      showToast('Daily Demo PDF report downloaded!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Error generating PDF report.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#0B4CA3] to-[#1D64F2] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <WhatsAppIcon size={22} className="text-[#25D366]" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-base font-bold text-white">
                Daily EOD Report
              </h2>
              <p className="text-xs text-blue-100">Ready for WhatsApp sharing</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition"
            aria-label="Close report preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: WhatsApp preview card */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#EFEAE2]/60">
          <div className="rounded-2xl border border-[#DAD3C8] bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> WhatsApp Formatted Output
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">
              {reportText}
            </pre>
          </div>

          {/* Quick developer tag badge */}
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-[#0B4CA3]">
              ⚡ Designed & Built by VIMAL GUPTA
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-slate-100 bg-white p-4">
          <div className="flex flex-col gap-2">
            {/* Share via WhatsApp */}
            <button
              type="button"
              onClick={handleShare}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-[#20BE5B] active:scale-[0.98] transition-all"
            >
              <WhatsAppIcon size={20} className="text-white" />
              <span>Share via WhatsApp</span>
            </button>

            {/* Download Formatted PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2.5 text-sm font-bold text-[#0B4CA3] hover:bg-blue-100 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
            >
              <FileDown className="h-4 w-4 text-[#0B4CA3]" />
              <span>Download Formatted PDF</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-600" />
                  <span>Copy Report Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
