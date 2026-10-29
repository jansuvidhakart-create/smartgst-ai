import React from 'react';
import { InvoiceFormCard } from './InvoiceFormCard';
import { Invoice } from '../types';

interface CreateInvoiceModalProps {
  onClose: () => void;
  onInvoiceSaved: (invoice: Invoice, shouldPrint?: boolean) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  onClose,
  onInvoiceSaved,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl">
        <InvoiceFormCard
          onClose={onClose}
          onInvoiceCreated={(invoice, shouldPrint) => {
            onInvoiceSaved(invoice, shouldPrint);
          }}
        />
      </div>
    </div>
  );
};
