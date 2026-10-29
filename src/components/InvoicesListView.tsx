import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { Invoice } from '../types';
import { formatINR } from '../utils/gstUtils';
import { downloadInvoiceAsPdf } from '../utils/pdfGenerator';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceFormCard } from './InvoiceFormCard';
import {
  FileText,
  Search,
  Printer,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Info,
  CheckCircle2
} from 'lucide-react';

interface InvoicesListViewProps {
  onViewInvoice: (inv: Invoice) => void;
  onNewBill: () => void;
}

export const InvoicesListView: React.FC<InvoicesListViewProps> = ({
  onViewInvoice,
  onNewBill,
}) => {
  const { language, currentShop, invoices, deleteInvoice } = useShop();
  const { t } = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Paid' | 'Unpaid' | 'Partial'>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalFilteredSales = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const handleInvoiceSaved = (newInvoice: Invoice, shouldPrint?: boolean) => {
    setSuccessNotice(`Demo Invoice #${newInvoice.invoiceNumber} created and added to the table below!`);
    setTimeout(() => setSuccessNotice(null), 5000);

    if (shouldPrint) {
      onViewInvoice(newInvoice);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with clearly visible green "+ Create New Medical Bill" button IMMEDIATELY BESIDE the heading */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900" id="sales-invoices-heading">
            Sales & Invoices
          </h1>

          {/* Visible Green "+ Create New Medical Bill" Button Immediately Beside Heading */}
          <button
            id="create-new-invoice-btn"
            data-testid="create-new-invoice-button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-green-600/30 shrink-0"
            title="Create a new Medical Bill / GST Tax Invoice"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Create New Invoice</span>
          </button>

          {/* Form 20B/21B Compliant Badge */}
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>DL Form 20B/21B Compliant</span>
          </span>

          {/* Clear Demo Label */}
          <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Demo Mode</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-1.5">
          {currentShop.name} · DL No: <strong className="font-mono text-slate-800">{currentShop.dlNumber20B}</strong> · Total Bills: <strong>{invoices.length}</strong> · Total Pharmacy Sales: <strong className="font-mono text-slate-900">{formatINR(totalFilteredSales)}</strong> · <span className="text-slate-400">Demo sandbox data stored locally in your browser.</span>
        </p>
      </div>

      {/* Inline Invoice Creation Form Card */}
      {showCreateForm && (
        <div id="invoice-creation-form-container" className="scroll-mt-24">
          <InvoiceFormCard
            onClose={() => setShowCreateForm(false)}
            onInvoiceCreated={(newInv, shouldPrint) => {
              setShowCreateForm(false);
              handleInvoiceSaved(newInv, shouldPrint);
            }}
          />
        </div>
      )}

      {/* Success Notification after Invoice Creation */}
      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Demo Notice Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Local Demo Store:</strong> You are viewing sample invoices for <em>{currentShop.name}</em>. Invoices created here are saved to your browser session. Cloud backend and live GST portal filing are in preview mode.
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Invoice # or Customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
          />
        </div>

        {/* Status segmented filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          {(['ALL', 'Paid', 'Partial', 'Unpaid'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status === 'ALL' ? 'All Invoices' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer Details</th>
                <th className="py-2.5 px-3">Tax Type</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">Total GST</th>
                <th className="py-2.5 px-3 text-right">Grand Total</th>
                <th className="py-2.5 px-3 text-right">Balance Due</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    <p className="mb-3 text-slate-500 font-medium">
                      No invoices found. Click "+ Create New Invoice" beside the heading to generate a new GST bill.
                    </p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Create New Invoice</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <div>{inv.invoiceNumber}</div>
                      <span className="text-[9px] uppercase font-semibold text-slate-400">Demo Invoice</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono">{inv.invoiceDate}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{inv.patientName || inv.customerName}</span>
                        {inv.hasPrescription && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded font-bold">
                            Rx
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {inv.customerPhone} {inv.doctorName ? `· Dr: ${inv.doctorName}` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                        {inv.items.map(i => `${i.name} (B:${i.batchNumber})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {inv.isInterState ? (
                        <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          IGST (Inter-state)
                        </span>
                      ) : (
                        <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                          CGST+SGST (Intra-state)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatINR(inv.subtotalTaxable)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatINR(inv.totalTax)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                          {formatINR(inv.balanceDue)}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0.00</span>
                      )}
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
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Print Invoice */}
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          title="View / Print Tax Invoice"
                        >
                          <Printer className="w-3 h-3 text-slate-500" />
                          <span>Print</span>
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => downloadInvoiceAsPdf(inv, currentShop)}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-3 h-3 text-emerald-600" />
                          <span>PDF</span>
                        </button>

                        {/* Delete Invoice */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete demo invoice ${inv.invoiceNumber}?`)) {
                              deleteInvoice(inv.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal Form */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onInvoiceSaved={handleInvoiceSaved}
        />
      )}
    </div>
  );
};
