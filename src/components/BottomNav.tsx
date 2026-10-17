import React from 'react';
import { Home, History, Calendar, User } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type { NavTab } from '../types/index.ts';

interface TabItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'history', label: 'History', icon: History },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'settings', label: 'Profile', icon: User },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-[#0B4CA3]' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  isActive ? 'bg-blue-50 text-[#0B4CA3]' : ''
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight ${
                  isActive ? 'font-bold text-[#0B4CA3]' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>

              {/* Active top pill indicator */}
              {isActive && (
                <div className="absolute top-0 h-0.5 w-8 rounded-full bg-[#0B4CA3]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
