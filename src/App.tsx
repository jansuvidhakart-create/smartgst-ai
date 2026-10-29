import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { InvoicesListView } from './components/InvoicesListView';
import { InventoryView } from './components/InventoryView';
import { CustomerKhataView } from './components/CustomerKhataView';
import { SupplierPurchaseView } from './components/SupplierPurchaseView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { AccountingReportsView } from './components/AccountingReportsView';
import { AIAssistantView } from './components/AIAssistantView';
import { SubscriptionPlansView } from './components/SubscriptionPlansView';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { StoreProfileModal } from './components/StoreProfileModal';
import { RegisterShopModal } from './components/RegisterShopModal';
import { Invoice } from './types';

const MainAppContent: React.FC = () => {
  const { currentShop } = useShop();

  const [activeTab, setActiveTab] = useState<NavTab>('invoices');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [showRegisterShop, setShowRegisterShop] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Keyboard shortcut: F2 to trigger New Bill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('new-invoice');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInvoiceCreated = (invoice: Invoice) => {
    // Open print preview immediately after invoice generation
    setPrintingInvoice(invoice);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navbar
        onOpenNewBill={() => setActiveTab('new-invoice')}
        onOpenStoreSettings={() => setShowStoreSettings(true)}
        onOpenRegisterShop={() => setShowRegisterShop(true)}
        onOpenUpgrade={() => setActiveTab('subscriptions')}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewInvoice={(inv) => setPrintingInvoice(inv)}
            />
          )}

          {activeTab === 'new-invoice' && (
            <InvoiceGenerator onInvoiceCreated={handleInvoiceCreated} />
          )}

          {activeTab === 'invoices' && (
            <InvoicesListView
              onViewInvoice={(inv) => setPrintingInvoice(inv)}
              onNewBill={() => setActiveTab('new-invoice')}
            />
          )}

          {activeTab === 'inventory' && <InventoryView />}

          {activeTab === 'customers' && <CustomerKhataView />}

          {activeTab === 'suppliers' && <SupplierPurchaseView />}

          {activeTab === 'expenses' && <ExpenseTrackerView />}

          {activeTab === 'reports' && <AccountingReportsView />}

          {activeTab === 'ai-assistant' && <AIAssistantView />}

          {activeTab === 'subscriptions' && <SubscriptionPlansView />}
        </main>
      </div>

      {/* Invoice Print & Download Modal */}
      {printingInvoice && (
        <InvoicePrintModal
          invoice={printingInvoice}
          shop={currentShop}
          onClose={() => setPrintingInvoice(null)}
        />
      )}

      {/* Store Profile Settings Modal */}
      {showStoreSettings && (
        <StoreProfileModal onClose={() => setShowStoreSettings(false)} />
      )}

      {/* Register New Shop Modal */}
      {showRegisterShop && (
        <RegisterShopModal onClose={() => setShowRegisterShop(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <MainAppContent />
    </ShopProvider>
  );
}
