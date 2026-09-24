import React, { useState } from 'react';
import { useAtelier } from '../../store/AtelierContext';
import { ManagementTab } from '../../types';
import { AtelierShell } from '../AtelierShell';
import { TodayView } from './TodayView';
import { ScheduleView } from './ScheduleView';
import { ClientsView } from './ClientsView';
import { AnalyticsView } from './AnalyticsView';
import { TariffManagementView } from './tariffs/TariffManagementView';
import { ServiceManagementView } from './ServiceManagementView';
import { ReportsView } from './reports/ReportsView';
import { StudioSettingsView } from './settings/StudioSettingsView';
import { ClientDossierModal } from './ClientDossierModal';
import { 
  Clock, 
  Calendar, 
  Users, 
  TrendingUp, 
  Sparkles,
  Bell,
  ChevronDown,
  Scissors,
  Armchair,
  FileText,
  DollarSign,
  Sliders,
  BarChart3,
  LogOut,
  Menu,
  X,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { toPersianDigits } from '../../utils/dateUtils';

export const ManagementShell: React.FC = () => {
  const { 
    managementTab, 
    setManagementTab, 
    managementSubTab,
    setManagementSubTab,
    logoutManagement,
    activeChair,
    activeBarber,
    customers,
    selectedClientForDossier,
    setSelectedClientForDossier,
  } = useAtelier();

  const handleOpenDossier = (customerId?: string) => {
    if (customerId) {
      const client = customers.find((c) => c.id === customerId);
      if (client) {
        setSelectedClientForDossier(client);
        return;
      }
    }
    setManagementTab('clients');
  };

  return (
    <AtelierShell id="management-shell-container">
      {/* 1. Studio Management Top Header */}
      <header
        id="management-header"
        className="relative z-30 px-4 pt-1 flex items-center justify-between shrink-0"
        dir="rtl"
      >
        {/* Center Title & Barber Info */}
        <div className="text-right">
          <h1 className="text-xs font-serif font-bold text-stone-900">
            مدیریت آرایشگاه رویال
          </h1>
          <p className="text-[9px] text-stone-600 font-mono">
            {activeBarber.name} · {activeChair.name}
          </p>
        </div>

        {/* Right Action Icons: Return to Client Portal */}
        <div className="flex items-center gap-1.5">
          {/* Switch to Client Portal / Logout Button */}
          <button
            type="button"
            onClick={logoutManagement}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white text-[10px] font-medium px-2.5 py-1 rounded-full transition-all shadow-sm border border-stone-700/60"
            title="خروج از پنل مدیریت و بازگشت به نمای مشتری"
          >
            <LogOut className="w-3 h-3 text-amber-400" />
            <span>خروج و نمای مشتری</span>
          </button>
        </div>
      </header>

      {/* 2. Main Floating Monolithic Glass Container (Responsive and Fluid) */}
      <section
        id="management-main-card"
        className="relative z-20 w-[365px] ml-0 mr-1 pl-2.5 sm:pl-3.5 pr-[10px] pt-2 pb-[12px] bg-white/35 backdrop-blur-2xl rounded-[32px] sm:rounded-[38px] shadow-2xl border border-white/60 flex flex-col justify-between mt-0.5 max-h-[calc(100dvh-130px)] sm:max-h-[725px] overflow-hidden"
        dir="rtl"
      >
        <div className="flex-1 overflow-y-auto pr-0.5 no-scrollbar pb-16">
          {managementTab === 'today' && <TodayView onOpenDossier={handleOpenDossier} />}
          {managementTab === 'schedule' && <ScheduleView onOpenDossier={handleOpenDossier} />}
          {managementTab === 'clients' && (
            <ClientsView
              onOpenDossier={(cId) => {
                const client = customers.find((c) => c.id === cId);
                if (client) setSelectedClientForDossier(client);
              }}
            />
          )}
          {managementTab === 'analytics' && (
            <div className="space-y-3">
              {/* Analytics & Configuration Hub Sub-Navigation Bar */}
              <div 
                id="management-subtabs-bar"
                className="sticky top-0 z-20 flex items-center justify-between p-1 bg-stone-900/95 backdrop-blur-xl border border-stone-800 rounded-2xl shadow-md gap-1 overflow-x-auto no-scrollbar"
              >
                {[
                  { id: 'overview', label: 'آمار و تقاضا', icon: BarChart3 },
                  { id: 'reports', label: 'گزارش‌ها', icon: FileText },
                  { id: 'services', label: 'خدمات', icon: Scissors },
                  { id: 'tariffs', label: 'تعرفه‌ها', icon: DollarSign },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = managementSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setManagementSubTab(st.id as any)}
                      className={`flex-1 py-1.5 px-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all flex items-center justify-center gap-1 shrink-0 ${
                        isSelected
                          ? 'bg-[#7e5352] text-white shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                      }`}
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{st.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Render Subtab View */}
              {managementSubTab === 'overview' && <AnalyticsView onOpenDossier={handleOpenDossier} />}
              {managementSubTab === 'reports' && <ReportsView />}
              {managementSubTab === 'services' && <ServiceManagementView />}
              {managementSubTab === 'tariffs' && <TariffManagementView />}
              {managementSubTab === 'settings' && <StudioSettingsView />}
            </div>
          )}
          {managementTab === 'settings' && <StudioSettingsView />}
        </div>
      </section>

      {/* Client Dossier Detail & History Modal */}
      <ClientDossierModal
        customer={selectedClientForDossier}
        isOpen={!!selectedClientForDossier}
        onClose={() => setSelectedClientForDossier(null)}
        onNavigateToSchedule={() => setManagementTab('schedule')}
      />

      {/* 3. Bottom Floating Navigation Dock */}
      <div
        id="management-bottom-dock-container"
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-4"
      >
        <div className="px-3 max-w-[380px] mx-auto">
          <nav
            id="management-bottom-dock"
            aria-label="منوی ناوبری مدیریت آتلیه"
            className="pointer-events-auto bg-white/95 backdrop-blur-2xl rounded-full px-2.5 py-1.5 shadow-2xl border border-white/80 flex items-center justify-between"
            dir="rtl"
          >
            {/* Today Tab */}
            <button
              id="mgmt-tab-today"
              type="button"
              onClick={() => setManagementTab('today')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'today'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Clock className="w-4 h-4" />
                {managementTab === 'today' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                امروز
              </span>
            </button>

            {/* Schedule Tab */}
            <button
              id="mgmt-tab-schedule"
              type="button"
              onClick={() => setManagementTab('schedule')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'schedule'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Calendar className="w-4 h-4" />
                {managementTab === 'schedule' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                برنامه
              </span>
            </button>

            {/* Clients Tab */}
            <button
              id="mgmt-tab-clients"
              type="button"
              onClick={() => setManagementTab('clients')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'clients'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Users className="w-4 h-4" />
                {managementTab === 'clients' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                مشتریان
              </span>
            </button>

            {/* Analytics Tab */}
            <button
              id="mgmt-tab-analytics"
              type="button"
              onClick={() => setManagementTab('analytics')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'analytics'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
                {managementTab === 'analytics' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                آمار
              </span>
            </button>

            {/* Settings Tab */}
            <button
              id="mgmt-tab-settings"
              type="button"
              onClick={() => setManagementTab('settings')}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-all ${
                managementTab === 'settings'
                  ? 'text-[#7e5352] font-bold scale-105'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Sliders className="w-4 h-4" />
                {managementTab === 'settings' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#7e5352]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-normal mt-0.5">
                تنظیمات
              </span>
            </button>
          </nav>
        </div>
      </div>
    </AtelierShell>
  );
};
