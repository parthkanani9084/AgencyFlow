import React from 'react';
import { IndianRupee, History, Pencil, Trash2, Briefcase, Loader2 } from 'lucide-react';
import { STATIC_STRINGS, CLIENT_PLANS } from '@/utils/constants';
import Pagination from '@/components/ui/Pagination';
import { Client } from '../types';

interface ClientTableProps {
  clients: Client[];
  isFetching: boolean;
  isOwner: boolean;
  page: number;
  perPage: number;
  totalEntries: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (pp: number) => void;
  onEdit: (c: Client) => void;
  onDelete: (c: Client) => void;
  onRecordPayment: (c: Client) => void;
  onViewPayments: (c: Client) => void;
  getClientTotalPaid: (c: Client) => number;
}

const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  isFetching,
  isOwner,
  page,
  perPage,
  totalEntries,
  totalPages,
  onPageChange,
  onPerPageChange,
  onEdit,
  onDelete,
  onRecordPayment,
  onViewPayments,
  getClientTotalPaid,
}) => {
  return (
    <main className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TABLE_CLIENT}</th>
              <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TABLE_BRAND}</th>
              {isOwner && (
                <>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.TABLE_PACKAGE}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.CLIENT_MGMT_TOTAL_PAID}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{STATIC_STRINGS.TABLE_PLAN}</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-right">{STATIC_STRINGS.ADS_TABLE_COL_ACTIONS}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr>
                <td colSpan={isOwner ? 6 : 2} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin opacity-80" />
                    <p className="text-[13px] text-slate-500 font-medium animate-pulse">
                      {STATIC_STRINGS.BA_LOADING}
                    </p>
                  </div>
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 6 : 2} className="px-5 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Briefcase size={32} className="opacity-30" />
                    <p className="text-[13px]">{STATIC_STRINGS.CLIENT_MGMT_NO_CLIENTS}</p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client, idx) => {
                const totalPaid = getClientTotalPaid(client);
                return (
                  <tr
                    key={client.id}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[11px] font-bold text-violet-700">
                            {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[13.5px] font-semibold text-slate-800">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600">{client.brand}</td>
                    {isOwner && (
                      <>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-slate-600 text-right">
                          {STATIC_STRINGS.CURRENCY_SYMBOL}{client.packageAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-bold text-emerald-600 text-right">
                          {STATIC_STRINGS.CURRENCY_SYMBOL}{totalPaid.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              client.planType === CLIENT_PLANS.MONTHLY ? 'bg-violet-100 text-violet-700' : 
                              client.planType === CLIENT_PLANS.WEEKLY ? 'bg-emerald-100 text-emerald-700' :
                              'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {client.planType.charAt(0).toUpperCase() + client.planType.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onRecordPayment(client)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                              title={STATIC_STRINGS.CLIENT_MGMT_RECORD_PAYMENT_TOOLTIP}
                            >
                              <IndianRupee size={14} />
                            </button>
                            <button
                              onClick={() => onViewPayments(client)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                              title={STATIC_STRINGS.CLIENT_MGMT_VIEW_PAYMENTS_TOOLTIP}
                            >
                              <History size={14} />
                            </button>
                            <button
                              onClick={() => onEdit(client)}
                              className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                              title={STATIC_STRINGS.CLIENT_MGMT_EDIT_CLIENT_TOOLTIP}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => onDelete(client)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                              title={STATIC_STRINGS.CLIENT_MGMT_DELETE_CLIENT_TOOLTIP}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        perPage={perPage}
        onPerPageChange={onPerPageChange}
        totalEntries={totalEntries}
        labels={{
          show: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_SHOW,
          of: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_OF,
          entries: STATIC_STRINGS.CAMPAIGN_MGMT_PAGINATION_ENTRIES
        }}
      />
    </main>
  );
};

export default React.memo(ClientTable);
