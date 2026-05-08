
export type UserRole =
  | "Super Admin"
  | "Owner"
  | "Manager"
  | "Shooter"
  | "Editor"
  | "Ads Manager"
  | "Social Media Manager"
  | "Client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

export type WorkflowStage = 'In Draft' | 'In Review' | 'Process' | 'Publish';

export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskRole = "Shooter" | "Editor" | "Ads Manager" | "Social Media Manager" | "Owner" | "Manager";

export interface TaskNote {
  role: TaskRole;
  message: string;
  timestamp: string;
  author?: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  role: TaskRole;
  client: string;
  brand?: string;
  campaign: string;
  campaignId?: string;
  deadline: string;
  status: TaskStatus | string; 
  priority?: TaskPriority;
  description?: string;
  notes?: string;
  roleNotes?: TaskNote[];
  shooterNotes?: string;
  editorNotes?: string;
  previousNotes?: string;
  fromShooter?: string;
  nextRole?: string;
  forwardedBy?: string;
  platform?: string;
  budget?: number;
  spent?: number;
  leads?: number;
  screenshot?: string;
  type?: 'TASK' | 'REEL';
  scheduledDate?: string;
  clientName?: string;
  activityLogs?: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  status: string;
  userId: string;
  role: string;
  timestamp: string;
  note?: string;
}

export interface Reel {
  id: string;
  title: string;
  campaignId: string;
  assignedToUserId: string;
  scheduledDate: string;
  status?: 'Scheduled' | 'Production' | 'Upload';
  createdAt: string;
  clientName?: string;
}
export type CampaignStatus = "active" | "paused" | "completed" | "in draft" | "archived";

export interface Campaign {
  id: string;
  name: string;
  client: string;
  clientId?: string;
  brand?: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  leads: number;
  roas?: number;
  startDate: string;
  endDate: string;
  stage?: WorkflowStage;
  assignee?: string;
  assigneeInitials?: string;
  assignedAdsManagerId?: string;
  assignedSocialMediaManagerId?: string;
  platform?: string;
  auditLogs?: AuditLog[];
  performanceHistory?: PerformanceLog[];
}

export interface PerformanceLog {
  id: string;
  date: string;
  addedSpend: number;
  addedLeads: number;
  newRoas: number;
}

export interface AuditLog {
  id: string;
  campaignId: string;
  editedBy: {
    userId: string;
    name: string;
    role: UserRole;
  };
  timestamp: string;
  changes?: Record<string, { from: any; to: any }>;
}
export interface Client {
  id: string;
  name: string;
  brand: string;
  budget: number;
  planType: 'monthly' | 'weekly';
  createdAt: string;
}
export type FileType = 'image' | 'video' | 'document' | 'archive';
export type FileStage = 'raw' | 'edited' | 'final' | 'asset';

export interface ManagedFile {
  id: string;
  name: string;
  type: FileType;
  stage: FileStage;
  size: string;
  campaign: string;
  client: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
}
export type NotificationType = 
  | 'task_assigned' 
  | 'task_completed' 
  | 'campaign_update' 
  | 'deadline_warning' 
  | 'handoff' 
  | 'system' 
  | 'TASK_VERIFICATION';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actor?: string;
  targetId?: string;
  targetType?: 'task' | 'campaign' | 'client';
}
export interface CampaignReport {
  campaignId: string;
  campaignName: string;
  client: string;
  budget: number;
  spent: number;
  leads: number;
  roas: number;
  tasksTotal: number;
  tasksCompleted: number;
  stage: string;
  startDate: string;
  endDate: string;
}
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  joinedAt: string;
  tasksCompleted: number;
  tasksActive: number;
  agencyName?: string;
}
