import React, { useState } from 'react';
import { ServicePerformanceMetric } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { Scissors, ArrowUpDown, Sparkles, CheckCircle2, ChevronLeft } from 'lucide-react';

interface ServicePerformanceSectionProps {
  services: ServicePerformanceMetric[];
  onSelectService: (serviceId: string) => void;
}

export const ServicePerformanceSection: React.FC<ServicePerformanceSectionProps> = ({
  services,
  onSelectService,
}) => {
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'avg'>('revenue');

  const sortedServices = [...services].sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'bookings') return b.totalBookings - a.totalBookings;
    if (sortBy === 'avg') return b.avgRevenue - a.avgRevenue;
    return 0;
  });

  return (
    <div className="bg-[#121215] border border-[#26262c] rounded-2xl p-4 sm:p-5 text-white shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#14241a] border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-100 text-sm sm:text-base">
              عملکرد آیین‌ها و خدمات (Service Rituals Ranking)
            </h3>
            <p className="text-xs text-stone-400">تحلیل سودآوری، تعداد رزرو و میانگین درآمد هر خدمت</p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-[#18181d] border border-[#2d2d35] p-1 rounded-xl text-xs">
          <span className="text-stone-400 px-1 text-[11px]">مرتب‌سازی:</span>
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              sortBy === 'revenue' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            بیشترین درآمد
          </button>
          <button
            onClick={() => setSortBy('bookings')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              sortBy === 'bookings' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            تعداد رزرو
          </button>
          <button
            onClick={() => setSortBy('avg')}
            className={`px-2 py-0.5 rounded-lg transition-colors ${
              sortBy === 'avg' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            میانگین فاکتور
          </button>
        </div>
      </div>

      {/* Services List / Table */}
      <div className="space-y-2">
        {sortedServices.length === 0 ? (
          <div className="p-6 text-center text-stone-400 text-xs bg-[#16161a] rounded-xl border border-stone-800">
            در این بازه زمانی خدمتی ثبت نشده است.
          </div>
        ) : (
          sortedServices.map((service, idx) => (
            <div
              key={service.serviceId || idx}
              onClick={() => onSelectService(service.serviceId)}
              className="group p-3 sm:p-3.5 bg-[#16161a] hover:bg-[#1a1a20] border border-[#26262d] hover:border-emerald-500/40 rounded-xl cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Service Info */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#1f1f26] text-stone-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {toPersianDigits(idx + 1)}
                </span>
                <div>
                  <div className="font-bold text-stone-200 text-sm group-hover:text-emerald-400 transition-colors">
                    {service.name}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>{toPersianDigits(service.completedCount)} تکمیل‌شده از {toPersianDigits(service.totalBookings)} رزرو</span>
                    <span>·</span>
                    <span>میانگین فاکتور: {formatPrice(service.avgRevenue)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue & Share Bar */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                <div className="w-24 sm:w-32 hidden md:block">
                  <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                    <span>سهم درآمد</span>
                    <span className="text-emerald-400 font-bold">٪{toPersianDigits(service.revenuePct)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#202028] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${service.revenuePct}%` }}
                    />
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-sm font-black text-emerald-400">
                    {formatPrice(service.revenue)}
                  </div>
                  <div className="text-[10px] text-stone-400 flex items-center gap-0.5 justify-end">
                    بررسی نوبت‌ها <ChevronLeft className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
