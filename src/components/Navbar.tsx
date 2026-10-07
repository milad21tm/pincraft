import React from 'react';
import { UserSession } from '../types';
import { Sparkles, ShieldCheck, ChevronDown, Wand2 } from 'lucide-react';

interface NavbarProps {
  userSession: UserSession;
  onOpenAuthModal: () => void;
  activeTab: 'creator' | 'history';
  onSelectTab: (tab: 'creator' | 'history') => void;
  savedPinsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userSession,
  onOpenAuthModal,
  activeTab,
  onSelectTab,
  savedPinsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white shadow-lg shadow-rose-900/30">
            <Wand2 className="h-5 w-5" />
          </div>
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            PinCraft AI <span className="text-xs font-normal text-rose-400">HUB</span>
          </a>
        </div>

        {/* Zone 2: Navigation Links (Clean text, no pill badges) */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-400 md:flex">
          <button
            onClick={() => onSelectTab('creator')}
            className={`transition-colors hover:text-white ${
              activeTab === 'creator' ? 'text-white' : ''
            }`}
          >
            اتوماسیون پین و کپی‌رایتینگ
          </button>
          <a
            href="#visual-studio"
            className="transition-colors hover:text-white"
          >
            استودیو کاور و ویدیو
          </a>
          <a
            href="#mobile-preview"
            className="transition-colors hover:text-white"
          >
            پیش‌نمایش زنده پینترست
          </a>
          <button
            onClick={() => onSelectTab('history')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${
              activeTab === 'history' ? 'text-white' : ''
            }`}
          >
            <span>کتابخانه پین‌ها</span>
            {savedPinsCount > 0 && (
              <span className="text-xs font-mono tabular-nums text-rose-400">
                ({savedPinsCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Google Account Profile & Engine Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuthModal}
            className="group flex items-center gap-2.5 rounded-xl border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-xs text-neutral-200 transition-all hover:border-neutral-700 hover:bg-neutral-800"
            title="حساب گوگل و تنظیمات مدل‌های هوش مصنوعی"
          >
            <div className="relative">
              <img
                src={userSession.avatar}
                alt={userSession.name}
                className="h-6 w-6 rounded-full border border-neutral-700 object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-neutral-950" />
            </div>
            <div className="hidden flex-col items-start sm:flex text-right">
              <span className="font-medium text-neutral-200 max-w-[120px] truncate">
                {userSession.name}
              </span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5 text-rose-400" />
                <span>Google OAuth · <span className="font-mono tabular-nums text-rose-300">{userSession.quotaRemaining}</span> کریدیت</span>
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-neutral-400 transition-transform group-hover:rotate-180" />
          </button>

          <button
            onClick={onOpenAuthModal}
            className="hidden lg:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-md shadow-rose-950 transition-all hover:from-rose-500 hover:to-rose-600"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>مدل‌های AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
