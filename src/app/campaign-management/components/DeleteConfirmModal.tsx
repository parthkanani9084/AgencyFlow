'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface Props {
  open: boolean;
  campaignName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ open, campaignName, onClose, onConfirm }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Campaign" size="sm">
      <div className="px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-[13.5px] text-slate-700 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">&quot;{campaignName}&quot;</span>?
              This will permanently remove all associated tasks, files, and ad data.
            </p>
            <p className="mt-2 text-[12px] text-red-600 font-medium">This action cannot be undone.</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Keep Campaign
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-[13px] font-semibold transition-all duration-150"
          >
            Delete Campaign
          </button>
        </div>
      </div>
    </Modal>
  );
}