import { CAMPAIGN_STATUS, WORKFLOW_STAGE, PLATFORMS } from './constants';

export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];
export type WorkflowStage = typeof WORKFLOW_STAGE[keyof typeof WORKFLOW_STAGE];
export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

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
