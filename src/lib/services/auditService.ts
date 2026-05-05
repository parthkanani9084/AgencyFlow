import { Campaign, AuthUser, AuditLog } from '@/types';
import { auditAgent } from '../agent/auditAgent';

export const auditService = {
 
  performAtomicUpdate: (original: Campaign, updatedData: Campaign, user: AuthUser | null): Campaign => {
    if (!user) return updatedData;

    try {
      const diff = auditService.calculateDiff(original, updatedData);
      if (!diff) return original;
      const newLog = auditAgent.processUpdateEvent(original.id, user, diff);
      return {
        ...updatedData,
        auditLogs: [...(original.auditLogs || []), newLog]
      };
    } catch (error) {
      console.error('[Service] Atomic Update Failed. Rolling back changes.', error);
      return original;
    }
  },
  getEditHistory: (campaign: Campaign) => {
    return auditAgent.validateAndNormalizeHistory(campaign.auditLogs || []);
  },
  calculateDiff: (oldData: any, newData: any) => {
    const changes: any = {};
    const keysToIgnore = ['auditLogs', 'performanceHistory']; 
    
    Object.keys(newData).forEach(key => {
      if (!keysToIgnore.includes(key) && newData[key] !== oldData[key]) {
        changes[key] = { from: oldData[key], to: newData[key] };
      }
    });
    return Object.keys(changes).length > 0 ? changes : null;
  }
};
