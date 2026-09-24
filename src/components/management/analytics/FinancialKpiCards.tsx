import React from 'react';
import { AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { 
  DollarSign, 
  Scissors, 
  ReceiptText, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  CalendarCheck,
  Percent
} from 'lucide-react';

interface FinancialKpiCardsProps {
  summary: AnalyticsSummary;
  onSelectInspection: (type: 'total' | 'service' | 'transactions' | 'appointments') => void;
}

export const FinancialKpiCards: React.FC<FinancialKpiCardsProps> = ({
  summary,
  onSelectInspection,
}) => {
  const {
    totalRevenue,
    serviceRevenue,
    avgTransactionValue,
    transactionCount,
    serviceTransactionCount,
    revenueGrowthPct,
    isGrowthPositive,
    occupancyRate,
  } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Revenue Card */}
      <div 
        onClick={() => onSelectInspection('total')}
        className="group relative bg-[#131316] hover:bg-[#18181c] border border-[#26262c] hover:border-[#d4af37]/50 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl group-hover:bg-[#d4af37]/15 transition-all pointer-events-none" />
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-400 group-hover:text-stone-300 transition-colors">
            درآمد کل آتلیه
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#242119] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
            {formatPrice(totalRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#232328]">
          <div className="flex items-center gap-1.5">
            {revenueGrowthPct !== null ? (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-bold text-[11px] ${
                isGrowthPositive 
                  ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/40' 
                  : 'bg-rose-950/70 text-rose-400 border border-rose-800/40'
              }`}>
                {isGrowthPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                ٪{toPersianDigits(Math.abs(revenueGrowthPct))}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] bg-stone-800 text-stone-400">
                <Minus className="w-3 h-3" /> پایه اولیه
              </span>
            )}
            <span className="text-[11px] text-stone-400">نسبت به دوره قبل</span>
          </div>

          <span className="text-[11px] text-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            جزئیات <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 2. Service Revenue Card */}
      <div 
        onClick={() => onSelectInspection('service')}
        className="group relative bg-[#131316] hover:bg-[#18181c] border border-[#26262c] hover:border-[#4ade80]/40 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#4ade80]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-400 group-hover:text-stone-300 transition-colors">
            درآمد خدمات و آیین‌ها
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#14241a] border border-[#4ade80]/30 flex items-center justify-center text-[#4ade80]">
            <Scissors className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
            {formatPrice(serviceRevenue)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#232328]">
          <span className="text-[11px] text-stone-400">
            {toPersianDigits(serviceTransactionCount)} نوبت تکمیل‌شده
          </span>
          <span className="text-[11px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            بررسی آیین‌ها <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 3. Occupancy Rate Card */}
      <div 
        onClick={() => onSelectInspection('appointments')}
        className="group relative bg-[#131316] hover:bg-[#18181c] border border-[#26262c] hover:border-[#60a5fa]/40 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#60a5fa]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-400 group-hover:text-stone-300 transition-colors">
            ضریب اشغال و بهره‌وری صندلی
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#141f2d] border border-[#60a5fa]/30 flex items-center justify-center text-[#60a5fa]">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
            ٪{toPersianDigits(occupancyRate || 0)}
          </span>
          <span className="text-xs font-medium text-blue-400/80 mr-1">
            نرخ بهره‌وری
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#232328]">
          <span className="text-[11px] text-stone-400">
            {toPersianDigits(serviceTransactionCount)} نوبت ثبت‌شده
          </span>
          <span className="text-[11px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            تقویم نوبت‌ها <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 4. Average Transaction Value Card */}
      <div 
        onClick={() => onSelectInspection('transactions')}
        className="group relative bg-[#131316] hover:bg-[#18181c] border border-[#26262c] hover:border-[#c084fc]/40 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-[#c084fc]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stone-400 group-hover:text-stone-300 transition-colors">
            میانگین ارزش تراکنش (ATV)
          </span>
          <div className="w-9 h-9 rounded-xl bg-[#21162d] border border-[#c084fc]/30 flex items-center justify-center text-[#c084fc]">
            <ReceiptText className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-2.5">
          <span className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight">
            {formatPrice(avgTransactionValue)}
          </span>
          <span className="text-xs text-stone-400">/ هر خدمت</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#232328]">
          <span className="text-[11px] text-stone-400">
            مجموع {toPersianDigits(transactionCount)} تراکنش معتبر
          </span>
          <span className="text-[11px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            فهرست کامل <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
