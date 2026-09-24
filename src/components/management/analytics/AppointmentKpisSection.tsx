import React from 'react';
import { AnalyticsSummary } from '../../../types';
import { toPersianDigits } from '../../../utils/dateUtils';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserX, 
  Percent,
  Armchair,
  Gauge
} from 'lucide-react';

interface AppointmentKpisSectionProps {
  summary: AnalyticsSummary;
  onInspectAppointments: (filterType?: string) => void;
}

export const AppointmentKpisSection: React.FC<AppointmentKpisSectionProps> = ({
  summary,
  onInspectAppointments,
}) => {
  const {
    totalAppointments,
    completedAppointments,
    cancelledAppointments,
    noShowAppointments,
    inProgressOrConfirmedAppointments,
    completionRate,
    cancellationRate,
    noShowRate,
    occupancyRate,
    bookedMinutes,
    availableMinutes,
  } = summary;

  const bookedHours = (bookedMinutes / 60).toFixed(1);
  const totalHours = (availableMinutes / 60).toFixed(0);

  return (
    <div className="bg-[#121215] border border-[#26262c] rounded-2xl p-4 sm:p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#201c14] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-100 text-sm sm:text-base">
              شاخص‌های بهره‌وری و نوبت‌دهی (Appointment & Capacity KPIs)
            </h3>
            <p className="text-xs text-stone-400">توزیع وضعیت نوبت‌ها و نرخ اشغال سوئیت‌های پیرایش</p>
          </div>
        </div>

        <button
          onClick={() => onInspectAppointments('all')}
          className="text-xs text-[#d4af37] hover:underline"
        >
          مشاهده لیست کامل نوبت‌ها
        </button>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Total Appointments */}
        <div 
          onClick={() => onInspectAppointments('all')}
          className="bg-[#16161a] hover:bg-[#1a1a20] border border-[#282830] rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>کل نوبت‌ها</span>
            <CalendarCheck className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-2xl font-black text-stone-100">
            {toPersianDigits(totalAppointments)}
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            رزرو ثبت‌شده در بازه
          </div>
        </div>

        {/* 2. Completed Appointments */}
        <div 
          onClick={() => onInspectAppointments('completed')}
          className="bg-[#16161a] hover:bg-[#1a1a20] border border-emerald-900/30 hover:border-emerald-500/50 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>تکمیل‌شده</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {toPersianDigits(completedAppointments)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 font-medium">
            ٪{toPersianDigits(completionRate)} نرخ موفقیت
          </div>
        </div>

        {/* 3. In Progress / Confirmed */}
        <div 
          onClick={() => onInspectAppointments('active')}
          className="bg-[#16161a] hover:bg-[#1a1a20] border border-amber-900/30 hover:border-amber-500/50 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>در جریان / تایید</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {toPersianDigits(inProgressOrConfirmedAppointments)}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">
            در انتظار یا در حال اجرا
          </div>
        </div>

        {/* 4. Cancelled */}
        <div 
          onClick={() => onInspectAppointments('cancelled')}
          className="bg-[#16161a] hover:bg-[#1a1a20] border border-rose-900/30 hover:border-rose-500/50 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>لغوشده</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {toPersianDigits(cancelledAppointments)}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1 font-medium">
            ٪{toPersianDigits(cancellationRate)} نرخ کنسلی
          </div>
        </div>

        {/* 5. No Show */}
        <div 
          onClick={() => onInspectAppointments('no_show')}
          className="bg-[#16161a] hover:bg-[#1a1a20] border border-stone-800 hover:border-stone-600 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span>عدم حضور</span>
            <UserX className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="text-2xl font-black text-stone-300">
            {toPersianDigits(noShowAppointments)}
          </div>
          <div className="text-[10px] text-stone-400 mt-1 font-medium">
            ٪{toPersianDigits(noShowRate)} نرخ غیبت
          </div>
        </div>

        {/* 6. Studio Occupancy Rate */}
        <div 
          onClick={() => onInspectAppointments('occupancy')}
          className="bg-gradient-to-br from-[#1d1a13] to-[#161510] border border-[#d4af37]/40 rounded-xl p-3.5 cursor-pointer transition-all flex flex-col justify-between shadow-md"
        >
          <div className="flex items-center justify-between text-stone-300 text-xs mb-1.5">
            <span>نرخ اشغال سوئیت</span>
            <Gauge className="w-3.5 h-3.5 text-[#d4af37]" />
          </div>
          <div className="text-2xl font-black text-[#d4af37]">
            ٪{toPersianDigits(occupancyRate)}
          </div>
          <div className="text-[10px] text-stone-300 mt-1 font-medium">
            {toPersianDigits(bookedHours)} از {toPersianDigits(totalHours)} ساعت
          </div>
        </div>
      </div>
    </div>
  );
};
