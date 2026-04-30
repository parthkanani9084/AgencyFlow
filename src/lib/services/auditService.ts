import { Campaign, AuthUser, AuditLog } from '@/types';
import { auditAgent } from '../agent/auditAgent';

/**
 * Service Layer: Campaign + Audit Logging Logic
 * Responsibility: Enforce atomic campaign updates and audit log creation.
 * Simulates transactional integrity for high data reliability.
 */
export const auditService = {
  /**
   * Performs an atomic campaign update with an accompanying audit log.
   * Logic: BEGIN TRANSACTION -> Update Campaign -> Create Log -> COMMIT
   */
  performAtomicUpdate: (original: Campaign, updatedData: Campaign, user: AuthUser | null): Campaign => {
    if (!user) return updatedData;

    try {
      // 1. Calculate diff via AI Agent (internal validation)
      const diff = auditService.calculateDiff(original, updatedData);
      
      // If no changes, return as is (no log needed)
      if (!diff) return original;

      // 2. Generate immutable audit log entry
      const newLog = auditAgent.processUpdateEvent(original.id, user, diff);

      // 3. Atomically merge updated data with new audit history
      return {
        ...updatedData,
        auditLogs: [...(original.auditLogs || []), newLog]
      };
    } catch (error) {
      console.error('[Service] Atomic Update Failed. Rolling back changes.', error);
      // Recovery: Return original state to prevent partial update/data leakage
      return original;
    }
  },

  /**
   * Retrieves and reconciles audit logs for a specific campaign.
   */
  getEditHistory: (campaign: Campaign) => {
    // Coordinate with AI Agent for validation and recovery
    return auditAgent.validateAndNormalizeHistory(campaign.auditLogs || []);
  },

  /**
   * Detects differences between old and new campaign states (simple diff).
   */
  calculateDiff: (oldData: any, newData: any) => {
    const changes: any = {};
    const keysToIgnore = ['auditLogs', 'performanceHistory']; // Dynamic metadata ignored in direct diff
    
    Object.keys(newData).forEach(key => {
      if (!keysToIgnore.includes(key) && newData[key] !== oldData[key]) {
        changes[key] = { from: oldData[key], to: newData[key] };
      }
    });
    return Object.keys(changes).length > 0 ? changes : null;
  }
};
