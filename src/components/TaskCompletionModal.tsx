'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import { CheckCircle2, UserPlus, Info, ChevronRight, Image } from 'lucide-react';
import { Task, Reel, UserRole } from '@/types';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';

interface TaskCompletionModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | Reel | any | null; // Allow Reel and any for flexibility in dashboards
  onComplete: (taskId: string, notes: string, nextMember?: { name: string; role: string }, screenshot?: string) => void;
  userRole: UserRole | string;
  teamMembers: readonly { id: string; name: string; role: string }[];
}

export default function TaskCompletionModal({
  open,
  onClose,
  task,
  onComplete,
  userRole,
  teamMembers
}: TaskCompletionModalProps) {
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const eligibleRoles = useMemo(() => {
    if (!task) return [];
    
    const taskRole = (task as Task)?.role || ROLES.SOCIAL_MEDIA_MANAGER;
    const roleToCheck = userRole === ROLES.MANAGER || userRole === ROLES.OWNER ? taskRole : userRole;
    
    const roles = (() => {
      switch (roleToCheck) {
        case ROLES.SHOOTER: return [ROLES.EDITOR];
        case ROLES.EDITOR: return [ROLES.ADS_MANAGER];
        case ROLES.ADS_MANAGER: return [ROLES.MANAGER, ROLES.OWNER];
        case ROLES.SOCIAL_MEDIA_MANAGER: return [ROLES.MANAGER, ROLES.OWNER];
        default: return [];
      }
    })();

    if (roleToCheck === ROLES.EDITOR || roleToCheck === ROLES.SHOOTER) return roles;
    
    // Default fallback for admin roles or non-editor handoffs
    return Array.from(new Set([...roles, ROLES.MANAGER, ROLES.OWNER]));
  }, [userRole, task]);

  const flags = useMemo(() => {
    const isManagerOrOwner = userRole === ROLES.MANAGER || userRole === ROLES.OWNER;
    const taskRole = (task as Task)?.role;
    const isAdsTask = taskRole === ROLES.ADS_MANAGER || taskRole === ROLES.SOCIAL_MEDIA_MANAGER;
    return {
      showHandoff: eligibleRoles.length > 0,
      isManagerOrOwner,
      isAdsTask,
      needsScreenshot: isAdsTask
    };
  }, [userRole, task?.role, eligibleRoles.length]);


  const handleSubmit = useCallback(() => {
    if (!task) return;

    const errors: Record<string, string> = {};
    if (!notes.trim() || notes.length < 5) {
      errors.notes = STATIC_STRINGS.TASK_MODAL_ERR_NOTES;
    }
    if (flags.showHandoff && !sendTo && !flags.isManagerOrOwner) {
      errors.sendTo = STATIC_STRINGS.TASK_MODAL_ERR_HANDOFF;
    }
    if (flags.isAdsTask && !screenshot.trim()) {
      errors.screenshot = STATIC_STRINGS.TASK_MODAL_ERR_SCREENSHOT;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedMember = teamMembers.find(m => m.id === sendTo);
    onComplete(
      task.id, 
      notes, 
      selectedMember ? { name: selectedMember.name, role: selectedMember.role } : undefined,
      flags.needsScreenshot ? screenshot : undefined
    );
    
    // State Reset
    setNotes('');
    setScreenshot('');
    setSendTo('');
    setFormErrors({});
    onClose();
  }, [task, notes, sendTo, flags, teamMembers, onComplete, onClose, screenshot]);

  const handleScreenshotUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setScreenshot(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={(task as any)?.type === 'REEL' || (task as any)?.scheduledDate ? STATIC_STRINGS.TASK_MODAL_CONFIRM_REEL : STATIC_STRINGS.TASK_MODAL_COMPLETE_TASK}
      subtitle={task?.title}
      size="md"
    >
      <div className="p-6 pt-2">
        <div className="space-y-4">
          {/* Notes Field */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              {STATIC_STRINGS.TASK_MODAL_LABEL_NOTES} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder={STATIC_STRINGS.TASK_MODAL_PLACEHOLDER_NOTES}
              className={`w-full px-4 py-3 rounded-xl border text-[13.5px] outline-none transition-all resize-none ${
                formErrors.notes ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-4 focus:ring-violet-50 focus:border-violet-300'
              }`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {formErrors.notes && (
              <p className="mt-1.5 text-[11.5px] text-red-600 flex items-center gap-1">
                <Info size={12} /> {formErrors.notes}
              </p>
            )}
          </div>

          {/* Screenshot Upload Field */}
          {flags.needsScreenshot && (
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                {flags.isAdsTask ? STATIC_STRINGS.TASK_MODAL_LABEL_DELIVERY_SS : STATIC_STRINGS.TASK_MODAL_LABEL_EXPORT_SS} {!flags.isAdsTask && <span className="text-slate-400 font-normal ml-1">({STATIC_STRINGS.COMMON_OPTIONAL})</span>} {flags.isAdsTask && <span className="text-red-500">*</span>}
              </label>
              <input 
                type="file" 
                id="screenshot-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleScreenshotUpload}
              />
              <div 
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  screenshot ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-violet-300 hover:bg-violet-50/30'
                }`}
                onClick={() => document.getElementById('screenshot-upload')?.click()}
              >
                {screenshot ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-emerald-200 shadow-sm">
                      <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-emerald-500/10" />
                    </div>
                    <p className="text-[12px] font-bold text-emerald-700">{STATIC_STRINGS.TASK_MODAL_SS_ATTACHED}</p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setScreenshot(''); }}
                      className="text-[11px] text-red-500 font-medium hover:underline"
                    >
                      {STATIC_STRINGS.COMMON_REMOVE}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                      <Image size={16} />
                    </div>
                    <p className="text-[12px] font-medium text-slate-500">
                      {flags.isAdsTask ? STATIC_STRINGS.TASK_MODAL_UPLOAD_PROOF : STATIC_STRINGS.TASK_MODAL_UPLOAD_PREVIEW}
                    </p>
                  </>
                )}
              </div>
              {formErrors.screenshot && (
                <p className="mt-1.5 text-[11.5px] text-red-600 flex items-center gap-1">
                  <Info size={12} /> {formErrors.screenshot}
                </p>
              )}
            </div>
          )}

          {/* Handoff Field */}
          {flags.showHandoff && (
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                {STATIC_STRINGS.TASK_MODAL_LABEL_HANDOFF} {flags.isManagerOrOwner && <span className="text-slate-400 font-normal ml-1">({STATIC_STRINGS.COMMON_OPTIONAL})</span>} {!flags.isManagerOrOwner && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <UserPlus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-[13.5px] outline-none transition-all appearance-none bg-white ${
                    formErrors.sendTo ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-slate-200 focus:ring-4 focus:ring-violet-50 focus:border-violet-300'
                  }`}
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                >
                  <option value="">{STATIC_STRINGS.TASK_MODAL_SELECT_RECIPIENT}</option>
                  {teamMembers.filter(m => (eligibleRoles as string[]).includes(m.role as string)).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={14} />
              </div>
              {formErrors.sendTo && (
                <p className="mt-1.5 text-[11.5px] text-red-600 flex items-center gap-1">
                  <Info size={12} /> {formErrors.sendTo}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {STATIC_STRINGS.FORM_CANCEL}
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold shadow-md shadow-violet-100 transition-all active:scale-[0.98]"
            >
              {task?.type === 'REEL' ? STATIC_STRINGS.TASK_MODAL_BTN_CONFIRM_UPLOAD : (flags.showHandoff ? STATIC_STRINGS.TASK_MODAL_BTN_COMPLETE_HANDOFF : STATIC_STRINGS.TASK_MODAL_COMPLETE_TASK)} <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
