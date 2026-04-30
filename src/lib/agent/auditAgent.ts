import { AuditLog, AuthUser } from '@/types';

/**
 * AI Agent Layer: Audit Validation, Recovery & Consistency Enforcement
 * Responsibility: Ensure every campaign update is backed by a valid audit log.
 * Detects missing entries and normalizes data for reliable consumption.
 */
export const auditAgent = {
  /**
   * Validates and normalizes an audit log entry.
   * Ensures atomicity and required fields.
   */
  processUpdateEvent: (campaignId: string, user: AuthUser, changes?: any): AuditLog => {
    if (!campaignId || !user.id || !user.role) {
      throw new Error('[Agent] Consistency Violation: Missing critical identity data');
    }

    // AI Agent Rule: Use server-relative timestamp simulation
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

  /**
   * Reconciles and validates edit history for display.
   * Responsibility: Detection and Recovery of inconsistent states.
   */
  validateAndNormalizeHistory: (logs: AuditLog[]) => {
    if (!logs || !Array.isArray(logs)) {
      return { totalEdits: 0, history: [], status: 'empty' };
    }

    // 1. Consistency Check: Detect nulls or missing required fields
    const validatedLogs = logs.filter(log => {
      const isValid = log.id && log.editedBy?.userId && log.timestamp;
      if (!isValid) console.warn('[Agent] Dropping inconsistent log entry:', log.id);
      return isValid;
    });

    // 2. Deduplication (Recovery): Prevent duplicate entries from failed retries
    const uniqueLogs = Array.from(new Map(validatedLogs.map(l => [l.id, l])).values());

    // 3. Normalization: Sort by latest
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
