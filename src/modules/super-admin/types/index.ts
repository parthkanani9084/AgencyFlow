export interface Agency {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  mobileNumber: string;
  status: 'active' | 'inactive';
  subscription: string;
  lastActive: string;
  expiryDate: string;
  startDate: string;
}

export interface RoleMetrics {
  views: number;
  clicks: number;
  dataEntered: number;
  updated: number;
  deleted: number;
  currentRecords: number;
  uniqueBase: number;
}

export interface ModuleUsage {
  module: string;
  roleData: Record<string, RoleMetrics>;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
}

export interface SubscriptionPlan {
  id: string;
  planName: string;
  price: number;
  status: 'active' | 'inactive';
}
