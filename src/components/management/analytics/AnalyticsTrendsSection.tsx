import React, { useState } from 'react';
import { TrendDataPoint, AnalyticsPeriod } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { BarChart3, LineChart, DollarSign, CalendarCheck } from 'lucide-react';

interface AnalyticsTrendsSectionProps {
  revenueTrend: TrendDataPoint[];
  appointmentTrend: TrendDataPoint[];
  period: AnalyticsPeriod;
}

export const AnalyticsTrendsSection: React.FC<AnalyticsTrendsSectionProps> = ({
  revenueTrend,
  appointmentTrend,
  period,
}) => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'appointments'>('revenue');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Determine max values for relative bar height scaling
  const maxRevenue = Math.max(...revenueTrend.map((p) => p.totalRevenue), 100);
  const maxAppointments = Math.max(...appointmentTrend.map((p) => p.totalAppointments), 5);

  return (
    <div className="bg-[#121215] border border-[#26262c] rounded-2xl p-4 sm:p-5 text-white shadow-xl">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#201c14] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            {activeTab === 'revenue' ? <DollarSign className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-bold text-stone-100 text-sm sm:text-base">
              {activeTab === 'revenue' ? 'نمودار روند درآمدی آتلیه' : 'نمودار توزیع زمانی نوبت‌ها'}
            </h3>
            <p className="text-xs text-stone-400">
              {activeTab === 'revenue' 
                ? 'تفکیک جریان نقدینگی به تفکیک خدمات و بوتیک' 
                : 'بررسی حجم مراجعات و نوبت‌های تکمیل‌شده'}
            </p>
          </div>
        </div>

        {/* Tab Buttons & Legend */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-[#18181d] border border-[#2d2d35] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('revenue')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'revenue'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              روند درآمد (تومان)
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'appointments'
                  ? 'bg-[#d4af37] text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              تعداد نوبت‌ها
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 mb-4 pb-3 border-b border-[#202026]">
        {activeTab === 'revenue' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span>درآمد خدمات و آیین‌ها</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
              <span>تکمیل‌شده</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
              <span>کل نوبت‌ها</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
              <span>لغوشده / غیبت</span>
            </div>
          </>
        )}
      </div>

      {/* Chart Canvas / Visual Bars */}
      <div className="h-56 sm:h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 sm:px-4 relative border-b border-[#232328]">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-15">
          <div className="border-b border-stone-500 w-full" />
          <div className="border-b border-stone-500 w-full" />
          <div className="border-b border-stone-500 w-full" />
        </div>

        {activeTab === 'revenue' ? (
          revenueTrend.map((point, idx) => {
            const totalHeight = Math.max(8, (point.totalRevenue / maxRevenue) * 100);
            const isHovered = hoveredPointIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-[#1e1e24] border border-[#d4af37]/60 text-white rounded-lg px-2.5 py-1 text-[11px] shadow-2xl whitespace-nowrap animate-in fade-in">
                    <div className="font-bold text-[#d4af37]">{point.label} {point.sublabel ? `(${point.sublabel})` : ''}</div>
                    <div>درآمد: {formatPrice(point.totalRevenue)}</div>
                  </div>
                )}

                {/* Amount Label above bar */}
                <span className="text-[10px] text-stone-400 mb-1.5 font-medium group-hover:text-[#d4af37] transition-colors">
                  {formatPrice(point.totalRevenue)}
                </span>

                {/* Stacked Bar */}
                <div
                  className="w-full max-w-[42px] bg-[#1a1a20] rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 border border-stone-800 group-hover:border-[#d4af37]/60 group-hover:shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                  style={{ height: `${totalHeight}%` }}
                >
                  <div
                    className="w-full h-full bg-gradient-to-t from-emerald-700 to-emerald-500 transition-all"
                  />
                </div>
              </div>
            );
          })
        ) : (
          appointmentTrend.map((point, idx) => {
            const totalHeight = Math.max(8, (point.totalAppointments / maxAppointments) * 100);
            const isHovered = hoveredPointIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredPointIndex(idx)}
                onMouseLeave={() => setHoveredPointIndex(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-[#1e1e24] border border-[#d4af37]/60 text-white rounded-lg px-2.5 py-1 text-[11px] shadow-2xl whitespace-nowrap animate-in fade-in">
                    <div className="font-bold text-[#d4af37]">{point.label} {point.sublabel ? `(${point.sublabel})` : ''}</div>
                    <div>کل نوبت‌ها: {toPersianDigits(point.totalAppointments)}</div>
                    <div className="text-emerald-400 text-[10px]">تکمیل‌شده: {toPersianDigits(point.completedAppointments)}</div>
                    {point.cancelledAppointments > 0 && (
                      <div className="text-rose-400 text-[10px]">کنسلی: {toPersianDigits(point.cancelledAppointments)}</div>
                    )}
                  </div>
                )}

                {/* Count Label */}
                <span className="text-[10px] text-stone-400 mb-1.5 font-medium group-hover:text-[#d4af37] transition-colors">
                  {toPersianDigits(point.totalAppointments)}
                </span>

                {/* Bar */}
                <div
                  className="w-full max-w-[42px] bg-gradient-to-t from-amber-800 to-amber-500 rounded-t-lg transition-all duration-300 border border-stone-800 group-hover:border-[#d4af37]/60"
                  style={{ height: `${totalHeight}%` }}
                >
                  {/* Completed sub-indicator inside */}
                  <div
                    className="w-full bg-emerald-500/80 rounded-t-lg"
                    style={{ height: `${point.totalAppointments > 0 ? (point.completedAppointments / point.totalAppointments) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2.5 px-2 sm:px-4 text-xs text-stone-400">
        {revenueTrend.map((point, idx) => (
          <div key={idx} className="flex-1 text-center font-medium">
            <div>{point.label}</div>
            {point.sublabel && (
              <div className="text-[10px] text-stone-400">{point.sublabel}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
