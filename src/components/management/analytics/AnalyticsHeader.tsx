import React, { useState } from 'react';
import { AnalyticsPeriod, AnalyticsCustomRange } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { 
  TrendingUp, 
  Calendar, 
  ChevronDown, 
  Check, 
  Target, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

interface AnalyticsHeaderProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  customRange: AnalyticsCustomRange;
  onCustomRangeChange: (range: AnalyticsCustomRange) => void;
  dateRangeDescription: string;
  isTargetMet: boolean;
  achievedPct: number;
  onOpenTargetModal: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  dateRangeDescription,
  isTargetMet,
  achievedPct,
  onOpenTargetModal,
}) => {
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [startDayInput, setStartDayInput] = useState(customRange.startDay);
  const [endDayInput, setEndDayInput] = useState(customRange.endDay);

  const periods: { key: AnalyticsPeriod; label: string }[] = [
    { key: 'today', label: 'امروز' },
    { key: 'week', label: 'این هفته' },
    { key: 'month', label: 'این ماه' },
    { key: 'year', label: 'این سال' },
    { key: 'custom', label: 'سفارشی' },
  ];

  const handleApplyCustomRange = () => {
    const s = Math.min(startDayInput, endDayInput);
    const e = Math.max(startDayInput, endDayInput);
    onCustomRangeChange({ startDay: s, endDay: e });
    onPeriodChange('custom');
    setIsCustomDropdownOpen(false);
  };

  return (
    <div className="bg-[#121214] border border-[#26262a] rounded-2xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden">
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 right-0 w-80 h-32 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        {/* Title & Date Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2a261c] to-[#1a1916] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-inner shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
                گزارش عملکرد و هوش مالی آتلیه
              </h1>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#24221c] text-[#d4af37] border border-[#d4af37]/25">
                زنده و محاسبه لحظه‌ای
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>دوره انتخابی:</span>
              <span className="font-semibold text-stone-200">{dateRangeDescription}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector Tabs */}
          <div className="flex items-center bg-[#1a1a1e] border border-[#2a2a30] p-1 rounded-xl">
            {periods.map((p) => {
              const isActive = period === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => {
                    if (p.key === 'custom') {
                      setIsCustomDropdownOpen(!isCustomDropdownOpen);
                    } else {
                      setIsCustomDropdownOpen(false);
                      onPeriodChange(p.key);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-[#121214] font-bold shadow-md'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-[#25252b]'
                  }`}
                >
                  {p.label}
                  {p.key === 'custom' && (
                    <ChevronDown className={`w-3 h-3 transition-transform ${isCustomDropdownOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Target Quick Gauge Button */}
          <button
            onClick={onOpenTargetModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181c] border border-[#2e2b20] hover:border-[#d4af37]/40 text-stone-300 hover:text-[#d4af37] rounded-xl text-xs font-medium transition-colors"
            title="مشاهده و تغییر تارگت درآمد"
          >
            <Target className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>تارگت دوره:</span>
            <span className={`font-bold ${isTargetMet ? 'text-emerald-400' : 'text-[#d4af37]'}`}>
              ٪{toPersianDigits(achievedPct)}
            </span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Popover */}
      {isCustomDropdownOpen && (
        <div className="mt-3 p-4 bg-[#18181c] border border-[#33333b] rounded-xl text-xs text-stone-300 animate-in fade-in duration-150">
          <div className="font-semibold text-stone-200 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37]" />
              انتخاب روزهای مهرماه ۱۴۰۳ برای تحلیل
            </span>
            <span className="text-[11px] text-stone-400">تقویم فعال استودیو</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-stone-400 text-[11px] mb-1">از روز (مهر ۱۴۰۳):</label>
              <input
                type="number"
                min={1}
                max={30}
                value={startDayInput}
                onChange={(e) => setStartDayInput(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#121214] border border-[#333] rounded-lg px-3 py-1.5 text-stone-100 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-stone-400 text-[11px] mb-1">تا روز (مهر ۱۴۰۳):</label>
              <input
                type="number"
                min={1}
                max={30}
                value={endDayInput}
                onChange={(e) => setEndDayInput(parseInt(e.target.value, 10) || 30)}
                className="w-full bg-[#121214] border border-[#333] rounded-lg px-3 py-1.5 text-stone-100 text-sm focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsCustomDropdownOpen(false)}
              className="px-3 py-1 text-stone-400 hover:text-stone-200"
            >
              انصراف
            </button>
            <button
              onClick={handleApplyCustomRange}
              className="px-4 py-1.5 bg-[#d4af37] text-stone-950 font-bold rounded-lg hover:bg-[#c5a028] transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              اعمال فیلتر سفارشی
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
