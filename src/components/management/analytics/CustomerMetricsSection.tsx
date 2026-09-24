import React from 'react';
import { AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { Users, Crown, Sparkles, ChevronLeft, ArrowUpRight } from 'lucide-react';

interface CustomerMetricsSectionProps {
  summary: AnalyticsSummary;
  onOpenCustomerDossier: (customerId: string) => void;
}

export const CustomerMetricsSection: React.FC<CustomerMetricsSectionProps> = ({
  summary,
  onOpenCustomerDossier,
}) => {
  const { customerMetrics } = summary;
  const {
    activeCustomersCount,
    newCustomersCount,
    returningCustomersCount,
    avgCustomerValue,
    topCustomers,
  } = customerMetrics;

  return (
    <div className="bg-[#121215] border border-[#26262c] rounded-2xl p-4 sm:p-5 text-white shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#241f17] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-100 text-sm sm:text-base">
              تحلیل و هوش مراجعین (Client Intelligence)
            </h3>
            <p className="text-xs text-stone-400">تحلیل وفاداری، مراجعین جدید و مراجعین برتر</p>
          </div>
        </div>

        <div className="text-xs text-stone-400">
          میانگین ارزش هر مشتری: <strong className="text-stone-100 font-bold">{formatPrice(avgCustomerValue)}</strong>
        </div>
      </div>

      {/* Customer Quick Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div className="bg-[#16161b] border border-[#26262f] rounded-xl p-3 text-center">
          <span className="text-[11px] text-stone-400 block mb-1">مراجعین فعال در دوره</span>
          <span className="text-xl font-black text-stone-100">{toPersianDigits(activeCustomersCount)} نفر</span>
        </div>
        <div className="bg-[#16161b] border border-[#26262f] rounded-xl p-3 text-center">
          <span className="text-[11px] text-stone-400 block mb-1">مشتریان بازگشتی (وفادار)</span>
          <span className="text-xl font-black text-emerald-400">{toPersianDigits(returningCustomersCount)} نفر</span>
        </div>
        <div className="bg-[#16161b] border border-[#26262f] rounded-xl p-3 text-center">
          <span className="text-[11px] text-stone-400 block mb-1">مشتریان جدید آتلیه</span>
          <span className="text-xl font-black text-[#d4af37]">{toPersianDigits(newCustomersCount)} نفر</span>
        </div>
        <div className="bg-[#16161b] border border-[#26262f] rounded-xl p-3 text-center">
          <span className="text-[11px] text-stone-400 block mb-1">نرخ وفاداری مشتریان</span>
          <span className="text-xl font-black text-purple-400">
            ٪{toPersianDigits(activeCustomersCount > 0 ? Math.round((returningCustomersCount / activeCustomersCount) * 100) : 0)}
          </span>
        </div>
      </div>

      {/* Top Clients Table */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-stone-300 mb-1 flex items-center justify-between">
          <span>فهرست ۱۰ مشتری با بالاترین میزان خرید و حضور در آتلیه:</span>
        </div>

        {topCustomers.length === 0 ? (
          <div className="p-6 text-center text-stone-400 text-xs bg-[#16161a] rounded-xl border border-stone-800">
            اطلاعات مشتریان برای این بازه موجود نیست.
          </div>
        ) : (
          topCustomers.map((client, idx) => (
            <div
              key={client.customerId || idx}
              onClick={() => onOpenCustomerDossier(client.customerId)}
              className="group p-3 bg-[#16161a] hover:bg-[#1a1a20] border border-[#26262d] hover:border-[#d4af37]/40 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3"
            >
              {/* Left Info */}
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#1f1f26] text-stone-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {toPersianDigits(idx + 1)}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-200 text-sm group-hover:text-[#d4af37] transition-colors">
                      {client.customerName}
                    </span>
                    {client.memberId && (
                      <span className="text-[10px] text-stone-400">{client.memberId}</span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>{toPersianDigits(client.visitsCount)} نوبت خدمات</span>
                    {client.ordersCount > 0 && (
                      <>
                        <span>·</span>
                        <span>{toPersianDigits(client.ordersCount)} سفارش بوتیک</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Spend */}
              <div className="text-left flex items-center gap-3">
                <div>
                  <div className="text-sm font-black text-[#d4af37]">
                    {formatPrice(client.totalSpend)}
                  </div>
                  <span className="text-[10px] text-stone-400 flex items-center gap-0.5 justify-end group-hover:text-stone-300">
                    مشاهده پرونده <ChevronLeft className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
