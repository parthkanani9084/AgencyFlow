import React from 'react';
import Modal from '@/components/ui/Modal';
import { History, Trash2 } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';
import { Client } from '../types';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClient: Client | null;
  onDeletePayment: (idx: number) => void;
  getClientTotalPaid: (c: Client) => number;
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  activeClient,
  onDeletePayment,
  getClientTotalPaid,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={STATIC_STRINGS.CLIENT_MGMT_PAYMENT_HISTORY}
      subtitle={`${STATIC_STRINGS.CLIENT_MGMT_PAYMENT_HISTORY_SUBTITLE} ${activeClient?.name}`}
      size="md"
    >
      <div className="px-6 py-5">
        {!activeClient?.payments || activeClient.payments.length === 0 ? (
          <div className="py-10 text-center">
            <History size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-[13px] text-slate-500">{STATIC_STRINGS.CLIENT_MGMT_NO_PAYMENTS}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">{STATIC_STRINGS.CLIENT_MGMT_TOTAL_PAID}</p>
                <p className="text-xl font-bold text-emerald-700">{STATIC_STRINGS.CURRENCY_SYMBOL}{getClientTotalPaid(activeClient).toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{STATIC_STRINGS.CLIENT_MGMT_PENDING_BALANCE}</p>
                <p className="text-xl font-bold text-slate-700">
                  {STATIC_STRINGS.CURRENCY_SYMBOL}{Math.max(0, activeClient.packageAmount - getClientTotalPaid(activeClient)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin border border-slate-100 rounded-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{STATIC_STRINGS.DATE}</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{STATIC_STRINGS.NOTES}</th>
                    <th className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{STATIC_STRINGS.AMOUNT}</th>
                    <th className="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeClient.payments.map((p, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-[12.5px] font-medium text-slate-500 whitespace-nowrap">
                        {(() => {
                          const date = new Date(p.date);
                          return isNaN(date.getTime()) ? p.date : date.toLocaleDateString(STATIC_STRINGS.LOCALE_GB);
                        })()}
                      </td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-400 italic">
                        <span className="line-clamp-1" title={p.notes}>{p.notes || '-'}</span>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-bold text-slate-800 text-right">{STATIC_STRINGS.CURRENCY_SYMBOL}{p.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => onDeletePayment(i)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          title={STATIC_STRINGS.DELETE_ENTRY}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex items-center justify-end mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-violet-900 text-white text-[13px] font-semibold hover:bg-violet-800 transition-colors"
          >
            {STATIC_STRINGS.CLIENT_MGMT_CLOSE}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(PaymentHistoryModal);
