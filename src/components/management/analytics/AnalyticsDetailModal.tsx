import React, { useState } from 'react';
import { Appointment, AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { 
  X, 
  DollarSign, 
  Scissors, 
  Receipt, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
} from 'lucide-react';

export type InspectionModalType = 'total' | 'service' | 'transactions' | 'appointments' | string;

interface AnalyticsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionType: InspectionModalType;
  summary: AnalyticsSummary;
  onOpenCustomerDossier: (customerId: string) => void;
}

export const AnalyticsDetailModal: React.FC<AnalyticsDetailModalProps> = ({
  isOpen,
  onClose,
  inspectionType,
  summary,
  onOpenCustomerDossier,
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { filteredAppointments, totalRevenue, serviceRevenue, dateRangeDescription } = summary;

  // Filter appointments
  const matchingAppointments = filteredAppointments.filter((apt) => {
    if (apt.status === 'blocked') return false;
    const matchesSearch = 
      (apt.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.appointmentNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getModalTitle = () => {
    switch (inspectionType) {
      case 'total':
        return 'گزارش جامع تراکنش‌ها و درآمدهای آتلیه';
      case 'service':
        return 'ریز درآمد و نوبت‌های آیین‌های پیرایش';
      case 'transactions':
        return 'دفتر کل تراکنش‌های مالی دوره';
      default:
        return 'جزئیات عملکرد و ریز داده‌های مالی';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl">
      <div 
        className="bg-[#131317] border border-[#2b2b35] w-full max-w-4xl rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#23232c] flex items-center justify-between bg-[#17171d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#242119] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                {getModalTitle()}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>دوره: {dateRangeDescription}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#22222a] hover:bg-[#2c2c36] text-stone-400 hover:text-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Summary Bar in Modal */}
        <div className="grid grid-cols-2 gap-3 p-3 sm:p-4 bg-[#101013] border-b border-[#202026] text-center text-xs">
          <div className="p-2 bg-[#16161b] rounded-xl border border-stone-800">
            <span className="text-stone-400 text-[11px] block">درآمد کل دوره</span>
            <span className="text-base sm:text-lg font-black text-[#d4af37]">
              {formatPrice(totalRevenue)}
            </span>
          </div>
          <div className="p-2 bg-[#16161b] rounded-xl border border-stone-800">
            <span className="text-stone-400 text-[11px] block">خدمات پیرایش</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {formatPrice(serviceRevenue)}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-[#202026] flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام مشتری، خدمت یا شماره نوبت..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#18181e] border border-[#2e2e38] rounded-xl pr-9 pl-4 py-2 text-xs text-stone-200 placeholder:text-stone-400 focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#18181e] border border-[#2e2e38] rounded-xl px-3 py-2 text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="completed">تکمیل‌شده (درآمد محقق)</option>
              <option value="confirmed">تایید شده</option>
              <option value="cancelled">لغوشده</option>
              <option value="no_show">عدم حضور</option>
            </select>
          </div>
        </div>

        {/* Records Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-emerald-400" />
                نوبت‌ها و آیین‌های دوره ({toPersianDigits(matchingAppointments.length)})
              </span>
            </div>

            {matchingAppointments.length === 0 ? (
              <div className="p-4 text-center text-xs text-stone-400 bg-[#16161b] rounded-xl border border-stone-800">
                موردی یافت نشد.
              </div>
            ) : (
              <div className="space-y-2">
                {matchingAppointments.map((apt) => {
                  const isCompleted = apt.status === 'completed';
                  const aptTotal = apt.totalAmount || (apt.servicePrice || 0) + (apt.accoutrementsPrice || 0) + (apt.tipAmount || 0);

                  return (
                    <div
                      key={apt.id}
                      className="p-3 bg-[#17171d] hover:bg-[#1c1c24] border border-[#272732] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCompleted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-stone-800 text-stone-400'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span 
                              onClick={() => apt.customerId && onOpenCustomerDossier(apt.customerId)}
                              className="font-bold text-stone-200 hover:text-[#d4af37] cursor-pointer"
                            >
                              {apt.customerName}
                            </span>
                            <span className="text-[10px] text-stone-400">({apt.appointmentNumber})</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isCompleted ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-400'
                            }`}>
                              {isCompleted ? 'تکمیل‌شده' : apt.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {apt.service?.name} · {apt.date} ساعت {apt.startTime}
                          </div>
                        </div>
                      </div>

                      <div className="text-left flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                        <div>
                          <div className="font-black text-emerald-400 text-sm">
                            {formatPrice(aptTotal)}
                          </div>
                          {apt.tipAmount ? (
                            <div className="text-[10px] text-stone-400">انعام: {formatPrice(apt.tipAmount)}</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#17171d] border-t border-[#23232c] flex items-center justify-between text-xs">
          <span className="text-stone-400">
            محاسبه داده‌ها مستقیم بر اساس رکوردهای آتلیه
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#262630] hover:bg-[#32323e] text-stone-200 font-bold rounded-xl transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
