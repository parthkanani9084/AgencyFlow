'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { STATIC_STRINGS } from '@/utils/constants';

interface AddReelModalProps {
  open: boolean;
  onClose: () => void;
  form: {
    title: string;
    campaignId: string;
    scheduledDate: string;
  };
  errors: {
    title: boolean;
    campaignId: boolean;
    scheduledDate: boolean;
  };
  clients: Array<{ id: string; name: string }>;
  isFetchingClients: boolean;
  isCreating: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

const AddReelModal: React.FC<AddReelModalProps> = ({
  open,
  onClose,
  form,
  errors,
  clients,
  isFetchingClients,
  isCreating,
  onChange,
  onSubmit,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={STATIC_STRINGS.SMM_MODAL_TITLE}
      size="md"
    >
      <div className="p-6 space-y-5">
        {/* TITLE */}
        <div>
          <label className="block text-[13px] font-bold text-slate-700 mb-2">
            {STATIC_STRINGS.SMM_LABEL_TITLE} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder={STATIC_STRINGS.SMM_PLACEHOLDER_TITLE}
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-[14px] outline-none transition-all ${
              errors.title
                ? 'border-rose-500 ring-2 ring-rose-500/10'
                : 'border-slate-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500'
            }`}
          />
          {errors.title && (
            <p className="text-rose-500 text-[11px] font-bold mt-1.5 flex items-center gap-1">
              {STATIC_STRINGS.SMM_ERR_TITLE}
            </p>
          )}
        </div>

        {/* CLIENT + DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">
              {STATIC_STRINGS.SMM_LABEL_CLIENT} <span className="text-rose-500">*</span>
            </label>
            <select
              value={form.campaignId}
              onChange={(e) => onChange('campaignId', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-[14px] outline-none transition-all cursor-pointer ${
                errors.campaignId
                  ? 'border-rose-500 ring-2 ring-rose-500/10'
                  : 'border-slate-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500'
              }`}
            >
              <option value="">
                {isFetchingClients
                  ? 'Loading clients...'
                  : STATIC_STRINGS.SMM_PLACEHOLDER_CLIENT}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            {errors.campaignId && (
              <p className="text-rose-500 text-[11px] font-bold mt-1.5 flex items-center gap-1">
                {STATIC_STRINGS.SMM_ERR_CLIENT}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2">
              {STATIC_STRINGS.SMM_LABEL_DATE} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => onChange('scheduledDate', e.target.value)}
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-[14px] outline-none transition-all ${
                errors.scheduledDate
                  ? 'border-rose-500 ring-2 ring-rose-500/10'
                  : 'border-slate-200 focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500'
              }`}
            />
            {errors.scheduledDate && (
              <p className="text-rose-500 text-[11px] font-bold mt-1.5 flex items-center gap-1">
                {STATIC_STRINGS.SMM_ERR_DATE}
              </p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {STATIC_STRINGS.SMM_BTN_CANCEL}
          </button>
          <button
            onClick={onSubmit}
            disabled={isCreating}
            className="px-6 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-800 disabled:opacity-50 text-white text-[13px] font-bold transition-all shadow-md active:scale-[0.98]"
          >
            {isCreating ? 'Scheduling...' : STATIC_STRINGS.SMM_BTN_SCHEDULE}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddReelModal;
