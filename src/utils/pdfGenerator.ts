import { Invoice, ShopProfile } from '../types';
import { formatINR, convertNumberToIndianWords } from './gstUtils';

/**
 * Generates and triggers download of a standalone, self-contained printable Pharmacy Tax Invoice
 */
export function downloadInvoiceAsPdf(invoice: Invoice, shop: ShopProfile) {
  const isInterState = invoice.isInterState;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Medical Bill - ${invoice.invoiceNumber}</title>
  <style>
    @page { size: A4; margin: 10mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; color: #0f172a; margin: 0; padding: 20px; line-height: 1.4; }
    .invoice-card { max-width: 820px; margin: 0 auto; border: 1.5px solid #0f172a; padding: 20px; box-sizing: border-box; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 12px; }
    .shop-name { font-size: 18px; font-weight: 800; text-transform: uppercase; color: #065f46; letter-spacing: -0.5px; }
    .badge { display: inline-block; background: #065f46; color: white; font-size: 9px; font-weight: bold; padding: 3px 8px; border-radius: 3px; text-transform: uppercase; }
    .license-bar { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 10px; margin-bottom: 12px; font-size: 10px; color: #065f46; display: flex; justify-content: space-between; }
    .grid { display: flex; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; margin-bottom: 12px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10px; }
    th { background: #f1f5f9; color: #1e293b; text-align: left; padding: 6px 6px; border: 1px solid #cbd5e1; font-weight: 700; }
    td { padding: 5px 6px; border: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .font-mono { font-family: monospace; }
    .totals { display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 10px; }
    .totals-box { width: 320px; font-size: 11px; }
    .totals-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f1f5f9; }
    .grand-total { font-size: 14px; font-weight: 900; color: #065f46; border-top: 2px solid #0f172a; padding: 6px 0; }
    .bank-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px; margin-top: 8px; border-radius: 4px; font-size: 10px; }
    .footer { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
    @media print {
      body { padding: 0; }
      .invoice-card { border: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="shop-name">${shop.name}</div>
        ${shop.hindiName ? `<div style="font-size: 11px; color: #475569;">${shop.hindiName}</div>` : ''}
        <div>${shop.address}, ${shop.city}, ${shop.state} - ${shop.pincode}</div>
        <div>Phone: <strong>${shop.phone}</strong> · GSTIN: <strong class="font-mono">${shop.gstin}</strong> (State: ${shop.stateCode})</div>
      </div>
      <div style="text-align: right;">
        <div class="badge">RETAIL MEDICAL TAX INVOICE (FORM 20/21)</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Original for Patient / Buyer</div>
        <div style="margin-top: 6px;">Bill No: <strong class="font-mono">${invoice.invoiceNumber}</strong></div>
        <div>Date: <strong>${invoice.invoiceDate}</strong></div>
        <div>Place of Supply: <strong>${invoice.placeOfSupply}</strong></div>
      </div>
    </div>

    <!-- Drug Licenses & Registered Pharmacist Info -->
    <div class="license-bar">
      <div><strong>D.L. No. (20B):</strong> ${shop.dlNumber20B || 'DL-20B/NZ-2291/2021'} · <strong>(21B):</strong> ${shop.dlNumber21B || 'DL-21B/NZ-2292/2021'}</div>
      <div><strong>Regd. Pharmacist:</strong> ${shop.registeredPharmacist || shop.ownerName} ${shop.fssaiNumber ? `· FSSAI: ${shop.fssaiNumber}` : ''}</div>
    </div>

    <div class="grid">
      <div style="width: 50%;">
        <div style="font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 9px; margin-bottom: 3px;">Patient / Customer (Billed To):</div>
        <div style="font-size: 13px; font-weight: bold; color: #0f172a;">${invoice.patientName || invoice.customerName} ${invoice.patientAge ? `(${invoice.patientAge}y ${invoice.patientGender || ''})` : ''}</div>
        <div>Contact: <strong>${invoice.customerPhone}</strong></div>
        ${invoice.customerAddress ? `<div>Address: ${invoice.customerAddress}</div>` : ''}
        ${invoice.customerGstin ? `<div>Buyer GSTIN: <strong>${invoice.customerGstin}</strong></div>` : ''}
      </div>
      <div style="width: 50%; text-align: right;">
        <div style="font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 9px; margin-bottom: 3px;">Prescribing Doctor & Tax:</div>
        <div>Doctor: <strong>${invoice.doctorName || 'Dr. Consulted / OTC'}</strong> ${invoice.doctorRegNo ? `(Reg: ${invoice.doctorRegNo})` : ''}</div>
        <div>Supply: <strong>${isInterState ? 'Inter-State (IGST 12%)' : 'Intra-State (CGST 6% + SGST 6%)'}</strong></div>
        <div>Payment Mode: <strong class="capitalize">${invoice.paymentMode}</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th class="text-center" style="width: 20px;">#</th>
          <th>Medicine Description & Salt</th>
          <th class="text-center">Batch #</th>
          <th class="text-center">Expiry</th>
          <th class="text-center">HSN</th>
          <th class="text-right">Qty</th>
          <th class="text-right">MRP (₹)</th>
          <th class="text-right">Rate (₹)</th>
          <th class="text-right">Taxable (₹)</th>
          ${!isInterState ? `
            <th class="text-right">CGST</th>
            <th class="text-right">SGST</th>
          ` : `
            <th class="text-right">IGST</th>
          `}
          <th class="text-right">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td>
              <strong>${item.name}</strong> ${item.requiresPrescription ? '<span style="color:#e11d48;font-weight:bold;">[Rx]</span>' : ''}
              ${item.saltComposition ? `<div style="font-size:9px;color:#64748b;font-style:italic;">${item.saltComposition}</div>` : ''}
            </td>
            <td class="text-center font-mono" style="font-weight:bold;">${item.batchNumber || '-'}</td>
            <td class="text-center font-mono">${item.expiryDate || '-'}</td>
            <td class="text-center font-mono">${item.hsn}</td>
            <td class="text-right font-mono" style="font-weight:bold;">${item.quantity} ${item.unit}</td>
            <td class="text-right font-mono" style="color:#64748b;">${item.mrp.toFixed(2)}</td>
            <td class="text-right font-mono">${item.unitPrice.toFixed(2)}</td>
            <td class="text-right font-mono">${item.taxableAmount.toFixed(2)}</td>
            ${!isInterState ? `
              <td class="text-right font-mono">${item.cgstAmount.toFixed(2)}</td>
              <td class="text-right font-mono">${item.sgstAmount.toFixed(2)}</td>
            ` : `
              <td class="text-right font-mono">${item.igstAmount.toFixed(2)}</td>
            `}
            <td class="text-right font-mono" style="font-weight:bold;">${item.totalAmount.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div style="width: 50%;">
        <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold;">Amount in Words:</div>
        <div style="font-size: 11px; font-weight: bold; color: #0f172a; margin-top: 2px;">
          ${convertNumberToIndianWords(invoice.grandTotal)}
        </div>
        ${invoice.prescriptionNotes ? `
          <div style="margin-top: 6px; font-size: 10px; color: #475569;">
            <strong>Dosage / Rx Notes:</strong> ${invoice.prescriptionNotes}
          </div>
        ` : ''}
        <div class="bank-box">
          <div><strong>UPI Payment:</strong> <span class="font-mono">${shop.upiVpa}</span></div>
          <div>Bank: ${shop.bankName} · A/C: <span class="font-mono">${shop.accountNumber}</span> · IFSC: <span class="font-mono">${shop.ifsc}</span></div>
        </div>
      </div>

      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal Taxable Value:</span>
          <span class="font-mono font-bold">${formatINR(invoice.subtotalTaxable)}</span>
        </div>
        ${!isInterState ? `
          <div class="totals-row">
            <span>Central GST (CGST 6%):</span>
            <span class="font-mono">${formatINR(invoice.totalCgst)}</span>
          </div>
          <div class="totals-row">
            <span>State GST (SGST 6%):</span>
            <span class="font-mono">${formatINR(invoice.totalSgst)}</span>
          </div>
        ` : `
          <div class="totals-row">
            <span>Integrated GST (IGST 12%):</span>
            <span class="font-mono">${formatINR(invoice.totalIgst)}</span>
          </div>
        `}
        <div class="totals-row">
          <span>Total Medicine GST:</span>
          <span class="font-mono">${formatINR(invoice.totalTax)}</span>
        </div>
        ${invoice.roundOff !== 0 ? `
          <div class="totals-row">
            <span>Round Off:</span>
            <span class="font-mono">${invoice.roundOff > 0 ? `+₹${invoice.roundOff.toFixed(2)}` : `-₹${Math.abs(invoice.roundOff).toFixed(2)}`}</span>
          </div>
        ` : ''}
        <div class="totals-row grand-total">
          <span>NET PAYABLE:</span>
          <span class="font-mono">${formatINR(invoice.grandTotal)}</span>
        </div>
        <div class="totals-row">
          <span>Amount Paid:</span>
          <span class="font-mono">${formatINR(invoice.amountPaid)}</span>
        </div>
        ${invoice.balanceDue > 0 ? `
          <div class="totals-row" style="color: #e11d48; font-weight: bold;">
            <span>Balance Due (Khata):</span>
            <span class="font-mono">${formatINR(invoice.balanceDue)}</span>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="footer">
      <div style="max-width: 460px; font-size: 9px; color: #64748b; line-height: 1.3;">
        <strong>Terms & Conditions:</strong><br/>
        ${shop.termsAndConditions}
      </div>
      <div style="text-align: right; width: 200px;">
        <div style="font-size: 10px; font-weight: bold;">For ${shop.name}</div>
        <div style="height: 35px;"></div>
        <div style="border-top: 1px solid #475569; font-size: 10px; color: #475569; padding-top: 2px;">
          Registered Pharmacist
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Medical_Bill_${invoice.invoiceNumber.replace(/\//g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
