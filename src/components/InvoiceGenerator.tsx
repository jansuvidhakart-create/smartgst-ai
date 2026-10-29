import React from 'react';
import { InvoiceFormCard } from './InvoiceFormCard';
import { Invoice } from '../types';

interface InvoiceGeneratorProps {
  onInvoiceCreated: (inv: Invoice) => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ onInvoiceCreated }) => {
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <InvoiceFormCard
        onClose={() => {
          // If on standalone page, can scroll to top or reset
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onInvoiceCreated={(invoice, shouldPrint) => {
          onInvoiceCreated(invoice);
        }}
      />
    </div>
  );
};
