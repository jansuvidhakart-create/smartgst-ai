import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { InvoiceItem, GstRate, PaymentMode, Invoice, Product } from '../types';
import { 
  INDIAN_STATES, 
  COMMON_HSN_CODES, 
  calculateItemGst, 
  formatINR, 
  convertNumberToIndianWords, 
  getMedicineExpiryDetails 
} from '../utils/gstUtils';
import { downloadInvoiceAsPdf } from '../utils/pdfGenerator';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  Download, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Receipt, 
  Info,
  Pill,
  Stethoscope,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';

interface InvoiceFormCardProps {
  onClose: () => void;
  onInvoiceCreated: (invoice: Invoice, shouldPrint?: boolean) => void;
}

export const InvoiceFormCard: React.FC<InvoiceFormCardProps> = ({
  onClose,
  onInvoiceCreated,
}) => {
  const { 
    language, 
    currentShop, 
    products, 
    customers, 
    createInvoice 
  } = useShop();
  const { t } = useTranslation(language);

  // Pre-seed first customer for instant chemist billing experience
  const defaultCust = customers[0];

  // Customer & Patient State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(defaultCust ? defaultCust.id : '');
  const [customerName, setCustomerName] = useState<string>(defaultCust ? defaultCust.name : 'Suresh Chandra Gupta');
  const [customerPhone, setCustomerPhone] = useState<string>(defaultCust ? defaultCust.phone : '+91 98711 22334');
  const [customerGstin, setCustomerGstin] = useState<string>(defaultCust?.gstin || '');
  const [customerAddress, setCustomerAddress] = useState<string>(defaultCust?.address || 'B-44, Karol Bagh Market, New Delhi');
  const [customerState, setCustomerState] = useState<string>(defaultCust ? defaultCust.state : currentShop.state);
  const [customerStateCode, setCustomerStateCode] = useState<string>(defaultCust ? defaultCust.stateCode : currentShop.stateCode);

  // Doctor & Prescription Details
  const [patientName, setPatientName] = useState<string>(defaultCust ? defaultCust.name : 'Suresh Chandra Gupta');
  const [patientAge, setPatientAge] = useState<number>(58);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [doctorName, setDoctorName] = useState<string>('Dr. K. K. Aggarwal, MBBS, MD');
  const [doctorRegNo, setDoctorRegNo] = useState<string>('DMC-18921');
  const [hasPrescription, setHasPrescription] = useState<boolean>(true);
  const [prescriptionNotes, setPrescriptionNotes] = useState<string>('Take medications strictly as per physician instructions.');

  // Invoice Dates & Settings
  const todayStr = new Date().toISOString().split('T')[0];
  const [invoiceDate, setInvoiceDate] = useState<string>(todayStr);
  const [dueDate, setDueDate] = useState<string>(todayStr);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [invoiceFormat, setInvoiceFormat] = useState<'A4' | 'Thermal80mm'>('A4');

  // Intra-state vs Inter-state supply check
  const isInterState = customerStateCode !== currentShop.stateCode;

  // Pre-seed with one valid non-expired medicine
  const defaultProd = products.find((p) => p.currentStock > 0 && p.expiryDate > '2027-01') || products[0];
  const initialGstCalc = defaultProd
    ? calculateItemGst(2, defaultProd.sellingPrice, 5, defaultProd.gstRate, isInterState)
    : calculateItemGst(1, 100, 0, 12, isInterState);

  const initialItems: InvoiceItem[] = defaultProd ? [
    {
      id: `item-init-${Date.now()}`,
      productId: defaultProd.id,
      name: defaultProd.name,
      saltComposition: defaultProd.saltComposition,
      manufacturer: defaultProd.manufacturer,
      batchNumber: defaultProd.batchNumber,
      expiryDate: defaultProd.expiryDate,
      packSize: defaultProd.packSize,
      hsn: defaultProd.hsn,
      quantity: 2,
      unit: defaultProd.unit,
      mrp: defaultProd.mrp,
      unitPrice: defaultProd.sellingPrice,
      discountPercent: 5,
      discountAmount: initialGstCalc.discountAmount,
      taxableAmount: initialGstCalc.taxableAmount,
      gstRate: defaultProd.gstRate,
      cgstAmount: initialGstCalc.cgstAmount,
      sgstAmount: initialGstCalc.sgstAmount,
      igstAmount: initialGstCalc.igstAmount,
      totalAmount: initialGstCalc.totalAmount,
      requiresPrescription: defaultProd.requiresPrescription,
    }
  ] : [];

  const [items, setItems] = useState<InvoiceItem[]>(initialItems);

  // Scratchpad for selecting and adding medicine
  const [activeProductId, setActiveProductId] = useState<string>('');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [saltComposition, setSaltComposition] = useState<string>('');
  const [manufacturer, setManufacturer] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [packSize, setPackSize] = useState<string>('10 Tablets / Strip');
  const [itemHsn, setItemHsn] = useState<string>('3004');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemUnit, setItemUnit] = useState<any>('strip');
  const [itemMrp, setItemMrp] = useState<number>(0);
  const [itemRate, setItemRate] = useState<number>(0);
  const [itemDiscount, setItemDiscount] = useState<number>(0);
  const [itemGstRate, setItemGstRate] = useState<GstRate>(12);
  const [requiresPrescription, setRequiresPrescription] = useState<boolean>(false);
  const [selectedProductStock, setSelectedProductStock] = useState<number | null>(null);

  // Validation & Warnings
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [isManualPaidAmount, setIsManualPaidAmount] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check expiry for scratchpad selected medicine
  const activeExpiryInfo = expiryDate ? getMedicineExpiryDetails(expiryDate) : null;

  // Handle customer pick
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (!custId) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerGstin('');
      setCustomerAddress('');
      setPatientName('');
      setCustomerState(currentShop.state);
      setCustomerStateCode(currentShop.stateCode);
      return;
    }
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone);
      setCustomerGstin(found.gstin || '');
      setCustomerAddress(found.address || '');
      setPatientName(found.name);
      setCustomerState(found.state);
      setCustomerStateCode(found.stateCode);
    }
  };

  // Handle State of Supply Change
  const handleStateChange = (stateCode: string) => {
    const found = INDIAN_STATES.find((s) => s.code === stateCode);
    if (found) {
      setCustomerState(found.name);
      setCustomerStateCode(found.code);
    }
  };

  // Handle Medicine select in scratchpad
  const handleSelectProduct = (productId: string) => {
    setActiveProductId(productId);
    setErrorMsg(null);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setItemName(prod.name);
      setSaltComposition(prod.saltComposition || '');
      setManufacturer(prod.manufacturer || '');
      setBatchNumber(prod.batchNumber || 'BAT-101');
      setExpiryDate(prod.expiryDate || '');
      setPackSize(prod.packSize || '10 Tablets / Strip');
      setItemHsn(prod.hsn || '3004');
      setItemUnit(prod.unit);
      setItemMrp(prod.mrp || prod.sellingPrice);
      setItemRate(prod.sellingPrice);
      setItemGstRate(prod.gstRate);
      setItemDiscount(0);
      setItemQty(1);
      setRequiresPrescription(prod.requiresPrescription || false);
      setSelectedProductStock(prod.currentStock);

      // Check if medicine is expired
      const exp = getMedicineExpiryDetails(prod.expiryDate);
      if (!exp.isSaleAllowed) {
        setErrorMsg(`ALERT: "${prod.name}" (Batch ${prod.batchNumber}) is EXPIRED (${exp.formattedDate}). Sale is strictly prohibited under Drugs & Cosmetics Act.`);
      }
    }
  };

  // Add Medicine to Bill
  const handleAddItem = () => {
    if (!itemName.trim()) {
      setErrorMsg('Please specify medicine name');
      return;
    }
    if (itemQty <= 0) {
      setErrorMsg('Quantity must be greater than zero');
      return;
    }
    if (itemRate <= 0) {
      setErrorMsg('Price must be greater than zero');
      return;
    }

    // 1. Expiry Check
    if (expiryDate) {
      const exp = getMedicineExpiryDetails(expiryDate);
      if (!exp.isSaleAllowed) {
        setErrorMsg(`SALE BLOCKED: Cannot add expired medicine "${itemName}" (Batch ${batchNumber}, Exp: ${exp.formattedDate}). Return batch to distributor.`);
        return;
      }
    }

    // 2. Stock Check
    if (selectedProductStock !== null && itemQty > selectedProductStock) {
      setErrorMsg(`STOCK WARNING: Requested quantity (${itemQty}) exceeds available stock (${selectedProductStock} ${itemUnit}). Please adjust quantity.`);
      return;
    }

    setErrorMsg(null);

    const gstCalc = calculateItemGst(itemQty, itemRate, itemDiscount, itemGstRate, isInterState);

    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: activeProductId || 'custom-med',
      name: itemName.trim(),
      saltComposition: saltComposition.trim() || undefined,
      manufacturer: manufacturer.trim() || undefined,
      batchNumber: batchNumber.trim() || 'BAT-AUTO',
      expiryDate: expiryDate.trim() || '2027-12',
      packSize: packSize.trim() || undefined,
      hsn: itemHsn.trim() || '3004',
      quantity: Number(itemQty),
      unit: itemUnit,
      mrp: Number(itemMrp) || Number(itemRate),
      unitPrice: Number(itemRate),
      discountPercent: Number(itemDiscount),
      discountAmount: gstCalc.discountAmount,
      taxableAmount: gstCalc.taxableAmount,
      gstRate: itemGstRate,
      cgstAmount: gstCalc.cgstAmount,
      sgstAmount: gstCalc.sgstAmount,
      igstAmount: gstCalc.igstAmount,
      totalAmount: gstCalc.totalAmount,
      requiresPrescription,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset scratchpad
    setActiveProductId('');
    setMedicineSearchTerm('');
    setItemName('');
    setSaltComposition('');
    setManufacturer('');
    setBatchNumber('');
    setExpiryDate('');
    setItemQty(1);
    setItemMrp(0);
    setItemRate(0);
    setItemDiscount(0);
    setSelectedProductStock(null);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Re-calculate all line items if customer state / inter-state flag changes
  useEffect(() => {
    if (items.length === 0) return;
    setItems((prev) =>
      prev.map((item) => {
        const gstCalc = calculateItemGst(
          item.quantity,
          item.unitPrice,
          item.discountPercent,
          item.gstRate,
          isInterState
        );
        return {
          ...item,
          cgstAmount: gstCalc.cgstAmount,
          sgstAmount: gstCalc.sgstAmount,
          igstAmount: gstCalc.igstAmount,
          totalAmount: gstCalc.totalAmount,
        };
      })
    );
  }, [customerStateCode]);

  // Aggregate Totals calculations
  const totalDiscount = Number(items.reduce((sum, i) => sum + i.discountAmount, 0).toFixed(2));
  const subtotalTaxable = Number(items.reduce((sum, i) => sum + i.taxableAmount, 0).toFixed(2));
  const totalCgst = Number(items.reduce((sum, i) => sum + i.cgstAmount, 0).toFixed(2));
  const totalSgst = Number(items.reduce((sum, i) => sum + i.sgstAmount, 0).toFixed(2));
  const totalIgst = Number(items.reduce((sum, i) => sum + i.igstAmount, 0).toFixed(2));
  const totalTax = Number((totalCgst + totalSgst + totalIgst).toFixed(2));
  const unroundedTotal = subtotalTaxable + totalTax;
  const roundedGrandTotal = Math.round(unroundedTotal);
  const roundOff = Number((roundedGrandTotal - unroundedTotal).toFixed(2));

  // Default amount paid
  useEffect(() => {
    if (!isManualPaidAmount) {
      if (paymentMode === 'Credit') {
        setAmountPaidInput('0');
      } else {
        setAmountPaidInput(roundedGrandTotal.toString());
      }
    }
  }, [roundedGrandTotal, paymentMode, isManualPaidAmount]);

  const numAmountPaid = parseFloat(amountPaidInput) || 0;
  const balanceDue = Math.max(0, Number((roundedGrandTotal - numAmountPaid).toFixed(2)));

  // Filter medicines for scratchpad selection
  const filteredCatalogProducts = products.filter((p) => {
    if (!medicineSearchTerm.trim()) return true;
    const term = medicineSearchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.saltComposition && p.saltComposition.toLowerCase().includes(term)) ||
      (p.batchNumber && p.batchNumber.toLowerCase().includes(term)) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(term))
    );
  });

  // Build and create invoice
  const buildInvoice = (): Invoice | null => {
    if (!customerName.trim()) {
      setErrorMsg('Please specify patient / customer name');
      return null;
    }

    let finalItems = [...items];

    // If no items added yet, but user filled in scratchpad, auto add it!
    if (finalItems.length === 0 && itemName.trim() && itemRate > 0 && itemQty > 0) {
      // Expiry check
      if (expiryDate) {
        const exp = getMedicineExpiryDetails(expiryDate);
        if (!exp.isSaleAllowed) {
          setErrorMsg(`Cannot save bill: Medicine "${itemName}" is expired.`);
          return null;
        }
      }

      const gstCalc = calculateItemGst(itemQty, itemRate, itemDiscount, itemGstRate, isInterState);
      const autoItem: InvoiceItem = {
        id: `item-auto-${Date.now()}`,
        productId: activeProductId || 'custom-med',
        name: itemName.trim(),
        saltComposition: saltComposition.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        batchNumber: batchNumber.trim() || 'BAT-AUTO',
        expiryDate: expiryDate.trim() || '2027-12',
        packSize: packSize.trim() || undefined,
        hsn: itemHsn.trim() || '3004',
        quantity: Number(itemQty),
        unit: itemUnit,
        mrp: Number(itemMrp) || Number(itemRate),
        unitPrice: Number(itemRate),
        discountPercent: Number(itemDiscount),
        discountAmount: gstCalc.discountAmount,
        taxableAmount: gstCalc.taxableAmount,
        gstRate: itemGstRate,
        cgstAmount: gstCalc.cgstAmount,
        sgstAmount: gstCalc.sgstAmount,
        igstAmount: gstCalc.igstAmount,
        totalAmount: gstCalc.totalAmount,
        requiresPrescription,
      };
      finalItems = [autoItem];
    }

    if (finalItems.length === 0) {
      setErrorMsg('Please add at least one medicine item to the bill');
      return null;
    }

    const calcSubtotal = Number(finalItems.reduce((sum, i) => sum + i.taxableAmount, 0).toFixed(2));
    const calcCgst = Number(finalItems.reduce((sum, i) => sum + i.cgstAmount, 0).toFixed(2));
    const calcSgst = Number(finalItems.reduce((sum, i) => sum + i.sgstAmount, 0).toFixed(2));
    const calcIgst = Number(finalItems.reduce((sum, i) => sum + i.igstAmount, 0).toFixed(2));
    const calcTax = Number((calcCgst + calcSgst + calcIgst).toFixed(2));
    const calcUnrounded = calcSubtotal + calcTax;
    const calcGrandTotal = Math.round(calcUnrounded);
    const calcRoundOff = Number((calcGrandTotal - calcUnrounded).toFixed(2));
    const calcPaid = numAmountPaid > 0 ? numAmountPaid : paymentMode === 'Credit' ? 0 : calcGrandTotal;
    const calcDue = Math.max(0, calcGrandTotal - calcPaid);

    return createInvoice({
      invoiceDate,
      dueDate,
      customerId: selectedCustomerId || '',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '+91 98000 00000',
      customerGstin: customerGstin.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      customerState,
      customerStateCode,
      isInterState,
      placeOfSupply: `${customerState} (${customerStateCode})`,
      patientName: patientName.trim() || customerName.trim(),
      patientAge: patientAge || undefined,
      patientGender,
      doctorName: doctorName.trim() || undefined,
      doctorRegNo: doctorRegNo.trim() || undefined,
      hasPrescription,
      prescriptionNotes: prescriptionNotes.trim() || undefined,
      invoiceFormat,
      items: finalItems,
      subtotalTaxable: calcSubtotal,
      totalCgst: calcCgst,
      totalSgst: calcSgst,
      totalIgst: calcIgst,
      totalTax: calcTax,
      roundOff: calcRoundOff,
      grandTotal: calcGrandTotal,
      paymentMode,
      amountPaid: calcPaid,
      balanceDue: calcDue,
      status: calcDue === 0 ? 'Paid' : calcPaid > 0 ? 'Partial' : 'Unpaid',
      notes: prescriptionNotes.trim() || undefined,
    });
  };

  const handleSaveOnly = () => {
    const saved = buildInvoice();
    if (saved) {
      onInvoiceCreated(saved, false);
      onClose();
    }
  };

  const handleSaveAndPrint = () => {
    const saved = buildInvoice();
    if (saved) {
      onInvoiceCreated(saved, true);
      onClose();
    }
  };

  const handleSaveAndDownloadPdf = () => {
    const saved = buildInvoice();
    if (saved) {
      downloadInvoiceAsPdf(saved, currentShop);
      onInvoiceCreated(saved, false);
      onClose();
    }
  };

  return (
    <div className="bg-white border-2 border-emerald-600 rounded-2xl shadow-xl p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
      {/* Header of Medical Bill Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                New Medical Bill & GST Tax Invoice
              </h2>
              <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Form 20B/21B Compliant
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Demo Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentShop.name} · DL No: <strong>{currentShop.dlNumber20B}</strong> · Reg Pharmacist: <strong>{currentShop.registeredPharmacist}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Print format selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setInvoiceFormat('A4')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                invoiceFormat === 'A4'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 Pharmacy Tax Bill
            </button>
            <button
              type="button"
              onClick={() => setInvoiceFormat('Thermal80mm')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                invoiceFormat === 'Thermal80mm'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              80mm Thermal Slip
            </button>
          </div>

          <span
            className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
              isInterState
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {isInterState ? 'Inter-State (IGST 12%)' : 'Intra-State (CGST 6% + SGST 6%)'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Doctor & Patient / Customer Details */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Prescribing Doctor & Patient Information</span>
          </span>
          <span className="text-slate-500 text-[11px]">Mandatory for Schedule H/H1 Antibiotics & Chronic Rx</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Doctor Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Prescribing Doctor Name
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. K. K. Aggarwal, MBBS, MD"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            />
          </div>

          {/* Doctor Reg No */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Doctor Medical Reg #
            </label>
            <input
              type="text"
              placeholder="e.g. DMC-18921 / MCI-44210"
              value={doctorRegNo}
              onChange={(e) => setDoctorRegNo(e.target.value)}
              className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Patient Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Patient / Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Chandra Gupta"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setPatientName(e.target.value);
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
            />
          </div>

          {/* Patient Mobile */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mobile # (WhatsApp Bill) *
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98123 45678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Patient Age & Gender */}
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="block text-slate-600 font-semibold mb-1">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientAge || ''}
                onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                placeholder="Years"
                className="w-full font-mono bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-slate-600 font-semibold mb-1">Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Place of supply */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Place of Supply (State) *
            </label>
            <select
              value={customerStateCode}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name} {s.code === currentShop.stateCode ? '(Intra-State: CGST+SGST)' : '(Inter-State: IGST)'}
                </option>
              ))}
            </select>
          </div>

          {/* Customer GSTIN (B2B) */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Customer GSTIN (For B2B Clinics)
            </label>
            <input
              type="text"
              placeholder="07AAACA4490P1ZM"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
              className="w-full font-mono uppercase bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Presc Attachment note */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Prescription Check
            </label>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="hasPrescriptionCheckbox"
                checked={hasPrescription}
                onChange={(e) => setHasPrescription(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="hasPrescriptionCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Prescription Verified on File
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Medicine Selection, Batch Number, Expiry Date & Stock Guard */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Medicine Selection (Batch No, Expiry Date, MRP & GST Rate)</span>
          </span>
          <span className="text-slate-500 text-xs font-semibold">
            {items.length} {items.length === 1 ? 'item' : 'items'} in bill
          </span>
        </div>

        {/* Scratchpad Entry Row */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          {/* Quick Search & Select from Pharmacy Catalog */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
            <div className="sm:col-span-5">
              <label className="block text-slate-700 font-semibold mb-1">
                Search & Select Medicine (or type Salt / Brand)
              </label>
              <div className="relative">
                <select
                  value={activeProductId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                >
                  <option value="">-- Choose Medicine from Pharmacy Stock --</option>
                  {products.map((p) => {
                    const exp = getMedicineExpiryDetails(p.expiryDate);
                    return (
                      <option 
                        key={p.id} 
                        value={p.id}
                        disabled={!exp.isSaleAllowed}
                        className={!exp.isSaleAllowed ? 'text-rose-500 font-bold' : ''}
                      >
                        {p.name} {p.saltComposition ? `(${p.saltComposition})` : ''} · B: {p.batchNumber} · Exp: {exp.formattedDate} · Stock: {p.currentStock} {p.unit} · MRP: ₹{p.mrp} {!exp.isSaleAllowed ? '[EXPIRED - BLOCKED]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-700 font-semibold mb-1">
                Salt / Active Composition
              </label>
              <input
                type="text"
                placeholder="e.g. Paracetamol 650mg / Amoxycillin 500mg"
                value={saltComposition}
                onChange={(e) => setSaltComposition(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-700 font-semibold mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. GSK / Micro Labs / Cipla"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs"
              />
            </div>
          </div>

          {/* Medicine parameters: Batch, Expiry, Pack, HSN, Qty, Rate, GST */}
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 text-xs pt-1">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Batch No. *
              </label>
              <input
                type="text"
                placeholder="e.g. AG-9021"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                className="w-full font-mono font-bold uppercase bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Expiry Date * (YYYY-MM)
              </label>
              <input
                type="month"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full font-mono bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              {activeExpiryInfo && (
                <div className="mt-1 text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded font-semibold ${activeExpiryInfo.badgeClass}`}>
                    {activeExpiryInfo.label}
                  </span>
                </div>
              )}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                HSN
              </label>
              <input
                type="text"
                value={itemHsn}
                onChange={(e) => setItemHsn(e.target.value)}
                className="w-full font-mono bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                Qty *
              </label>
              <input
                type="number"
                min="1"
                value={itemQty}
                onChange={(e) => setItemQty(parseFloat(e.target.value) || 0)}
                className="w-full font-mono bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold"
              />
              {selectedProductStock !== null && (
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Avail: {selectedProductStock}
                </span>
              )}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={itemMrp}
                onChange={(e) => setItemMrp(parseFloat(e.target.value) || 0)}
                className="w-full font-mono bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={itemRate}
                onChange={(e) => setItemRate(parseFloat(e.target.value) || 0)}
                className="w-full font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                GST %
              </label>
              <select
                value={itemGstRate}
                onChange={(e) => setItemGstRate(parseInt(e.target.value) as GstRate)}
                className="w-full font-bold bg-white border border-slate-300 rounded-lg px-1 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value={0}>0% (Life saving)</option>
                <option value={5}>5%</option>
                <option value={12}>12% (Medicines)</option>
                <option value={18}>18% (Supplements)</option>
                <option value={28}>28%</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                Disc %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                value={itemDiscount}
                onChange={(e) => setItemDiscount(parseFloat(e.target.value) || 0)}
                className="w-full font-mono bg-white border border-slate-300 rounded-lg px-1.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="button"
                onClick={handleAddItem}
                disabled={activeExpiryInfo ? !activeExpiryInfo.isSaleAllowed : false}
                className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer text-xs ${
                  activeExpiryInfo && !activeExpiryInfo.isSaleAllowed
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Medicine</span>
              </button>
            </div>
          </div>
        </div>

        {/* Added Items Table */}
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-8">#</th>
                <th className="py-2.5 px-3">Medicine & Salt Composition</th>
                <th className="py-2.5 px-3">Batch #</th>
                <th className="py-2.5 px-3 text-center">Expiry</th>
                <th className="py-2.5 px-3 text-center">HSN</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">MRP</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                {!isInterState ? (
                  <>
                    <th className="py-2.5 px-3 text-right">CGST</th>
                    <th className="py-2.5 px-3 text-right">SGST</th>
                  </>
                ) : (
                  <th className="py-2.5 px-3 text-right">IGST</th>
                )}
                <th className="py-2.5 px-3 text-right">Total (₹)</th>
                <th className="py-2.5 px-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    No medicines added to bill yet. Select a medicine from your pharmacy stock above and click "+ Add Medicine".
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const exp = getMedicineExpiryDetails(item.expiryDate);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.requiresPrescription && (
                            <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.2 rounded font-bold">
                              Rx
                            </span>
                          )}
                        </div>
                        {item.saltComposition && (
                          <div className="text-[10px] text-slate-500 italic">
                            {item.saltComposition} {item.manufacturer ? `· ${item.manufacturer}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.batchNumber}</td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${exp.badgeClass}`}>
                          {exp.formattedDate}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">{item.hsn}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">₹{item.mrp.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">₹{item.taxableAmount.toFixed(2)}</td>
                      {!isInterState ? (
                        <>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            ₹{item.cgstAmount.toFixed(2)} <span className="text-[9px] text-slate-400">({item.gstRate / 2}%)</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            ₹{item.sgstAmount.toFixed(2)} <span className="text-[9px] text-slate-400">({item.gstRate / 2}%)</span>
                          </td>
                        </>
                      ) : (
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          ₹{item.igstAmount.toFixed(2)} <span className="text-[9px] text-slate-400">({item.gstRate}%)</span>
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                        ₹{item.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Payment Mode & Tax Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment mode & Khata */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block border-b border-slate-200 pb-2">
            3. Payment Method & Patient Settlement
          </span>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['Cash', 'UPI', 'Card', 'Credit', 'Bank Transfer'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setPaymentMode(mode);
                    setIsManualPaidAmount(false);
                  }}
                  className={`py-1.5 px-2 rounded-lg font-medium border text-center transition-all cursor-pointer ${
                    paymentMode === mode
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mode === 'Credit' ? 'Khata (Udhaar)' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Amount Paid (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amountPaidInput}
                onChange={(e) => {
                  setAmountPaidInput(e.target.value);
                  setIsManualPaidAmount(true);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Balance Due (Patient Khata)
              </label>
              <div
                className={`px-2.5 py-1.5 rounded-lg border font-mono font-bold ${
                  balanceDue > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                {formatINR(balanceDue)}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Prescription / Dosage Instructions
            </label>
            <input
              type="text"
              value={prescriptionNotes}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              placeholder="e.g. 1 Tablet twice daily after meals for 5 days"
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* GST & Totals Breakdown */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-1.5 font-mono text-xs">
          <span className="font-bold font-sans text-slate-900 uppercase tracking-wider text-[11px] block border-b border-slate-200 pb-2">
            4. Real-time GST & Grand Total Calculation
          </span>

          {totalDiscount > 0 && (
            <div className="flex justify-between py-1 text-slate-500 border-b border-slate-200 font-sans">
              <span>Total Patient Discount:</span>
              <span className="font-mono text-emerald-700">- {formatINR(totalDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200 font-sans">
            <span>Taxable Value (Subtotal):</span>
            <span className="font-mono font-semibold text-slate-900">{formatINR(subtotalTaxable)}</span>
          </div>

          {!isInterState ? (
            <>
              <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200 font-sans bg-emerald-50/70 px-2 rounded">
                <span>Central GST (CGST 6%):</span>
                <span className="font-mono font-bold text-emerald-800">{formatINR(totalCgst)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200 font-sans bg-emerald-50/70 px-2 rounded">
                <span>State GST (SGST 6%):</span>
                <span className="font-mono font-bold text-emerald-800">{formatINR(totalSgst)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200 font-sans bg-amber-50/70 px-2 rounded">
              <span>Integrated GST (IGST 12%):</span>
              <span className="font-mono font-bold text-amber-800">{formatINR(totalIgst)}</span>
            </div>
          )}

          <div className="flex justify-between py-1 text-slate-600 border-b border-slate-200 font-sans">
            <span>Total Medicine GST:</span>
            <span className="font-mono font-semibold">{formatINR(totalTax)}</span>
          </div>

          {roundOff !== 0 && (
            <div className="flex justify-between py-1 text-slate-500 border-b border-slate-200 text-[11px] font-sans">
              <span>Round Off:</span>
              <span className="font-mono">
                {roundOff > 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}
              </span>
            </div>
          )}

          <div className="flex justify-between py-2 text-base font-bold text-slate-900 border-b-2 border-slate-900 font-sans">
            <span>Net Payable (Grand Total):</span>
            <span className="font-mono text-emerald-700 text-xl font-black">{formatINR(roundedGrandTotal)}</span>
          </div>

          <div className="text-[11px] text-slate-500 italic font-sans pt-1">
            {convertNumberToIndianWords(roundedGrandTotal)}
          </div>
        </div>
      </div>

      {/* Action Buttons: Save Bill, Download PDF, Print A4 / Thermal */}
      <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          Cancel / Hide Form
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Save Bill */}
          <button
            type="button"
            onClick={handleSaveOnly}
            className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Medical Bill</span>
          </button>

          {/* Download PDF */}
          <button
            type="button"
            onClick={handleSaveAndDownloadPdf}
            className="px-4 py-2.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Download PDF</span>
          </button>

          {/* Print Medical Bill */}
          <button
            type="button"
            onClick={handleSaveAndPrint}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-500/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print {invoiceFormat === 'Thermal80mm' ? 'Thermal Slip' : 'A4 Bill'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
