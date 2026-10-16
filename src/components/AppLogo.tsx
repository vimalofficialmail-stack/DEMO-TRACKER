import React from 'react';
import { TrendingUp } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AppLogo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Sleek brand badge with trending up icon */}
      <div
        className={`flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF7A00] to-[#FFA043] text-white shadow-xs ${
          isSm ? 'h-7 w-7' : isLg ? 'h-10 w-10' : 'h-8 w-8'
        }`}
      >
        <TrendingUp className={isSm ? 'h-4 w-4' : isLg ? 'h-6 w-6' : 'h-5 w-5'} strokeWidth={2.8} />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight text-white leading-tight ${
            isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-base'
          }`}
        >
          Pre-Sales<span className="text-[#FF7A00]">.</span>
        </span>
        {!isSm && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-200 -mt-0.5">
            Demo Tracker
          </span>
        )}
      </div>
    </div>
  );
};
