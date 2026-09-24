import React, { useState, useEffect } from 'react';
import { Service, LegacyServiceCategory, PriceHistoryEntry } from '../../../types';
import { 
  X, 
  DollarSign, 
  Calendar, 
  Clock, 
  Check, 
  AlertCircle, 
  History, 
  Tag, 
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Trash2,
  Scissors,
  Crown,
  Palette,
  Leaf,
  Sparkle
} from 'lucide-react';
import { toPersianDigits, getPersianDateForDay, safeParseNumber } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { validateTariffInput } from '../../../utils/settingsDefaults';
import { hapticLight, hapticSuccess, hapticWarning } from '../../../utils/hapticUtils';

interface EditTariffModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceId: string, updatedData: {
    name: string;
    category: LegacyServiceCategory;
    price: number;
    durationMinutes: number;
    description: string;
    tag?: string;
    isSpecialty?: boolean;
    isActive: boolean;
    effectiveDate?: string;
  }) => void;
  onDelete?: (serviceId: string) => void;
}

const CATEGORY_OPTIONS: Array<{
  id: LegacyServiceCategory;
  label: string;
  icon: typeof Scissors;
  color: string;
  bg: string;
}> = [
  { id: 'haircut', label: 'پیرایش مو', icon: Scissors, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'beard', label: 'طراحی ریش', icon: Sparkles, color: 'text-rose-300', bg: 'bg-rose-500/10' },
  { id: 'rituals', label: 'آیین‌های جامع', icon: Crown, color: 'text-amber-300', bg: 'bg-amber-400/10' },
  { id: 'coloring', label: 'رنگ و گریم', icon: Palette, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'treatment', label: 'مراقبت و اسپا', icon: Leaf, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const DURATION_PRESETS = [20, 30, 45, 60, 75, 90, 120];
const PRICE_PRESETS = [35, 45, 60, 75, 95, 120, 150];

export const EditTariffModal: React.FC<EditTariffModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LegacyServiceCategory>('haircut');
  const [priceInput, setPriceInput] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [isSpecialty, setIsSpecialty] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setCategory(typeof service.category === 'string' ? (service.category as LegacyServiceCategory) : 'haircut');
      setPriceInput(service.price ? service.price.toString() : '0');
      setDurationMinutes(service.durationMinutes || 45);
      setDescription(service.description || '');
      setTag(service.tag || '');
      setIsSpecialty(!!service.isSpecialty);
      setEffectiveDate(getPersianDateForDay(22));
      setIsActive(service.isActive !== undefined ? service.isActive : true);
      setShowConfirmDelete(false);
      setErrorMessage(null);
      setIsSuccess(false);
    }
  }, [service, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const numericPrice = safeParseNumber(priceInput, -1);
  const currentPrice = service.price;
  const priceDiff = numericPrice >= 0 ? numericPrice - currentPrice : 0;

  const handlePriceAdjust = (delta: number) => {
    hapticLight();
    const current = safeParseNumber(priceInput, 0);
    const nextVal = Math.max(0, current + delta);
    setPriceInput(nextVal.toString());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('عنوان خدمت الزامی است.');
      return;
    }

    const parsedPrice = safeParseNumber(priceInput, -1);
    if (parsedPrice < 0) {
      setErrorMessage('لطفاً مبلغ معتبر و غیرمنفی برای تعرفه وارد نمایید.');
      return;
    }

    if (durationMinutes <= 0) {
      setErrorMessage('مدت زمان خدمت باید بیشتر از ۰ دقیقه باشد.');
      return;
    }

    const validation = validateTariffInput(parsedPrice, effectiveDate);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'لطفاً مقدار معتبر وارد نمایید.');
      return;
    }

    hapticSuccess();
    onSave(service.id, {
      name: trimmedName,
      category,
      price: parsedPrice,
      durationMinutes,
      description: description.trim(),
      tag: tag.trim() || undefined,
      isSpecialty,
      isActive,
      effectiveDate,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 450);
  };

  const handleDelete = () => {
    if (onDelete) {
      hapticWarning();
      onDelete(service.id);
      onClose();
    }
  };

  return (
    <div
      id="edit-tariff-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        id="edit-tariff-modal-container"
        className="relative w-full max-w-2xl bg-[#141211] border border-stone-800/90 rounded-[28px] p-6 text-stone-100 shadow-2xl space-y-5 my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7e5352]/20 border border-[#7e5352]/40 text-[#cbb5b4] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                <span>ویرایش اطلاعات و تعرفه خدمت</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                  {service.id}
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                تنظیم دسته‌بندی، نرخ تعرفه رسمی و وضعیت ارائه در سامانه نوبت‌دهی
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
        <form onSubmit={handleSave} className="space-y-4">
          {/* Service Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200">
              عنوان آیین پیرایش <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-sm text-stone-100 focus:outline-none focus:border-[#7e5352] transition-colors"
              required
            />
          </div>

          {/* Category Select */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200">
              دسته‌بندی خدمت <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-stone-800 border-[#cbb5b4] ring-1 ring-[#cbb5b4]/40 text-white shadow-sm'
                        : 'bg-stone-900/50 border-stone-800 text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg ${cat.bg} flex items-center justify-center ${cat.color}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pricing & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-900/40 border border-stone-800">
            {/* Price Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-200 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#cbb5b4]" />
                  <span>تعرفه جدید (تومان)</span>
                </label>
                <div className="flex items-center gap-1" dir="ltr">
                  <button
                    type="button"
                    onClick={() => handlePriceAdjust(-50000)}
                    className="px-1.5 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono"
                  >
                    -۵۰k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePriceAdjust(50000)}
                    className="px-1.5 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono"
                  >
                    +۵۰k
                  </button>
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-2.5 text-sm text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352] transition-colors"
                  placeholder="350000"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-stone-400 font-sans pointer-events-none">
                  تومان
                </span>
              </div>

              {/* Price Diff Indicator */}
              {priceDiff !== 0 && !isNaN(numericPrice) && (
                <div className="flex items-center gap-1 text-[11px] pt-0.5">
                  {priceDiff > 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">
                        افزایش {formatPrice(Math.abs(priceDiff))} نسبت به تعرفه قبلی ({formatPrice(service.price)})
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-400">
                        کاهش {formatPrice(Math.abs(priceDiff))} نسبت به تعرفه قبلی ({formatPrice(service.price)})
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Duration Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>مدت زمان اجرا (دقیقه)</span>
              </label>

              <div className="relative">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-xl px-3 py-2.5 text-sm text-stone-100 font-mono text-left focus:outline-none focus:border-[#7e5352] transition-colors"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-stone-500 pointer-events-none">
                  دقیقه
                </span>
              </div>

              {/* Duration presets */}
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
                    {toPersianDigits(d)}د
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200">
              توضیحات آیین پیرایش
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700/80 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#7e5352] transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Tag & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-200 block">
                  وضعیت ارائه در سامانه رزرو
                </span>
                <span className="text-[10px] text-stone-400 block">
                  {isActive ? 'فعال و قابل انتخاب برای مشتریان' : 'غیرفعال و مخفی در رزرو'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-emerald-600' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Historical Data Protection Notice */}
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-2.5 text-[11px] text-blue-200 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-blue-100">پایداری سوابق مالی و نوبت‌ها:</span>
              تغییرات برای نوبت‌های آتی اعمال می‌گردد و سوابق نوبت‌های قبلی حفظ خواهد شد.
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Delete Confirmation Box */}
          {showConfirmDelete ? (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-700/60 text-rose-200 space-y-2 text-xs animate-fade-in">
              <p className="font-bold">آیا از حذف این آیین پیرایش اطمینان دارید؟</p>
              <p className="text-[11px] text-rose-300">
                این خدمت از منوی رزرو حذف خواهد شد اما نوبت‌های رزروشده قبلی دست‌نخورده باقی می‌مانند.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  بله، حذف قطعی خدمت
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs"
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : null}

          {/* Previous Price History */}
          {service.priceHistory && service.priceHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-1.5 text-xs text-stone-400 font-bold">
                <History className="w-3.5 h-3.5 text-stone-500" />
                <span>تاریخچه تغییرات نرخ:</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                {service.priceHistory.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-stone-900/50 border border-stone-800/50 text-stone-400"
                  >
                    <span>{h.effectiveDate || 'سوابق قبلی'}</span>
                    <span className="font-mono text-stone-300 font-bold">{formatPrice(h.price)}</span>
                    <span className="text-[10px] text-stone-500">{h.note || 'تغییر تعرفه'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800">
            <div className="flex items-center gap-2 flex-1">
              <button
                type="submit"
                disabled={isSuccess}
                className="flex-1 py-3 px-4 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>تغییرات ذخیره شد</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ذخیره تغییرات و تعرفه</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
              >
                بستن
              </button>
            </div>

            {onDelete && !showConfirmDelete && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-400 hover:text-rose-200 transition-colors"
                title="حذف خدمت"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
