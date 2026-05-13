export type CampaignStatus = 'active' | 'draft' | 'pause' | 'completed' | 'archived';
export type WorkflowStage = 'in draft' | 'in review' | 'process' | 'publish';
export type Platform = 'Meta' | 'Facebook' | 'Instagram' | 'Google' | 'TikTok' | 'LinkedIn' | 'Multi';

export interface Campaign {
  id: string;
  name: string;
  client: string;
  clientId: string;
  status: CampaignStatus;
  stage: WorkflowStage;
  assignee: string;
  assigneeId: string;
  assigneeInitials: string;
  deadline: string;
  spend: string;
  budget: string;
  leads: number;
  roas: number;
  platform: Platform;
  platforms: string[];
  createdAt: string;
  auditLogs?: any[];
  performanceHistory?: {
    id: string;
    date: string;
    addedSpend: number;
    addedLeads: number;
    newRoas: number;
  }[];
}

export type SortField = 'name' | 'client' | 'deadline' | 'leads' | 'roas' | 'spend' | null;
export type SortDir = 'asc' | 'desc';
