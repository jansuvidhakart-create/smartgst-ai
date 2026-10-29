import React, { useState } from 'react';
import { Invoice, ShopProfile } from '../types';
import { formatINR, convertNumberToIndianWords } from '../utils/gstUtils';
import { Printer, Download, X, Smartphone, FileText, CheckCircle2, Pill, Stethoscope } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  shop: ShopProfile;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  shop,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPaymentLink = () => {
    const upiLink = `upi://pay?pa=${encodeURIComponent(shop.upiVpa || 'merchant@upi')}&pn=${encodeURIComponent(shop.name)}&am=${invoice.balanceDue > 0 ? invoice.balanceDue : invoice.grandTotal}&cu=INR`;
    navigator.clipboard.writeText(upiLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header toolbar (Hidden during window.print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Medical Bill #{invoice.invoiceNumber}</span>
            <span className="text-xs text-slate-400">· Form 20B/21B Compliant Preview</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle: A4 vs Thermal 80mm */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setPrintFormat('a4')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  printFormat === 'a4' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Tax Bill</span>
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                  printFormat === 'thermal' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>80mm Thermal Slip</span>
              </button>
            </div>

            <button
              onClick={() => {
                import('../utils/pdfGenerator').then(({ downloadInvoiceAsPdf }) => {
                  downloadInvoiceAsPdf(invoice, shop);
                });
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Download formatted invoice file"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {printFormat === 'thermal' ? 'Slip' : 'Bill'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          {printFormat === 'a4' ? (
            /* STANDARD A4 MEDICAL PHARMACY TAX INVOICE */
            <div className="print-page-wrapper bg-white w-full max-w-[800px] border border-slate-200 shadow-sm p-6 sm:p-8 text-slate-900 text-xs font-sans">
              {/* Top Banner */}
              <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-3 mb-3">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-emerald-900 uppercase">
                    {shop.name}
                  </h1>
                  {shop.hindiName && (
                    <div className="text-xs text-slate-600 font-medium">{shop.hindiName}</div>
                  )}
                  <p className="text-slate-600 mt-1 max-w-sm">
                    {shop.address}, {shop.city}, {shop.state} - {shop.pincode}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-slate-700 font-medium">
                    <span>Phone: <strong>{shop.phone}</strong></span>
                    <span>GSTIN: <strong className="font-mono text-slate-900">{shop.gstin}</strong></span>
                    <span>State Code: {shop.stateCode}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-emerald-800 text-white font-bold text-xs uppercase px-3 py-1 tracking-wider mb-1 rounded">
                    RETAIL DRUG TAX INVOICE
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Form 20/21 Drugs & Cosmetics Rule
                  </div>
                  <div className="mt-2 space-y-0.5 text-slate-700">
                    <div>
                      Bill No: <span className="font-bold font-mono text-slate-900">{invoice.invoiceNumber}</span>
                    </div>
                    <div>
                      Date: <span className="font-semibold">{invoice.invoiceDate}</span>
                    </div>
                    <div>
                      Place of Supply: <span className="font-semibold">{invoice.placeOfSupply}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drug Licenses Strip */}
              <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-1.5 mb-3 text-[11px] text-emerald-900 flex justify-between">
                <div><strong>D.L. No. (20B):</strong> {shop.dlNumber20B} · <strong>(21B):</strong> {shop.dlNumber21B}</div>
                <div><strong>Regd. Pharmacist:</strong> {shop.registeredPharmacist} {shop.fssaiNumber ? `· FSSAI: ${shop.fssaiNumber}` : ''}</div>
              </div>

              {/* Patient & Doctor Section */}
              <div className="grid grid-cols-2 gap-4 border border-slate-200 p-3 mb-4 bg-slate-50/50 rounded-lg">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Patient / Customer (Billed To):
                  </div>
                  <div className="font-bold text-sm text-slate-900">
                    {invoice.patientName || invoice.customerName}
                    {invoice.patientAge && <span className="text-xs text-slate-500 font-normal"> ({invoice.patientAge}y {invoice.patientGender || ''})</span>}
                  </div>
                  <div className="text-slate-600">Contact: {invoice.customerPhone}</div>
                  {invoice.customerAddress && (
                    <div className="text-slate-600">{invoice.customerAddress}</div>
                  )}
                  {invoice.customerGstin && (
                    <div className="text-slate-700 mt-0.5">
                      Buyer GSTIN: <strong className="font-mono">{invoice.customerGstin}</strong>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Doctor & Tax Information:
                  </div>
                  <div>
                    Doctor: <strong>{invoice.doctorName || 'Dr. Consulted / OTC'}</strong> {invoice.doctorRegNo ? `(Reg: ${invoice.doctorRegNo})` : ''}
                  </div>
                  <div>Supply Type: <strong>{invoice.isInterState ? 'Inter-State (IGST 12%)' : 'Intra-State (CGST 6% + SGST 6%)'}</strong></div>
                  <div>Payment Mode: <strong className="capitalize">{invoice.paymentMode}</strong></div>
                  {invoice.hasPrescription && (
                    <div className="text-emerald-700 font-semibold text-[10px] mt-0.5">
                      ✓ Prescription Verified on Record
                    </div>
                  )}
                </div>
              </div>

              {/* Medicines Table */}
              <div className="border border-slate-200 mb-4 overflow-x-auto rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2">Medicine Name & Salt Composition</th>
                      <th className="py-2 px-2 text-center font-mono">Batch #</th>
                      <th className="py-2 px-2 text-center font-mono">Expiry</th>
                      <th className="py-2 px-2 text-center">HSN</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-2 text-right">MRP (₹)</th>
                      <th className="py-2 px-2 text-right">Rate (₹)</th>
                      <th className="py-2 px-2 text-right">Taxable (₹)</th>
                      {!invoice.isInterState ? (
                        <>
                          <th className="py-2 px-2 text-right">CGST</th>
                          <th className="py-2 px-2 text-right">SGST</th>
                        </>
                      ) : (
                        <th className="py-2 px-2 text-right">IGST</th>
                      )}
                      <th className="py-2 px-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id} className="text-slate-800">
                        <td className="py-2 px-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <div className="font-bold text-slate-900">
                            {item.name} {item.requiresPrescription && <span className="text-rose-600 text-[10px]">[Rx]</span>}
                          </div>
                          {item.saltComposition && (
                            <div className="text-[10px] text-slate-500 italic max-w-xs truncate">
                              {item.saltComposition}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold">{item.batchNumber}</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-700">{item.expiryDate}</td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600">{item.hsn}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-500">₹{item.mrp.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-mono">₹{item.taxableAmount.toFixed(2)}</td>
                        {!invoice.isInterState ? (
                          <>
                            <td className="py-2 px-2 text-right font-mono text-[11px]">
                              ₹{item.cgstAmount.toFixed(2)} <span className="text-slate-400">({item.gstRate / 2}%)</span>
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-[11px]">
                              ₹{item.sgstAmount.toFixed(2)} <span className="text-slate-400">({item.gstRate / 2}%)</span>
                            </td>
                          </>
                        ) : (
                          <td className="py-2 px-2 text-right font-mono text-[11px]">
                            ₹{item.igstAmount.toFixed(2)} <span className="text-slate-400">({item.gstRate}%)</span>
                          </td>
                        )}
                        <td className="py-2 px-2 text-right font-mono font-black text-slate-900">
                          ₹{item.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Calculations Breakdown */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 mb-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Invoice Amount in Words:
                  </div>
                  <div className="font-semibold text-slate-900 italic">
                    {convertNumberToIndianWords(invoice.grandTotal)}
                  </div>

                  {invoice.notes && (
                    <div className="mt-2 text-[11px] text-slate-600">
                      <strong>Dosage Instructions:</strong> {invoice.notes}
                    </div>
                  )}

                  {/* Bank and UPI Details Box */}
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>UPI & Bank Settlement</span>
                      <button
                        onClick={handleCopyPaymentLink}
                        className="no-print text-[10px] text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
                      >
                        {copiedLink ? 'Copied!' : 'Copy UPI Link'}
                      </button>
                    </div>
                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <div>UPI VPA: <strong className="font-mono text-emerald-800">{shop.upiVpa}</strong></div>
                      <div>Bank: <strong className="text-slate-800">{shop.bankName}</strong> · A/C: <span className="font-mono">{shop.accountNumber}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-right font-mono text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans">Total Taxable Value:</span>
                    <span className="font-semibold">{formatINR(invoice.subtotalTaxable)}</span>
                  </div>
                  {!invoice.isInterState ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                        <span className="font-sans">Central GST (CGST 6%):</span>
                        <span>{formatINR(invoice.totalCgst)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                        <span className="font-sans">State GST (SGST 6%):</span>
                        <span>{formatINR(invoice.totalSgst)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span className="font-sans">Integrated GST (IGST 12%):</span>
                      <span>{formatINR(invoice.totalIgst)}</span>
                    </div>
                  )}
                  {invoice.roundOff !== 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500 text-[11px]">
                      <span className="font-sans">Round Off:</span>
                      <span>{invoice.roundOff > 0 ? `+₹${invoice.roundOff.toFixed(2)}` : `-₹${Math.abs(invoice.roundOff).toFixed(2)}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold text-slate-900">
                    <span className="font-sans">NET AMOUNT PAYABLE:</span>
                    <span className="text-emerald-700 text-base font-black">{formatINR(invoice.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span className="font-sans">Amount Paid:</span>
                    <span>{formatINR(invoice.amountPaid)}</span>
                  </div>
                  {invoice.balanceDue > 0 && (
                    <div className="flex justify-between py-1 text-rose-700 font-bold bg-rose-50 px-2 rounded">
                      <span className="font-sans">Balance Due (Khata):</span>
                      <span>{formatINR(invoice.balanceDue)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Pharmacist Stamp */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3 mt-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Pharmacy Terms & Disclaimer:
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {shop.termsAndConditions}
                  </p>
                </div>

                <div className="text-right flex flex-col justify-end items-end">
                  <div className="text-xs font-bold text-slate-900 mb-8">
                    For {shop.name}
                  </div>
                  <div className="border-t border-slate-400 pt-1 text-[10px] text-slate-600 w-48 text-center">
                    Registered Pharmacist Signature
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* THERMAL POS 80MM (3-INCH) COMPACT MEDICAL RECEIPT */
            <div className="print-page-wrapper bg-white w-full max-w-[340px] border border-slate-300 shadow-sm p-4 text-slate-900 text-[11px] font-mono leading-tight">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <div className="font-bold text-sm uppercase">{shop.name}</div>
                <div className="text-[10px] text-slate-600">{shop.address}, {shop.city}</div>
                <div className="text-[10px]">Ph: {shop.phone} · GST: {shop.gstin}</div>
                <div className="text-[9px] mt-0.5 font-semibold text-emerald-800">
                  DL: {shop.dlNumber20B}
                </div>
                <div className="text-xs font-bold mt-1 bg-slate-100 py-0.5">
                  RETAIL PHARMACY CASH MEMO
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
                <div>Bill No: <strong>{invoice.invoiceNumber}</strong></div>
                <div>Date: {invoice.invoiceDate}</div>
                <div>Patient: <strong>{invoice.patientName || invoice.customerName}</strong></div>
                <div>Contact: {invoice.customerPhone}</div>
                {invoice.doctorName && <div>Doctor: <strong>{invoice.doctorName}</strong></div>}
              </div>

              {/* Items */}
              <div className="py-2 border-b border-dashed border-slate-400">
                <div className="flex justify-between font-bold text-[10px] border-b border-slate-200 pb-1 mb-1">
                  <span>MEDICINE</span>
                  <span>QTY x RATE</span>
                  <span>AMT</span>
                </div>
                {invoice.items.map((item) => (
                  <div key={item.id} className="mb-1.5 text-[10px]">
                    <div className="font-bold truncate">{item.name}</div>
                    <div className="text-[9px] text-slate-500">
                      B: {item.batchNumber} · Exp: {item.expiryDate}
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{item.quantity} {item.unit} x ₹{item.unitPrice}</span>
                      <span className="font-bold text-slate-900">₹{item.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Taxable Value:</span>
                  <span>₹{invoice.subtotalTaxable.toFixed(2)}</span>
                </div>
                {!invoice.isInterState ? (
                  <>
                    <div className="flex justify-between">
                      <span>CGST (6%):</span>
                      <span>₹{invoice.totalCgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (6%):</span>
                      <span>₹{invoice.totalSgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>IGST (12%):</span>
                    <span>₹{invoice.totalIgst.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                  <span>NET TOTAL:</span>
                  <span>₹{invoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid ({invoice.paymentMode}):</span>
                  <span>₹{invoice.amountPaid.toFixed(2)}</span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between font-bold text-rose-700">
                    <span>Balance Due (Khata):</span>
                    <span>₹{invoice.balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* UPI QR & Footer */}
              <div className="text-center pt-2">
                <div className="text-[10px] font-bold mb-1">Scan to Pay UPI:</div>
                <div className="bg-slate-100 p-1.5 inline-block rounded border border-slate-300 mb-1 text-[9px] font-mono break-all">
                  {shop.upiVpa}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">
                  Pharmacist: {shop.registeredPharmacist}
                </div>
                <div className="text-[9px] text-slate-400">Medicines once sold non-returnable. Wish you good health!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
