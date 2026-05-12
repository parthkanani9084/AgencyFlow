import React from 'react';
import Modal from '@/components/ui/Modal';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';
import { TaskForm } from '../types';
import { Task, TaskRole } from '@/types';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  editingTask: Task | null;
  form: TaskForm;
  setForm: React.Dispatch<React.SetStateAction<TaskForm>>;
  errors: Partial<Record<keyof TaskForm, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof TaskForm, string>>>>;
  teamMembers: { id: string; name: string; role: string }[];
  clientsList: { id: string; name: string }[];
  isFetchingTeam: boolean;
  isFetchingClients: boolean;
  isSaving: boolean;
  handleMemberChange: (memberId: string) => Promise<void>;
  handleSave: () => Promise<void>;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onClose,
  editingTask,
  form,
  setForm,
  errors,
  setErrors,
  teamMembers,
  clientsList,
  isFetchingTeam,
  isFetchingClients,
  isSaving,
  handleMemberChange,
  handleSave,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={editingTask ? STATIC_STRINGS.TASK_MGMT_EDIT_TASK : STATIC_STRINGS.TASK_MGMT_ADD_NEW_TASK} size="lg">
      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_LABEL_TITLE} <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors(er => ({ ...er, title: '' })); }}
            placeholder={STATIC_STRINGS.TASK_MGMT_PLACEHOLDER_TITLE}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'}`}
          />
          {errors.title && <p className="mt-1 text-[11.5px] text-red-500">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_LABEL_DESCRIPTION}</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder={STATIC_STRINGS.TASK_MGMT_PLACEHOLDER_DESC}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_ASSIGNED_TO} <span className="text-red-500">*</span></label>
            <select 
              value={teamMembers.find(m => m.name === form.assignedTo)?.id || ''} 
              onChange={(e) => { handleMemberChange(e.target.value); setErrors(er => ({ ...er, assignedTo: '' })); }} 
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition bg-white ${errors.assignedTo ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-violet-400'}`}
            >
              <option value="">{isFetchingTeam ? 'Loading team...' : STATIC_STRINGS.TASK_MGMT_SELECT_TEAMMATE}</option>
              {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {errors.assignedTo && <p className="mt-1 text-[11.5px] text-red-500">{errors.assignedTo}</p>}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_ROLE} <span className="text-red-500">*</span></label>
            <select 
              value={form.role} 
              onChange={(e) => { setForm((f) => ({ ...f, role: e.target.value as TaskRole })); setErrors(er => ({ ...er, role: '' })); }} 
              disabled={true}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition bg-slate-50 text-slate-500 cursor-not-allowed"
            >
              <option value={ROLES.MANAGER}>{ROLES.MANAGER}</option>
              <option value={ROLES.SHOOTER}>{ROLES.SHOOTER}</option>
              <option value={ROLES.EDITOR}>{ROLES.EDITOR}</option>
              <option value={ROLES.ADS_MANAGER}>{ROLES.ADS_MANAGER}</option>
              <option value={ROLES.SOCIAL_MEDIA_MANAGER}>{ROLES.SOCIAL_MEDIA_MANAGER}</option>
              <option value={ROLES.OWNER}>{ROLES.OWNER}</option>
            </select>
            {errors.role && <p className="mt-1 text-[11.5px] text-red-500">{errors.role}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_CLIENT} <span className="text-red-500">*</span></label>
            <select 
              value={form.client} 
              onChange={(e) => { setForm((f) => ({ ...f, client: e.target.value })); setErrors(er => ({ ...er, client: '' })); }} 
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition bg-white ${errors.client ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-violet-400'}`}
            >
              <option value="">{isFetchingClients ? 'Loading clients...' : STATIC_STRINGS.TASK_MGMT_SELECT_CLIENT}</option>
              {clientsList.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            {errors.client && <p className="mt-1 text-[11.5px] text-red-500">{errors.client}</p>}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.TASK_MGMT_COL_DEADLINE} <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              value={form.deadline} 
              onChange={(e) => { setForm((f) => ({ ...f, deadline: e.target.value })); setErrors(er => ({ ...er, deadline: '' })); }} 
              className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${errors.deadline ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-violet-400'}`} 
            />
            {errors.deadline && <p className="mt-1 text-[11.5px] text-red-500">{errors.deadline}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.FORM_CANCEL}</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-5 py-2 rounded-lg bg-violet-600 text-white text-[13px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (editingTask ? 'Saving...' : 'Creating...') : STATIC_STRINGS.FORM_SAVE_CHANGES}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskFormModal;
