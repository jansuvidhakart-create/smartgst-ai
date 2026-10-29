import React from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { formatINR, getMedicineExpiryDetails } from '../utils/gstUtils';
import { Invoice } from '../types';
import {
  TrendingUp,
  Receipt,
  Users,
  Truck,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Package,
  Printer,
  ChevronRight,
  Wallet,
  ShieldAlert,
  Pill,
  Clock
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onViewInvoice: (inv: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onViewInvoice,
}) => {
  const {
    language,
    currentShop,
    todaySales,
    monthSales,
    totalReceivable,
    totalPayable,
    grossProfit,
    netProfit,
    lowStockItems,
    invoices,
    products,
  } = useShop();
  const { t } = useTranslation(language);

  // Expired & near-expiry medicines
  const expiredMedicines = products.filter(
    (p) => getMedicineExpiryDetails(p.expiryDate).status === 'EXPIRED'
  );
  const exp30Medicines = products.filter(
    (p) => getMedicineExpiryDetails(p.expiryDate).status === 'EXPIRING_30'
  );

  // Recent 5 invoices
  const recentInvoices = invoices.slice(0, 5);

  // Top products from catalog
  const topProducts = [...products]
    .sort((a, b) => b.sellingPrice * b.currentStock - a.sellingPrice * a.currentStock)
    .slice(0, 4);

  // Mock sales day breakdown for 7-day sparkline bar chart
  const weeklyData = [
    { day: 'Mon', sales: 4200, count: 6 },
    { day: 'Tue', sales: 6800, count: 9 },
    { day: 'Wed', sales: 5100, count: 7 },
    { day: 'Thu', sales: 8400, count: 11 },
    { day: 'Fri', sales: 7900, count: 10 },
    { day: 'Sat', sales: 11500, count: 16 },
    { day: 'Sun', sales: 14200, count: 21 },
  ];
  const maxWeeklySales = Math.max(...weeklyData.map((d) => d.sales));

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {currentShop.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
            <span className="font-semibold text-emerald-800">{currentShop.category}</span>
            <span>·</span>
            <span>DL No (20B/21B): <strong className="font-mono text-slate-800">{currentShop.dlNumber20B}</strong></span>
            <span>·</span>
            <span>Reg. Pharmacist: <strong className="text-slate-800">{currentShop.registeredPharmacist}</strong></span>
            <span>·</span>
            <span>GSTIN: <strong className="font-mono text-slate-800">{currentShop.gstin}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('invoices')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>+ New Medical Bill</span>
          </button>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Add Medicine</span>
          </button>

          <button
            onClick={() => onNavigateTab('expenses')}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('quickRecordExpense')}</span>
          </button>
        </div>
      </div>

      {/* Critical Expiry Alert Banner (if any expired batch in stock) */}
      {expiredMedicines.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="text-rose-950 font-bold">
                Critical Pharmacy Alert: {expiredMedicines.length} Expired Medicine {expiredMedicines.length === 1 ? 'Batch' : 'Batches'} in Stock!
              </strong>
              <div className="text-[11px] text-rose-700 mt-0.5">
                Sale prohibited under Drugs & Cosmetics Act. Quarantined: {expiredMedicines.map((p) => `${p.name} (Batch ${p.batchNumber})`).join(', ')}. Please return to distributor for credit note.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="font-bold text-rose-800 hover:text-rose-950 underline shrink-0 whitespace-nowrap cursor-pointer text-xs"
          >
            Quarantine Stock &rarr;
          </button>
        </div>
      )}

      {/* Expiring in 30 Days Alert */}
      {exp30Medicines.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{exp30Medicines.length} Medicines Expiring within 30 Days:</strong>{' '}
              {exp30Medicines.map((p) => `${p.name} (Exp: ${p.expiryDate})`).join(', ')}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="font-bold text-amber-800 hover:text-amber-950 underline shrink-0 whitespace-nowrap cursor-pointer"
          >
            Manage Near-Expiry &rarr;
          </button>
        </div>
      )}

      {/* Low Stock Alert Strip */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{lowStockItems.length} {t('lowStockAlerts')}:</strong>{' '}
              {lowStockItems.map((p) => `${p.name} (${p.currentStock} ${p.unit})`).join(', ')}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="font-bold text-amber-800 hover:text-amber-950 underline shrink-0 whitespace-nowrap cursor-pointer"
          >
            Manage Stock &rarr;
          </button>
        </div>
      )}

      {/* 6 Primary Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{t('todaySales')}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live POS
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatINR(todaySales)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>Updated with every generated bill</span>
          </div>
        </div>

        {/* This Month's Sales */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{t('monthSales')}</span>
            <span className="text-[11px] text-slate-400">Current Month</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatINR(monthSales)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Taxable: <span className="font-mono">{formatINR(monthSales * 0.9)}</span>
          </div>
        </div>

        {/* Estimated Gross & Net Profit */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{t('netProfit')}</span>
            <span className="text-[11px] text-slate-400">After Shop Expenses</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatINR(netProfit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Gross: <strong className="font-mono text-slate-800">{formatINR(grossProfit)}</strong></span>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              View P&L &rarr;
            </button>
          </div>
        </div>

        {/* Customer Udhaar (Receivable) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{t('totalReceivable')}</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600">
            {formatINR(totalReceivable)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Pending from customers</span>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-rose-700 hover:underline font-semibold"
            >
              Collect Khata &rarr;
            </button>
          </div>
        </div>

        {/* Supplier Payable */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{t('totalPayable')}</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {formatINR(totalPayable)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Owed to distributors</span>
            <button
              onClick={() => onNavigateTab('suppliers')}
              className="text-amber-800 hover:underline font-semibold"
            >
              View Suppliers &rarr;
            </button>
          </div>
        </div>

        {/* Inventory Stock Value */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Catalog Items & Stock</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {products.length} <span className="text-sm font-normal text-slate-500 font-sans">Products</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span className="text-amber-700 font-medium">{lowStockItems.length} Low on stock</span>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              All Items &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Section: 7-Day Performance & Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Weekly Sales Velocity Chart */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t('salesTrend')}
              </h2>
              <span className="text-[11px] text-slate-500">Weekly sales volume and counter velocity</span>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700">
              Avg ₹8,300/day
            </span>
          </div>

          {/* SVG Sparkline / Bar Graph */}
          <div className="pt-2">
            <div className="h-44 flex items-end gap-3 sm:gap-6 px-2 justify-between">
              {weeklyData.map((item) => {
                const heightPercent = Math.round((item.sales / maxWeeklySales) * 100);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-slate-700 bg-slate-100 px-1 rounded shadow-xs">
                      ₹{item.sales}
                    </div>
                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t-md h-32 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-emerald-700/85 hover:bg-emerald-600 rounded-t-md transition-all duration-300"
                      />
                    </div>
                    {/* Label */}
                    <span className="text-[11px] font-medium text-slate-600">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Top Products with Margin */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {t('topSellingItems')}
              </h2>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-emerald-700 hover:underline font-semibold"
              >
                View Catalog
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {topProducts.map((p) => {
                const marginPercent = Math.round(
                  ((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100
                );
                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="truncate mr-3">
                      <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Stock: <span className="font-mono">{p.currentStock} {p.unit}</span> · HSN: {p.hsn}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-900">₹{p.sellingPrice}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        +{marginPercent}% margin
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('new-invoice')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bill Any Item Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {t('recentTransactions')}
            </h2>
            <span className="text-[11px] text-slate-500">Latest tax invoices generated</span>
          </div>

          <button
            onClick={() => onNavigateTab('invoices')}
            className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
          >
            <span>View All ({invoices.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Supply Type</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">GST</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{inv.invoiceDate}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{inv.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {inv.isInterState ? 'IGST (Inter)' : 'CGST+SGST'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {formatINR(inv.subtotalTaxable)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatINR(inv.totalTax)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : inv.status === 'Partial'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                        title="Print / View Invoice"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
