import React from 'react';
import Modal from '@/components/ui/Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { STATIC_STRINGS } from '@/utils/constants';
import { Client } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  client,
  onConfirm,
  isDeleting,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} title={STATIC_STRINGS.CLIENT_MGMT_DELETE_CLIENT} size="sm">
      <div className="px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-[13.5px] text-slate-700 leading-relaxed">
              {STATIC_STRINGS.CLIENT_MGMT_DELETE_CONFIRM} <span className="font-semibold text-slate-900">&quot;{client?.name}&quot;</span>? {STATIC_STRINGS.CLIENT_MGMT_DELETE_DESC}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.CAMPAIGN_MGMT_CANCEL}</button>
          <button 
            onClick={onConfirm} 
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            {isDeleting ? STATIC_STRINGS.FORM_DELETING : STATIC_STRINGS.CLIENT_MGMT_DELETE_CLIENT}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(DeleteConfirmModal);
