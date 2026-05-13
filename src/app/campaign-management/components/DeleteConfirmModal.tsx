'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { STATIC_STRINGS } from '@/utils/constants';

interface Props {
  open: boolean;
  campaignName: string;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export default function DeleteConfirmModal({
  open,
  campaignName,
  onClose,
  onConfirm,
  isProcessing = false,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={STATIC_STRINGS.DELETE_MODAL_TITLE} size="sm">
      <div className="px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-[13.5px] text-slate-700 leading-relaxed">
              {STATIC_STRINGS.DELETE_MODAL_CONFIRM}{' '}
              <span className="font-semibold text-slate-900">&quot;{campaignName}&quot;</span>?
              {STATIC_STRINGS.DELETE_MODAL_DESC}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {STATIC_STRINGS.DELETE_MODAL_KEEP}
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {isProcessing ? 'Deleting...' : STATIC_STRINGS.DELETE_MODAL_DELETE}
          </button>
        </div>
      </div>
    </Modal>
  );
}
