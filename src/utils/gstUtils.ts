import { GstRate, UnitType } from '../types';

export interface StateInfo {
  code: string;
  name: string;
}

export const INDIAN_STATES: StateInfo[] = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh (New)' },
  { code: '38', name: 'Ladakh' },
];

export interface HsnSuggestion {
  hsn: string;
  desc: string;
  hindiDesc: string;
  defaultGst: GstRate;
  unit: UnitType;
}

export const COMMON_HSN_CODES: HsnSuggestion[] = [
  { hsn: '3004', desc: 'Allopathic Medicaments (Tablets, Syrups, Capsules)', hindiDesc: 'एलोपैथिक दवाइयां (टैबलेट, सिरप, कैप्सूल)', defaultGst: 12, unit: 'strip' },
  { hsn: '3004', desc: 'Life Saving / Critical Formulations', hindiDesc: 'जीवन रक्षक दवाइयां (५% जीएसटी)', defaultGst: 5, unit: 'strip' },
  { hsn: '3002', desc: 'Vaccines, Toxoids & Immunologicals', hindiDesc: 'वैक्सीन व इम्यूनोलॉजिकल टीके', defaultGst: 5, unit: 'vial' },
  { hsn: '3006', desc: 'First Aid Kits & Surgical Dressings', hindiDesc: 'सर्जिकल बैंडेज व प्राथमिक उपचार किट', defaultGst: 12, unit: 'box' },
  { hsn: '9018', desc: 'Medical Diagnostic Devices (Glucometers, BP Monitors)', hindiDesc: 'मेडिकल जांच उपकरण (ग्लूकोमीटर, बीपी मशीन)', defaultGst: 18, unit: 'pcs' },
  { hsn: '9018', desc: 'Surgical Disposable Needles & Syringes', hindiDesc: 'डिस्पोजेबल सीरिंज व सुइयां', defaultGst: 12, unit: 'packet' },
  { hsn: '2106', desc: 'Nutritional Supplements & Protein Powders', hindiDesc: 'प्रोटीन पाउडर व पोषण सप्लीमेंट्स', defaultGst: 18, unit: 'box' },
  { hsn: '3004', desc: 'Ayurvedic & Herbal Proprietary Medicines', hindiDesc: 'आयुर्वेदिक व हर्बल दवाइयां', defaultGst: 12, unit: 'bottle' },
  { hsn: '3808', desc: 'Antiseptics, Hand Sanitizers & Disinfectants', hindiDesc: 'एंटीसेप्टिक लिक्विड व हैंड सैनिटाइजर', defaultGst: 18, unit: 'bottle' },
  { hsn: '3304', desc: 'Medicated Dermatological Creams & Ointments', hindiDesc: 'स्किन केयर व मेडिकेटेड मलहम', defaultGst: 12, unit: 'tube' },
];

export type ExpiryStatusType = 'EXPIRED' | 'EXPIRING_30' | 'EXPIRING_60' | 'EXPIRING_90' | 'NORMAL';

export interface ExpiryDetails {
  status: ExpiryStatusType;
  daysRemaining: number;
  label: string;
  badgeClass: string;
  isSaleAllowed: boolean;
  formattedDate: string;
}

/**
 * Calculate expiry status and countdown for medicines
 * Input formats supported: "YYYY-MM" or "YYYY-MM-DD"
 */
