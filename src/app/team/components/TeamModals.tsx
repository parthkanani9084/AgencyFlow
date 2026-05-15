import React from 'react';
import Modal from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';
import { STATIC_STRINGS, COMMON_STATUS } from '@/utils/constants';
import Label from '@/components/ui/Label';
import { ROLE_CONFIG, ROLE_AVATAR_COLORS } from '@/utils/ui-configs';
import { UserRole } from '@/types';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: typeof COMMON_STATUS.ACTIVE | typeof COMMON_STATUS.INACTIVE;
  joinedAt: string;
  tasksCompleted: number;
  tasksActive: number;
}

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember: TeamMember | null;
  form: { name: string; email: string; role: UserRole };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; role: UserRole }>>;
  errors: Partial<{ name: string; email: string; role: UserRole }>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<{ name: string; email: string; role: UserRole }>>>;
  onSave: () => void;
  isProcessing: boolean;
  allRoles: UserRole[];
}

export const TeamMemberModal = ({
  isOpen,
  onClose,
  editingMember,
  form,
  setForm,
  errors,
  setErrors,
  onSave,
  isProcessing,
  allRoles,
}: TeamMemberModalProps) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    title={editingMember ? STATIC_STRINGS.TEAM_PAGE_MODAL_EDIT_TITLE : STATIC_STRINGS.TEAM_PAGE_MODAL_INVITE_TITLE}
    subtitle={editingMember ? STATIC_STRINGS.TEAM_PAGE_MODAL_EDIT_SUBTITLE : STATIC_STRINGS.TEAM_PAGE_MODAL_INVITE_SUBTITLE}
    size="md"
  >
    <div className="px-6 py-5 space-y-4">
      <div>
        <Label required>{STATIC_STRINGS.TEAM_PAGE_LABEL_FULL_NAME}</Label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            setErrors((er) => ({ ...er, name: '' }));
          }}
          placeholder={STATIC_STRINGS.TEAM_PAGE_PLACEHOLDER_NAME}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${
            errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'
          }`}
        />
        {errors.name && <p className="mt-1 text-[11.5px] text-red-500">{errors.name}</p>}
      </div>

      <div>
        <Label required>{STATIC_STRINGS.TEAM_PAGE_LABEL_EMAIL}</Label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm((f) => ({ ...f, email: e.target.value }));
            setErrors((er) => ({ ...er, email: '' }));
          }}
          placeholder={STATIC_STRINGS.TEAM_PAGE_PLACEHOLDER_EMAIL}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition ${
            errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white focus:border-violet-400'
          }`}
        />
        {errors.email && <p className="mt-1 text-[11.5px] text-red-500">{errors.email}</p>}
      </div>

      <div>
        <Label>{STATIC_STRINGS.TASK_MGMT_COL_ROLE}</Label>
        <div className="grid grid-cols-2 gap-2">
          {allRoles.map((r) => {
            const cfg = ROLE_CONFIG[r];
            const Icon = cfg.icon;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[12.5px] font-medium transition-all ${
                  form.role === r ? `${cfg.bg} ${cfg.color} border-current` : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {STATIC_STRINGS.FORM_CANCEL}
        </button>
        <button
          onClick={onSave}
          disabled={isProcessing}
          className="flex-1 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing && <Loader2 size={16} className="animate-spin" />}
          {isProcessing
            ? STATIC_STRINGS.TEAM_PAGE_BTN_SENDING
            : editingMember
            ? STATIC_STRINGS.FORM_SAVE_CHANGES
            : STATIC_STRINGS.TEAM_PAGE_BTN_SEND_INVITE}
        </button>
      </div>
    </div>
  </Modal>
);

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  member,
  onConfirm,
  isProcessing = false,
}: DeleteConfirmModalProps) => (
  <Modal
    open={isOpen}
    onClose={onClose}
    title={STATIC_STRINGS.TEAM_PAGE_CONFIRM_REMOVE_TITLE}
    subtitle={STATIC_STRINGS.TEAM_PAGE_CONFIRM_REMOVE_SUBTITLE}
    size="sm"
  >
    <div className="px-6 py-5">
      {member && (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg mb-5">
          <div className={`w-8 h-8 rounded-full ${ROLE_AVATAR_COLORS[member.role]} flex items-center justify-center flex-shrink-0`}>
            <span className="text-[11px] font-bold text-white">
              {member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-800">{member.name}</p>
            <p className="text-[11px] text-slate-500">{member.role}</p>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {STATIC_STRINGS.FORM_CANCEL}
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing && <Loader2 size={16} className="animate-spin" />}
          {isProcessing ? 'Removing...' : STATIC_STRINGS.TEAM_PAGE_BTN_REMOVE}
        </button>
      </div>
    </div>
  </Modal>
);
