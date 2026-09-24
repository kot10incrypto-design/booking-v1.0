import React, { useState, useMemo } from 'react';
import {
  HourlyDemandDetail,
  DayOfWeekDemandDetail,
  DateDemandDetail,
  TopDemandingUser,
  CustomerConstraintRecord,
} from '../../../utils/bookingUtils';
import { useAtelier } from '../../../store/AtelierContext';
import { toPersianDigits } from '../../../utils/dateUtils';
import {
  Clock,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Flame,
  Search,
  Zap,
  BarChart2,
  GraduationCap,
  Sparkles,
  CalendarDays,
  Activity,
  Layers,
  Phone,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

// Custom Persian Tooltip Component for Recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = 'درخواست' }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-stone-700 bg-stone-900/95 p-3 shadow-2xl backdrop-blur-md text-right text-xs" dir="rtl">
      {label && (
        <p className="font-black text-amber-300 mb-1.5 pb-1 border-b border-stone-800">
          {toPersianDigits(label)}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-stone-300 font-medium">{entry.name}:</span>
            </div>
            <span className="font-bold text-white font-mono">
              {toPersianDigits(entry.value)} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DemandAnalyticsSection: React.FC = () => {
  const { demandInsights } = useAtelier();
  const demandData = demandInsights;

  const [expandedHour, setExpandedHour] = useState<string | null>(null);
  const [constraintSearch, setConstraintSearch] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'hours' | 'days' | 'constraints'>('overview');

  const topHour = demandData.mostDemandedHours[0];
  const topWeekday = demandData.mostDemandedWeekdays[0];

  // 1. Prepare Hourly Chart Data (Sorted by chronologic operational hours 09:00 to 22:00)
  const hourlyChartData = useMemo(() => {
    // Sort logically by chronological time
    const sorted = [...demandData.mostDemandedHours].sort((a, b) => {
      const numA = parseFloat(a.hour.replace(':', '.'));
      const numB = parseFloat(b.hour.replace(':', '.'));
      return numA - numB;
    });

    return sorted.map((h) => ({
      hour: h.hour,
      hourLabel: toPersianDigits(h.hour),
      totalDemand: h.totalDemand,
      reservedCount: h.reservedCount,
      missedDemand: h.missedDemandCount,
      uniqueUsers: h.demandingUsers.length,
    }));
  }, [demandData.mostDemandedHours]);

  // 2. Prepare Weekday Chart Data in proper Persian sequence (Saturday to Friday)
  const weekdayChartData = useMemo(() => {
    const persianWeekOrder = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const weekdayMap = new Map(demandData.mostDemandedWeekdays.map((w) => [w.weekday, w]));

    return persianWeekOrder.map((day) => {
      const existing = weekdayMap.get(day);
      return {
        weekday: day,
        count: existing ? existing.count : 0,
        percentage: existing ? existing.percentage : 0,
      };
    });
  }, [demandData.mostDemandedWeekdays]);

  // 3. Daypart Peak Demand Windows (Clean Linear Cards & Metrics - No Circles!)
  const daypartsData = useMemo(() => {
    let morning = 0; // 09:00 - 12:00
    let midday = 0;  // 12:00 - 16:30
    let evening = 0; // 16:30 - 21:00
    let night = 0;   // 21:00 - 23:00

    demandData.mostDemandedHours.forEach((h) => {
      const hourNum = parseFloat(h.hour.replace(':', '.'));
      if (hourNum < 12.0) {
        morning += h.totalDemand;
      } else if (hourNum < 16.5) {
        midday += h.totalDemand;
      } else if (hourNum < 21.0) {
        evening += h.totalDemand;
      } else {
        night += h.totalDemand;
      }
    });

    const total = (morning + midday + evening + night) || 1;

    return [
      {
        id: 'evening',
        title: 'عصر و اوج تقاضا',
        timeRange: '۱۶:۳۰ الی ۲۱:۰۰',
        count: evening,
        percentage: Math.round((evening / total) * 100),
        barColor: 'bg-[#7e5352]',
        badgeText: 'بیشترین ترافیک سالن',
        description: 'ساعات خاتمه کار اداری، شرکت‌ها و کلاس‌های دانشگاهی',
      },
      {
        id: 'morning',
        title: 'صبحگاه اختصاصی',
        timeRange: '۰۹:۰۰ الی ۱۲:۰۰',
        count: morning,
        percentage: Math.round((morning / total) * 100),
        barColor: 'bg-amber-500',
        badgeText: 'مشاغل آزاد و پزشکان',
        description: 'مشتریان با ساعات کاری منعطف و قرار ملاقات‌های صبح',
      },
      {
        id: 'midday',
        title: 'میان‌روز آرام',
        timeRange: '۱۲:۰۰ الی ۱۶:۳۰',
        count: midday,
        percentage: Math.round((midday / total) * 100),
        barColor: 'bg-emerald-500',
        badgeText: 'فرصت تخفیف و پر کردن صندلی',
        description: 'بازه مناسب جهت اختصاص تخفیف‌های زمان خلوت',
      },
      {
        id: 'night',
        title: 'پایان شب VIP',
        timeRange: '۲۱:۰۰ الی ۲۳:۰۰',
        count: night,
        percentage: Math.round((night / total) * 100),
        barColor: 'bg-purple-500',
        badgeText: 'خدمات ویژه',
        description: 'رزروهای خاص و خدمات جامع تشریفاتی',
      },
    ];
  }, [demandData.mostDemandedHours]);

  // Dayparts chart data formatted for Recharts Bar / Area display
  const daypartsChartData = useMemo(() => {
    return [
      {
        id: 'morning',
        name: 'صبحگاه',
        timeRange: '۰۹:۰۰ الی ۱۲:۰۰',
        fullTitle: 'صبحگاه اختصاصی',
        count: daypartsData.find((d) => d.id === 'morning')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'morning')?.percentage || 0,
        fill: '#f59e0b',
        badgeText: 'مشاغل آزاد و پزشکان',
      },
      {
        id: 'midday',
        name: 'میان‌روز',
        timeRange: '۱۲:۰۰ الی ۱۶:۳۰',
        fullTitle: 'میان‌روز آرام',
        count: daypartsData.find((d) => d.id === 'midday')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'midday')?.percentage || 0,
        fill: '#10b981',
        badgeText: 'فرصت تخفیف',
      },
      {
        id: 'evening',
        name: 'عصر (پیک)',
        timeRange: '۱۶:۳۰ الی ۲۱:۰۰',
        fullTitle: 'عصر و اوج تقاضا',
        count: daypartsData.find((d) => d.id === 'evening')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'evening')?.percentage || 0,
        fill: '#d88d85',
        badgeText: 'بیشترین ترافیک سالن',
      },
      {
        id: 'night',
        name: 'شب VIP',
        timeRange: '۲۱:۰۰ الی ۲۳:۰۰',
        fullTitle: 'پایان شب VIP',
        count: daypartsData.find((d) => d.id === 'night')?.count || 0,
        percentage: daypartsData.find((d) => d.id === 'night')?.percentage || 0,
        fill: '#a855f7',
        badgeText: 'خدمات ویژه',
      },
    ];
  }, [daypartsData]);

  // 4. Constraint Stats & Clean Linear Bar Data (No Circles!)
  const constraintStats = useMemo(() => {
    const total = demandData.customerConstraints.length || 1;
    const fixedOffice = demandData.customerConstraints.filter((c) => c.workPatternType === 'fixed_office').length;
    const rotationalShift = demandData.customerConstraints.filter((c) => c.workPatternType === 'shift_rotational').length;
    const university = demandData.customerConstraints.filter((c) => c.workPatternType === 'university').length;
    const weekendOnly = demandData.customerConstraints.filter((c) => c.workPatternType === 'weekend_only').length;

    // Day frequency of unavailability
    const dayUnavailableCounts: Record<string, number> = {};
    demandData.customerConstraints.forEach((c) => {
      c.unavailableDays.forEach((d) => {
        dayUnavailableCounts[d] = (dayUnavailableCounts[d] || 0) + 1;
      });
    });

    const persianWeekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const unavailableDaysChart = persianWeekDays.map((day) => ({
      day,
      count: dayUnavailableCounts[day] || 0,
    }));

    const patternMetrics = [
      {
        label: 'ساعات اداری ثابت (۸ تا ۱۷)',
        count: fixedOffice,
        percentage: Math.round((fixedOffice / total) * 100),
        barColor: 'bg-blue-500',
        textColor: 'text-blue-400',
      },
      {
        label: 'شیفت‌های چرخشی و بیمارستان',
        count: rotationalShift,
        percentage: Math.round((rotationalShift / total) * 100),
        barColor: 'bg-amber-500',
        textColor: 'text-amber-400',
      },
      {
        label: 'دانشجو و محصل',
        count: university,
        percentage: Math.round((university / total) * 100),
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-400',
      },
      {
        label: 'فقط تعطیلات و آخر هفته',
        count: weekendOnly,
        percentage: Math.round((weekendOnly / total) * 100),
        barColor: 'bg-purple-500',
        textColor: 'text-purple-400',
      },
    ];

    return {
      fixedOfficePct: Math.round((fixedOffice / total) * 100),
      rotationalShiftPct: Math.round((rotationalShift / total) * 100),
      universityPct: Math.round((university / total) * 100),
      weekendOnlyPct: Math.round((weekendOnly / total) * 100),
      unavailableDaysChart,
      patternMetrics,
    };
  }, [demandData.customerConstraints]);

  // Filtered Constraints
  const filteredConstraints = useMemo(() => {
    if (!constraintSearch.trim()) return demandData.customerConstraints;
    const query = constraintSearch.toLowerCase();
    return demandData.customerConstraints.filter(
      (c) =>
        c.customerName.toLowerCase().includes(query) ||
        c.customerPhone?.includes(query) ||
        c.patternNote.toLowerCase().includes(query) ||
        c.unavailableDays.some((d) => d.includes(query))
    );
  }, [demandData.customerConstraints, constraintSearch]);

  return (
    <div className="space-y-3.5 w-full max-w-full text-stone-100" dir="rtl">
      {/* 1. Executive Summary KPI Grid (Clean, Responsive, High-Contrast) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Flame className="h-3.5 w-3.5 text-rose-500 shrink-0" />
            <span className="text-[10px] font-bold truncate">اوج تقاضای ساعتی</span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-white font-mono">
              {topHour ? `ساعت ${toPersianDigits(topHour.hour)}` : '—'}
            </div>
            <div className="text-[10px] text-rose-400 font-bold mt-0.5">
              {topHour ? `${toPersianDigits(topHour.totalDemand)} درخواست نوبت` : ''}
            </div>
          </div>
          <p className="mt-1.5 pt-1.5 border-t border-stone-800/80 text-[9px] text-stone-400 leading-tight">
            {topHour ? `${toPersianDigits(topHour.missedDemandCount)} نفر تقاضای مازاد بر ظرفیت` : ''}
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-bold truncate">پیک تقاضای روز هفته</span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-white">
              {topWeekday ? topWeekday.weekday : '—'}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
              {topWeekday ? `${toPersianDigits(topWeekday.percentage)}٪ کل درخواست‌ها` : ''}
            </div>
          </div>
          <p className="mt-1.5 pt-1.5 border-t border-stone-800/80 text-[9px] text-stone-400 leading-tight">
            بیشترین تمرکز رزرو در پایان هفته
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-bold truncate">بازه عصر و اوج کار</span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-white font-mono">
              ۱۶:۳۰ الی ۲۱:۰۰
            </div>
            <div className="text-[10px] text-amber-400 font-bold mt-0.5">
              {toPersianDigits(daypartsData[0].percentage)}٪ حجم مراجعات
            </div>
          </div>
          <p className="mt-1.5 pt-1.5 border-t border-stone-800/80 text-[9px] text-stone-400 leading-tight">
            ساعات بعد از تایم کاری اداری
          </p>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3 shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-stone-400">
            <Briefcase className="h-3.5 w-3.5 text-purple-400 shrink-0" />
            <span className="text-[10px] font-bold truncate">الگوی شاغلین و شیفت</span>
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-white">
              {toPersianDigits(demandData.customerConstraints.length)} پرونده
            </div>
            <div className="text-[10px] text-purple-400 font-bold mt-0.5">
              ثبت ترجیح حضور
            </div>
          </div>
          <p className="mt-1.5 pt-1.5 border-t border-stone-800/80 text-[9px] text-stone-400 leading-tight">
            هماهنگی شیفت آرایشگران با مراجعین
          </p>
        </div>
      </div>

      {/* 2. Clean Tab Navigation */}
      <div className="flex gap-1 rounded-2xl border border-stone-800 bg-stone-950 p-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 rounded-xl py-2 px-1 text-center text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'overview'
              ? 'bg-[#7e5352] text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Activity className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">نمودارها و بازه‌ها</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('hours')}
          className={`flex-1 rounded-xl py-2 px-1 text-center text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'hours'
              ? 'bg-[#7e5352] text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">ساعات و مشتریان</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('days')}
          className={`flex-1 rounded-xl py-2 px-1 text-center text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'days'
              ? 'bg-[#7e5352] text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">روزهای هفته</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('constraints')}
          className={`flex-1 rounded-xl py-2 px-1 text-center text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'constraints'
              ? 'bg-[#7e5352] text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">ترجیحات مراجعین</span>
        </button>
      </div>

      {/* 3. Tab: Overview (Clean Bar Chart & Dayparts Linear Progress - NO CIRCLES) */}
      {activeSubTab === 'overview' && (
        <div className="space-y-3.5">
          {/* Main Composed Chart: Hourly Demand Distribution */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-stone-800 gap-1.5">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-amber-400" />
                  نمودار تقاضای ساعتی (نوبت‌های رزروشده در برابر تقاضای مازاد)
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  ساعات کاری سالن از ۰۹:۰۰ صبح تا ۲۲:۰۰ شب
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-[#7e5352]" />
                  <span className="text-stone-300">رزرو قطعی</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded bg-amber-500" />
                  <span className="text-stone-300">تقاضای مازاد</span>
                </div>
              </div>
            </div>

            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hourlyChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis
                    dataKey="hourLabel"
                    stroke="#78716c"
                    tick={{ fill: '#a8a29e', fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#78716c"
                    tick={{ fill: '#a8a29e', fontSize: 10 }}
                    tickLine={false}
                    tickFormatter={(val) => toPersianDigits(val)}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="reservedCount"
                    name="نوبت‌های رزروشده"
                    stackId="a"
                    fill="#7e5352"
                    radius={[0, 0, 3, 3]}
                  />
                  <Bar
                    dataKey="missedDemand"
                    name="تقاضای مازاد بر ظرفیت"
                    stackId="a"
                    fill="#f59e0b"
                    radius={[3, 3, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalDemand"
                    name="کل درخواست‌ها"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ fill: '#f43f5e', r: 2.5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daypart Peak Windows Chart & Breakdown (Focused Element) */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-stone-800 gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  نمودار توزیع بازه‌های زمانی پیک تقاضا (Dayparts)
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  سهم مراجعه بر اساس بازه‌های صبحگاه، میان‌روز، عصر و شب VIP
                </p>
              </div>
              <div className="flex items-center gap-1 bg-stone-950 px-2.5 py-1 rounded-full border border-stone-800 self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-amber-300">
                  بیشترین تمرکز: عصر (۱۶:۳۰ - ۲۱:۰۰)
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart for Dayparts */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={daypartsChartData}
                  margin={{ top: 12, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#78716c"
                    tick={{ fill: '#d6d3d1', fontSize: 11, fontWeight: 'bold' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#78716c"
                    tick={{ fill: '#a8a29e', fontSize: 10 }}
                    tickLine={false}
                    tickFormatter={(val) => toPersianDigits(val)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div
                          className="rounded-xl border border-stone-700 bg-stone-900/95 p-3 shadow-2xl backdrop-blur-md text-right text-xs"
                          dir="rtl"
                        >
                          <p className="font-black text-amber-300 mb-1 border-b border-stone-800 pb-1 flex items-center justify-between gap-3">
                            <span>{data.fullTitle}</span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {data.timeRange}
                            </span>
                          </p>
                          <div className="space-y-1 mt-1 text-[11px]">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">تعداد تقاضا:</span>
                              <span className="font-bold text-white font-mono">
                                {toPersianDigits(data.count)} تقاضا
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-stone-300">سهم از کل:</span>
                              <span className="font-bold text-amber-300 font-mono">
                                {toPersianDigits(data.percentage)}٪
                              </span>
                            </div>
                            <div className="pt-1 text-[10px] text-stone-400 font-normal">
                              {data.badgeText}
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" name="تعداد تقاضا" radius={[6, 6, 0, 0]}>
                    {daypartsChartData.map((entry) => (
                      <Cell key={entry.id} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Metric Cards under the Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {daypartsChartData.map((part) => (
                <div
                  key={part.id}
                  className="rounded-xl border border-stone-800/90 bg-stone-950/80 p-2.5 flex flex-col justify-between hover:border-stone-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-bold text-white truncate">
                        {part.fullTitle}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: part.fill }}
                      />
                    </div>
                    <p className="text-[9px] font-mono text-stone-400">
                      {part.timeRange}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-stone-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-black text-white">
                      {toPersianDigits(part.count)}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${part.fill}20`,
                        color: part.fill === '#d88d85' ? '#fbdcd9' : part.fill,
                      }}
                    >
                      {toPersianDigits(part.percentage)}٪
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Requested Hours & Demanding Users */}
      {activeSubTab === 'hours' && (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white">
                جزییات تقاضای هر ساعت و اسامی مشتریان متقاضی
              </h3>
              <p className="text-[10px] text-stone-400 mt-0.5">
                کلیک روی هر ساعت جهت مشاهده لیست مشتریان و شماره تماس
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {demandData.mostDemandedHours.map((h) => {
              const isExpanded = expandedHour === h.hour;
              return (
                <div
                  key={h.hour}
                  className="rounded-xl border border-stone-800 bg-stone-950/70 p-2.5 transition-all hover:border-stone-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-[#7e5352] text-xs font-mono font-bold text-white shadow-sm">
                        {toPersianDigits(h.hour)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">
                            {toPersianDigits(h.totalDemand)} تقاضا
                          </span>
                          {h.missedDemandCount > 0 && (
                            <span className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                              {toPersianDigits(h.missedDemandCount)} مازاد
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-stone-400">
                          <span className="text-emerald-400 font-bold">
                            {toPersianDigits(h.reservedCount)} رزرو قطعی
                          </span>
                          <span>•</span>
                          <span>{toPersianDigits(h.demandingUsers.length)} مراجع</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedHour(isExpanded ? null : h.hour)}
                      className="flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-800 px-2.5 py-1 text-[11px] font-bold text-stone-200 hover:bg-stone-700 transition-colors"
                    >
                      <span>متقاضیان</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Demanding Users List */}
                  {isExpanded && (
                    <div className="mt-2.5 rounded-lg border border-stone-800 bg-stone-900 p-2.5 space-y-1.5 animate-fadeIn">
                      <span className="block text-[10px] font-black text-amber-300">
                        مشتریان متقاضی ساعت {toPersianDigits(h.hour)}:
                      </span>
                      <div className="divide-y divide-stone-800 text-xs">
                        {h.demandingUsers.map((user, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-1.5 text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="h-3.5 w-3.5 text-stone-500" />
                              <span className="font-bold text-white">{user.name}</span>
                              {user.phone && (
                                <span className="font-mono text-[10px] text-stone-400 flex items-center gap-1">
                                  <Phone className="h-2.5 w-2.5" />
                                  {toPersianDigits(user.phone)}
                                </span>
                              )}
                            </div>
                            <span className="rounded bg-[#7e5352]/40 border border-[#7e5352]/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 font-mono">
                              {toPersianDigits(user.count)} درخواست
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tab: Weekdays & Calendar Breakdown */}
      {activeSubTab === 'days' && (
        <div className="space-y-3.5">
          {/* Weekday Recharts Bar Chart */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-400" />
                توزیع تقاضا در روزهای هفته (شنبه تا جمعه)
              </h3>
              <span className="text-[10px] text-stone-400">بر اساس کل تاریخچه رزروها</span>
            </div>

            <div className="mt-3 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="weekday" stroke="#78716c" tick={{ fill: '#a8a29e', fontSize: 10 }} tickLine={false} />
                  <YAxis stroke="#78716c" tick={{ fill: '#a8a29e', fontSize: 10 }} tickLine={false} tickFormatter={(val) => toPersianDigits(val)} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar dataKey="count" name="تعداد تقاضا" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calendar Top Dates */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl space-y-2.5">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 pb-2 border-b border-stone-800">
              <TrendingUp className="h-4 w-4 text-amber-400" />
              پرازدحام‌ترین تاریخ‌های تقویم
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demandData.mostDemandedDates.map((d, idx) => (
                <div
                  key={d.dayNumber}
                  className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-950/70 p-2.5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7e5352] text-[10px] font-bold text-white">
                      {toPersianDigits(idx + 1)}
                    </span>
                    <span className="font-bold text-white">{d.dateLabel}</span>
                  </div>
                  <span className="rounded-md bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-amber-300 font-mono">
                    {toPersianDigits(d.count)} درخواست
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab: Customer Preferences & Constraints (NO CIRCLES!) */}
      {activeSubTab === 'constraints' && (
        <div className="space-y-3.5">
          {/* Pattern Breakdown Linear Progress Metrics */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 pb-2 border-b border-stone-800">
              <Briefcase className="h-4 w-4 text-blue-400" />
              تفکیک الگوهای شغلی و محدودیت‌های مراجعین
            </h3>

            <div className="space-y-2.5">
              {constraintStats.patternMetrics.map((pattern) => (
                <div key={pattern.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-200">{pattern.label}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-stone-400">{toPersianDigits(pattern.count)} پرونده</span>
                      <span className={`font-black ${pattern.textColor}`}>
                        ({toPersianDigits(pattern.percentage)}٪)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-800">
                    <div
                      className={`h-full rounded-full ${pattern.barColor}`}
                      style={{ width: `${pattern.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unavailability by Weekday Bar Chart */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl">
            <h3 className="text-xs sm:text-sm font-black text-white mb-1 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              روزهای عدم امکان حضور مراجعین (تداخل کاری/دانشگاه)
            </h3>
            <p className="text-[10px] text-stone-400 mb-3">
              تعداد مراجعینی که اعلام کرده‌اند در روزهای زیر شیفت دارند و نمی‌توانند مراجعه کنند
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={constraintStats.unavailableDaysChart}
                  margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                  <XAxis dataKey="day" stroke="#78716c" tick={{ fill: '#a8a29e', fontSize: 10 }} tickLine={false} />
                  <YAxis stroke="#78716c" tick={{ fill: '#a8a29e', fontSize: 10 }} tickLine={false} tickFormatter={(val) => toPersianDigits(val)} />
                  <Tooltip content={<CustomChartTooltip unit="مراجع" />} />
                  <Bar dataKey="count" name="تعداد مراجعین با تداخل" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Searchable Client Constraints Dossiers */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-3.5 shadow-xl space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-white">
                  پرونده محدودیت‌های ثبت‌شده توسط مراجعین
                </h3>
                <p className="text-[10px] text-stone-400">
                  جستجو بر اساس نام، شماره یا کلمات کلیدی توضیحات
                </p>
              </div>
              <div className="relative">
                <Search className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="جستجوی مراجع یا شغل..."
                  value={constraintSearch}
                  onChange={(e) => setConstraintSearch(e.target.value)}
                  className="w-full sm:w-48 rounded-xl border border-stone-700 bg-stone-950 py-1.5 pl-2.5 pr-8 text-xs text-white placeholder-stone-500 outline-none focus:border-[#7e5352]"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredConstraints.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-stone-800 bg-stone-950/70 p-2.5 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.customerName}</span>
                      {item.customerPhone && (
                        <span className="font-mono text-[10px] text-stone-400">
                          {toPersianDigits(item.customerPhone)}
                        </span>
                      )}
                    </div>
                    <span className="rounded-md bg-[#7e5352]/30 border border-[#7e5352]/50 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                      {item.workPatternType === 'fixed_office'
                        ? 'ساعات اداری ثابت'
                        : item.workPatternType === 'shift_rotational'
                        ? 'شیفت چرخشی'
                        : item.workPatternType === 'university'
                        ? 'دانشگاه / مدرسه'
                        : item.workPatternType === 'weekend_only'
                        ? 'فقط آخر هفته'
                        : 'سایر'}
                    </span>
                  </div>

                  {item.unavailableDays.length > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-stone-400">روزهای عدم امکان حضور:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.unavailableDays.map((d) => (
                          <span
                            key={d}
                            className="rounded bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.2 text-[9px] font-bold text-rose-300"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.patternNote && (
                    <div className="rounded-lg bg-stone-900 p-2 text-[10px] leading-relaxed text-stone-300 border border-stone-800/80">
                      <span className="font-bold text-amber-300 ml-1">توضیح مراجع:</span>
                      {item.patternNote}
                    </div>
                  )}
                </div>
              ))}

              {filteredConstraints.length === 0 && (
                <div className="py-6 text-center text-xs text-stone-500">
                  موردی با این مشخصات یافت نشد.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
