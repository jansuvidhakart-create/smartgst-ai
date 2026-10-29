import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { Product, GstRate, UnitType, DrugSchedule } from '../types';
import { COMMON_HSN_CODES, formatINR, getMedicineExpiryDetails, ExpiryStatusType } from '../utils/gstUtils';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  Pill,
  ShieldAlert,
  Calendar,
  Layers,
  Clock,
  TrendingDown,
  X,
  Stethoscope
} from 'lucide-react';

type ExpiryFilterTab = 'ALL' | 'EXP_30' | 'EXP_60' | 'EXP_90' | 'EXPIRED' | 'LOW_STOCK';

export const InventoryView: React.FC = () => {
  const { language, products, addProduct, updateProduct, deleteProduct, adjustStock, currentShop } = useShop();
  const { t } = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expiryTab, setExpiryTab] = useState<ExpiryFilterTab>('ALL');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [saltComposition, setSaltComposition] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [packSize, setPackSize] = useState('10 Tablets / Strip');
  const [drugSchedule, setDrugSchedule] = useState<DrugSchedule>('Schedule H');
  const [requiresPrescription, setRequiresPrescription] = useState(true);
  const [rackNumber, setRackNumber] = useState('Rack A-01');
  const [sku, setSku] = useState('');
  const [hsn, setHsn] = useState('3004');
  const [category, setCategory] = useState('Antibiotics');
  const [unit, setUnit] = useState<UnitType>('strip');
  const [purchasePrice, setPurchasePrice] = useState<number>(100);
  const [sellingPrice, setSellingPrice] = useState<number>(130);
  const [mrp, setMrp] = useState<number>(145);
  const [gstRate, setGstRate] = useState<GstRate>(12);
  const [currentStock, setCurrentStock] = useState<number>(20);
  const [minStockAlert, setMinStockAlert] = useState<number>(10);

  // Quick categories
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  // Expiry & stock analysis
  const analyzedProducts = products.map((p) => ({
    ...p,
    expiryInfo: getMedicineExpiryDetails(p.expiryDate),
  }));

  const expiredCount = analyzedProducts.filter((p) => p.expiryInfo.status === 'EXPIRED').length;
  const exp30Count = analyzedProducts.filter((p) => p.expiryInfo.status === 'EXPIRING_30').length;
  const exp60Count = analyzedProducts.filter((p) => p.expiryInfo.status === 'EXPIRING_60').length;
  const exp90Count = analyzedProducts.filter((p) => p.expiryInfo.status === 'EXPIRING_90').length;
  const lowStockCount = analyzedProducts.filter((p) => p.currentStock <= p.minStockAlert).length;

  const totalStockUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalPurchaseValuation = products.reduce((sum, p) => sum + p.purchasePrice * p.currentStock, 0);
  const totalMrpValuation = products.reduce((sum, p) => sum + p.mrp * p.currentStock, 0);

  // Filtering
  const filteredProducts = analyzedProducts.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.saltComposition && p.saltComposition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.hsn.includes(searchQuery);

    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    let matchesExpiry = true;
    if (expiryTab === 'EXPIRED') matchesExpiry = p.expiryInfo.status === 'EXPIRED';
    else if (expiryTab === 'EXP_30') matchesExpiry = p.expiryInfo.status === 'EXPIRING_30';
    else if (expiryTab === 'EXP_60') matchesExpiry = p.expiryInfo.status === 'EXPIRING_60';
    else if (expiryTab === 'EXP_90') matchesExpiry = p.expiryInfo.status === 'EXPIRING_90';
    else if (expiryTab === 'LOW_STOCK') matchesExpiry = p.currentStock <= p.minStockAlert;

    return matchesSearch && matchesCategory && matchesExpiry;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSaltComposition('');
    setManufacturer('');
    setBatchNumber(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
    setExpiryDate('2027-10');
    setPackSize('10 Tablets / Strip');
    setDrugSchedule('Schedule H');
    setRequiresPrescription(true);
    setRackNumber('Rack A-01');
    setSku(`MED-${Date.now().toString().slice(-4)}`);
    setHsn('3004');
    setCategory('Antibiotics');
    setUnit('strip');
    setPurchasePrice(120);
    setSellingPrice(150);
    setMrp(168);
    setGstRate(12);
    setCurrentStock(30);
    setMinStockAlert(10);
    setShowAddModal(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSaltComposition(prod.saltComposition || '');
    setManufacturer(prod.manufacturer || '');
    setBatchNumber(prod.batchNumber || '');
    setExpiryDate(prod.expiryDate || '');
    setPackSize(prod.packSize || '10 Tablets / Strip');
    setDrugSchedule(prod.drugSchedule || 'OTC');
    setRequiresPrescription(prod.requiresPrescription || false);
    setRackNumber(prod.rackNumber || 'Rack A-01');
    setSku(prod.sku);
    setHsn(prod.hsn);
    setCategory(prod.category);
    setUnit(prod.unit);
    setPurchasePrice(prod.purchasePrice);
    setSellingPrice(prod.sellingPrice);
    setMrp(prod.mrp);
    setGstRate(prod.gstRate);
    setCurrentStock(prod.currentStock);
    setMinStockAlert(prod.minStockAlert);
    setShowAddModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: name.trim(),
        saltComposition: saltComposition.trim(),
        manufacturer: manufacturer.trim(),
        batchNumber: batchNumber.trim().toUpperCase(),
        expiryDate,
        packSize: packSize.trim(),
        drugSchedule,
        requiresPrescription,
        rackNumber: rackNumber.trim(),
        sku: sku.trim() || editingProduct.sku,
        hsn: hsn.trim(),
        category,
        unit,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        mrp: Number(mrp) || Number(sellingPrice),
        gstRate,
        currentStock: Number(currentStock),
        minStockAlert: Number(minStockAlert),
      });
    } else {
      addProduct({
        name: name.trim(),
        saltComposition: saltComposition.trim(),
        manufacturer: manufacturer.trim(),
        batchNumber: batchNumber.trim().toUpperCase() || 'BAT-101',
        expiryDate: expiryDate || '2027-12',
        packSize: packSize.trim(),
        drugSchedule,
        requiresPrescription,
        rackNumber: rackNumber.trim(),
        sku: sku.trim() || `MED-${Date.now().toString().slice(-4)}`,
        hsn: hsn.trim() || '3004',
        category,
        unit,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        mrp: Number(mrp) || Number(sellingPrice),
        gstRate,
        currentStock: Number(currentStock),
        minStockAlert: Number(minStockAlert),
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Medicine Inventory & Expiry Management
            </h1>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Batch-wise Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentShop.name} · DL No: <strong>{currentShop.dlNumber20B}</strong> · Reg Pharmacist: <strong>{currentShop.registeredPharmacist}</strong>
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add New Medicine</span>
        </button>
      </div>

      {/* Stock Valuation & Expiry Alert Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block font-medium">Total Medicines</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{products.length} Items</span>
          <span className="text-[10px] text-slate-400 font-mono">{totalStockUnits} Total Units</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block font-medium">Stock Valuation (Cost)</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block font-mono">{formatINR(totalPurchaseValuation)}</span>
          <span className="text-[10px] text-slate-400 font-mono">MRP: {formatINR(totalMrpValuation)}</span>
        </div>

        {/* Expired Medicines (Danger) */}
        <div 
          onClick={() => setExpiryTab(expiryTab === 'EXPIRED' ? 'ALL' : 'EXPIRED')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            expiredCount > 0 
              ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20' 
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold">Expired Stock</span>
            {expiredCount > 0 && <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
          </div>
          <span className={`text-lg font-black mt-0.5 block ${expiredCount > 0 ? 'text-rose-700' : 'text-slate-800'}`}>
            {expiredCount} {expiredCount === 1 ? 'Batch' : 'Batches'}
          </span>
          <span className="text-[10px] text-rose-600 font-semibold block">Sale Prohibited</span>
        </div>

        {/* Expiring in 30 Days */}
        <div 
          onClick={() => setExpiryTab(expiryTab === 'EXP_30' ? 'ALL' : 'EXP_30')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            exp30Count > 0 
              ? 'bg-amber-50 border-amber-300 text-amber-900' 
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <span className="text-[11px] font-bold block">Expiring &le; 30 Days</span>
          <span className={`text-lg font-black mt-0.5 block ${exp30Count > 0 ? 'text-amber-800' : 'text-slate-800'}`}>
            {exp30Count} Items
          </span>
          <span className="text-[10px] text-amber-700 block">Critical Refill / Return</span>
        </div>

        {/* Expiring in 60-90 Days */}
        <div 
          onClick={() => setExpiryTab(expiryTab === 'EXP_90' ? 'ALL' : 'EXP_90')}
          className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <span className="text-[11px] text-slate-500 block font-medium">Expiring &le; 90 Days</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{exp60Count + exp90Count} Items</span>
          <span className="text-[10px] text-slate-400 block">Monitor Sales Flow</span>
        </div>

        {/* Low Stock */}
        <div 
          onClick={() => setExpiryTab(expiryTab === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            lowStockCount > 0 
              ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          <span className="text-[11px] font-bold block">Low Stock Alert</span>
          <span className="text-lg font-black text-amber-800 mt-0.5 block">{lowStockCount} Items</span>
          <span className="text-[10px] text-amber-600 block">&le; Reorder Level</span>
        </div>
      </div>

      {/* Filter Tabs: All / Expired / 30 Days / 60 Days / 90 Days / Low Stock */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Medicine, Salt, Batch or Company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
          />
        </div>

        {/* Expiry Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setExpiryTab('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expiryTab === 'ALL' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Medicines ({products.length})
          </button>
          <button
            onClick={() => setExpiryTab('EXP_30')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expiryTab === 'EXP_30' ? 'bg-amber-500 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expiring &le; 30d ({exp30Count})
          </button>
          <button
            onClick={() => setExpiryTab('EXP_60')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expiryTab === 'EXP_60' ? 'bg-amber-100 text-amber-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            60d ({exp60Count})
          </button>
          <button
            onClick={() => setExpiryTab('EXP_90')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expiryTab === 'EXP_90' ? 'bg-blue-100 text-blue-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            90d ({exp90Count})
          </button>
          <button
            onClick={() => setExpiryTab('EXPIRED')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expiryTab === 'EXPIRED' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-rose-600 hover:text-rose-900'
            }`}
          >
            Expired ({expiredCount})
          </button>
          <button
            onClick={() => setExpiryTab('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              expiryTab === 'LOW_STOCK' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Medicine & Salt Composition</th>
                <th className="py-2.5 px-3">Manufacturer</th>
                <th className="py-2.5 px-3 font-mono">Batch #</th>
                <th className="py-2.5 px-3 text-center">Expiry Status</th>
                <th className="py-2.5 px-3 text-center">Pack / Rack</th>
                <th className="py-2.5 px-3 text-center">Stock</th>
                <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                <th className="py-2.5 px-3 text-right">Selling (₹)</th>
                <th className="py-2.5 px-3 text-right">MRP (₹)</th>
                <th className="py-2.5 px-3 text-center">GST %</th>
                <th className="py-2.5 px-3 text-center">Schedule</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No medicines found matching the active filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isExpired = p.expiryInfo.status === 'EXPIRED';
                  const isLow = p.currentStock <= p.minStockAlert;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isExpired ? 'bg-rose-50/40' : isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.requiresPrescription && (
                            <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.2 rounded font-bold">
                              Rx
                            </span>
                          )}
                        </div>
                        {p.saltComposition && (
                          <div className="text-[10px] text-slate-500 italic max-w-xs truncate">
                            {p.saltComposition}
                          </div>
                        )}
                        <span className="text-[9px] text-slate-400 font-mono">HSN: {p.hsn} · SKU: {p.sku}</span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {p.manufacturer || 'General'}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {p.batchNumber}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.expiryInfo.badgeClass}`}>
                          {p.expiryInfo.label}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="font-medium text-slate-700">{p.packSize || p.unit}</div>
                        <div className="text-[10px] text-slate-400">{p.rackNumber || 'General'}</div>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-slate-600"
                            title="Decrement 1"
                          >
                            -
                          </button>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            p.currentStock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'text-slate-900'
                          }`}>
                            {p.currentStock}
                          </span>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-slate-600"
                            title="Increment 1"
                          >
                            +
                          </button>
                        </div>
                        {isLow && (
                          <span className="text-[9px] text-amber-700 font-semibold block mt-0.5">
                            Min: {p.minStockAlert}
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        ₹{p.purchasePrice.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        ₹{p.mrp.toFixed(2)}
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                        {p.gstRate}%
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          p.drugSchedule === 'Schedule H' || p.drugSchedule === 'Schedule H1'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : p.drugSchedule === 'Ayurvedic'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.drugSchedule || 'OTC'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="Edit Medicine"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete medicine ${p.name} (${p.batchNumber})?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete Medicine"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingProduct ? 'Edit Medicine Details' : 'Add New Medicine to Stock'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Batch number, expiry tracking & GST rate
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Medicine Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Augmentin 625 Duo Tablet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Salt / Chemical Composition *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amoxycillin (500mg) + Clavulanic Acid (125mg)"
                    value={saltComposition}
                    onChange={(e) => setSaltComposition(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Manufacturer / Pharma Co. *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GlaxoSmithKline / Micro Labs"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Therapeutic Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics & Antipyretics">Analgesics & Antipyretics (Pain/Fever)</option>
                    <option value="Gastrointestinal & Antacids">Gastrointestinal & Antacids</option>
                    <option value="Cardiac & Hypertension">Cardiac & Blood Pressure</option>
                    <option value="Anti-Diabetic">Anti-Diabetic</option>
                    <option value="Respiratory & Anti-Asthmatic">Respiratory & Anti-Asthmatic</option>
                    <option value="Vitamins & Nutritional">Vitamins & Nutritional</option>
                    <option value="Calcium & Vitamin D">Calcium & Vitamin D</option>
                    <option value="Antiseptics & Wound Care">Antiseptics & Wound Care</option>
                    <option value="Diagnostic Devices & Strips">Diagnostic Devices & Strips</option>
                    <option value="Ayurvedic & Herbal">Ayurvedic & Herbal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AG-9021"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                    className="w-full font-mono font-bold uppercase bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Expiry Date * (YYYY-MM)
                  </label>
                  <input
                    type="month"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Pack Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10 Tablets / Strip"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Rack / Storage Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rack A-02 / Cold Storage 2-8°C"
                    value={rackNumber}
                    onChange={(e) => setRackNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Drug Schedule
                  </label>
                  <select
                    value={drugSchedule}
                    onChange={(e) => {
                      const val = e.target.value as DrugSchedule;
                      setDrugSchedule(val);
                      if (val === 'Schedule H' || val === 'Schedule H1') {
                        setRequiresPrescription(true);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="Schedule H">Schedule H (Prescription Rx)</option>
                    <option value="Schedule H1">Schedule H1 (Controlled Rx)</option>
                    <option value="OTC">OTC (Over the Counter)</option>
                    <option value="Ayurvedic">Ayurvedic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    GST Rate %
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(parseInt(e.target.value) as GstRate)}
                    className="w-full font-bold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value={0}>0% (Life saving drugs)</option>
                    <option value={5}>5% (Specified bulk drugs & vaccines)</option>
                    <option value={12}>12% (Standard medicaments HSN 3004)</option>
                    <option value={18}>18% (Supplements & diagnostics)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Purchase Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    MRP (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Opening Stock (Units) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Min Stock Reorder Alert
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Add Medicine to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
