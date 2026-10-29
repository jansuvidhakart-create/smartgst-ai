import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { SubscriptionTier } from '../types';
import {
  Crown,
  Check,
  Sparkles,
  Zap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Pill,
  Info
} from 'lucide-react';

export const SubscriptionPlansView: React.FC = () => {
  const { language, currentShop, upgradeSubscription } = useShop();
  const { t } = useTranslation(language);

  const [notification, setNotification] = useState<string | null>(null);

  const handleSelectTier = (tier: SubscriptionTier) => {
    upgradeSubscription(tier);
    setNotification(`Successfully switched ${currentShop.name} to the ${tier.toUpperCase()} tier!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const plans: {
    tier: SubscriptionTier;
    name: string;
    price: string;
    period: string;
    popular?: boolean;
    description: string;
    features: string[];
    limits: string;
  }[] = [
    {
      tier: 'basic',
      name: 'Basic Chemist',
      price: '₹499',
      period: '/month',
      description: 'Ideal for neighborhood retail chemists starting computerized medical billing & batch tracking',
      limits: 'Single Counter · Up to 500 Bills / mo',
      features: [
        'Form 20B / 21B compliant tax invoices & thermal slips',
        'Medicine batch number & expiry date tracking',
        'Strict expired medicine sale-block protection',
        'Local patient khata ledger & WhatsApp bills',
        'A4 & 80mm POS receipt printing',
      ],
    },
    {
      tier: 'business',
      name: 'Smart Pharmacy Pro',
      price: '₹999',
      period: '/month',
      popular: true,
      description: 'Best for busy retail medical stores, 24x7 chemist shops, and high-volume surgical stores',
      limits: 'Unlimited Bills · Batch Alerts',
      features: [
        'Unlimited medical tax invoices & cash memos',
        '30, 60 & 90-day expiry warning dashboard',
        'Schedule H & H1 antibiotic prescription verification',
        'Pharma distributor purchase bills & ITC credit tracking',
        'Distributor purchase returns & credit notes for expired stock',
        'GSTR-1, GSTR-3B & P&L Statement Excel exports',
        'SmartGST AI business advisor for pharma regulations',
      ],
    },
    {
      tier: 'premium',
      name: 'Hospital & Multi-Branch Chemist',
      price: '₹1,999',
      period: '/month',
      description: 'For hospital attached pharmacies, multi-branch chemist chains, and pharmaceutical wholesale depots',
      limits: 'Multi-Branch & Multi-Counter',
      features: [
        'Everything in Smart Pharmacy Pro',
        'Multi-branch inventory synchronization & stock transfers',
        'Staff role authorization (cashier, pharmacist, store manager)',
        'Doctor prescription repository with dosage notes',
        'Drug Inspector (DI) audit inspection report export',
        'Dedicated CA / tax reconciliation package',
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-full text-xs font-semibold">
          <Pill className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent SaaS Pricing for Indian Retail Pharmacies</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Chemist Subscription Plans
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Tailored for retail chemists, medical stores, and hospital pharmacies. Switch tiers anytime.
        </p>
      </div>

      {/* Demo Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Demo Sandbox Notice:</strong> Live payment gateways (Razorpay, Stripe, UPI Intent) are running in sandbox preview mode. Switching plans updates your store entitlement in your local browser sandbox without charging your card.
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => {
          const isActive = currentShop.subscriptionPlan === p.tier;

          return (
            <div
              key={p.tier}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative ${
                isActive
                  ? 'bg-white border-emerald-700 shadow-md ring-2 ring-emerald-700/20'
                  : p.popular
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              {p.popular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Recommended for Chemists
                </div>
              )}

              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-700 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Current Active Plan</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.description}</p>
                </div>

                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-extrabold text-slate-900">{p.price}</span>
                  <span className="text-xs text-slate-500 font-sans">{p.period}</span>
                </div>

                <div className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 text-center">
                  {p.limits}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Features:
                  </div>
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleSelectTier(p.tier)}
                  disabled={isActive}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                      : p.popular
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
                  }`}
                >
                  {isActive ? 'Active Plan' : `Switch to ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Strip */}
      <div className="bg-slate-100 rounded-xl p-4 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Drugs & Cosmetics Rules 1945 Form 20B/21B Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Real-time CGST 6% + SGST 6% / IGST 12% calculation</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Multi-tenant data isolation per pharmacy</span>
        </div>
      </div>
    </div>
  );
};
