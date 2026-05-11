import React from 'react';
import { Plus } from 'lucide-react';
import { STATIC_STRINGS, TASK_MGMT_KEYS } from '@/utils/constants';

interface TaskHeaderProps {
  totalEntries: number;
  isRestricted: boolean;
  onAddClick: () => void;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({ totalEntries, isRestricted, onAddClick }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 id={TASK_MGMT_KEYS.TITLE_ID} className="text-[22px] font-bold text-slate-900 tracking-tight">{STATIC_STRINGS.TASK_MGMT_TITLE}</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">{totalEntries} {STATIC_STRINGS.TASK_MGMT_TASKS_SUBTITLE}</p>
      </div>
      {!isRestricted && (
        <button
          id={TASK_MGMT_KEYS.ADD_BTN_ID}
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white text-[13.5px] font-semibold transition-all shadow-sm"
        >
          <Plus size={16} />
          {STATIC_STRINGS.TASK_MGMT_ADD_TASK}
        </button>
      )}
    </div>
  );
};

export default TaskHeader;
