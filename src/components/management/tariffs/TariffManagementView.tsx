import React, { useState, useMemo } from 'react';
import { useAtelier } from '../../../store/AtelierContext';
import { Service, LegacyServiceCategory } from '../../../types';
import { 
  DollarSign, 
  Search, 
  Plus, 
  Edit3, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  History, 
  ShoppingBag,
  Scissors,
  Crown,
  Palette,
  Leaf,
  Power
} from 'lucide-react';
import { toPersianDigits } from '../../../utils/dateUtils';
import { formatPrice } from '../../../utils/formatUtils';
import { EditTariffModal } from './EditTariffModal';
import { AddServiceModal } from './AddServiceModal';
import { hapticLight, hapticSuccess } from '../../../utils/hapticUtils';

export const TariffManagementView: React.FC = () => {
  const { 
    services, 
    products, 
    addService, 
    updateService, 
    deleteService 
  } = useAtelier();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        s.name.toLowerCase().includes(query) || 
        s.description.toLowerCase().includes(query) ||
        (s.tag && s.tag.toLowerCase().includes(query));
      return matchesCat && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleCreateService = (data: {
    name: string;
    category: LegacyServiceCategory;
    durationMinutes: number;
    price: number;
    description: string;
    tag?: string;
    isSpecialty?: boolean;
    isActive?: boolean;
  }) => {
    const res = addService({
      ...data,
      isActive: data.isActive ?? true,
    });
    if (res.success) {
      showToast(`آیین «${data.name}» با موفقیت افزوده شد و به منوی سالن اضافه گردید.`);
    }
    return res;
  };

  const handleSaveEditedService = (
    serviceId: string, 
    updatedData: {
      name: string;
      category: LegacyServiceCategory;
      price: number;
      durationMinutes: number;
      description: string;
      tag?: string;
      isSpecialty?: boolean;
      isActive: boolean;
      effectiveDate?: string;
    }
  ) => {
    const res = updateService(serviceId, updatedData);
    if (res.success) {
      showToast('اطلاعات و تعرفه خدمت با موفقیت بروزرسانی شد.');
    }
  };

  const handleDeleteService = (serviceId: string) => {
    deleteService(serviceId);
    showToast('خدمت با موفقیت از منوی سالن حذف گردید.');
  };

  const handleToggleActiveStatus = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticLight();
    const nextStatus = !(service.isActive !== false);
    updateService(service.id, { isActive: nextStatus });
    showToast(`وضعیت «${service.name}» به ${nextStatus ? 'فعال' : 'غیرفعال'} تغییر یافت.`);
  };

  const getCategoryBadge = (cat?: string | any) => {
    const catStr = typeof cat === 'object' && cat !== null ? (cat.id || '') : (cat || '');
    switch (catStr) {
      case 'haircut':
        return { 
          label: 'پیرایش مو', 
          color: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
          icon: Scissors 
        };
      case 'beard':
        return { 
          label: 'طراحی ریش', 
          color: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
          icon: Sparkles 
        };
      case 'rituals':
        return { 
          label: 'آیین‌های جامع', 
          color: 'bg-amber-900/30 text-amber-200 border-amber-600/40',
          icon: Crown 
        };
      case 'coloring':
        return { 
          label: 'رنگ و گریم', 
          color: 'bg-purple-950/40 text-purple-300 border-purple-800/40',
          icon: Palette 
        };
      case 'treatment':
        return { 
          label: 'مراقبت و اسپا', 
          color: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
          icon: Leaf 
        };
      default:
        return { 
          label: cat || 'خدمات', 
          color: 'bg-stone-800 text-stone-300 border-stone-700',
          icon: Scissors 
        };
    }
  };

  // Pricing statistics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive !== false).length;
    const avgPrice = Math.round(services.reduce((acc, s) => acc + s.price, 0) / (total || 1));
    const minPrice = services.length > 0 ? Math.min(...services.map((s) => s.price)) : 0;
    const maxPrice = services.length > 0 ? Math.max(...services.map((s) => s.price)) : 0;
    return { total, active, avgPrice, minPrice, maxPrice };
  }, [services]);

  return (
    <div id="tariff-management-view" className="space-y-6 animate-fade-in" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-2xl bg-[#1c1917] border border-emerald-500/60 text-emerald-300 text-xs shadow-2xl flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#cbb5b4]" />
            <span>مدیریت آیین‌های پیرایش و تعرفه‌ها</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            تعریف خدمات جدید، دسته‌بندی موضوعی، تنظیم نرخ رسمی و فعال‌سازی در سامانه رزرو
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="hidden lg:flex items-center gap-2 bg-stone-900/80 border border-stone-800 rounded-2xl py-2 px-3 text-xs text-stone-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>حفظ داده‌های تاریخی فعال</span>
          </div>

          <button
            type="button"
            onClick={() => {
              hapticSuccess();
              setIsAddModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-2xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold shadow-lg shadow-[#7e5352]/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن آیین جدید</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1">
          <span className="text-[11px] text-stone-500 block">کل آیین‌های تعریف‌شده</span>
          <span className="text-lg font-mono font-bold text-stone-200">
            {toPersianDigits(stats.total)} خدمت
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1">
          <span className="text-[11px] text-stone-500 block">خدمات فعال در رزرو آنلاین</span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            {toPersianDigits(stats.active)} فعال
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1">
          <span className="text-[11px] text-stone-500 block">میانگین تعرفه رسمی</span>
          <span className="text-lg font-mono font-bold text-[#cbb5b4]">
            {formatPrice(stats.avgPrice)}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1">
          <span className="text-[11px] text-stone-500 block">دامنه تعرفه‌ها (تومان)</span>
          <span className="text-sm font-mono font-bold text-stone-300">
            {formatPrice(stats.minPrice)} – {formatPrice(stats.maxPrice)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900/40 border border-stone-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'همه آیین‌ها' },
            { id: 'haircut', label: 'پیرایش مو' },
            { id: 'beard', label: 'طراحی ریش' },
            { id: 'rituals', label: 'آیین‌های جامع' },
            { id: 'coloring', label: 'رنگ و گریم' },
            { id: 'treatment', label: 'مراقبت و اسپا' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                hapticLight();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#7e5352] text-white shadow-sm'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی عنوان خدمت یا برچسب..."
            className="w-full bg-stone-900/90 border border-stone-700/70 rounded-xl pr-9 pl-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#7e5352] transition-colors"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const badge = getCategoryBadge(service.category);
          const IconComp = badge.icon;
          const isServiceActive = service.isActive !== false;

          return (
            <div
              key={service.id}
              className={`p-4 rounded-2xl bg-stone-900/60 border transition-all flex flex-col justify-between space-y-4 ${
                isServiceActive ? 'border-stone-800/80 hover:border-stone-700' : 'border-stone-800/40 opacity-75'
              }`}
            >
              <div className="space-y-2.5">
                {/* Badges & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${badge.color}`}>
                    <IconComp className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {service.tag && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        {service.tag}
                      </span>
                    )}
                    {service.isSpecialty && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-950/60 text-amber-400 border border-amber-700/50 font-medium flex items-center gap-0.5" title="خدمت تخصصی سالن">
                        <Crown className="w-2.5 h-2.5" />
                        <span>تخصصی</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleToggleActiveStatus(service, e)}
                      title={isServiceActive ? 'کلیک برای غیرفعال‌سازی در رزرو' : 'کلیک برای فعال‌سازی در رزرو'}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 transition-all ${
                        isServiceActive
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/50'
                      }`}
                    >
                      <Power className="w-2.5 h-2.5" />
                      <span>{isServiceActive ? 'فعال' : 'غیرفعال'}</span>
                    </button>
                  </div>
                </div>

                {/* Service Name & Description */}
                <div>
                  <h3 className="text-sm font-bold text-stone-100 font-serif">
                    {service.name}
                  </h3>
                  <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-stone-400 pt-2 border-t border-stone-800/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>{toPersianDigits(service.durationMinutes)} دقیقه</span>
                  </div>
                  {service.priceHistory && service.priceHistory.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <History className="w-3 h-3" />
                      <span>{toPersianDigits(service.priceHistory.length)} تاریخچه قیمت</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-800/80">
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block">تعرفه رسمی:</span>
                  <span className="text-base font-mono font-bold text-[#cbb5b4]">
                    {formatPrice(service.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setEditingService(service);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-[#7e5352] text-stone-200 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>ویرایش آیین</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="p-8 text-center bg-stone-900/40 border border-stone-800 rounded-2xl text-stone-400 text-xs space-y-3">
          <p>خدمتی با مشخصات جستجو شده یافت نشد.</p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-[#7e5352] hover:bg-[#6c4443] text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تعریف آیین جدید</span>
          </button>
        </div>
      )}

      {/* Unified Product Catalog Pricing Overview */}
      <div className="mt-8 p-5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-800 text-[#cbb5b4] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-200">
                تعرفه‌های جاری محصولات بوتیک آتلیه
              </h3>
              <p className="text-[11px] text-stone-500">
                قیمت‌ها و موجودی با رجیستری مرکزی کاتالوگ بوتیک یکپارچه می‌باشند
              </p>
            </div>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {toPersianDigits(products.length)} قلم کالا
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {products.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 flex items-center justify-between text-xs"
            >
              <div className="truncate pl-2">
                <span className="text-stone-200 font-medium block truncate">
                  {prod.persianName || prod.name}
                </span>
                <span className="text-[10px] text-stone-500">
                  موجودی: {toPersianDigits(prod.stockQuantity)} عدد
                </span>
              </div>
              <span className="font-mono font-bold text-[#cbb5b4] shrink-0">
                {formatPrice(prod.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddService={handleCreateService}
        />
      )}

      {/* Edit Modal */}
      {editingService && (
        <EditTariffModal
          service={editingService}
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          onSave={handleSaveEditedService}
          onDelete={handleDeleteService}
        />
      )}
    </div>
  );
};
