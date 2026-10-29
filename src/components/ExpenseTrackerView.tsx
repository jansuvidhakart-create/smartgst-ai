import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { Expense, ExpenseCategory, PaymentMode } from '../types';
import { formatINR } from '../utils/gstUtils';
import {
  Wallet,
  Plus,
  Trash2,
  X,
  PieChart,
  Tag,
  Calendar
} from 'lucide-react';

export const ExpenseTrackerView: React.FC = () => {
  const { language, expenses, addExpense, deleteExpense } = useShop();
  const { t } = useTranslation(language);

  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Shop Rent');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [paidTo, setPaidTo] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Total expenses
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    addExpense({
      date,
      category,
      description: description.trim(),
      amount: Number(amount),
      paymentMode,
      paidTo: paidTo.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
    });

    setShowAddModal(false);
    setDescription('');
    setAmount(0);
    setPaidTo('');
    setReceiptNumber('');
  };

  const categoriesList: ExpenseCategory[] = [
    'Shop Rent',
    'Electricity & Utilities',
    'Staff Salary & Wages',
    'Transport & Freight',
    'Packaging & Bags',
    'Tea & Refreshments',
    'Repairs & Maintenance',
    'Marketing & Printing',
    'Miscellaneous',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {t('expenseTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total Recorded Expenses: <strong className="font-mono text-slate-900">{formatINR(totalExpense)}</strong> · Essential for accurate Net Profit calculation
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addExpense')}</span>
        </button>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(categoryTotals).map(([cat, val]) => (
          <div key={cat} className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <div className="text-[11px] text-slate-500 truncate font-medium">{cat}</div>
            <div className="text-base font-bold font-mono text-slate-900 mt-1">
              {formatINR(val)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {Math.round((val / (totalExpense || 1)) * 100)}% of total
            </div>
          </div>
        ))}
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Paid To</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No expenses recorded yet. Click "Add Shop Expense" above.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-600">{exp.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{exp.category}</td>
                    <td className="py-2.5 px-3 text-slate-700">{exp.description}</td>
                    <td className="py-2.5 px-3 text-slate-600">{exp.paidTo || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-medium">{exp.paymentMode}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete expense "${exp.description}"?`)) {
                            deleteExpense(exp.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <span className="font-bold text-sm">{t('addExpense')}</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full font-mono border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    {categoriesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Description / Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October Shop Rent to Suresh Kumar"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full font-mono font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    Paid To / Vendor Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BSES Electricity / Landlord"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
