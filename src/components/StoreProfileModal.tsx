import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n/translations';
import { INDIAN_STATES } from '../utils/gstUtils';
import { BusinessCategory } from '../types';
import { X, Save, Store, Building, CreditCard } from 'lucide-react';

interface StoreProfileModalProps {
  onClose: () => void;
}

export const StoreProfileModal: React.FC<StoreProfileModalProps> = ({ onClose }) => {
  const { language, currentShop, updateShopProfile } = useShop();
  const { t } = useTranslation(language);

  const [name, setName] = useState(currentShop.name);
  const [hindiName, setHindiName] = useState(currentShop.hindiName || '');
  const [ownerName, setOwnerName] = useState(currentShop.ownerName);
  const [category, setCategory] = useState<BusinessCategory>(currentShop.category);
  const [gstin, setGstin] = useState(currentShop.gstin);
  const [pan, setPan] = useState(currentShop.pan);
  const [stateCode, setStateCode] = useState(currentShop.stateCode);
  const [address, setAddress] = useState(currentShop.address);
  const [city, setCity] = useState(currentShop.city);
  const [pincode, setPincode] = useState(currentShop.pincode);
  const [phone, setPhone] = useState(currentShop.phone);
  const [email, setEmail] = useState(currentShop.email);
  const [upiVpa, setUpiVpa] = useState(currentShop.upiVpa);
  const [bankName, setBankName] = useState(currentShop.bankName);
  const [accountNumber, setAccountNumber] = useState(currentShop.accountNumber);
  const [ifsc, setIfsc] = useState(currentShop.ifsc);
  const [invoicePrefix, setInvoicePrefix] = useState(currentShop.invoicePrefix);
  const [terms, setTerms] = useState(currentShop.termsAndConditions);
  const [dlNumber20B, setDlNumber20B] = useState(currentShop.dlNumber20B || 'DL-20B/NZ-2291/2021');
  const [dlNumber21B, setDlNumber21B] = useState(currentShop.dlNumber21B || 'DL-21B/NZ-2292/2021');
  const [registeredPharmacist, setRegisteredPharmacist] = useState(currentShop.registeredPharmacist || 'Rajesh K. Sharma, Reg: DL-45901/PH');
  const [fssaiNumber, setFssaiNumber] = useState(currentShop.fssaiNumber || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const stateObj = INDIAN_STATES.find((s) => s.code === stateCode);

    updateShopProfile({
      name: name.trim(),
      hindiName: hindiName.trim() || undefined,
      ownerName: ownerName.trim(),
      category,
      gstin: gstin.trim().toUpperCase(),
      pan: pan.trim().toUpperCase(),
      state: stateObj ? stateObj.name : currentShop.state,
      stateCode,
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      email: email.trim(),
      upiVpa: upiVpa.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      invoicePrefix: invoicePrefix.trim().toUpperCase(),
      termsAndConditions: terms.trim(),
      dlNumber20B: dlNumber20B.trim(),
      dlNumber21B: dlNumber21B.trim(),
      registeredPharmacist: registeredPharmacist.trim(),
      fssaiNumber: fssaiNumber.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm">Store Profile & Tax Settings</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* General info */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">
              Store & Owner Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Store Legal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Hindi Display Name</label>
                <input
                  type="text"
                  value={hindiName}
                  onChange={(e) => setHindiName(e.target.value)}
                  placeholder="उदा. श्री गणेश किराना स्टोर"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Proprietor / Owner Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Business Trade Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  <option value="Kirana & Grocery">Kirana & Grocery</option>
                  <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                  <option value="Textile & Garments">Textile & Garments</option>
                  <option value="Hardware & Sanitary">Hardware & Sanitary</option>
                  <option value="Pharmacy & Medical">Pharmacy & Medical</option>
                  <option value="General Retail">General Retail</option>
                </select>
              </div>
            </div>
          </div>

          {/* GST & Tax Registration */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">
              GST Registration & Tax Identity
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">GSTIN (15 Digits) *</label>
                <input
                  type="text"
                  required
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">PAN Number *</label>
                <input
                  type="text"
                  required
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Store State Code *</label>
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

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Full Shop Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">City & Pincode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-1/2 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                    className="w-1/2 font-mono border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacy Licenses & Certifications */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">
              Drug Licenses & Pharmacist Registration (Drugs & Cosmetics Act)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Drug License Form 20B (Allopathic) *
                </label>
                <input
                  type="text"
                  required
                  value={dlNumber20B}
                  onChange={(e) => setDlNumber20B(e.target.value)}
                  placeholder="e.g. DL-20B/NZ-2291/2021"
                  className="w-full font-mono uppercase font-semibold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Drug License Form 21B (Schedule C/C1) *
                </label>
                <input
                  type="text"
                  required
                  value={dlNumber21B}
                  onChange={(e) => setDlNumber21B(e.target.value)}
                  placeholder="e.g. DL-21B/NZ-2292/2021"
                  className="w-full font-mono uppercase font-semibold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Registered Pharmacist Name & Reg No. *
                </label>
                <input
                  type="text"
                  required
                  value={registeredPharmacist}
                  onChange={(e) => setRegisteredPharmacist(e.target.value)}
                  placeholder="e.g. Rajesh K. Sharma, Reg: DL-45901/PH"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  FSSAI License # (Food & Supplements)
                </label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  placeholder="e.g. 13321008000412"
                  className="w-full font-mono border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment & Bank Details */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">
              Bank Details & UPI Payment QR Settings
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  UPI VPA (for QR code scan) *
                </label>
                <input
                  type="text"
                  required
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="e.g. shopname@okhdfcbank"
                  className="w-full font-mono text-emerald-800 font-semibold border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Bank Name & Branch</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full font-mono border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Invoice terms */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b pb-1">
              Invoice Customization
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. SGK"
                  className="w-full font-mono uppercase border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">
                  Invoice Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
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
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
