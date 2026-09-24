import React, { useState } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { Lock, User, KeyRound, AlertCircle, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginManagement } = useAtelier();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Simulate minimal auth verification
    setTimeout(() => {
      const success = loginManagement(username, password);
      setIsSubmitting(false);

      if (success) {
        setUsername('');
        setPassword('');
        setErrorMessage(null);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage('نام کاربری یا رمز عبور اشتباه است (پیش‌فرض: admin / 1234)');
      }
    }, 250);
  };

  const handleQuickDemoFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  return (
    <div
      id="admin-auth-modal-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        id="admin-auth-modal-card"
        className="relative w-full max-w-[360px] bg-white/95 backdrop-blur-2xl border border-white/90 rounded-[32px] p-5 shadow-2xl text-stone-900 overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200 flex items-center justify-center transition-colors"
          title="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge & Title */}
        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7e5352]/10 border border-[#7e5352]/20 text-[#7e5352] mx-auto flex items-center justify-center mb-3 shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#7e5352] bg-[#7e5352]/10 border border-[#7e5352]/20 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            بخش مدیریت و پذیرش آرایشگاه
          </span>
          <h2 className="text-base font-bold text-stone-900 tracking-tight">
            ورود به پنل مدیریت
          </h2>
          <p className="text-[11px] text-stone-600 mt-1 leading-relaxed px-2">
            جهت دسترسی به داشبورد نوبت‌ها، لیست مراجعین و تنظیمات، نام کاربری و رمز عبور را وارد کنید.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Username Input */}
          <div>
            <label className="block text-[11px] font-medium text-stone-700 mb-1">
              نام کاربری
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username-input"
                type="text"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: admin"
                className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#7e5352] focus:ring-1 focus:ring-[#7e5352] transition-all font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[11px] font-medium text-stone-700 mb-1">
              رمز عبور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="مثال: 1234"
                className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#7e5352] focus:ring-1 focus:ring-[#7e5352] transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                title={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[#151517] hover:bg-stone-800 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#fbdcd9]" />
              <span>{isSubmitting ? 'در حال بررسی...' : 'ورود به پنل مدیریت'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors text-center"
            >
              انصراف و بازگشت به نمای مشتری
            </button>
          </div>
        </form>

        {/* Quick Demo Credentials Assistant */}
        <div className="mt-4 pt-3 border-t border-stone-200 text-[10px] text-stone-500 text-center">
          <p className="font-semibold text-stone-700 mb-1.5">اطلاعات ورود آزمایشی سریع:</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('admin', '1234')}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-mono border border-stone-200 transition-colors"
            >
              مدیر: admin / 1234
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('barber', '1234')}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-mono border border-stone-200 transition-colors"
            >
              آرایشگر: barber / 1234
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
