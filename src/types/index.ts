export type Language = 'en' | 'hi';

export type SubscriptionTier = 'basic' | 'business' | 'premium';

export type BusinessCategory = 
  | 'Pharmacy & Medical'
  | 'Kirana & Grocery'
  | 'Electronics & Mobiles'
  | 'Textile & Garments'
  | 'General Retail';

export interface ShopProfile {
  id: string;
  name: string;
  hindiName?: string;
  ownerName: string;
  category: BusinessCategory;
  gstin: string;
  pan: string;
  state: string;
  stateCode: string; // e.g. "07" for Delhi, "27" for Maharashtra
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  upiVpa: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  invoicePrefix: string;
  currentInvoiceSequence: number;
  subscriptionPlan: SubscriptionTier;
  planExpiryDate: string;
  termsAndConditions: string;
  // Pharmacy Specific Licenses & Registrations
  dlNumber20B: string; // Drug License Form 20B (Allopathic)
  dlNumber21B: string; // Drug License Form 21B (Schedule C/C1)
  registeredPharmacist: string; // Name & Reg # of certified pharmacist
  fssaiNumber?: string; // FSSAI License for baby foods, nutritional supplements
}

export type UnitType = 
  | 'strip' 
  | 'bottle' 
  | 'tube' 
  | 'vial' 
  | 'box' 
  | 'packet' 
  | 'pcs' 
  | 'tablet' 
  | 'capsule' 
  | 'ml' 
  | 'gm';

export type GstRate = 0 | 5 | 12 | 18 | 28;

export type DrugSchedule = 'OTC' | 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'Ayurvedic';

export interface Product {
  id: string;
  shopId: string;
  name: string; // e.g. Augmentin 625 Duo Tablet
  hindiName?: string;
  sku: string;
  barcode?: string;
  hsn: string; // typically 3004 for medicaments
  category: string; // Antibiotics, Analgesics, Antacids, Cardiac, Diabetic, etc.
  saltComposition: string; // e.g. Amoxycillin 500mg + Clavulanic Acid 125mg
  manufacturer: string; // e.g. GlaxoSmithKline / Micro Labs
  batchNumber: string; // e.g. AG-9021
  expiryDate: string; // YYYY-MM
  mfgDate?: string; // YYYY-MM
  packSize: string; // e.g. "10 Tablets / Strip", "100ml Bottle"
  drugSchedule: DrugSchedule;
  requiresPrescription: boolean;
  rackNumber?: string; // e.g. Rack A-02 / Refrigerator 2-8°C
  unit: UnitType;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstRate: GstRate;
  currentStock: number;
  minStockAlert: number;
  lastUpdated?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  saltComposition?: string;
  manufacturer?: string;
  batchNumber: string;
  expiryDate: string;
  packSize?: string;
  hsn: string;
  quantity: number;
  unit: UnitType;
  mrp: number;
  unitPrice: number; // selling price before discount
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: GstRate;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  requiresPrescription?: boolean;
}

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Credit' | 'Bank Transfer' | 'Cheque';

export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';

export interface Invoice {
  id: string;
  shopId: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  customerAddress?: string;
  customerState: string;
  customerStateCode: string;
  isInterState: boolean;
  placeOfSupply: string;
  // Patient & Doctor Information (Pharmacy Requirement)
  patientName?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  doctorName?: string;
  doctorRegNo?: string;
  hasPrescription?: boolean;
  prescriptionNotes?: string;
  invoiceFormat?: 'A4' | 'Thermal80mm';
  items: InvoiceItem[];
  subtotalTaxable: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state: string;
  stateCode: string;
  creditLimit: number;
  currentBalance: number; // positive: customer owes shopkeeper (Udhaar), negative: advance paid
  totalPurchases: number;
  lastTransactionDate: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  shopId: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  gstin: string;
  address: string;
  state: string;
  stateCode: string;
  payableBalance: number;
  totalPurchased: number;
}

export interface PurchaseRecord {
  id: string;
  shopId: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  supplierGstin: string;
  billDate: string;
  itemsDescription: string;
  batchNumber?: string;
  expiryDate?: string;
  isPurchaseReturn?: boolean;
  returnReason?: string;
  taxableAmount: number;
  gstRate: GstRate;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalGst: number;
  totalAmount: number;
  isItcEligible: boolean; // Input Tax Credit
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  paymentMode: PaymentMode;
  notes?: string;
}

export type ExpenseCategory = 
  | 'Shop Rent'
  | 'Electricity & Utilities'
  | 'Staff Salary & Wages'
  | 'Transport & Freight'
  | 'Packaging & Bags'
  | 'Tea & Refreshments'
  | 'Repairs & Maintenance'
  | 'Marketing & Printing'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  shopId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMode: PaymentMode;
  paidTo?: string;
  receiptNumber?: string;
}

export interface CustomerTransaction {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  date: string;
  type: 'BILL' | 'PAYMENT_RECEIVED' | 'OPENING_BALANCE' | 'RETURN';
  invoiceId?: string;
  invoiceNumber?: string;
  amount: number;
  paymentMode?: PaymentMode;
  balanceAfter: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'create_invoice' | 'view_stock' | 'view_khata' | 'whatsapp_reminder';
    label: string;
    payload?: any;
  };
}