export function getMedicineExpiryDetails(expiryDateStr: string): ExpiryDetails {
  if (!expiryDateStr) {
    return {
      status: 'NORMAL',
      daysRemaining: 999,
      label: 'Date Unknown',
      badgeClass: 'text-slate-500 bg-slate-100',
      isSaleAllowed: true,
      formattedDate: 'N/A',
    };
  }

  // Parse YYYY-MM into last day of that month, or YYYY-MM-DD directly
  let expDate: Date;
  if (expiryDateStr.length === 7) {
    const [year, month] = expiryDateStr.split('-').map(Number);
    // End of the specified expiry month
    expDate = new Date(year, month, 0, 23, 59, 59);
  } else {
    expDate = new Date(expiryDateStr);
  }

  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = expDate.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  if (daysRemaining <= 0) {
    return {
      status: 'EXPIRED',
      daysRemaining,
      label: `EXPIRED (${Math.abs(daysRemaining)}d ago)`,
      badgeClass: 'text-rose-700 bg-rose-50 border border-rose-200 font-bold',
      isSaleAllowed: false, // Strict compliance: Expired drug sale prohibited
      formattedDate,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: 'EXPIRING_30',
      daysRemaining,
      label: `Expiring in ${daysRemaining} days`,
      badgeClass: 'text-amber-800 bg-amber-50 border border-amber-300 font-bold',
      isSaleAllowed: true,
      formattedDate,
    };
  }

  if (daysRemaining <= 60) {
    return {
      status: 'EXPIRING_60',
      daysRemaining,
      label: `Expiring in ${daysRemaining} days`,
      badgeClass: 'text-amber-700 bg-amber-50/60 border border-amber-200',
      isSaleAllowed: true,
      formattedDate,
    };
  }

  if (daysRemaining <= 90) {
    return {
      status: 'EXPIRING_90',
      daysRemaining,
      label: `Expiring in ${daysRemaining} days`,
      badgeClass: 'text-blue-700 bg-blue-50 border border-blue-200',
      isSaleAllowed: true,
      formattedDate,
    };
  }

  return {
    status: 'NORMAL',
    daysRemaining,
    label: `Good (${formattedDate})`,
    badgeClass: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    isSaleAllowed: true,
    formattedDate,
  };
}

/**
 * Format currency in Indian Lakhs / Crores standard:
 * e.g. 145000 -> "₹ 1,45,000.00"
 */
export function formatINR(val: number, showDecimals: boolean = true): string {
  if (isNaN(val) || val === null || val === undefined) return '₹ 0.00';
  
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absVal);
  
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Calculate GST breakdown for an item
 */
export function calculateItemGst(
  quantity: number,
  unitPrice: number,
  discountPercent: number,
  gstRate: GstRate,
  isInterState: boolean
) {
  const basePrice = quantity * unitPrice;
  const discountAmount = (basePrice * discountPercent) / 100;
  const taxableAmount = Math.max(0, basePrice - discountAmount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (isInterState) {
    igstAmount = (taxableAmount * gstRate) / 100;
  } else {
    // Split into CGST and SGST equally
    const halfRate = gstRate / 2;
    cgstAmount = (taxableAmount * halfRate) / 100;
    sgstAmount = (taxableAmount * halfRate) / 100;
  }

  const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;

  return {
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    cgstAmount: Number(cgstAmount.toFixed(2)),
    sgstAmount: Number(sgstAmount.toFixed(2)),
    igstAmount: Number(igstAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

/**
 * Convert number to words in Indian Rupees standard format
 * e.g. 1250.50 -> "Rupees One Thousand Two Hundred Fifty and Fifty Paise Only"
 */
export function convertNumberToIndianWords(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(num: number): string {
    if (num < 10) return singleDigits[num];
    if (num >= 10 && num < 20) return twoDigits[num - 10];
    const tens = Math.floor(num / 10);
    const rest = num % 10;
    return `${tensMultiple[tens]}${rest ? ' ' + singleDigits[rest] : ''}`;
  }

  function convertThreeDigits(num: number): string {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    let res = '';
    if (hundred) {
      res += `${singleDigits[hundred]} Hundred`;
      if (rest) res += ' and ';
    }
    if (rest) {
      res += convertTwoDigits(rest);
    }
    return res;
  }

  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let crore = Math.floor(rupees / 10000000);
  let lakh = Math.floor((rupees % 10000000) / 100000);
  let thousand = Math.floor((rupees % 100000) / 1000);
  let hundred = rupees % 1000;

  let words = 'Rupees ';
  if (crore) words += `${convertTwoDigits(crore)} Crore `;
  if (lakh) words += `${convertTwoDigits(lakh)} Lakh `;
  if (thousand) words += `${convertTwoDigits(thousand)} Thousand `;
  if (hundred) words += convertThreeDigits(hundred);

  if (paise > 0) {
    words += ` and ${convertTwoDigits(paise)} Paise`;
  }
  words += ' Only';

  return words.trim();
}

/**
 * Generate UPI payment link string
 */
export function generateUpiLink(vpa: string, payeeName: string, amount: number, invoiceNum: string): string {
  const cleanVpa = encodeURIComponent(vpa.trim() || 'payee@upi');
  const cleanName = encodeURIComponent(payeeName.trim() || 'Merchant');
  const cleanNote = encodeURIComponent(`Bill ${invoiceNum}`);
  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${amount.toFixed(2)}&cu=INR&tn=${cleanNote}`;
}
