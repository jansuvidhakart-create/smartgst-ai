import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { Supplier, PurchaseRecord, GstRate, PaymentMode } from '../types';
import { formatINR, calculateItemGst } from '../utils/gstUtils';
import {
  Truck,
  Plus,
  Search,
  FileCheck2,
  DollarSign,
  X,
  Building,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Pill,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

export const SupplierPurchaseView: React.FC = () => {
  const {
    language,
    currentShop,
    suppliers,
    purchases,
    addSupplier,
    addPurchaseRecord,
    recordSupplierPayment,
    totalPayable,
  } = useShop();
  const { t } = useTranslation(language);

  const [activeSubTab, setActiveSubTab] = useState<'purchases' | 'returns' | 'suppliers'>('purchases');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showAddReturnModal, setShowAddReturnModal] = useState(false);

  // Add Supplier Form
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supGstin, setSupGstin] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supState, setSupState] = useState(currentShop.state);
  const [supPayable, setSupPayable] = useState(0);

  // Add Purchase Bill Form
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemsDesc, setItemsDesc] = useState('');
  const [purchaseBatch, setPurchaseBatch] = useState('');
  const [purchaseExpiry, setPurchaseExpiry] = useState('');
  const [taxableAmount, setTaxableAmount] = useState<number>(0);
  const [gstRate, setGstRate] = useState<GstRate>(12);
  const [isItcEligible, setIsItcEligible] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Paid');
  const [purchaseMode, setPurchaseMode] = useState<PaymentMode>('Bank Transfer');

  // Add Purchase Return Form
  const [returnSupplierId, setReturnSupplierId] = useState('');
  const [returnNumber, setReturnNumber] = useState(`PR-${Date.now().toString().slice(-4)}`);
  const [returnMedicine, setReturnMedicine] = useState('');
  const [returnBatch, setReturnBatch] = useState('');
  const [returnExpiry, setReturnExpiry] = useState('');
  const [returnReason, setReturnReason] = useState('Expired batch returned for distributor credit note');
  const [returnAmount, setReturnAmount] = useState<number>(0);

  // Separate normal purchases from purchase returns
  const regularPurchases = purchases.filter((p) => !p.isPurchaseReturn);
  const returnPurchases = purchases.filter((p) => p.isPurchaseReturn);

  const totalRegularPurchases = regularPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalReturnCredits = returnPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalItcAvailable = regularPurchases
    .filter((p) => p.isItcEligible)
    .reduce((sum, p) => sum + p.totalGst, 0);

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    addSupplier({
      name: supName.trim(),
      contactPerson: supContact.trim() || 'Distribution Officer',
      phone: supPhone.trim() || '+91 98000 00000',
      gstin: supGstin.trim().toUpperCase() || 'UNREGISTERED',
      address: supAddress.trim() || 'Pharma Wholesale Market',
      state: supState,
      stateCode: currentShop.stateCode,
      payableBalance: Number(supPayable) || 0,
    });

    setShowAddSupplierModal(false);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupGstin('');
    setSupAddress('');
    setSupPayable(0);
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNumber.trim() || taxableAmount <= 0) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const supplierName = supplier ? supplier.name : 'Direct Wholesale Distributor';
    const supplierGstin = supplier ? supplier.gstin : 'URP';

    const isInterState = supplier ? supplier.stateCode !== currentShop.stateCode : false;
    const gstCalc = calculateItemGst(1, taxableAmount, 0, gstRate, isInterState);

    addPurchaseRecord({
      billNumber: billNumber.trim(),
      supplierId: selectedSupplierId || 'direct',
      supplierName,
      supplierGstin,
      billDate,
      itemsDescription: itemsDesc.trim() || 'Medicine batch wholesale purchase',
      batchNumber: purchaseBatch.trim().toUpperCase() || undefined,
      expiryDate: purchaseExpiry || undefined,
      isPurchaseReturn: false,
      taxableAmount: Number(taxableAmount),
      gstRate,
      cgstAmount: gstCalc.cgstAmount,
      sgstAmount: gstCalc.sgstAmount,
      igstAmount: gstCalc.igstAmount,
      totalGst: gstCalc.cgstAmount + gstCalc.sgstAmount + gstCalc.igstAmount,
      totalAmount: gstCalc.totalAmount,
      isItcEligible,
      paymentStatus: purchaseStatus,
      paymentMode: purchaseMode,
    });

    setShowAddPurchaseModal(false);
    setBillNumber('');
    setTaxableAmount(0);
    setItemsDesc('');
    setPurchaseBatch('');
    setPurchaseExpiry('');
  };

  const handleCreatePurchaseReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnNumber.trim() || returnAmount <= 0) return;

    const supplier = suppliers.find((s) => s.id === returnSupplierId);
    const supplierName = supplier ? supplier.name : 'Pharma Distributor';
    const supplierGstin = supplier ? supplier.gstin : 'URP';

    addPurchaseRecord({
      billNumber: returnNumber.trim(),
      supplierId: returnSupplierId || 'direct',
      supplierName,
      supplierGstin,
      billDate: new Date().toISOString().split('T')[0],
      itemsDescription: `RETURN: ${returnMedicine.trim()} (Batch: ${returnBatch.trim().toUpperCase() || 'NA'}) - ${returnReason}`,
      batchNumber: returnBatch.trim().toUpperCase() || undefined,
      expiryDate: returnExpiry || undefined,
      isPurchaseReturn: true,
      returnReason,
      taxableAmount: Number(returnAmount),
      gstRate: 12,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalGst: 0,
      totalAmount: Number(returnAmount),
      isItcEligible: false,
      paymentStatus: 'Paid',
      paymentMode: 'Credit',
    });

    // Reduce supplier payable balance if applicable
    if (supplier) {
      recordSupplierPayment(supplier.id, Number(returnAmount), 'Credit', `Debit Note #${returnNumber} (Batch Return)`);
    }

    setShowAddReturnModal(false);
    setReturnNumber(`PR-${Date.now().toString().slice(-4)}`);
    setReturnMedicine('');
    setReturnBatch('');
    setReturnExpiry('');
    setReturnAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Purchases & Pharma Distributors
            </h1>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Form 20B/21B Wholesale Log
            </span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              Demo Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supplier payables: <strong className="font-mono text-amber-800">{formatINR(totalPayable)}</strong> · Claimable GST ITC: <strong className="font-mono text-emerald-800">{formatINR(totalItcAvailable)}</strong> · Purchase Returns: <strong className="font-mono text-slate-900">{formatINR(totalReturnCredits)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Record Return / Debit Note Button */}
          <button
            onClick={() => setShowAddReturnModal(true)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Return expired or damaged medicine batch to wholesale distributor for credit note"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>+ Return Expired Batch</span>
          </button>

          {/* Record Purchase Bill Button */}
          <button
            onClick={() => setShowAddPurchaseModal(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Purchase Bill</span>
          </button>

          {/* Add Distributor Button */}
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Distributor</span>
          </button>
        </div>
      </div>

      {/* Segmented Subtabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('purchases')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'purchases'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Purchase Bills ({regularPurchases.length})
        </button>
        <button
          onClick={() => setActiveSubTab('returns')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'returns'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Purchase Returns & Debit Notes ({returnPurchases.length})
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'suppliers'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pharma Distributors ({suppliers.length})
        </button>
      </div>

      {/* 1. Purchase Bills Table */}
      {activeSubTab === 'purchases' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Bill #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Pharma Distributor</th>
                  <th className="py-2.5 px-3">Medicines & Batch Details</th>
                  <th className="py-2.5 px-3 text-right">Taxable (₹)</th>
                  <th className="py-2.5 px-3 text-right">GST Input (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Bill (₹)</th>
                  <th className="py-2.5 px-3 text-center">ITC Eligible</th>
                  <th className="py-2.5 px-3 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regularPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No purchase bills recorded yet. Click "Record Purchase Bill" to log incoming stock.
                    </td>
                  </tr>
                ) : (
                  regularPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                        {p.billNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">{p.billDate}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {p.supplierName}
                        <div className="text-[10px] text-slate-400 font-mono">GSTIN: {p.supplierGstin}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <div className="font-medium text-slate-900">{p.itemsDescription}</div>
                        {(p.batchNumber || p.expiryDate) && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            {p.batchNumber ? `Batch: ${p.batchNumber}` : ''} {p.expiryDate ? `· Exp: ${p.expiryDate}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatINR(p.taxableAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-semibold">
                        {formatINR(p.totalGst)} <span className="text-[10px] text-slate-400">({p.gstRate}%)</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatINR(p.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.isItcEligible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Claimable</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Ineligible</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Purchase Returns / Debit Notes Table */}
      {activeSubTab === 'returns' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Expired & Breakage Stock Claims:</strong> In the Indian pharmaceutical trade, expired batches and transit breakages are returned to wholesale distributors under credit notes for 100% refund or replacement stock credit.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Debit Note #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Pharma Distributor</th>
                    <th className="py-2.5 px-3">Returned Medicine & Batch</th>
                    <th className="py-2.5 px-3">Return Reason</th>
                    <th className="py-2.5 px-3 text-right">Credit Amount (₹)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No purchase returns recorded. Use "+ Return Expired Batch" to return expired medicines for distributor credit.
                      </td>
                    </tr>
                  ) : (
                    returnPurchases.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-900">
                          {r.billNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{r.billDate}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {r.supplierName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <div className="font-semibold text-slate-900">{r.itemsDescription}</div>
                          {r.batchNumber && (
                            <span className="text-[10px] font-mono text-slate-500">Batch: {r.batchNumber}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {r.returnReason || 'Expired Batch Return'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                          {formatINR(r.totalAmount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Credit Adjusted
                          </span>
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

      {/* 3. Pharma Distributors Table */}
      {activeSubTab === 'suppliers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Distributor Name</th>
                  <th className="py-2.5 px-3">Contact Person & Phone</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">Total Purchases (₹)</th>
                  <th className="py-2.5 px-3 text-right">Payable Balance (₹)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No suppliers registered yet.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {s.name}
                        <div className="text-[10px] text-slate-400">Form 20B/21B Wholesale Agent</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800">{s.contactPerson}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{s.phone}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{s.gstin}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.state} ({s.stateCode})</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {formatINR(s.totalPurchased, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                        {formatINR(s.payableBalance)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            const amtStr = prompt(`Enter payment amount to ${s.name}:`, s.payableBalance.toString());
                            if (amtStr) {
                              const amt = parseFloat(amtStr);
                              if (!isNaN(amt) && amt > 0) {
                                recordSupplierPayment(s.id, amt, 'Bank Transfer');
                              }
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          Pay Distributor
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Purchase Modal */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Record Wholesale Purchase Bill</span>
              <button
                onClick={() => setShowAddPurchaseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Select Pharma Distributor</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="">-- Choose Pharma Wholesale Distributor --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (GSTIN: {s.gstin})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Distributor Invoice / Bill # *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPW-9042"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bill Date</label>
                  <input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Medicines & Items Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50 boxes Augmentin 625 Duo, 100 strips Pan-D"
                    value={itemsDesc}
                    onChange={(e) => setItemsDesc(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BAT-2026-X"
                    value={purchaseBatch}
                    onChange={(e) => setPurchaseBatch(e.target.value.toUpperCase())}
                    className="w-full font-mono uppercase border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Batch Expiry (YYYY-MM)
                  </label>
                  <input
                    type="month"
                    value={purchaseExpiry}
                    onChange={(e) => setPurchaseExpiry(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Taxable Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">GST Rate Slab</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(parseInt(e.target.value) as GstRate)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12% (Standard Pharma)</option>
                    <option value={18}>18% (Diagnostics & Nutraceuticals)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                    <input
                      type="checkbox"
                      checked={isItcEligible}
                      onChange={(e) => setIsItcEligible(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-700 w-4 h-4"
                    />
                    <span>Eligible for Input Tax Credit (ITC claimable in GSTR-3B)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Status</label>
                  <select
                    value={purchaseStatus}
                    onChange={(e) => setPurchaseStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Unpaid">Unpaid (Add to Distributor Payable)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Mode</label>
                  <select
                    value={purchaseMode}
                    onChange={(e) => setPurchaseMode(e.target.value as PaymentMode)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Record Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Purchase Return (Debit Note) Modal */}
      {showAddReturnModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Return Expired / Damaged Batch (Debit Note)</span>
              <button
                onClick={() => setShowAddReturnModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchaseReturn} className="p-4 sm:p-6 space-y-4 text-xs">
              <p className="text-slate-500">
                Log credit notes for expired medicine batches returned to distributors. This automatically reduces your supplier ledger payable.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Select Wholesale Distributor *</label>
                  <select
                    required
                    value={returnSupplierId}
                    onChange={(e) => setReturnSupplierId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="">-- Choose Wholesale Distributor --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Payable: ₹{s.payableBalance})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Debit Note / Return Ref # *
                  </label>
                  <input
                    type="text"
                    required
                    value={returnNumber}
                    onChange={(e) => setReturnNumber(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cipcal 500 / Voveran 50"
                    value={returnMedicine}
                    onChange={(e) => setReturnMedicine(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CP-8812"
                    value={returnBatch}
                    onChange={(e) => setReturnBatch(e.target.value.toUpperCase())}
                    className="w-full font-mono uppercase border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expiry Date</label>
                  <input
                    type="month"
                    value={returnExpiry}
                    onChange={(e) => setReturnExpiry(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="Expired batch returned for distributor credit note">Expired batch returned for distributor credit note</option>
                    <option value="Near-expiry batch returned before 60-day window">Near-expiry batch returned before 60-day window</option>
                    <option value="Damaged / broken packaging received in shipment">Damaged / broken packaging received in shipment</option>
                    <option value="Manufacturer batch recall notice">Manufacturer batch recall notice</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Credit / Claim Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="Enter credit note amount"
                    value={returnAmount}
                    onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddReturnModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Record Return & Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">Add Pharma Wholesale Distributor</span>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Distributor / Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    placeholder="e.g. Metro Pharma Wholesale Agencies"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="+91 98111 22334"
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={supGstin}
                    onChange={(e) => setSupGstin(e.target.value.toUpperCase())}
                    placeholder="07AABCD1122E1Z1"
                    className="w-full font-mono uppercase border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Opening Payable (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={supPayable}
                    onChange={(e) => setSupPayable(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Address / Godown</label>
                  <input
                    type="text"
                    value={supAddress}
                    onChange={(e) => setSupAddress(e.target.value)}
                    placeholder="Pharma Trade Complex, Bhagirath Palace"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Distributor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
