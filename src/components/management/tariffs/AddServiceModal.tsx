import React, { useState, useEffect } from 'react';
import { LegacyServiceCategory, Service, ActionResult } from '../../../types';
import { 
  X, 
  Scissors, 
  DollarSign, 
  Clock, 
  Sparkles, 
  Tag, 
  Check, 
  AlertCircle, 
  Crown, 
  Sparkle,
  Plus,
  Palette,
  Leaf
} from 'lucide-react';
import { toPersianDigits, safeParseNumber } from '../../../utils/dateUtils';
import { hapticLight, hapticSuccess } from '../../../utils/hapticUtils';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService: (data: {
    name: string;
    category: LegacyServiceCategory;
    durationMinutes: number;
    price: number;
    description: string;
    tag?: string;
    isSpecialty?: boolean;
    isActive?: boolean;
  }) => { success: boolean; error?: string; service?: Service } | ActionResult;
}

const CATEGORY_OPTIONS: Array<{
  id: LegacyServiceCategory;
  label: string;
  description: string;
  icon: typeof Scissors;
  color: string;
  border: string;
  bg: string;
}> = [
  {
    id: 'haircut',
    label: 'پیرایش مو',
    description: 'کوتاهی کلاسیک و مدرن، فید و فرم‌دهی اختصاصی مو',
    icon: Scissors,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'beard',
    label: 'طراحی ریش',
    description: 'اصلاح با تیغ سنتی، حوله گرم و فرم‌دهی تخصصی خط ریش',
    icon: Sparkles,
    color: 'text-rose-300',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
  },
  {
    id: 'rituals',
    label: 'آیین‌های جامع',
    description: 'پکیج‌های سلطنتی کامل، تشریفات VIP و آرامش ذهن',
    icon: Crown,
    color: 'text-amber-300',
    border: 'border-amber-400/30',
    bg: 'bg-amber-400/10',
  },
  {
    id: 'coloring',
    label: 'رنگ و گریم',
    description: 'رنگساژ، پوشش سفیدی، جوانسازی و استایلینگ ژورنالی',
    icon: Palette,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
  },
  {
    id: 'treatment',
    label: 'مراقبت و اسپا',
    description: 'پاکسازی پوست، اسکراب، ماساژ سر و احیای ریشه مو',
    icon: Leaf,
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
  },
];

