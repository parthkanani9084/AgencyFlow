'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { LogOut } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={STATIC_STRINGS.LOGOUT_MODAL_TITLE}
      size="sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <LogOut size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-medium text-slate-900 mb-1">
              {STATIC_STRINGS.LOGOUT_MODAL_QUESTION}
            </p>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              {STATIC_STRINGS.LOGOUT_MODAL_DESCRIPTION}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all duration-200"
          >
            {STATIC_STRINGS.LOGOUT_MODAL_CANCEL}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
          >
            {STATIC_STRINGS.LOGOUT_MODAL_CONFIRM}
          </button>
        </div>
      </div>
    </Modal>
  );
}

