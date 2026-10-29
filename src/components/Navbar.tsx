import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { 
  Store, 
  PlusCircle, 
  Globe, 
  Sparkles, 
  Sliders, 
  ChevronDown, 
  Check, 
  RotateCcw,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  onOpenNewBill: () => void;
  onOpenStoreSettings: () => void;
  onOpenRegisterShop: () => void;
  onOpenUpgrade: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewBill,
  onOpenStoreSettings,
  onOpenRegisterShop,
  onOpenUpgrade,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { 
    language, 
    setLanguage, 
    shops, 
    currentShop, 
    switchShop, 
    resetAllToDemoData 
  } = useShop();
  const { t } = useTranslation(language);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Top Demo Notification Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium text-white">{t('demoModeBanner')}</span>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset all demo invoices, products, and khata records to initial state?')) {
              resetAllToDemoData();
            }
          }}
          className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-medium shrink-0 ml-4 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('resetDemoData')}</span>
        </button>
      </div>

      {/* Main Top Bar Contract: Brand Zone - Shop Switcher - Actions */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm ring-1 ring-emerald-500">
              Rx
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
              SmartGST <span className="text-emerald-600 font-extrabold">MediStore</span>
            </span>
          </div>

          {/* Shop Switcher Dropdown */}
          <div className="relative ml-2 sm:ml-4">
            <button
              onClick={() => setShopMenuOpen(!shopMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors max-w-[220px] sm:max-w-xs truncate cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{currentShop.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {shopMenuOpen && (
              <div 
                className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShopMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('switchShop')}
                </div>
                {shops.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => switchShop(s.id)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      s.id === currentShop.id ? 'bg-emerald-50/70 text-emerald-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="truncate font-medium">{s.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {s.state} · GSTIN: {s.gstin}
                      </div>
                    </div>
                    {s.id === currentShop.id && (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={onOpenRegisterShop}
                  className="w-full px-3 py-2 text-left text-xs text-emerald-700 font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{t('registerNewShop')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Zone: Plan Badge, Language Toggle, Settings, Primary New Bill CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Subscription Plan Badge */}
          <button
            onClick={onOpenUpgrade}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
            title="Subscription Tier"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span className="capitalize">{currentShop.subscriptionPlan} Plan</span>
          </button>

          {/* Language Toggle: EN / HI */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                language === 'hi'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Store Settings Button */}
          <button
            onClick={onOpenStoreSettings}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title={t('navSettings')}
            aria-label={t('navSettings')}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Primary CTA: Create Bill */}
          <button
            onClick={onOpenNewBill}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('quickNewInvoice')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
