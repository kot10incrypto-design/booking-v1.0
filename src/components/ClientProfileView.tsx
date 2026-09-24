import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenMode, BookingStep } from '../types';
import { AtelierShell } from './AtelierShell';
import { useAtelier } from '../store/AtelierContext';
import {
  User,
  Edit3,
  Check,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Phone,
  Bell,
  BellRing,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { toPersianDigits } from '../utils/dateUtils';
import { hapticLight, hapticSuccess } from '../utils/hapticUtils';
import { playNotificationChime } from '../utils/soundUtils';
import { sendNativeNotification, requestPushPermission } from '../utils/serviceWorkerRegistration';

interface ClientProfileViewProps {
  onNavigateScreen: (mode: ScreenMode, step?: BookingStep) => void;
  onOpenConcierge?: () => void;
}

// Preset masculine fantasy & warrior avatars with English names
export const PRESET_AVATARS = [
  {
    id: 'av-dark-knight',
    title: 'Dark Knight',
    category: 'Warriors',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Galahad&backgroundColor=1e293b,0f172a',
  },
  {
    id: 'av-viking',
    title: 'Viking Lord',
    category: 'Warriors',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ragnar&backgroundColor=334155,1e293b',
  },
  {
    id: 'av-cyber-ronin',
    title: 'Cyber Ronin',
    category: 'Cyber & Mech',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Musashi&backgroundColor=0284c7,0369a1',
  },
  {
    id: 'av-shadow-ninja',
    title: 'Shadow Ninja',
    category: 'Stealth & Rogue',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kage&backgroundColor=18181b,27272a',
  },
  {
    id: 'av-spartan',
    title: 'Spartan King',
    category: 'Warriors',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leonidas&backgroundColor=991b1b,7f1d1d',
  },
  {
    id: 'av-doom-slayer',
    title: 'Doom Slayer',
    category: 'Legends',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ares&backgroundColor=b45309,78350f',
  },
  {
    id: 'av-titan-mech',
    title: 'Titan Mech',
    category: 'Cyber & Mech',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=TitanPrime&backgroundColor=0f172a,1e293b',
  },
  {
    id: 'av-cyber-ghost',
    title: 'Cyber Mech X',
    category: 'Cyber & Mech',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberGhost&backgroundColor=0369a1,082f49',
  },
  {
    id: 'av-battle-bot',
    title: 'Battle Bot',
    category: 'Cyber & Mech',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=WarMachine&backgroundColor=374151,111827',
  },
  {
    id: 'av-ghost-op',
    title: 'Ghost Recon',
    category: 'Stealth & Rogue',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Hunter&backgroundColor=064e3b,022c22',
  },
  {
    id: 'av-warlock',
    title: 'Warlock',
    category: 'Legends',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Morrigan&backgroundColor=581c87,3b0764',
  },
  {
    id: 'av-gladiator',
    title: 'Gladiator',
    category: 'Warriors',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maximus&backgroundColor=7c2d12,431407',
  },
  {
    id: 'av-apex-pilot',
    title: 'Apex Pilot',
    category: 'Stealth & Rogue',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maverick&backgroundColor=1e3a8a,172554',
  },
  {
    id: 'av-ironclad',
    title: 'Ironclad',
    category: 'Warriors',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Thorin&backgroundColor=3f3f46,18181b',
  },
  {
    id: 'av-drifter',
    title: 'Wasteland Drifter',
    category: 'Legends',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Logan&backgroundColor=44403c,1c1917',
  },
  {
    id: 'av-beast-tamer',
    title: 'Wolf Witcher',
    category: 'Legends',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Geralt&backgroundColor=1e293b,334155',
  },
];

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({
  onNavigateScreen,
}) => {
  const { currentCustomer, setCurrentCustomer } = useAtelier();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Browser notification permission tracking
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [enableAppointmentReminder, setEnableAppointmentReminder] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('royal_reminder_notifications_enabled');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  });
  
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [reminderToast, setReminderToast] = useState<{ title: string; message: string; time: string } | null>(null);

  // Sync browser notification permission status on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
      // If permission was granted previously and reminder was enabled, keep in sync
      if (Notification.permission === 'granted') {
        const saved = localStorage.getItem('royal_reminder_notifications_enabled');
        if (saved !== null) {
          setEnableAppointmentReminder(JSON.parse(saved));
        }
      }
    } else {
      setPermissionState('unsupported');
    }
  }, []);

  // Direct 1-tap Allow handler for the on-screen prompt
  const handleAllowNotifications = async () => {
    setShowPermissionModal(false);
    hapticSuccess();

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setEnableAppointmentReminder(true);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
      playNotificationChime();
      setToastMessage('اعلان درون‌برنامه‌ای با موفقیت فعال شد');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    try {
      const result = await requestPushPermission();
      if (result !== 'unsupported') {
        setPermissionState(result);
      }
      
      if (result === 'granted') {
        setEnableAppointmentReminder(true);
        localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
        playNotificationChime();
        
        await sendNativeNotification({
          title: 'آرایشگاه رویال — یادآور فعال شد',
          body: `جناب ${currentCustomer?.name?.split(' ')[0] || 'گرامی'}، یادآور ۱ ساعت قبل با موفقیت روی دستگاه شما فعال گردید.`,
          tag: 'royal-reminder-enabled',
          actions: [
            { action: 'view', title: 'مشاهده نوبت' },
            { action: 'close', title: 'متوجه شدم' },
          ],
        });

        setReminderToast({
          title: 'دسترسی اعلان فعال شد',
          message: `جناب ${currentCustomer?.name?.split(' ')[0] || 'گرامی'}، پیام یادآوری ۱ ساعت پیش از نوبت پیرایش شما ارسال خواهد شد.`,
          time: '۱ ساعت قبل',
        });
        setTimeout(() => setReminderToast(null), 5000);
      } else {
        // Fallback: still enable in-app reminder
        setEnableAppointmentReminder(true);
        localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
        setToastMessage('یادآور درون‌برنامه‌ای فعال گردید');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.warn('Notification permission error', err);
      setEnableAppointmentReminder(true);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
    }
  };

  const toggleAppointmentReminder = async () => {
    if (enableAppointmentReminder) {
      // User is disabling the reminder
      setEnableAppointmentReminder(false);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(false));
      hapticLight();
      setToastMessage('یادآور ۱ ساعت پیش از نوبت غیرفعال شد');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    // User wants to turn it ON -> Show interactive on-screen allow prompt
    hapticLight();

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setEnableAppointmentReminder(true);
      localStorage.setItem('royal_reminder_notifications_enabled', JSON.stringify(true));
      playNotificationChime();
      setReminderToast({
        title: 'یادآور ۱ ساعت قبل فعال شد',
        message: 'پیام یادآوری ۱ ساعت پیش از شروع نوبت برای شما ارسال خواهد شد.',
        time: '۱ ساعت قبل',
      });
      setTimeout(() => setReminderToast(null), 4000);
      return;
    }

    // Show on-screen popup for instant 1-tap "Allow"
    setShowPermissionModal(true);
  };

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempNotes, setTempNotes] = useState(currentCustomer?.formulaNotes || '');
  const [tempName, setTempName] = useState(currentCustomer?.name || 'مشتری رویال');
  const [tempPhone, setTempPhone] = useState(currentCustomer?.phone || '۰۹۱۲۳۴۵۶۷۸۹');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentCustomer) {
      setTempNotes(currentCustomer.formulaNotes || '');
      setTempName(currentCustomer.name || 'مشتری رویال');
      setTempPhone(currentCustomer.phone || '۰۹۱۲۳۴۵۶۷۸۹');
    }
  }, [currentCustomer]);

  // Handle Preset Avatar Selection (Chrome-style)
  const handleSelectAvatar = (avatarUrl: string, avatarTitle: string) => {
    if (!currentCustomer) return;
    const updated = {
      ...currentCustomer,
      avatarUrl,
    };
    setCurrentCustomer(updated);
    setToastMessage(`تصویر پروفایل «${avatarTitle}» انتخاب شد`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const saveNotes = () => {
    if (currentCustomer) {
      setCurrentCustomer({ ...currentCustomer, formulaNotes: tempNotes });
    }
    setIsEditingNotes(false);
    setToastMessage('ترجیحات و فرمول اصلاح ذخیره شد');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const saveInfo = () => {
    if (currentCustomer) {
      setCurrentCustomer({
        ...currentCustomer,
        name: tempName.trim() || 'مشتری رویال',
        phone: tempPhone.trim() || '۰۹۱۲۳۴۵۶۷۸۹',
      });
    }
    setIsEditingInfo(false);
    setToastMessage('اطلاعات کاربری با موفقیت ویرایش شد');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const currentAvatarUrl = currentCustomer?.avatarUrl || PRESET_AVATARS[0].url;

  return (
    <AtelierShell id="client-profile-container">
      {/* Top Header */}
      <header
        id="profile-header"
        className="relative z-30 px-6 pt-2 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-stone-900">
            آرایشگاه رویال · پروفایل کاربری شما
          </span>
        </div>

        <span className="text-[10px] text-stone-600 bg-white/70 px-2.5 py-0.5 rounded-full border border-white/80 font-medium">
          مشتری سالن
        </span>
      </header>

      {/* Floating Toast when selecting avatar or saving */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-white/20 animate-in fade-in zoom-in-90 flex items-center gap-2 max-w-[90%] text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* On-Screen Notification Permission Prompt (1-Tap Allow) */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[320px] bg-stone-900/95 text-white rounded-[28px] border border-white/20 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center space-y-4"
              dir="rtl"
            >
              {/* Pulsing Icon */}
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <BellRing className="w-7 h-7 animate-bounce" />
              </div>

              {/* Text info */}
              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-white">
                  فعال‌سازی یادآور نوبت
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed font-normal">
                  «آرایشگاه رویال» می‌خواهد ۱ ساعت پیش از شروع نوبت، پیام یادآوری برای شما ارسال کند.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAllowNotifications}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-stone-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>اجازه می‌دهم (Allow)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-stone-400 hover:text-white text-xs font-medium transition-all"
                >
                  فعلاً نه (Don't Allow)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1-Hour Reminder Toast Notification */}
      <AnimatePresence>
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-14 left-4 right-4 z-50 mx-auto max-w-sm rounded-2xl bg-stone-950/95 backdrop-blur-xl border border-emerald-400/40 p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.5)] text-right text-white space-y-1.5"
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <BellRing className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{reminderToast.title}</h4>
                  <span className="text-[9px] text-emerald-300 font-medium">{reminderToast.time}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReminderToast(null)}
                className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-stone-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-stone-200 leading-relaxed pr-9">
              {reminderToast.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Scrollable Card */}
      <section
        id="profile-glass-card"
        className="relative z-20 mx-auto w-[356px] bg-white/45 backdrop-blur-2xl rounded-[36px] shadow-2xl border border-white/70 p-3.5 pt-3 pb-6 flex flex-col mt-1 max-h-[700px] overflow-y-auto no-scrollbar"
        dir="rtl"
      >
        {/* Upper Section: Current User Profile Card */}
        <div className="p-3.5 rounded-[26px] bg-white/85 backdrop-blur-xl text-stone-900 shadow-md border border-white/95 relative overflow-hidden shrink-0 text-right">
          <div className="flex items-start gap-3">
            {/* Active Avatar Photo Display */}
            <div className="relative shrink-0">
              <img
                src={currentAvatarUrl}
                alt={currentCustomer?.name || 'پروفایل'}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-[#7e5352]/30"
              />
            </div>

            {/* User Meta & Editing */}
            <div className="flex-1 min-w-0">
              {isEditingInfo ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="نام و نام خانوادگی"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7e5352]"
                  />
                  <input
                    type="tel"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="شماره همراه"
                    className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#7e5352]"
                  />
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveInfo}
                      className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold"
                    >
                      ذخیره
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px]"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-stone-900 truncate">
                      {currentCustomer?.name || 'مشتری رویال'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(true)}
                      className="text-[10px] text-stone-500 hover:text-stone-900 flex items-center gap-0.5"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>ویرایش نام</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-600 mt-1 flex items-center gap-1 font-medium">
                    <Phone className="w-3 h-3 text-stone-500" />
                    <span>{currentCustomer?.phone || '۰۹۱۲۳۴۵۶۷۸۹'}</span>
                  </p>

                  <p className="text-[10px] text-stone-500 mt-0.5">
                    عضویت در سامانه آرایشگاه رویال
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-stone-200/80 text-[10px]">
            <div className="bg-stone-50/80 p-2 rounded-xl">
              <span className="text-stone-500 block">سوابق رزرو نوبت</span>
              <p className="font-bold text-stone-900 mt-0.5">
                {toPersianDigits(currentCustomer?.totalVisits || 1)} نوبت ثبت‌شده
              </p>
            </div>
            <div className="bg-stone-50/80 p-2 rounded-xl">
              <span className="text-stone-500 block">پذیرش سالن</span>
              <p className="font-bold text-stone-900 mt-0.5">صندلی رویال (رزرو فعال)</p>
            </div>
          </div>
        </div>

        {/* ─── FANTASY AVATARS GALLERY PICKER ─── */}
        <div className="mt-3.5 space-y-2 text-right">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              آواتارهای فانتزی و اساطیری
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              انتخاب سریع بدون مصرف حافظه
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {[
              { key: 'all', label: 'همه' },
              { key: 'Warriors', label: 'جنگجو و شوالیه' },
              { key: 'Cyber & Mech', label: 'ربات و سایبر' },
              { key: 'Stealth & Rogue', label: 'تکاور و نینجا' },
              { key: 'Legends', label: 'اسطوره‌ها' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === tab.key
                    ? 'bg-[#7e5352] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Fantasy Avatar Grid */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-2.5 border border-white/80">
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_AVATARS.filter(
                (avatar) =>
                  selectedCategory === 'all' || avatar.category === selectedCategory
              ).map((avatar) => {
                const isSelected = currentAvatarUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectAvatar(avatar.url, avatar.title)}
                    className={`group relative flex flex-col items-center p-1.5 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-white shadow-sm ring-2 ring-[#7e5352]'
                        : 'hover:bg-white/80 active:scale-95'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={avatar.url}
                        alt={avatar.title}
                        referrerPolicy="no-referrer"
                        className={`w-12 h-12 rounded-full object-cover border-2 transition-transform duration-200 bg-amber-50/50 ${
                          isSelected
                            ? 'border-[#7e5352] scale-105 shadow-sm'
                            : 'border-white group-hover:scale-105'
                        }`}
                      />
                      {isSelected && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7e5352] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] mt-1 truncate max-w-[56px] text-center ${
                        isSelected ? 'font-bold text-[#7e5352]' : 'text-stone-600'
                      }`}
                    >
                      {avatar.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle Section: Formula Notes & Preferences */}
        <div className="space-y-2.5 mt-3.5">
          {/* Formula Notes */}
          <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 space-y-1.5 shadow-xs text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#7e5352]" />
                فرمول اصلاح و ترجیحات نزد آرایشگر
              </span>
              {isEditingNotes ? (
                <button
                  type="button"
                  onClick={saveNotes}
                  className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100 px-2.5 py-0.5 rounded-full"
                >
                  <Check className="w-3 h-3" /> ذخیره
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[10px] text-stone-600 font-bold flex items-center gap-1 hover:text-stone-900"
                >
                  <Edit3 className="w-3 h-3" /> ویرایش
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                rows={3}
                className="w-full text-xs text-stone-900 bg-white p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#7e5352] font-sans"
              />
            ) : (
              <p className="text-xs text-stone-800 leading-relaxed font-medium bg-stone-50/70 p-2 rounded-xl border border-stone-100">
                {currentCustomer?.formulaNotes || 'سایه بغل شماره ۱.۵، بالای سر کار با قیچی، دور مو تمیز و آنکارد دقیق.'}
              </p>
            )}
          </div>

          {/* Notification & Reminder Preferences */}
          <div className="p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 space-y-2.5 shadow-xs text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#7e5352]" />
                تنظیمات پیام و یادآورهای نوبت
              </span>
              <span className="text-[9px] text-stone-500 font-medium">سرویس هوشمند رویال</span>
            </div>

            <div className="space-y-2 pt-1 border-t border-stone-200/60">
              {/* 1-Hour Reminder Toggle (with Web Notification Permission Request) */}
              <div 
                onClick={toggleAppointmentReminder}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/85 hover:bg-white border border-stone-100 shadow-xs cursor-pointer select-none transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold text-stone-900">یادآور ۱ ساعت پیش از نوبت</h5>
                      {permissionState === 'granted' && enableAppointmentReminder && (
                        <span className="text-[9px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          فعال
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-stone-500 mt-0.5">
                      ارسال پیام یادآوری ۱ ساعت پیش از شروع زمان رزرو نوبت
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAppointmentReminder();
                  }}
                  aria-label="فعال یا غیرفعال کردن یادآور نوبت"
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 pointer-events-auto ${
                    enableAppointmentReminder ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                      enableAppointmentReminder ? 'translate-x-0' : '-translate-x-5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AtelierShell>
  );
};

