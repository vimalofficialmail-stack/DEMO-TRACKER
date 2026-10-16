import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { TopBar } from './components/TopBar.tsx';
import { HomeTab } from './components/HomeTab.tsx';
import { HistoryTab } from './components/HistoryTab.tsx';
import { CalendarTab } from './components/CalendarTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { ReportModal } from './components/ReportModal.tsx';
import { QuickEditModal } from './components/QuickEditModal.tsx';
import { DatePickerModal } from './components/DatePickerModal.tsx';
import { NavigationDrawer } from './components/NavigationDrawer.tsx';
import { CheckCircle2 } from 'lucide-react';

const MainScreen: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Responsive Top Navigation Bar */}
      <TopBar />

      {/* Main Content Area - Full desktop width (max-w-6xl) and mobile centered */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 py-3 md:py-6 overflow-x-hidden">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

        {/* 4-Item Bottom Navigation Bar */}
        <BottomNav />

        {/* Modals & Overlays */}
        <ReportModal />
        <QuickEditModal />
        <DatePickerModal />
        <NavigationDrawer />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
};

export default function App() {
  return (
    <AppProvider>
      <MainScreen />
    </AppProvider>
  );
}
