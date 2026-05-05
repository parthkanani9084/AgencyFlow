import { AuditLog, AuthUser } from '@/types';


export const auditAgent = {

  processUpdateEvent: (campaignId: string, user: AuthUser, changes?: any): AuditLog => {
    if (!campaignId || !user.id || !user.role) {
      throw new Error('[Agent] Consistency Violation: Missing critical identity data');
    }
    const timestamp = new Date().toISOString();

    return {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      campaignId,
      editedBy: {
        userId: user.id,
        name: user.name,
        role: user.role
      },
      timestamp,
      changes: changes || {}
    };
  },

  validateAndNormalizeHistory: (logs: AuditLog[]) => {
    if (!logs || !Array.isArray(logs)) {
      return { totalEdits: 0, history: [], status: 'empty' };
    }
    const validatedLogs = logs.filter(log => {
      const isValid = log.id && log.editedBy?.userId && log.timestamp;
      if (!isValid) console.warn('[Agent] Dropping inconsistent log entry:', log.id);
      return isValid;
    });
    const uniqueLogs = Array.from(new Map(validatedLogs.map(l => [l.id, l])).values());
    const normalized = uniqueLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      totalEdits: normalized.length,
      history: normalized,
      status: normalized.length === logs.length ? 'consistent' : 'reconciled'
    };
  }
};
