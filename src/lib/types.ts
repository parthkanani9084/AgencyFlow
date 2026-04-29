// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole = 'Owner' | 'Manager' | 'Shooter' | 'Editor' | 'Ads Manager' | 'Client';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

// ─── Clients ──────────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  brand: string;
  budget: number;
  planType: 'monthly' | 'weekly';
  createdAt: string;
}

// ─── Campaigns ────────────────────────────────────────────────────────────────
export type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

export interface Campaign {
  id: string;
  name: string;
  client: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  leads: number;
  startDate: string;
  endDate: string;
  stage: WorkflowStage;
}

// ─── Workflow ─────────────────────────────────────────────────────────────────
export type WorkflowStage = 'Shooting' | 'Raw Upload' | 'Editing' | 'Ads' | 'Complete';

// ─── Tasks ────────────────────────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'ASSIGNED' | 'SHOOTER_DONE' | 'EDITOR_DONE';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskRole = 'Shooter' | 'Editor' | 'Ads Manager' | 'Owner' | 'Manager';

export interface TaskNote {
  role: TaskRole;
  message: string;
  timestamp: string;
  author?: string; // Who wrote the note
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  role: TaskRole;
  client: string;
  campaign: string;
  campaignId?: string; // Scoped campaign ID
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  description?: string;
  // Workflow fields
  notes?: string; // Legacy field for existing UI
  roleNotes?: TaskNote[]; // Scalable role-based notes
  shooterNotes?: string; // Specific field for easy access
  editorNotes?: string;  // Specific field for easy access
  previousNotes?: string;
  fromShooter?: string;
  nextRole?: string;
  forwardedBy?: string;
  // Ads fields
  platform?: string;
  budget?: number;
  spent?: number;
  leads?: number;
  screenshot?: string;
}

// ─── Files ────────────────────────────────────────────────────────────────────
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

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType = 'task_assigned' | 'task_completed' | 'campaign_update' | 'deadline_warning' | 'handoff' | 'system';

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

// ─── Reports ──────────────────────────────────────────────────────────────────
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
  stage: WorkflowStage;
  startDate: string;
  endDate: string;
}
