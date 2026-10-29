import React from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { Customer, Product } from '../types';
import { getMedicineExpiryDetails } from '../utils/gstUtils';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Boxes,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Bot,
  Crown,
  AlertTriangle,
  Pill,
  Stethoscope
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'new-invoice'
  | 'invoices'
  | 'inventory'
  | 'customers'
  | 'suppliers'
  | 'expenses'
  | 'reports'
  | 'ai-assistant'
  | 'subscriptions';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { language, lowStockItems, customers, products } = useShop();
  const { t } = useTranslation(language);

  // Overdue/Udhaar count
  const debtorCount = customers.filter(c => c.currentBalance > 0).length;

  // Expired medicines count
  const expiredCount = products.filter(p => getMedicineExpiryDetails(p.expiryDate).status === 'EXPIRED').length;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number | string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: t('navDashboard'),
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'new-invoice',
      label: t('navNewBill'),
      icon: <Receipt className="w-4 h-4 shrink-0 text-emerald-600" />,
    },
    {
      id: 'invoices',
      label: t('navInvoices'),
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'inventory',
      label: t('navInventory'),
      icon: <Pill className="w-4 h-4 shrink-0 text-emerald-600" />,
      badge: expiredCount > 0 ? `${expiredCount} Exp` : (lowStockItems.length > 0 ? `${lowStockItems.length} Low` : undefined),
      badgeColor: expiredCount > 0 ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold' : 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      id: 'customers',
      label: t('navCustomers'),
      icon: <Users className="w-4 h-4 shrink-0" />,
      badge: debtorCount > 0 ? `${debtorCount}` : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
    {
      id: 'suppliers',
      label: t('navSuppliers'),
      icon: <Truck className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'expenses',
      label: t('navExpenses'),
      icon: <Wallet className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'reports',
      label: t('navReports'),
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'ai-assistant',
      label: t('navAIAssistant'),
      icon: <Bot className="w-4 h-4 shrink-0 text-indigo-600" />,
      badge: 'AI',
      badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    },
    {
      id: 'subscriptions',
      label: t('navSubscriptions'),
      icon: <Crown className="w-4 h-4 shrink-0 text-amber-600" />,
    },
  ];

  const handleNavClick = (id: NavTab) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[88px] left-0 h-full md:h-[calc(100vh-88px)] w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                      isActive ? 'bg-slate-700 text-slate-200' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Helper Card */}
        <div className="p-3 border-t border-slate-200">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
              <span>GST Compliance Ready</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 leading-tight">
              Calculates CGST, SGST & IGST accurately as per CBIC guidelines.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
