import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ShopProfile,
  Product,
  Customer,
  Supplier,
  Invoice,
  PurchaseRecord,
  Expense,
  CustomerTransaction,
  Language,
  SubscriptionTier,
  PaymentMode,
} from '../types';
import {
  INITIAL_SHOPS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_INVOICES,
  INITIAL_PURCHASES,
  INITIAL_EXPENSES,
  INITIAL_CUSTOMER_TRANSACTIONS,
} from '../data/mockData';

interface ShopContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  shops: ShopProfile[];
  currentShop: ShopProfile;
  currentShopId: string;
  switchShop: (id: string) => void;
  registerNewShop: (shop: Omit<ShopProfile, 'id' | 'currentInvoiceSequence' | 'planExpiryDate'>) => void;
  updateShopProfile: (updates: Partial<ShopProfile>) => void;
  upgradeSubscription: (tier: SubscriptionTier) => void;

  // Data for active shop
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  invoices: Invoice[];
  purchases: PurchaseRecord[];
  expenses: Expense[];
  customerTransactions: CustomerTransaction[];

  // Mutators
  createInvoice: (inv: Omit<Invoice, 'id' | 'shopId' | 'invoiceNumber' | 'createdAt'>) => Invoice;
  deleteInvoice: (id: string) => void;
  addProduct: (prod: Omit<Product, 'id' | 'shopId'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'shopId' | 'totalPurchases' | 'lastTransactionDate'>) => Customer;
  recordCustomerPayment: (customerId: string, amount: number, mode: PaymentMode, notes?: string) => void;
  addSupplier: (sup: Omit<Supplier, 'id' | 'shopId' | 'totalPurchased'>) => Supplier;
  recordSupplierPayment: (supplierId: string, amount: number, mode: PaymentMode, notes?: string) => void;
  addPurchaseRecord: (pur: Omit<PurchaseRecord, 'id' | 'shopId'>) => PurchaseRecord;
  addExpense: (exp: Omit<Expense, 'id' | 'shopId'>) => Expense;
  deleteExpense: (id: string) => void;
  resetAllToDemoData: () => void;

  // Metrics
  todaySales: number;
  monthSales: number;
  totalReceivable: number;
  totalPayable: number;
  grossProfit: number;
  netProfit: number;
  lowStockItems: Product[];
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SHOPS: 'smartgst_pharmasaas_shops_v2',
  CURRENT_SHOP_ID: 'smartgst_pharmasaas_active_shop_v2',
  PRODUCTS: 'smartgst_pharmasaas_medicines_v2',
  CUSTOMERS: 'smartgst_pharmasaas_customers_v2',
  SUPPLIERS: 'smartgst_pharmasaas_suppliers_v2',
  INVOICES: 'smartgst_pharmasaas_invoices_v2',
  PURCHASES: 'smartgst_pharmasaas_purchases_v2',
  EXPENSES: 'smartgst_pharmasaas_expenses_v2',
  TRANSACTIONS: 'smartgst_pharmasaas_transactions_v2',
  LANGUAGE: 'smartgst_pharmasaas_lang_v2',
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  // Shops
  const [shops, setShops] = useState<ShopProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOPS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SHOPS;
  });

  const [currentShopId, setCurrentShopId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SHOP_ID);
    return saved || 'shop-pharma-1';
  });

  // Store data partitioned by shopId
  const [productsMap, setProductsMap] = useState<Record<string, Product[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customersMap, setCustomersMap] = useState<Record<string, Customer[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliersMap, setSuppliersMap] = useState<Record<string, Supplier[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [invoicesMap, setInvoicesMap] = useState<Record<string, Invoice[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [purchasesMap, setPurchasesMap] = useState<Record<string, PurchaseRecord[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [expensesMap, setExpensesMap] = useState<Record<string, Expense[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [transactionsMap, setTransactionsMap] = useState<Record<string, CustomerTransaction[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_TRANSACTIONS;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SHOP_ID, currentShopId);
  }, [currentShopId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsMap));
  }, [productsMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customersMap));
  }, [customersMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliersMap));
  }, [suppliersMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoicesMap));
  }, [invoicesMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchasesMap));
  }, [purchasesMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expensesMap));
  }, [expensesMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactionsMap));
  }, [transactionsMap]);

  const currentShop: ShopProfile =
    shops.find((s) => s.id === currentShopId) || shops[0] || INITIAL_SHOPS[0];

  const products = productsMap[currentShopId] || [];
  const customers = customersMap[currentShopId] || [];
  const suppliers = suppliersMap[currentShopId] || [];
  const invoices = invoicesMap[currentShopId] || [];
  const purchases = purchasesMap[currentShopId] || [];
  const expenses = expensesMap[currentShopId] || [];
  const customerTransactions = transactionsMap[currentShopId] || [];

  const switchShop = (id: string) => {
    if (shops.some((s) => s.id === id)) {
      setCurrentShopId(id);
    }
  };

  const registerNewShop = (shopData: Omit<ShopProfile, 'id' | 'currentInvoiceSequence' | 'planExpiryDate'>) => {
    const newId = `shop-${Date.now()}`;
    const newShop: ShopProfile = {
      ...shopData,
      id: newId,
      currentInvoiceSequence: 101,
      planExpiryDate: '2027-10-31',
      subscriptionPlan: 'business',
    };
    setShops((prev) => [...prev, newShop]);
    setProductsMap((prev) => ({ ...prev, [newId]: [] }));
    setCustomersMap((prev) => ({ ...prev, [newId]: [] }));
    setSuppliersMap((prev) => ({ ...prev, [newId]: [] }));
    setInvoicesMap((prev) => ({ ...prev, [newId]: [] }));
    setPurchasesMap((prev) => ({ ...prev, [newId]: [] }));
    setExpensesMap((prev) => ({ ...prev, [newId]: [] }));
    setTransactionsMap((prev) => ({ ...prev, [newId]: [] }));
    setCurrentShopId(newId);
  };

  const updateShopProfile = (updates: Partial<ShopProfile>) => {
    setShops((prev) =>
      prev.map((s) => (s.id === currentShopId ? { ...s, ...updates } : s))
    );
  };

  const upgradeSubscription = (tier: SubscriptionTier) => {
    updateShopProfile({ subscriptionPlan: tier });
  };

  const createInvoice = (invData: Omit<Invoice, 'id' | 'shopId' | 'invoiceNumber' | 'createdAt'>): Invoice => {
    const nextSeq = (currentShop.currentInvoiceSequence || 100) + 1;
    const year = new Date().getFullYear();
    const invoiceNumber = `${currentShop.invoicePrefix || 'BILL'}/${year}/${nextSeq}`;
    const newId = `inv-${Date.now()}`;

    const newInvoice: Invoice = {
      ...invData,
      id: newId,
      shopId: currentShopId,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    // 1. Save invoice
    setInvoicesMap((prev) => ({
      ...prev,
      [currentShopId]: [newInvoice, ...(prev[currentShopId] || [])],
    }));

    // 2. Increment shop invoice sequence
    updateShopProfile({ currentInvoiceSequence: nextSeq });

    // 3. Deduct product stock
    setProductsMap((prev) => {
      const currentList = prev[currentShopId] || [];
      const updated = currentList.map((prod) => {
        const item = invData.items.find((i) => i.productId === prod.id);
        if (item) {
          return {
            ...prod,
            currentStock: Math.max(0, prod.currentStock - item.quantity),
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return prod;
      });
      return { ...prev, [currentShopId]: updated };
    });

    // 4. Update customer khata if customer is chosen
    if (invData.customerId) {
      setCustomersMap((prev) => {
        const currentList = prev[currentShopId] || [];
        const updated = currentList.map((cust) => {
          if (cust.id === invData.customerId) {
            const addUdhaar = invData.balanceDue; // balance remaining to be paid
            return {
              ...cust,
              currentBalance: cust.currentBalance + addUdhaar,
              totalPurchases: cust.totalPurchases + invData.grandTotal,
              lastTransactionDate: invData.invoiceDate,
            };
          }
          return cust;
        });
        return { ...prev, [currentShopId]: updated };
      });

      // Record transaction
      const transId = `ctx-${Date.now()}`;
      const customer = customers.find((c) => c.id === invData.customerId);
      const newBalance = (customer?.currentBalance || 0) + invData.balanceDue;

      const newTrans: CustomerTransaction = {
        id: transId,
        shopId: currentShopId,
        customerId: invData.customerId,
        customerName: invData.customerName,
        date: invData.invoiceDate,
        type: 'BILL',
        invoiceId: newId,
        invoiceNumber,
        amount: invData.grandTotal,
        paymentMode: invData.paymentMode,
        balanceAfter: newBalance,
        notes: `Invoice billed. Received: ₹${invData.amountPaid}, Balance: ₹${invData.balanceDue}`,
      };

      setTransactionsMap((prev) => ({
        ...prev,
        [currentShopId]: [newTrans, ...(prev[currentShopId] || [])],
      }));
    }

    return newInvoice;
  };

  const deleteInvoice = (id: string) => {
    setInvoicesMap((prev) => ({
      ...prev,
      [currentShopId]: (prev[currentShopId] || []).filter((inv) => inv.id !== id),
    }));
  };

  const addProduct = (prodData: Omit<Product, 'id' | 'shopId'>): Product => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...prodData,
      id: newId,
      shopId: currentShopId,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setProductsMap((prev) => ({
      ...prev,
      [currentShopId]: [newProduct, ...(prev[currentShopId] || [])],
    }));
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProductsMap((prev) => ({
      ...prev,
      [currentShopId]: (prev[currentShopId] || []).map((p) =>
        p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : p
      ),
    }));
  };

  const deleteProduct = (id: string) => {
    setProductsMap((prev) => ({
      ...prev,
      [currentShopId]: (prev[currentShopId] || []).filter((p) => p.id !== id),
    }));
  };

  const adjustStock = (id: string, delta: number) => {
    setProductsMap((prev) => ({
      ...prev,
      [currentShopId]: (prev[currentShopId] || []).map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, p.currentStock + delta);
          return { ...p, currentStock: newQty, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return p;
      }),
    }));
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'shopId' | 'totalPurchases' | 'lastTransactionDate'>): Customer => {
    const newId = `cust-${Date.now()}`;
    const newCust: Customer = {
      ...custData,
      id: newId,
      shopId: currentShopId,
      totalPurchases: 0,
      lastTransactionDate: new Date().toISOString().split('T')[0],
    };
    setCustomersMap((prev) => ({
      ...prev,
      [currentShopId]: [newCust, ...(prev[currentShopId] || [])],
    }));
    return newCust;
  };

  const recordCustomerPayment = (customerId: string, amount: number, mode: PaymentMode, notes?: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    const newBalance = cust.currentBalance - amount;

    setCustomersMap((prev) => ({
      ...prev,
      [currentShopId]: (prev[currentShopId] || []).map((c) =>
        c.id === customerId
          ? {
              ...c,
              currentBalance: newBalance,
              lastTransactionDate: new Date().toISOString().split('T')[0],
            }
          : c
      ),
    }));

    const newTrans: CustomerTransaction = {
      id: `ctx-${Date.now()}`,
      shopId: currentShopId,
      customerId,
      customerName: cust.name,
      date: new Date().toISOString().split('T')[0],
      type: 'PAYMENT_RECEIVED',
      amount,
      paymentMode: mode,
      balanceAfter: newBalance,
      notes: notes || `Khata payment received via ${mode}`,
    };

    setTransactionsMap((prev) => ({
      ...prev,
      [currentShopId]: [newTrans, ...(prev[currentShopId] || [])],
    }));
  };

  const addSupplier = (supData: Omit<Supplier, 'id' | 'shopId' | 'totalPurchased'>): Supplier => {
    const newId = `sup-${Date.now()}`;
    const newSup: Supplier = {
      ...supData,
      id: newId,
      shopId: currentShopId,
      totalPurchased: 0,
    };
    setSuppliersMap((prev) => ({
      ...prev,
      [currentShopId]: [newSup, ...(prev[currentShopId] || [])],
    }));
    return newSup;
  };

  const recordSupplierPayment = (supplierId: string, amount: number, _mode: PaymentMode, _notes?: string) => {
    setSuppliersMap((prev) => ({
      ...prev,
      [currentShopId]: (prev[currentShopId] || []).map((s) =>
        s.id === supplierId ? { ...s, payableBalance: Math.max(0, s.payableBalance - amount) } : s
      ),
    }));
  };

  const addPurchaseRecord = (purData: Omit<PurchaseRecord, 'id' | 'shopId'>): PurchaseRecord => {
    const newId = `pur-${Date.now()}`;
    const newPur: PurchaseRecord = {
      ...purData,
      id: newId,
      shopId: currentShopId,
    };
    setPurchasesMap((prev) => ({
      ...prev,
      [currentShopId]: [newPur, ...(prev[currentShopId] || [])],
    }));

    // Update supplier balance if unpaid
    if (purData.supplierId && purData.paymentStatus !== 'Paid') {
      const unpaidAmount =
        purData.paymentStatus === 'Partial' ? purData.totalAmount / 2 : purData.totalAmount;
      setSuppliersMap((prev) => ({
        ...prev,
        [currentShopId]: (prev[currentShopId] || []).map((s) =>
          s.id === purData.supplierId
            ? {
                ...s,
                payableBalance: s.payableBalance + unpaidAmount,
                totalPurchased: s.totalPurchased + purData.totalAmount,
              }
            : s
        ),
      }));
    }

    return newPur;
  };

  const addExpense = (expData: Omit<Expense, 'id' | 'shopId'>): Expense => {
    const newId = `exp-${Date.now()}`;
    const newExp: Expense = {
      ...expData,
      id: newId,
      shopId: currentShopId,
    };
    setExpensesMap((prev) => ({
      ...prev,
      [currentShopId]: [newExp, ...(prev[currentShopId] || [])],
    }));
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpensesMap((prev) => ({
      ...prev,
      [currentShopId]: (prev[currentShopId] || []).filter((e) => e.id !== id),
    }));
  };

  const resetAllToDemoData = () => {
    setShops(INITIAL_SHOPS);
    setCurrentShopId('shop-pharma-1');
    setProductsMap(INITIAL_PRODUCTS);
    setCustomersMap(INITIAL_CUSTOMERS);
    setSuppliersMap(INITIAL_SUPPLIERS);
    setInvoicesMap(INITIAL_INVOICES);
    setPurchasesMap(INITIAL_PURCHASES);
    setExpensesMap(INITIAL_EXPENSES);
    setTransactionsMap(INITIAL_CUSTOMER_TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.SHOPS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SHOP_ID);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PURCHASES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  };

  // Metrics calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7); // e.g. "2026-10"

  const todaySales = invoices
    .filter((inv) => inv.invoiceDate === todayStr)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const monthSales = invoices
    .filter((inv) => inv.invoiceDate.startsWith(currentMonthStr))
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalReceivable = customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0);
  const totalPayable = suppliers.reduce((sum, s) => sum + Math.max(0, s.payableBalance), 0);

  // Profit calculations for current month
  // Revenue = monthSales
  // Cost of Goods Sold (estimated at ~78% of sales or derived from purchase prices)
  const monthExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const estimatedCOGS = monthSales * 0.78;
  const grossProfit = Math.max(0, monthSales - estimatedCOGS);
  const netProfit = grossProfit - monthExpenses;

  const lowStockItems = products.filter((p) => p.currentStock <= p.minStockAlert);

  return (
    <ShopContext.Provider
      value={{
        language,
        setLanguage,
        shops,
        currentShop,
        currentShopId,
        switchShop,
        registerNewShop,
        updateShopProfile,
        upgradeSubscription,
        products,
        customers,
        suppliers,
        invoices,
        purchases,
        expenses,
        customerTransactions,
        createInvoice,
        deleteInvoice,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        recordCustomerPayment,
        addSupplier,
        recordSupplierPayment,
        addPurchaseRecord,
        addExpense,
        deleteExpense,
        resetAllToDemoData,
        todaySales,
        monthSales,
        totalReceivable,
        totalPayable,
        grossProfit,
        netProfit,
        lowStockItems,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
