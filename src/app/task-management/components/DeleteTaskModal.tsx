import React from 'react';
import Modal from '@/components/ui/Modal';
import { STATIC_STRINGS } from '@/utils/constants';
import { Task } from '@/types';

interface DeleteTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onDelete: () => Promise<void>;
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  open,
  onClose,
  task,
  onDelete,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={STATIC_STRINGS.TASK_MGMT_CONFIRM_DELETE} size="sm">
      <div className="px-6 py-5">
        <p className="text-[13.5px] text-slate-600 mb-6 leading-relaxed">
          {STATIC_STRINGS.TASK_MGMT_DELETE_PROMPT} <span className="font-black text-slate-900">"{task?.title}"</span>?
        </p>
        <div className="flex justify-end gap-2.5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            {STATIC_STRINGS.FORM_CANCEL}
          </button>
          <button onClick={onDelete} className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-black shadow-md transition-all active:scale-[0.98]">
            {STATIC_STRINGS.TASK_MGMT_BTN_DELETE}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteTaskModal;
