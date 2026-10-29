import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { Customer, PaymentMode } from '../types';
import { formatINR, INDIAN_STATES } from '../utils/gstUtils';
import {
  Users,
  Search,
  Plus,
  Send,
  CreditCard,
  History,
  X,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CustomerKhataView: React.FC = () => {
  const {
    language,
    currentShop,
    customers,
    customerTransactions,
    addCustomer,
    recordCustomerPayment,
    totalReceivable,
  } = useShop();
  const { t } = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<Customer | null>(null);
  const [historyModalCustomer, setHistoryModalCustomer] = useState<Customer | null>(null);
  const [whatsappReminderCustomer, setWhatsappReminderCustomer] = useState<Customer | null>(null);

  // New Customer Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custStateCode, setCustStateCode] = useState(currentShop.stateCode);
  const [custCreditLimit, setCustCreditLimit] = useState(10000);
  const [custOpeningBalance, setCustOpeningBalance] = useState(0);

  // Payment Received Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<PaymentMode>('UPI');
  const [payNotes, setPayNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    const stateObj = INDIAN_STATES.find((s) => s.code === custStateCode);
    addCustomer({
      name: custName.trim(),
      phone: custPhone.trim() || 'NA',
      gstin: custGstin.trim().toUpperCase() || undefined,
      address: custAddress.trim() || undefined,
      state: stateObj ? stateObj.name : currentShop.state,
      stateCode: custStateCode,
      creditLimit: Number(custCreditLimit) || 10000,
      currentBalance: Number(custOpeningBalance) || 0,
    });

    setShowAddModal(false);
    setCustName('');
    setCustPhone('');
    setCustGstin('');
    setCustAddress('');
    setCustOpeningBalance(0);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer || payAmount <= 0) return;

    recordCustomerPayment(
      paymentModalCustomer.id,
      Number(payAmount),
      payMode,
      payNotes.trim() || undefined
    );

    setPaymentModalCustomer(null);
    setPayAmount(0);
    setPayNotes('');
  };

  const handleSendWhatsApp = (cust: Customer) => {
    const isHi = language === 'hi';
    const textMsg = isHi
      ? `नमस्ते ${cust.name} जी, आपकी प्रिय दुकान *${currentShop.hindiName || currentShop.name}* से सादर प्रणाम। आपके खाते का कुल बकाया उधार ₹${cust.currentBalance.toLocaleString('en-IN')} है। कृपया UPI ID: ${currentShop.upiVpa} पर भुगतान करके खाता अपडेट करवा लें। धन्यवाद! - ${currentShop.ownerName} (${currentShop.phone})`
      : `Dear ${cust.name}, Greetings from *${currentShop.name}*. This is a gentle reminder that your ledger balance of ₹${cust.currentBalance.toLocaleString('en-IN')} is pending. You can pay via UPI: ${currentShop.upiVpa}. Thank you! - ${currentShop.ownerName} (${currentShop.phone})`;

    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}&text=${encodeURIComponent(textMsg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Patients & Chronic Khata Ledger
            </h1>
            <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Patient Data Confidential
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total Patient Udhaar: <strong className="font-mono text-rose-600 text-sm">{formatINR(totalReceivable)}</strong> across {customers.length} registered patients · Track chronic medication refills & credit
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={t('searchCustomer')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
          />
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Patient / Customer</th>
                <th className="py-2.5 px-3">Contact & GSTIN</th>
                <th className="py-2.5 px-3">State / City</th>
                <th className="py-2.5 px-3 text-right">Credit Limit</th>
                <th className="py-2.5 px-3 text-right">Current Udhaar</th>
                <th className="py-2.5 px-3 text-center">Last Active</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No patients found matching search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const hasUdhaar = c.currentBalance > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.notes && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1 rounded font-medium">
                              Rx Patient
                            </span>
                          )}
                        </div>
                        {c.notes && (
                          <div className="text-[10px] text-emerald-700 italic">
                            {c.notes}
                          </div>
                        )}
                        {c.address && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {c.address}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono text-slate-700">{c.phone}</div>
                        {c.gstin && (
                          <div className="text-[10px] font-mono text-slate-400 font-semibold">
                            GST: {c.gstin}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {c.state} ({c.stateCode})
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatINR(c.creditLimit, false)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            hasUdhaar ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded' : 'text-slate-400'
                          }`}
                        >
                          {formatINR(c.currentBalance)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                        {c.lastTransactionDate}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {hasUdhaar && (
                            <button
                              onClick={() => handleSendWhatsApp(c)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1"
                              title="Send WhatsApp Reminder"
                            >
                              <Send className="w-3 h-3 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setPaymentModalCustomer(c);
                              setPayAmount(c.currentBalance > 0 ? c.currentBalance : 0);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1"
                            title="Record Payment Received"
                          >
                            <CreditCard className="w-3 h-3 text-slate-500" />
                            <span>Collect</span>
                          </button>

                          <button
                            onClick={() => setHistoryModalCustomer(c)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="View Khata Transactions"
                          >
                            <History className="w-3.5 h-3.5" />
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

      {/* Record Payment Modal */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm">Record Payment Received</span>
                <div className="text-[11px] text-slate-400">
                  {paymentModalCustomer.name} (Balance: {formatINR(paymentModalCustomer.currentBalance)})
                </div>
              </div>
              <button
                onClick={() => setPaymentModalCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono text-base font-bold text-slate-900 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as PaymentMode)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Payment Reference / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via PhonePe / GPay txn #..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalCustomer(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Khata Ledger History Modal */}
      {historyModalCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm">Customer Ledger (खाता बही)</span>
                <div className="text-[11px] text-slate-400">
                  {historyModalCustomer.name} · Outstanding: {formatINR(historyModalCustomer.currentBalance)}
                </div>
              </div>
              <button
                onClick={() => setHistoryModalCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Transaction</th>
                      <th className="py-2 px-3 text-right">Debit (You Gave)</th>
                      <th className="py-2 px-3 text-right">Credit (You Got)</th>
                      <th className="py-2 px-3 text-right">Balance Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerTransactions
                      .filter((tx) => tx.customerId === historyModalCustomer.id)
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-500 font-mono">{tx.date}</td>
                          <td className="py-2 px-3">
                            <span className="font-medium text-slate-900">{tx.type}</span>
                            {tx.invoiceNumber && (
                              <div className="text-[10px] font-mono text-slate-400">
                                {tx.invoiceNumber}
                              </div>
                            )}
                            {tx.notes && (
                              <div className="text-[10px] text-slate-500">{tx.notes}</div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-rose-600 font-semibold">
                            {tx.type === 'BILL' || tx.type === 'OPENING_BALANCE'
                              ? formatINR(tx.amount)
                              : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700 font-semibold">
                            {tx.type === 'PAYMENT_RECEIVED' ? formatINR(tx.amount) : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {formatINR(tx.balanceAfter)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">{t('addNewCustomer')}</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Customer / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Sharma Ji Caterers"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Phone (for WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 98123 45678"
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    GSTIN (Optional B2B)
                  </label>
                  <input
                    type="text"
                    value={custGstin}
                    onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
                    placeholder="07AAAAA0000A1Z5"
                    className="w-full font-mono uppercase border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Address</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Shop/House no, Area, City"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">State of Supply</label>
                  <select
                    value={custStateCode}
                    onChange={(e) => setCustStateCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={custCreditLimit}
                    onChange={(e) => setCustCreditLimit(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Opening Balance (Old Udhaar if any) (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={custOpeningBalance}
                    onChange={(e) => setCustOpeningBalance(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
