'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { CheckCircle2, UserPlus, Info, ChevronRight, Image } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { toast } from 'sonner';

interface TaskCompletionModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onComplete: (taskId: string, notes: string, nextMember?: { name: string; role: string }, screenshot?: string) => void;
  userRole: string;
  teamMembers: { id: string; name: string; role: string }[];
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

  // Determine which roles are eligible for handoff based on current user role
  const getEligibleNextRoles = () => {
    const roleToCheck = userRole === 'Manager' || userRole === 'Owner' ? task?.role : userRole;
    const roles = (() => {
      switch (roleToCheck) {
        case 'Shooter': return ['Editor'];
        case 'Editor': return ['Ads Manager'];
        case 'Ads Manager': return ['Manager', 'Owner'];
        case 'Social Media Manager': return ['Manager', 'Owner'];
        default: return [];
      }
    })();

    if (roleToCheck === 'Editor') {
      return roles;
    }
    
    return Array.from(new Set([...roles, 'Manager', 'Owner']));
  };

  const eligibleRoles = getEligibleNextRoles();
  const showHandoff = eligibleRoles.length > 0;
  const isManagerOrOwner = userRole === 'Manager' || userRole === 'Owner';
  const isAdsTask = task?.role === 'Ads Manager' || task?.role === 'Social Media Manager';
  const isEditorTask = task?.role === 'Editor';
  const needsScreenshot = isAdsTask; // Only Ads tasks need screenshots now, removing isEditorTask

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!notes.trim() || notes.length < 5) {
      errors.notes = 'Descriptive notes are required (min 5 chars)';
    }
    if (showHandoff && !sendTo && !isManagerOrOwner) {
      errors.sendTo = 'Please select a team member to hand off to';
    }
    if (isAdsTask && !screenshot.trim()) {
      errors.screenshot = 'Campaign delivery screenshot is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedMember = teamMembers.find(m => m.id === sendTo);
    onComplete(
      task!.id, 
      notes, 
      selectedMember ? { name: selectedMember.name, role: selectedMember.role } : undefined,
      needsScreenshot ? screenshot : undefined
    );
    
    // Reset state for next use
    setNotes('');
    setScreenshot('');
    setSendTo('');
    setFormErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task?.type === 'REEL' ? 'Confirm Reel Upload' : 'Complete Task'}
      subtitle={task?.title}
      size="md"
    >
      <div className="p-6 pt-2">
        {/* Task Summary Banner */}
     

        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
              Completion/Handoff Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide details for the next person or audit records..."
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

          {needsScreenshot && (
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                {isAdsTask ? 'Delivery Screenshot' : 'Export/Preview Screenshot'} {!isAdsTask && <span className="text-slate-400 font-normal ml-1">(Optional)</span>} {isAdsTask && <span className="text-red-500">*</span>}
              </label>
              <input 
                type="file" 
                id="screenshot-upload" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
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
                    <p className="text-[12px] font-bold text-emerald-700">Screenshot Attached</p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setScreenshot(''); }}
                      className="text-[11px] text-red-500 font-medium hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400">
                      <Image size={16} />
                    </div>
                    <p className="text-[12px] font-medium text-slate-500">
                      {isAdsTask ? 'Click to upload campaign proof' : 'Click to upload edit preview/confirmation'}
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

          {showHandoff && (
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Hand Off To {isManagerOrOwner && <span className="text-slate-400 font-normal ml-1">(Optional)</span>} {!isManagerOrOwner && <span className="text-red-500">*</span>}
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
                  <option value="">Select recipient…</option>
                  {teamMembers.filter(m => eligibleRoles.includes(m.role)).map((m) => (
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

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold shadow-md shadow-violet-100 transition-all active:scale-[0.98]"
            >
              {task?.type === 'REEL' ? 'Confirm Upload' : (showHandoff ? 'Complete & Hand Off' : 'Complete Task')} <CheckCircle2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
