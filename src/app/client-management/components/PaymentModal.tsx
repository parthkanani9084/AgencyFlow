import React from 'react';
import Modal from '@/components/ui/Modal';
import Label from '@/components/ui/Label';
import { STATIC_STRINGS } from '@/utils/constants';
import { Client } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClient: Client | null;
  paymentForm: { amount: string; date: string; notes: string };
  setPaymentForm: React.Dispatch<React.SetStateAction<{ amount: string; date: string; notes: string }>>;
  onSave: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  activeClient,
  paymentForm,
  setPaymentForm,
  onSave,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT}
      subtitle={STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT_SUBTITLE}
      size="sm"
    >
      <div className="px-6 py-5 space-y-4">
        <div>
          <Label className="text-[12px] text-slate-400 uppercase tracking-wider">{STATIC_STRINGS.CLIENT_MGMT_LABEL_CLIENT_NAME}</Label>
          <input
            type="text"
            readOnly
            value={activeClient?.name || ''}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-100 bg-slate-50 text-[13px] text-slate-600 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{STATIC_STRINGS.ADS_TABLE_COL_SPEND} ({STATIC_STRINGS.CURRENCY_SYMBOL})</Label>
            <input
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              placeholder={STATIC_STRINGS.PAYMENT_ZERO_PLACEHOLDER}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
          </div>
          <div>
            <Label>{STATIC_STRINGS.DATE}</Label>
            <input
              type="date"
              value={paymentForm.date}
              onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
          </div>
        </div>
        <div>
          <Label>{STATIC_STRINGS.CAMPAIGN_MGMT_NOTES}</Label>
          <textarea
            value={paymentForm.notes}
            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            placeholder={STATIC_STRINGS.CLIENT_MGMT_PAYMENT_NOTES_PLACEHOLDER}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {STATIC_STRINGS.CAMPAIGN_MGMT_CANCEL}
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150 shadow-sm"
          >
            {STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT_BTN}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(PaymentModal);
