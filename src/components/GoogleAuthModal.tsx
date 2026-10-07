import React, { useState } from 'react';
import { UserSession } from '../types';
import {
  X,
  CheckCircle,
  Shield,
  Cpu,
  RefreshCw,
  LogOut,
  Key,
  Zap,
  LogIn,
  AlertCircle,
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  onUpdateSession: (updated: UserSession) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onUpdateSession,
}) => {
  const [selectedSeoEngine, setSelectedSeoEngine] = useState(userSession.aiEngines.seoEngine);
  const [selectedVisualEngine, setSelectedVisualEngine] = useState(userSession.aiEngines.visualStudio);
  const [selectedVideoEngine, setSelectedVideoEngine] = useState(userSession.aiEngines.videoEngine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isCustomLoginOpen, setIsCustomLoginOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSaveEngines = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/save-engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seoEngine: selectedSeoEngine,
          visualStudio: selectedVisualEngine,
          videoEngine: selectedVideoEngine,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در ذخیره تنظیمات');

      onUpdateSession(data.user);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ذخیره');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshQuota = async () => {
    setIsRefreshing(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.user) {
        onUpdateSession(data.user);
      }
    } catch (err: any) {
      setErrorMsg('خطا در واکشی وضعیت نشست ابری');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQuickGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;

    try {
      // Mock standard Google OAuth Token generation for direct verification
      const pseudoToken = btoa(
        JSON.stringify({
          sub: `usr_google_${Date.now()}`,
          name: customGoogleName.trim() || customGoogleEmail.split('@')[0],
          email: customGoogleEmail.trim(),
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            customGoogleName.trim() || customGoogleEmail
          )}&backgroundColor=e11d48,be123c`,
        })
      );
      const fakeJwt = `header.${pseudoToken}.signature`;

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: fakeJwt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در احراز هویت');

      onUpdateSession(data.user);
      setIsCustomLoginOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در لاگین');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      onUpdateSession({
        ...userSession,
        authProvider: 'مهمان (Guest)',
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-6 text-neutral-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Shield className="h-5 w-5" />
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-white">احراز هویت گوگل و مدیریت موتورهای AI</h3>
            <p className="text-xs text-neutral-400">Google OAuth 2.0 & Cloud AI Studio Hub</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-right text-xs text-red-300 flex items-center justify-end gap-2">
            <span>{errorMsg}</span>
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          </div>
        )}

        {/* Google Account Profile Card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={userSession.avatar}
                alt={userSession.name}
                className="h-12 w-12 rounded-full border-2 border-rose-500/40 object-cover"
              />
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{userSession.name}</span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{userSession.authProvider}</span>
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono">{userSession.email}</p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500">
                  <span>طرح: {userSession.tier}</span>
                  <span>·</span>
                  <span>نشست فعال سرور</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCustomLoginOpen(!isCustomLoginOpen)}
              className="text-xs text-rose-400 hover:text-rose-300 underline"
            >
              سوییچ اکانت
            </button>
          </div>

          {/* Switch Account Form */}
          {isCustomLoginOpen && (
            <form onSubmit={handleQuickGoogleLogin} className="mt-4 pt-3 border-t border-neutral-800/80 space-y-2">
              <div className="text-xs font-semibold text-neutral-300 text-right">ورود با اکانت گوگل دیگر:</div>
              <input
                type="email"
                required
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                placeholder="ایمیل گوگل (مثلاً yourname@gmail.com)..."
                dir="ltr"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
              />
              <input
                type="text"
                value={customGoogleName}
                onChange={(e) => setCustomGoogleName(e.target.value)}
                placeholder="نام نمایشی..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none text-right"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCustomLoginOpen(false)}
                  className="px-3 py-1 text-xs text-neutral-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-rose-600 px-4 py-1 text-xs font-medium text-white hover:bg-rose-500"
                >
                  تایید ورود با گوگل
                </button>
              </div>
            </form>
          )}

          {/* Quota Progress */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-400">سهمیه باقیمانده تولید پین و محتوا:</span>
              <span className="font-mono tabular-nums text-rose-300 font-semibold">
                {userSession.quotaRemaining} / {userSession.quotaTotal} کردیت
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-500"
                style={{ width: `${(userSession.quotaRemaining / userSession.quotaTotal) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between items-center text-[11px]">
              <button
                onClick={handleLogout}
                className="text-neutral-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <LogOut className="h-3 w-3" />
                <span>خروج از حساب</span>
              </button>

              <button
                onClick={handleRefreshQuota}
                disabled={isRefreshing}
                className="text-neutral-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>بروزرسانی سهمیه از سرور</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Engine Selection */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider justify-end">
            <span>تنظیم موتورهای هوش مصنوعی (AI Routing)</span>
            <Cpu className="h-3.5 w-3.5 text-rose-400" />
          </div>

          {/* SEO Metadata Model */}
          <div className="text-right">
            <label className="block text-xs text-neutral-400 mb-1">
              موتور کپی‌رایتینگ متادیتای سئو پینترست:
            </label>
            <select
              value={selectedSeoEngine}
              onChange={(e) => setSelectedSeoEngine(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="Gemini 3.8 Flash">Gemini 3.8 Flash (پیش‌فرض - سرعت بالا و درک عمیق سئو)</option>
              <option value="Gemini 3.1 Pro Preview">Gemini 3.1 Pro Preview (تحلیل فوق تخصصی و استدلال عمیق)</option>
              <option value="Gemini 3.1 Flash Lite">Gemini 3.1 Flash Lite (کمترین تاخیر و مصرف بهینه)</option>
            </select>
          </div>

          {/* Visual Poster Backdrop Engine */}
          <div className="text-right">
            <label className="block text-xs text-neutral-400 mb-1">
              موتور تولید بك‌گراندهای استودیویی (Visual Studio):
            </label>
            <select
              value={selectedVisualEngine}
              onChange={(e) => setSelectedVisualEngine(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="Gemini Flash Image / Imagen Studio">Gemini Flash Image / Imagen Studio (پیش‌فرض)</option>
              <option value="Gemini 3 Pro Image">Gemini 3 Pro Image (کیفیت 4K و نورپردازی استودیویی)</option>
              <option value="Flux / Studio Pedestal Engine">Flux Studio Pedestal Generator</option>
            </select>
          </div>

          {/* Video Engine */}
          <div className="text-right">
            <label className="block text-xs text-neutral-400 mb-1">
              موتور تولید محتوای ویدیویی پین (Video Pin Engine):
            </label>
            <select
              value={selectedVideoEngine}
              onChange={(e) => setSelectedVideoEngine(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="Canvas Dynamic 60fps Studio">Canvas Dynamic Video Studio (رندر ۶۰ فریم بر ثانیه در مرورگر + زوم Ken Burns)</option>
              <option value="Veo 3.1 Fast Generate">Google Veo 3.1 Fast Video Pin Preview</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={handleSaveEngines}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-medium text-white shadow-lg shadow-rose-900/30 hover:bg-rose-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>تنظیمات در سرور ذخیره شد</span>
              </>
            ) : isSaving ? (
              <span>در حال ذخیره...</span>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>ذخیره تغییرات در سرور</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