const DURATION_PRESETS = [20, 30, 45, 60, 75, 90, 120];
const PRICE_PRESETS = [150000, 250000, 350000, 450000, 600000, 850000, 1200000];
const TAG_SUGGESTIONS = ['محبوب‌ترین', 'امضای رویال', 'VIP', 'تخصصی', 'پکیج ویژه', 'پیشنهادی'];

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onAddService,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LegacyServiceCategory>('haircut');
  const [priceInput, setPriceInput] = useState('350000');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [isSpecialty, setIsSpecialty] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setCategory('haircut');
      setPriceInput('350000');
      setDurationMinutes(45);
      setDescription('');
      setTag('');
      setIsSpecialty(false);
      setIsActive(true);
      setErrorMessage(null);
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('لطفاً عنوان آیین پیرایش را وارد نمایید.');
      return;
    }

    const parsedPrice = safeParseNumber(priceInput, -1);
    if (parsedPrice < 0) {
      setErrorMessage('لطفاً مبلغ معتبر و غیرمنفی برای تعرفه خدمت وارد نمایید.');
      return;
    }

    if (durationMinutes <= 0) {
      setErrorMessage('مدت زمان خدمت باید بیشتر از ۰ دقیقه باشد.');
      return;
    }

    setIsSubmitting(true);
    hapticSuccess();

    const result = onAddService({
      name: trimmedName,
      category,
      durationMinutes,
      price: parsedPrice,
      description: description.trim() || 'خدمت اختصاصی آرایشگاه رویال با برترین ابزار و مواد درجه‌یک',
      tag: tag.trim() || undefined,
      isSpecialty,
      isActive,
    });

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 500);
    } else {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'خطایی در افزودن خدمت رخ داد.');
    }
  };

  const handlePriceAdjust = (delta: number) => {
    hapticLight();
    const current = safeParseNumber(priceInput, 0);
    const nextVal = Math.max(0, current + delta);
    setPriceInput(nextVal.toString());
  };

  return (
    <div
      id="add-service-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        id="add-service-modal-container"
        className="relative w-full max-w-2xl bg-[#141211] border border-stone-800/90 rounded-[28px] p-6 text-stone-100 shadow-2xl space-y-6 my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7e5352]/20 border border-[#7e5352]/40 text-[#cbb5b4] flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#cbb5b4]" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                <span>تعریف و افزودن آیین پیرایش جدید</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7e5352]/30 text-[#fbdcd9] border border-[#7e5352]/40 font-sans">
                  منوی سالن
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                تنظیم دسته‌بندی، نرخ تعرفه رسمی، مدت زمان و فعال‌سازی در سامانه نوبت‌دهی
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200">
              عنوان خدمت / آیین پیرایش <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: پیرایش کلاسیک رویال با شستشو و استایل"
                className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#7e5352] transition-colors"
                required
              />
              <Scissors className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Service Category Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-200">
              دسته‌بندی خدمت <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setCategory(cat.id);
                    }}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-1.5 ${
                      isSelected
                        ? `bg-stone-800/90 border-[#cbb5b4] ring-1 ring-[#cbb5b4]/40 shadow-sm`
                        : 'bg-stone-900/50 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${cat.bg} flex items-center justify-center ${cat.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-stone-200">
                          {cat.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#7e5352] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-900/40 border border-stone-800/80">
            {/* Price Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#cbb5b4]" />
                  <span>تعرفه خدمت (تومان) <span className="text-rose-400">*</span></span>
                </label>
                <div className="flex items-center gap-1" dir="ltr">
                  <button
                    type="button"
                    onClick={() => handlePriceAdjust(-50000)}
                    className="px-1.5 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono"
                    title="-۵۰,۰۰۰ تومان"
                  >
                    -۵۰k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceAdjust(50000)}
                    className="px-1.5 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono"
                    title="+۵۰,۰۰۰ تومان"
                  >
                    +۵۰k
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="350000"
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-2.5 text-sm text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352] transition-colors"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-sans pointer-events-none">
                  تومان
                </span>
              </div>

              {/* Price Quick Chips */}
              <div className="flex items-center gap-1 flex-wrap pt-0.5" dir="ltr">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setPriceInput(p.toString());
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-colors ${
                      priceInput === p.toString()
                        ? 'bg-[#7e5352] text-white font-bold'
                        : 'bg-stone-800/80 hover:bg-stone-700 text-stone-400'
                    }`}
                  >
                    {toPersianDigits((p / 1000).toLocaleString())}k
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>مدت زمان اجرا (دقیقه) <span className="text-rose-400">*</span></span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  placeholder="45"
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-2.5 text-sm text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352] transition-colors"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-stone-500 pointer-events-none">
                  دقیقه
                </span>
              </div>

              {/* Duration Presets */}
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {DURATION_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setDurationMinutes(d);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] transition-colors ${
                      durationMinutes === d
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-stone-800/80 hover:bg-stone-700 text-stone-400'
                    }`}
                  >
                    {toPersianDigits(d)} دقیقه
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200">
              توضیحات و جزئیات آیین
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح مراحل، محصولات مورد استفاده، حوله گرم و آرامش‌بخش و ویژگی‌های این آیین..."
              className="w-full bg-stone-900 border border-stone-700/80 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#7e5352] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Tag & Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tag Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-200 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                <span>برچسب ویژه (اختیاری)</span>
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="مثال: محبوب‌ترین، امضای رویال، VIP"
                className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#7e5352] transition-colors"
              />
              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {TAG_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      hapticLight();
                      setTag(s);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] transition-colors ${
                      tag === s
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Specialty and Active Status */}
            <div className="space-y-3 pt-1">
              {/* Specialty toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-200 block flex items-center gap-1">
                    <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                    <span>آیین امضا / تخصصی</span>
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    نمایش نشان طلایی امضای آتلیه
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isSpecialty}
                  onChange={(e) => setIsSpecialty(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7e5352] focus:ring-0 cursor-pointer accent-[#7e5352]"
                />
              </label>

              {/* Active Toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-stone-200 block">
                    فعال در سامانه رزرو
                  </span>
                  <span className="text-[10px] text-stone-400 block">
                    قابل انتخاب توسط مشتریان
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-600"
                />
              </label>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2 text-xs text-rose-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-stone-800/80">
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="flex-1 py-3 px-4 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>آیین جدید با موفقیت اضافه شد</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>ثبت و انتشار آیین جدید در سالن</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-3 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
            >
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
