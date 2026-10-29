import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { INDIAN_STATES } from '../utils/gstUtils';
import { BusinessCategory } from '../types';
import { X, Plus, Store } from 'lucide-react';

interface RegisterShopModalProps {
  onClose: () => void;
}

export const RegisterShopModal: React.FC<RegisterShopModalProps> = ({ onClose }) => {
  const { language, registerNewShop } = useShop();
  const { t } = useTranslation(language);

  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('Pharmacy & Medical');
  const [dlNumber20B, setDlNumber20B] = useState('DL-20B/9981/WZ');
  const [dlNumber21B, setDlNumber21B] = useState('DL-21B/9982/WZ');
  const [registeredPharmacist, setRegisteredPharmacist] = useState('');
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [stateCode, setStateCode] = useState('07');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [upiVpa, setUpiVpa] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('MED');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim()) return;

    const stateObj = INDIAN_STATES.find((s) => s.code === stateCode);

    registerNewShop({
      name: name.trim(),
      hindiName: hindiName.trim() || undefined,
      ownerName: ownerName.trim(),
      category,
      dlNumber20B: dlNumber20B.trim().toUpperCase() || 'DL-20B/TEMP',
      dlNumber21B: dlNumber21B.trim().toUpperCase() || 'DL-21B/TEMP',
      registeredPharmacist: registeredPharmacist.trim() || `${ownerName} (B.Pharm)`,
      fssaiNumber: fssaiNumber.trim() || undefined,
      gstin: gstin.trim().toUpperCase() || 'UNREGISTERED',
      pan: pan.trim().toUpperCase() || 'NOT_PROVIDED',
      state: stateObj ? stateObj.name : 'Delhi',
      stateCode,
      address: address.trim() || 'Main Market',
      city: city.trim() || 'New Delhi',
      pincode: pincode.trim() || '110001',
      phone: phone.trim() || '+91 98000 00000',
      email: email.trim() || 'pharmacy@gmail.com',
      upiVpa: upiVpa.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@upi`,
      bankName: bankName.trim() || 'State Bank of India',
      accountNumber: accountNumber.trim() || '1234567890',
      ifsc: ifsc.trim().toUpperCase() || 'SBIN0001234',
      invoicePrefix: invoicePrefix.trim().toUpperCase() || 'MED',
      subscriptionPlan: 'business',
      termsAndConditions: '1. Medicines once sold will not be returned without cash memo. 2. Prescription required for Schedule H/H1 drugs.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">{t('registerNewShop')}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRegister} className="p-4 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <p className="text-slate-500">
            Create an independent store account with separate private inventory, khata, and invoice records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Balaji Supermarket & Provisions"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!invoicePrefix || invoicePrefix === 'INV') {
                    const initials = e.target.value
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 4);
                    if (initials) setInvoicePrefix(initials);
                  }
                }}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Proprietor Name *</label>
              <input
                type="text"
                required
                placeholder="Owner / Partner name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Trade Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Pharmacy & Medical">Pharmacy & Medical</option>
                <option value="Kirana & Grocery">Kirana & Grocery</option>
                <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                <option value="Textile & Garments">Textile & Garments</option>
                <option value="Hardware & Sanitary">Hardware & Sanitary</option>
                <option value="General Retail">General Retail</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Drug License (Form 20B) *</label>
              <input
                type="text"
                placeholder="e.g. DL-20B/1234/WZ"
                value={dlNumber20B}
                onChange={(e) => setDlNumber20B(e.target.value.toUpperCase())}
                className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Drug License (Form 21B) *</label>
              <input
                type="text"
                placeholder="e.g. DL-21B/1235/WZ"
                value={dlNumber21B}
                onChange={(e) => setDlNumber21B(e.target.value.toUpperCase())}
                className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">Registered Pharmacist & Reg No. *</label>
              <input
                type="text"
                placeholder="e.g. Rajesh K. Sharma, B.Pharm (DPC-48192)"
                value={registeredPharmacist}
                onChange={(e) => setRegisteredPharmacist(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">State Code *</label>
              <select
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full font-mono border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">GSTIN (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 07AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                placeholder="e.g. BSM"
                className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-medium mb-1">UPI ID for Payments</label>
              <input
                type="text"
                value={upiVpa}
                onChange={(e) => setUpiVpa(e.target.value)}
                placeholder="e.g. storename@okhdfcbank"
                className="w-full font-mono border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-900 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Store</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
