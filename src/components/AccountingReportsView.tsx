import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { formatINR, getMedicineExpiryDetails } from '../utils/gstUtils';
import {
  BarChart3,
  Download,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  Receipt,
  FileCheck,
  Pill,
  AlertTriangle,
  Layers,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export const AccountingReportsView: React.FC = () => {
  const {
    language,
    currentShop,
    products,
    invoices,
    purchases,
    expenses,
    todaySales,
    monthSales,
    grossProfit,
    netProfit,
  } = useShop();
  const { t } = useTranslation(language);

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'gstr1' | 'gstr3b' | 'valuation' | 'expired'>('pnl');

  // Total sales revenue from invoices
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalTaxableSales = invoices.reduce((sum, inv) => sum + inv.subtotalTaxable, 0);
  const totalCgstCollected = invoices.reduce((sum, inv) => sum + inv.totalCgst, 0);
  const totalSgstCollected = invoices.reduce((sum, inv) => sum + inv.totalSgst, 0);
  const totalIgstCollected = invoices.reduce((sum, inv) => sum + inv.totalIgst, 0);
  const totalTaxCollected = totalCgstCollected + totalSgstCollected + totalIgstCollected;

  // Total purchase costs and ITC
  const regularPurchases = purchases.filter((p) => !p.isPurchaseReturn);
  const totalPurchasesCost = regularPurchases.reduce((sum, p) => sum + p.taxableAmount, 0);
  const totalItcAvailable = regularPurchases
    .filter((p) => p.isItcEligible)
    .reduce((sum, p) => sum + p.totalGst, 0);
  const totalCgstItc = regularPurchases
    .filter((p) => p.isItcEligible)
    .reduce((sum, p) => sum + p.cgstAmount, 0);
  const totalSgstItc = regularPurchases
    .filter((p) => p.isItcEligible)
    .reduce((sum, p) => sum + p.sgstAmount, 0);
  const totalIgstItc = regularPurchases
    .filter((p) => p.isItcEligible)
    .reduce((sum, p) => sum + p.igstAmount, 0);

  // Total shop expenses
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // P&L Net Profit
  const actualGrossProfit = Math.max(0, totalTaxableSales - totalPurchasesCost);
  const actualNetProfit = actualGrossProfit - totalOperatingExpenses;

  // Net GST Payable after ITC offset
  const netCgstPayable = Math.max(0, totalCgstCollected - totalCgstItc);
  const netSgstPayable = Math.max(0, totalSgstCollected - totalSgstItc);
  const netIgstPayable = Math.max(0, totalIgstCollected - totalIgstItc);
  const netTotalGstPayable = netCgstPayable + netSgstPayable + netIgstPayable;

  // B2B vs B2C breakdown
  const b2bInvoices = invoices.filter((inv) => !!inv.customerGstin);
  const b2cInvoices = invoices.filter((inv) => !inv.customerGstin);

  // Inventory Stock Valuation
  const totalStockUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalPurchaseValuation = products.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
  const totalMrpValuation = products.reduce((sum, p) => sum + p.currentStock * p.mrp, 0);
  const potentialRetailMargin = Math.max(0, totalMrpValuation - totalPurchaseValuation);

  // Expired & Near-Expiry medicines
  const expiredMedicines = products.filter((p) => {
    const exp = getMedicineExpiryDetails(p.expiryDate);
    return exp.status === 'EXPIRED';
  });
  const expiring30Medicines = products.filter((p) => {
    const exp = getMedicineExpiryDetails(p.expiryDate);
    return exp.status === 'EXPIRING_30';
  });
  const totalExpiredLoss = expiredMedicines.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
  const totalExpiringRisk = expiring30Medicines.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);

  // Medicine Sales Aggregation
  const medicineSalesMap: Record<string, { name: string; batch: string; units: number; revenue: number; rx: boolean }> = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const key = `${item.name}-${item.batchNumber}`;
      if (!medicineSalesMap[key]) {
        medicineSalesMap[key] = {
          name: item.name,
          batch: item.batchNumber || 'NA',
          units: 0,
          revenue: 0,
          rx: !!item.requiresPrescription,
        };
      }
      medicineSalesMap[key].units += item.quantity;
      medicineSalesMap[key].revenue += item.totalAmount;
    });
  });
  const medicineSalesList = Object.values(medicineSalesMap).sort((a, b) => b.revenue - a.revenue);

  // Export CSV handler
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeReportTab === 'pnl') {
      csvContent += 'Profit & Loss Statement - ' + currentShop.name + '\r\n';
      csvContent += 'Metric,Amount (INR)\r\n';
      csvContent += `Sales Revenue (Taxable),${totalTaxableSales.toFixed(2)}\r\n`;
      csvContent += `Cost of Goods Sold (Purchases),${totalPurchasesCost.toFixed(2)}\r\n`;
      csvContent += `Gross Profit,${actualGrossProfit.toFixed(2)}\r\n`;
      csvContent += `Operating Expenses,${totalOperatingExpenses.toFixed(2)}\r\n`;
      csvContent += `Net Profit,${actualNetProfit.toFixed(2)}\r\n`;
    } else if (activeReportTab === 'gstr1') {
      csvContent += 'GSTR-1 Outward Supplies - ' + currentShop.name + '\r\n';
      csvContent += 'Invoice Number,Date,Customer,GSTIN,Place of Supply,Taxable Value,CGST,SGST,IGST,Total\r\n';
      invoices.forEach((inv) => {
        csvContent += `"${inv.invoiceNumber}","${inv.invoiceDate}","${inv.customerName}","${inv.customerGstin || 'URP'}","${inv.placeOfSupply}",${inv.subtotalTaxable},${inv.totalCgst},${inv.totalSgst},${inv.totalIgst},${inv.grandTotal}\r\n`;
      });
    } else if (activeReportTab === 'gstr3b') {
      csvContent += 'GSTR-3B Tax Summary - ' + currentShop.name + '\r\n';
      csvContent += 'Component,CGST (INR),SGST (INR),IGST (INR),Total (INR)\r\n';
      csvContent += `Output Tax (Sales),${totalCgstCollected},${totalSgstCollected},${totalIgstCollected},${totalTaxCollected}\r\n`;
      csvContent += `Eligible ITC (Purchases),${totalCgstItc},${totalSgstItc},${totalIgstItc},${totalItcAvailable}\r\n`;
      csvContent += `Net Tax Payable to Govt,${netCgstPayable},${netSgstPayable},${netIgstPayable},${netTotalGstPayable}\r\n`;
    } else if (activeReportTab === 'valuation') {
      csvContent += 'Pharmacy Stock Valuation - ' + currentShop.name + '\r\n';
      csvContent += 'Medicine,Salt,Batch,Stock,Unit,Purchase Cost,Cost Valuation,MRP,MRP Valuation\r\n';
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.saltComposition || ''}","${p.batchNumber}",${p.currentStock},"${p.unit}",${p.purchasePrice},${(p.currentStock * p.purchasePrice).toFixed(2)},${p.mrp},${(p.currentStock * p.mrp).toFixed(2)}\r\n`;
      });
    } else {
      csvContent += 'Expired & Near-Expiry Audit - ' + currentShop.name + '\r\n';
      csvContent += 'Medicine,Batch,Expiry,Status,Stock,Unit,Purchase Cost,Loss Exposure\r\n';
      [...expiredMedicines, ...expiring30Medicines].forEach((p) => {
        const exp = getMedicineExpiryDetails(p.expiryDate);
        csvContent += `"${p.name}","${p.batchNumber}","${p.expiryDate}","${exp.status}",${p.currentStock},"${p.unit}",${p.purchasePrice},${(p.currentStock * p.purchasePrice).toFixed(2)}\r\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartGST_${activeReportTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t('reportsTitle')}
            </h1>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Form 20B/21B Financial Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pharmacy P&L audit, medicine stock valuation, expired batch loss reports, and GSTR-1/3B tax returns
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('exportCsv')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit text-xs font-medium flex-wrap">
        <button
          onClick={() => setActiveReportTab('pnl')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeReportTab === 'pnl'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tabPnl')}
        </button>
        <button
          onClick={() => setActiveReportTab('valuation')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeReportTab === 'valuation'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock Valuation
        </button>
        <button
          onClick={() => setActiveReportTab('expired')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeReportTab === 'expired'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Expired Batch Audit
        </button>
        <button
          onClick={() => setActiveReportTab('gstr1')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeReportTab === 'gstr1'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tabGstr1')}
        </button>
        <button
          onClick={() => setActiveReportTab('gstr3b')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeReportTab === 'gstr3b'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('tabGstr3b')}
        </button>
      </div>

      {/* 1. PROFIT AND LOSS STATEMENT */}
      {activeReportTab === 'pnl' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs max-w-3xl">
            <div className="border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Statement of Profit and Loss (P&L) - Medical Store
              </h2>
              <div className="text-xs text-slate-500">
                {currentShop.name} · Accounting Period: Current Fiscal Year
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {/* Sales Revenue */}
              <div className="flex justify-between py-2 border-b border-slate-100 font-sans">
                <div>
                  <div className="font-semibold text-slate-900">{t('revenue')}</div>
                  <div className="text-[11px] text-slate-500">Gross pharmacy sales across {invoices.length} invoices</div>
                </div>
                <div className="font-mono text-sm font-bold text-slate-900">
                  {formatINR(totalTaxableSales)}
                </div>
              </div>

              {/* COGS */}
              <div className="flex justify-between py-2 border-b border-slate-100 font-sans text-slate-700">
                <div>
                  <div className="font-medium">{t('cogs')}</div>
                  <div className="text-[11px] text-slate-500">Wholesale pharma distributor purchases & stock cost</div>
                </div>
                <div className="font-mono text-rose-700">
                  - {formatINR(totalPurchasesCost)}
                </div>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between py-2 bg-emerald-50/60 px-3 rounded-lg font-sans">
                <span className="font-bold text-slate-900">{t('grossProfit')}</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  {formatINR(actualGrossProfit)}
                </span>
              </div>

              {/* Operating Expenses */}
              <div className="flex justify-between py-2 border-b border-slate-100 font-sans text-slate-700">
                <div>
                  <div className="font-medium">{t('operatingExpenses')}</div>
                  <div className="text-[11px] text-slate-500">Pharmacy rent, refrigerator electricity, staff salaries</div>
                </div>
                <div className="font-mono text-rose-700">
                  - {formatINR(totalOperatingExpenses)}
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex justify-between py-3 border-t-2 border-slate-900 font-sans text-base">
                <div>
                  <div className="font-bold text-slate-900">{t('netBusinessProfit')}</div>
                  <div className="text-[11px] text-slate-500">Net take-home medical business surplus</div>
                </div>
                <div
                  className={`font-mono font-bold text-lg ${
                    actualNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {formatINR(actualNetProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Medicines in Store */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden max-w-3xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" />
                <span>Fastest Moving Medicines & Antibiotics</span>
              </span>
              <span className="text-xs text-slate-500">{medicineSalesList.length} items sold</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2 px-3">Medicine Name</th>
                    <th className="py-2 px-3">Batch #</th>
                    <th className="py-2 px-3 text-right">Units Dispensed</th>
                    <th className="py-2 px-3 text-right">Revenue (₹)</th>
                    <th className="py-2 px-3 text-center">Rx Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medicineSalesList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No sales recorded yet.
                      </td>
                    </tr>
                  ) : (
                    medicineSalesList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{m.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{m.batch}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{m.units}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{formatINR(m.revenue)}</td>
                        <td className="py-2.5 px-3 text-center">
                          {m.rx ? (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                              Schedule H
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">OTC</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PHARMACY STOCK VALUATION */}
      {activeReportTab === 'valuation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">Total Medicines in Stock</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {products.length} Items ({totalStockUnits} units)
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Across all racks</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">Purchase Cost Valuation</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatINR(totalPurchaseValuation)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Capital invested in inventory</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">MRP Retail Valuation</div>
              <div className="text-xl font-bold font-mono text-emerald-800">
                {formatINR(totalMrpValuation)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Total realizable consumer value</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">Projected Gross Margin</div>
              <div className="text-xl font-bold font-mono text-emerald-700">
                {formatINR(potentialRetailMargin)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {totalPurchaseValuation > 0
                  ? `${((potentialRetailMargin / totalPurchaseValuation) * 100).toFixed(1)}% Markup`
                  : 'N/A'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-900">
              Batch-wise Medicine Valuation Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Medicine & Salt</th>
                    <th className="py-2.5 px-3">Batch #</th>
                    <th className="py-2.5 px-3 text-center">Expiry</th>
                    <th className="py-2.5 px-3 text-right">Available Stock</th>
                    <th className="py-2.5 px-3 text-right">Purchase Cost</th>
                    <th className="py-2.5 px-3 text-right">Cost Value (₹)</th>
                    <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                    <th className="py-2.5 px-3 text-right">MRP Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const costVal = p.currentStock * p.purchasePrice;
                    const mrpVal = p.currentStock * p.mrp;
                    const exp = getMedicineExpiryDetails(p.expiryDate);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-500">{p.saltComposition}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{p.batchNumber}</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${exp.badgeClass}`}>
                            {exp.formattedDate}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {p.currentStock} {p.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹{p.purchasePrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">{formatINR(costVal)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹{p.mrp.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{formatINR(mrpVal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPIRED BATCH LOSS AUDIT */}
      {activeReportTab === 'expired' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-rose-800 font-semibold mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Expired Stock Locked (Sale Prohibited)</span>
              </div>
              <div className="text-xl font-bold font-mono text-rose-900">
                {formatINR(totalExpiredLoss)}
              </div>
              <div className="text-[11px] text-rose-700 mt-1">
                {expiredMedicines.length} batches strictly blocked under Drugs & Cosmetics Act
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-amber-800 font-semibold mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Near-Expiry Risk (Next 30 Days)</span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-900">
                {formatINR(totalExpiringRisk)}
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                {expiring30Medicines.length} batches requiring urgent return or discount sale
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-emerald-800 font-semibold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Distributor Credit Note Protection</span>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-900">
                100% Returnable
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                Eligible for distributor return under trade agreements
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-900">
              Expired & Near-Expiry Batch Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Medicine Name</th>
                    <th className="py-2.5 px-3">Manufacturer</th>
                    <th className="py-2.5 px-3 font-mono">Batch #</th>
                    <th className="py-2.5 px-3 text-center">Expiry</th>
                    <th className="py-2.5 px-3 text-right">Stock Qty</th>
                    <th className="py-2.5 px-3 text-right">Cost Loss (₹)</th>
                    <th className="py-2.5 px-3 text-center">Legal Action Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expiredMedicines.length === 0 && expiring30Medicines.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Excellent! No expired or critical near-expiry medicines currently in stock.
                      </td>
                    </tr>
                  ) : (
                    [...expiredMedicines, ...expiring30Medicines].map((p) => {
                      const exp = getMedicineExpiryDetails(p.expiryDate);
                      const loss = p.currentStock * p.purchasePrice;
                      const isExpired = exp.status === 'EXPIRED';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{p.manufacturer}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{p.batchNumber}</td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${exp.badgeClass}`}>
                              {exp.label} ({exp.formattedDate})
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {p.currentStock} {p.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                            {formatINR(loss)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {isExpired ? (
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                Return to Distributor
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                Expedite Sale / Return
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. GSTR-1 REPORT */}
      {activeReportTab === 'gstr1' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">4A. B2B Registered Sales (Clinics)</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatINR(b2bInvoices.reduce((sum, i) => sum + i.grandTotal, 0))}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{b2bInvoices.length} Registered Healthcare Buyers</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">7. B2C Patient Cash Memos</div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {formatINR(b2cInvoices.reduce((sum, i) => sum + i.grandTotal, 0))}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{b2cInvoices.length} Retail Patient Invoices</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs text-slate-500 mb-1">Total Output GST Liability</div>
              <div className="text-xl font-bold font-mono text-emerald-800">
                {formatINR(totalTaxCollected)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">CGST + SGST + IGST Combined</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-xs uppercase tracking-wider text-slate-900">
              GSTR-1 Outward Invoices Registry
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Bill #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Patient / Buyer</th>
                    <th className="py-2.5 px-3">GSTIN</th>
                    <th className="py-2.5 px-3">Place of Supply</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">CGST</th>
                    <th className="py-2.5 px-3 text-right">SGST</th>
                    <th className="py-2.5 px-3 text-right">IGST</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{inv.invoiceDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.patientName || inv.customerName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{inv.customerGstin || 'URP'}</td>
                      <td className="py-2.5 px-3 text-slate-600">{inv.placeOfSupply}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatINR(inv.subtotalTaxable)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatINR(inv.totalCgst)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatINR(inv.totalSgst)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{formatINR(inv.totalIgst)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatINR(inv.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. GSTR-3B TAX RETURN RECONCILIATION */}
      {activeReportTab === 'gstr3b' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              GSTR-3B Monthly Tax Liability & Input Tax Credit (ITC)
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Net Tax Payable = Output GST collected on medicine sales minus Eligible ITC paid on distributor purchases
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">CGST (₹)</th>
                    <th className="py-2.5 px-3 text-right">SGST (₹)</th>
                    <th className="py-2.5 px-3 text-right">IGST (₹)</th>
                    <th className="py-2.5 px-3 text-right">Total GST (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50 font-sans">
                    <td className="py-3 px-3 font-medium text-slate-900">
                      3.1 Outward Taxable Supplies (Tax Collected from Medicine Sales)
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(totalCgstCollected)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(totalSgstCollected)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(totalIgstCollected)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatINR(totalTaxCollected)}</td>
                  </tr>

                  <tr className="hover:bg-slate-50 font-sans text-emerald-800 bg-emerald-50/40">
                    <td className="py-3 px-3 font-medium">
                      4. Eligible ITC Available (Tax Paid on Wholesale Purchases)
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(totalCgstItc)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(totalSgstItc)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(totalIgstItc)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">{formatINR(totalItcAvailable)}</td>
                  </tr>

                  <tr className="bg-slate-900 text-white font-sans text-sm font-bold">
                    <td className="py-3 px-3">
                      Net Tax Payable to Government (After ITC Offset)
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(netCgstPayable)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(netSgstPayable)}</td>
                    <td className="py-3 px-3 text-right font-mono">{formatINR(netIgstPayable)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400">{formatINR(netTotalGstPayable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> GSTR-3B must be filed by the 20th of the following month on the GST Portal (gst.gov.in). Use this summary to verify figures before Challan generation.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
