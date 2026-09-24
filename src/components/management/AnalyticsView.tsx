import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { 
  AnalyticsPeriod, 
  AnalyticsCustomRange, 
  ServicePerformanceMetric, 
} from '../../types';
import { 
  calculateAnalyticsSummary, 
  DEFAULT_FINANCIAL_TARGETS 
} from '../../utils/analyticsUtils';

// Modular Analytics Components
import { AnalyticsHeader } from './analytics/AnalyticsHeader';
import { FinancialKpiCards } from './analytics/FinancialKpiCards';
import { FinancialTargetCard } from './analytics/FinancialTargetCard';
import { AppointmentKpisSection } from './analytics/AppointmentKpisSection';
import { AnalyticsTrendsSection } from './analytics/AnalyticsTrendsSection';
import { ServicePerformanceSection } from './analytics/ServicePerformanceSection';
import { CustomerMetricsSection } from './analytics/CustomerMetricsSection';
import { DemandAnalyticsSection } from './analytics/DemandAnalyticsSection';
import { AnalyticsDetailModal, InspectionModalType } from './analytics/AnalyticsDetailModal';
import { Flame, DollarSign, Clock, Users, BarChart3, Sparkles } from 'lucide-react';

interface AnalyticsViewProps {
  onOpenDossier?: (customerId: string) => void;
  defaultMode?: 'demand' | 'financial';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  onOpenDossier,
  defaultMode = 'demand'
}) => {
  const {
    appointments,
    pastAppointments,
    customers,
    services,
    setSelectedClientForDossier,
  } = useAtelier();

  // Mode state: 'demand' (focused on requested hours, days & constraints) vs 'financial' (KPIs & revenue)
  const [analyticsMode, setAnalyticsMode] = useState<'demand' | 'financial'>(defaultMode);

  // State
  const [period, setPeriod] = useState<AnalyticsPeriod>('today');
  const [customRange, setCustomRange] = useState<AnalyticsCustomRange>({
    startDay: 19,
    endDay: 25,
  });
  const [customTargets, setCustomTargets] = useState<Record<AnalyticsPeriod, number>>(DEFAULT_FINANCIAL_TARGETS);

  // Inspection Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [inspectionType, setInspectionType] = useState<InspectionModalType>('total');

  // Derive Analytics Summary with memoization
  const summary = useMemo(() => {
    return calculateAnalyticsSummary(
      appointments,
      pastAppointments,
      [],
      customers,
      services,
      [],
      period,
      customRange,
      customTargets[period]
    );
  }, [appointments, pastAppointments, customers, services, period, customRange, customTargets]);

  const handleUpdateTarget = (newTarget: number) => {
    setCustomTargets((prev) => ({
      ...prev,
      [period]: newTarget,
    }));
  };

  const handleOpenInspection = (type: InspectionModalType) => {
    setInspectionType(type);
    setIsDetailModalOpen(true);
  };

  const handleOpenClientDossier = (customerId: string) => {
    const client = customers.find((c) => c.id === customerId);
    if (client) {
      setSelectedClientForDossier(client);
    }
    if (onOpenDossier) {
      onOpenDossier(customerId);
    }
  };

  return (
    <div id="analytics-view-container" className="space-y-4 pb-4 text-stone-100" dir="rtl">
      {/* 1. Main Analytics Mode Selector */}
      <div className="flex gap-2 rounded-2xl border border-stone-800 bg-stone-900/90 p-1.5 shadow-lg backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setAnalyticsMode('demand')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all ${
            analyticsMode === 'demand'
              ? 'bg-[#7e5352] text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <Flame className="h-4 w-4 text-amber-300" />
          <span>تحلیل تقاضای ساعات و روزها</span>
        </button>

        <button
          type="button"
          onClick={() => setAnalyticsMode('financial')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all ${
            analyticsMode === 'financial'
              ? 'bg-[#7e5352] text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
          }`}
        >
          <BarChart3 className="h-4 w-4 text-emerald-300" />
          <span>شاخص‌های مالی و درآمدی</span>
        </button>
      </div>

      {/* 2. Content based on active mode */}
      {analyticsMode === 'demand' ? (
        <div className="space-y-4">
          <DemandAnalyticsSection />
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Header & Period Filter */}
          <AnalyticsHeader
            period={period}
            onPeriodChange={(p) => setPeriod(p)}
            customRange={customRange}
            onCustomRangeChange={(r) => setCustomRange(r)}
            dateRangeDescription={summary.dateRangeDescription}
            isTargetMet={summary.financialTarget.isTargetMet}
            achievedPct={summary.financialTarget.achievedPct}
            onOpenTargetModal={() => handleOpenInspection('total')}
          />

          {/* Core Financial KPI Cards */}
          <FinancialKpiCards
            summary={summary}
            onSelectInspection={(type) => handleOpenInspection(type)}
          />

          {/* Financial Target & Budget Progress Card */}
          <FinancialTargetCard
            currentRevenue={summary.financialTarget.currentRevenue}
            targetAmount={summary.financialTarget.targetAmount}
            achievedPct={summary.financialTarget.achievedPct}
            remainingAmount={summary.financialTarget.remainingAmount}
            isTargetMet={summary.financialTarget.isTargetMet}
            periodLabel={summary.periodLabel}
            onUpdateTarget={handleUpdateTarget}
          />

          {/* Appointment & Capacity KPIs */}
          <AppointmentKpisSection
            summary={summary}
            onInspectAppointments={(filter) => handleOpenInspection('appointments')}
          />

          {/* Interactive Visual Trends (Revenue & Appointment curves) */}
          <AnalyticsTrendsSection
            revenueTrend={summary.revenueTrend}
            appointmentTrend={summary.appointmentTrend}
            period={period}
          />

          {/* Service Rituals Ranking */}
          <ServicePerformanceSection
            services={summary.servicePerformance}
            onSelectService={(serviceId) => handleOpenInspection('service')}
          />

          {/* Customer Loyalty & VIP Ranking */}
          <CustomerMetricsSection
            summary={summary}
            onOpenCustomerDossier={handleOpenClientDossier}
          />
        </div>
      )}

      {/* Deep Drill-down Detail Modal */}
      <AnalyticsDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        inspectionType={inspectionType}
        summary={summary}
        onOpenCustomerDossier={handleOpenClientDossier}
      />
    </div>
  );
};
