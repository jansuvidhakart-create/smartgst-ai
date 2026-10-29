import { Language } from '../types';

export const translations = {
  en: {
    // Brand
    brandName: 'SmartGST MediStore AI',
    tagline: 'Medical Store Billing, Batch Inventory & GST SaaS Software',
    demoModeBanner: 'Demo Pharmacy Active · Local sandbox changes persist in your browser · Form 20B/21B Compliant',
    resetDemoData: 'Reset Demo Pharmacy Data',
    
    // Navigation
    navDashboard: 'Pharmacy Dashboard',
    navNewBill: 'New Medical Bill (F2)',
    navInvoices: 'Sales & Invoices',
    navInventory: 'Medicine Inventory & Expiry',
    navCustomers: 'Patient & Customer Khata',
    navSuppliers: 'Pharma Distributors & Purchases',
    navExpenses: 'Shop Expenses',
    navReports: 'GST & Pharmacy Reports',
    navAIAssistant: 'Pharma AI Assistant',
    navSubscriptions: 'Chemist Plans & Pricing',
    navSettings: 'Pharmacy Profile & DL',
    
    // Quick Actions
    quickNewInvoice: 'New Medical Bill',
    quickAddProduct: 'Add New Medicine',
    quickRecordExpense: 'Record Expense',
    quickCollectPayment: 'Collect Khata',
    
    // Dashboard metrics
    todaySales: "Today's Sales",
    monthSales: 'This Month Sales',
    grossProfit: 'Estimated Gross Profit',
    netProfit: 'Net Business Profit',
    totalReceivable: 'Customer Udhaar (To Collect)',
    totalPayable: 'Supplier Payable (To Pay)',
    lowStockAlerts: 'Low Stock Items',
    recentTransactions: 'Recent Invoices',
    salesTrend: 'Sales & Revenue Performance',
    topSellingItems: 'Top Selling Items',
    
    // Invoice Generator
    taxInvoice: 'Tax Invoice (कर चालान)',
    billTo: 'Customer Details (Bill To)',
    customerName: 'Customer Name',
    customerPhone: 'Phone Number (for WhatsApp Bill)',
    customerGstin: 'Customer GSTIN (B2B)',
    placeOfSupply: 'Place of Supply (State)',
    interStateSupply: 'Inter-State (IGST applies)',
    intraStateSupply: 'Intra-State (CGST + SGST applies)',
    invoiceNumber: 'Invoice #',
    invoiceDate: 'Date',
    dueDate: 'Due Date',
    paymentMode: 'Payment Mode',
    addItem: 'Add Item',
    selectProduct: 'Search or Select Product...',
    itemDescription: 'Item Description',
    hsnCode: 'HSN / SAC',
    qty: 'Qty',
    unit: 'Unit',
    rate: 'Rate (₹)',
    discount: 'Disc %',
    taxableAmt: 'Taxable Val',
    gstRate: 'GST %',
    cgst: 'CGST',
    sgst: 'SGST',
    igst: 'IGST',
    total: 'Total (₹)',
    subtotal: 'Subtotal (Taxable)',
    totalTax: 'Total GST Amount',
    roundOff: 'Round Off',
    grandTotal: 'Grand Total',
    amountPaid: 'Amount Paid Now',
    balanceDue: 'Balance Due (Khata)',
    saveAndPrint: 'Save & Print Invoice',
    saveOnly: 'Save Invoice',
    resetForm: 'Clear Bill',
    termsConditions: 'Terms & Conditions',
    authorizedSignatory: 'Authorized Signatory',
    
    // Inventory
    inventoryTitle: 'Product & Stock Management',
    addNewProduct: 'Add New Product',
    searchProduct: 'Search by product name, SKU or HSN...',
    categoryFilter: 'All Categories',
    allStock: 'All Items',
    lowStockOnly: 'Low Stock Alert Only',
    stockInHand: 'Current Stock',
    purchaseRate: 'Cost Price',
    sellingRate: 'Sale Price',
    margin: 'Margin',
    quickStockAdd: '+ Add Stock',
    editProduct: 'Edit',
    deleteProduct: 'Delete',
    
    // Customer Khata
    khataTitle: 'Customer Khata & Udhaar Ledger',
    addNewCustomer: 'Add Customer',
    searchCustomer: 'Search customer by name or phone...',
    outstandingBalance: 'Udhaar Balance',
    sendReminder: 'Send WhatsApp Reminder',
    recordPayment: 'Record Payment',
    viewLedger: 'View Khata',
    
    // Suppliers & Purchases
    suppliersTitle: 'Suppliers & Purchase Bills',
    addNewSupplier: 'Add Supplier',
    recordPurchaseBill: 'Record Purchase Bill',
    itcEligible: 'ITC Eligible (Input Tax Credit)',
    
    // Expenses
    expenseTitle: 'Daily Shop Expenses',
    addExpense: 'Add Shop Expense',
    monthlyExpenseTotal: 'Total Expenses This Month',
    expenseCategory: 'Category',
    expenseDescription: 'Description / Reason',
    paidTo: 'Paid To',
    
    // Reports
    reportsTitle: 'Accounting Reports & GST Returns',
    tabPnl: 'Profit & Loss Statement',
    tabGstr1: 'GSTR-1 Outward Sales Summary',
    tabGstr3b: 'GSTR-3B Tax Liability & ITC',
    revenue: 'Sales Revenue (Gross)',
    cogs: 'Cost of Goods Sold (COGS)',
    operatingExpenses: 'Operating Expenses',
    netBusinessProfit: 'Net Profit',
    exportCsv: 'Export to Excel / CSV',
    
    // AI Assistant
    aiAssistantTitle: 'SmartGST AI Mitr',
    aiSubtitle: 'Your 24x7 GST, Khata & Business Assistant for Indian MSMEs',
    askQuestionPlaceholder: 'Ask anything about GST rates, overdue payment recovery, stock advice...',
    askAi: 'Ask Mitr',
    suggestedQuestions: 'Quick Inquiries:',
    
    // Subscriptions
    subscriptionTitle: 'Subscription Plans for Every Retailer',
    monthlyBilled: 'Billed Monthly',
    currentPlan: 'Current Plan',
    upgradePlan: 'Upgrade Now',
    activeTier: 'Active',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    actions: 'Actions',
    status: 'Status',
    print: 'Print',
    downloadPdf: 'Download Slip',
    thermalView: 'Thermal Slip (3 Inch)',
    a4View: 'Standard A4 Tax Invoice',
    close: 'Close',
    switchShop: 'Switch Business Store',
    registerNewShop: '+ Register New Store',
    demoNotice: 'Notice: GST portal filing, payment gateways and cloud multi-tenant sync are shown in simulated sandbox preview mode as per configuration.',
  },
  hi: {
    // Brand
    brandName: 'स्मार्टजीएसटी मेडिस्टोर AI',
    tagline: 'मेडिकल स्टोर बिलिंग, बैच इन्वेंटरी और जीएसटी सॉफ्टवेयर',
    demoModeBanner: 'डेमो मेडिकल स्टोर सक्रिय · स्थानीय डेटा सुरक्षित · फॉर्म २०बी/२१बी अनुरूप',
    resetDemoData: 'डेमो डेटा रीसेट करें',
    
    // Navigation
    navDashboard: 'फार्मेसी डैशबोर्ड',
    navNewBill: 'नया मेडिकल बिल (F2)',
    navInvoices: 'बिक्री व इनवॉइस',
    navInventory: 'दवा स्टॉक व एक्सपायरी',
    navCustomers: 'मरीज व ग्राहक खाता (उधार)',
    navSuppliers: 'दवा सप्लायर व खरीद',
    navExpenses: 'दुकान के खर्चे',
    navReports: 'जीएसटी व फार्मेसी रिपोर्ट',
    navAIAssistant: 'फार्मा एआई सहायक',
    navSubscriptions: 'सब्सक्रिप्शन प्लान',
    navSettings: 'दुकान प्रोफाइल व ड्रग लाइसेंस',
    
    // Quick Actions
    quickNewInvoice: 'मेडिकल बिल बनाएं',
    quickAddProduct: 'नई दवा जोड़ें',
    quickRecordExpense: 'खर्चा दर्ज करें',
    quickCollectPayment: 'उधार वसूली',
    
    // Dashboard metrics
    todaySales: 'आज की कुल बिक्री',
    monthSales: 'इस महीने की बिक्री',
    grossProfit: 'सकल लाभ (ग्रॉस प्रॉफिट)',
    netProfit: 'शुद्ध मुनाफा (नेट प्रॉफिट)',
    totalReceivable: 'ग्राहक से लेना (कुल उधार)',
    totalPayable: 'सप्लायर को देना (बाकी)',
    lowStockAlerts: 'कम स्टॉक वाले उत्पाद',
    recentTransactions: 'हाल के बिल',
    salesTrend: 'बिक्री व आय का विवरण',
    topSellingItems: 'सबसे ज्यादा बिकने वाला सामान',
    
    // Invoice Generator
    taxInvoice: 'टैक्स इनवॉइस (कर चालान)',
    billTo: 'ग्राहक का विवरण (बिल नाम)',
    customerName: 'ग्राहक का नाम',
    customerPhone: 'मोबाइल नंबर (व्हाट्सएप बिल हेतु)',
    customerGstin: 'ग्राहक का जीएसटी नंबर (यदि हो)',
    placeOfSupply: 'आपूर्ति का राज्य (Place of Supply)',
    interStateSupply: 'अंतरराज्यीय आपूर्ति (IGST लगेगा)',
    intraStateSupply: 'राज्य के भीतर आपूर्ति (CGST + SGST)',
    invoiceNumber: 'बिल नंबर',
    invoiceDate: 'तारीख',
    dueDate: 'भुगतान की अंतिम तिथि',
    paymentMode: 'भुगतान का माध्यम',
    addItem: 'सामान जोड़ें',
    selectProduct: 'सामान चुनें या खोजें...',
    itemDescription: 'सामान का नाम व विवरण',
    hsnCode: 'एचएसएन (HSN)',
    qty: 'मात्रा',
    unit: 'इकाई (यूनिट)',
    rate: 'दर (₹)',
    discount: 'छूट %',
    taxableAmt: 'कर योग्य मूल्य',
    gstRate: 'जीएसटी %',
    cgst: 'CGST',
    sgst: 'SGST',
    igst: 'IGST',
    total: 'कुल (₹)',
    subtotal: 'उप-कुल (टैक्सेबल)',
    totalTax: 'कुल जीएसटी रकम',
    roundOff: 'राउंड ऑफ',
    grandTotal: 'कुल देय राशि',
    amountPaid: 'अभी प्राप्त राशि',
    balanceDue: 'बाकी उधार (खाता)',
    saveAndPrint: 'बिल सुरक्षित करें व प्रिंट लें',
    saveOnly: 'केवल बिल सेव करें',
    resetForm: 'बिल साफ करें',
    termsConditions: 'नियम व शर्तें',
    authorizedSignatory: 'हस्ताक्षरकर्ता',
    
    // Inventory
    inventoryTitle: 'स्टॉक व उत्पाद प्रबंधन',
    addNewProduct: 'नया सामान जोड़ें',
    searchProduct: 'नाम, बारकोड या HSN से खोजें...',
    categoryFilter: 'सभी श्रेणियां',
    allStock: 'सारा स्टॉक',
    lowStockOnly: 'सिर्फ कम स्टॉक वाले',
    stockInHand: 'उपलब्ध स्टॉक',
    purchaseRate: 'खरीद मूल्य',
    sellingRate: 'बिक्री मूल्य',
    margin: 'मुनाफा मार्जिन',
    quickStockAdd: '+ स्टॉक बढ़ाएं',
    editProduct: 'संशोधन',
    deleteProduct: 'हटाएं',
    
    // Customer Khata
    khataTitle: 'ग्राहक खाता व उधार बही',
    addNewCustomer: 'नया ग्राहक जोड़ें',
    searchCustomer: 'नाम या फोन से खोजें...',
    outstandingBalance: 'बाकी उधार',
    sendReminder: 'व्हाट्सएप पर तगादा भेजें',
    recordPayment: 'भुगतान जमा करें',
    viewLedger: 'खाता देखें',
    
    // Suppliers & Purchases
    suppliersTitle: 'सप्लायर व खरीद बिल',
    addNewSupplier: 'नया सप्लायर जोड़ें',
    recordPurchaseBill: 'खरीद बिल दर्ज करें',
    itcEligible: 'आईटीसी योग्य (ITC Credit)',
    
    // Expenses
    expenseTitle: 'दुकान के दैनिक खर्चे',
    addExpense: 'खर्चा दर्ज करें',
    monthlyExpenseTotal: 'इस माह का कुल खर्च',
    expenseCategory: 'खर्च की श्रेणी',
    expenseDescription: 'विवरण / कारण',
    paidTo: 'किसको दिया',
    
    // Reports
    reportsTitle: 'लेखा रिपोर्ट व जीएसटी विवरण',
    tabPnl: 'लाभ और हानि खाता (P&L)',
    tabGstr1: 'GSTR-1 बिक्री विवरणी',
    tabGstr3b: 'GSTR-3B कर व आईटीसी गणना',
    revenue: 'कुल बिक्री आय',
    cogs: 'सामान की खरीद लागत',
    operatingExpenses: 'दुकान के अन्य खर्चे',
    netBusinessProfit: 'शुद्ध मुनाफा',
    exportCsv: 'एक्सेल / सीएसवी में निकालें',
    
    // AI Assistant
    aiAssistantTitle: 'स्मार्टजीएसटी एआई मित्र',
    aiSubtitle: 'भारतीय दुकानदारों का 24x7 जीएसटी, उधार व व्यापार सहायक',
    askQuestionPlaceholder: 'जीएसटी स्लैब, बकाया वसूली, स्टॉक प्रबंधन के बारे में पूछें...',
    askAi: 'मित्र से पूछें',
    suggestedQuestions: 'अक्सर पूछे जाने वाले सवाल:',
    
    // Subscriptions
    subscriptionTitle: 'हर व्यापारी के लिए किफायती प्लान',
    monthlyBilled: 'मासिक शुल्क',
    currentPlan: 'वर्तमान प्लान',
    upgradePlan: 'प्लान बदलें',
    activeTier: 'सक्रिय',
    
    // Common
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    actions: 'कार्य',
    status: 'स्थिति',
    print: 'प्रिंट निकालें',
    downloadPdf: 'रसीद डाउनलोड',
    thermalView: 'थर्मल पर्ची (3 इंच)',
    a4View: 'मानक A4 जीएसटी बिल',
    close: 'बंद करें',
    switchShop: 'दुकान बदलें',
    registerNewShop: '+ नई दुकान रजिस्टर करें',
    demoNotice: 'सूचना: जीएसटी पोर्टल फाइलिंग व ऑनलाइन पेमेंट गेटवे स्थानीय डेमो मोड में प्रदर्शित हैं।',
  }
};

export function useTranslation(lang: Language) {
  return {
    t: (key: keyof typeof translations['en']): string => {
      const langDict = translations[lang] || translations.en;
      return langDict[key] || translations.en[key] || String(key);
    }
  };
}
