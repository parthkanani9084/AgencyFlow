import { Agency, SubscriptionPlan, ModuleUsage, ActivityLog, RoleMetrics } from '@/modules/super-admin/types';

// Initial mock data
let agencies: Agency[] = [
  { 
    id: '1', 
    name: 'Nova Media', 
    ownerName: 'Alex Owens', 
    email: 'alex@novamedia.com', 
    mobileNumber: '+1 234-567-8901',
    status: 'active',
    subscription: 'Professional',
    lastActive: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  { 
    id: '2', 
    name: 'Sky High Ads', 
    ownerName: 'Sarah Mitchell', 
    email: 'sarah@skyhigh.com', 
    mobileNumber: '+1 987-654-3210',
    status: 'active',
    subscription: 'Starter',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
  },
  { 
    id: '3', 
    name: 'Velocity Digital', 
    ownerName: 'Marcus Chen', 
    email: 'marcus@velocity.com', 
    mobileNumber: '+1 555-010-9988',
    status: 'inactive',
    subscription: 'Enterprise',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expiryDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
  },
  { 
    id: '4', 
    name: 'Skyline Growth', 
    ownerName: 'Emma Wilson', 
    email: 'emma@skyline.com', 
    mobileNumber: '+1 415-555-0123',
    status: 'active',
    subscription: 'Starter',
    lastActive: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // Expiring in 2 days
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString()
  },
];

let subscriptions: SubscriptionPlan[] = [
  { id: '1', planName: 'Starter', price: 99, status: 'active' },
  { id: '2', planName: 'Professional', price: 299, status: 'active' },
  { id: '3', planName: 'Enterprise', price: 999, status: 'active' },
];

const roles = ['Owner', 'Shooter', 'Manager', 'Editor', 'Ads Manager', 'Social Media Manager'];

const roleModules: Record<string, string[]> = {
  'Owner': ['Dashboard', 'Campaigns', 'Clients', 'Tasks', 'Team', 'Ads Tracking', 'Reports', 'Settings'],
  'Shooter': ['Shooter Dashboard', 'Tasks'],
  'Manager': ['Manager Dashboard', 'Campaigns', 'Clients', 'Tasks', 'Team', 'Ads Tracking', 'Reports', 'Settings', 'Shooter Dashboard', 'Editor Dashboard', 'Ads Manager Dashboard', 'Social Media Dashboard'],
  'Editor': ['Editor Dashboard', 'Tasks'],
  'Ads Manager': ['Ads Manager Dashboard', 'Campaigns', 'Clients', 'Tasks', 'Ads Tracking'],
  'Social Media Manager': ['Social Media Dashboard', 'Campaigns', 'Clients', 'Tasks', 'Ads Tracking'],
};

// Derive union of all modules
const allModules = Array.from(new Set(Object.values(roleModules).flat()));

const generateRoleMetrics = (): RoleMetrics => ({
  views: Math.floor(Math.random() * 1000),
  clicks: Math.floor(Math.random() * 500),
  dataEntered: Math.floor(Math.random() * 100),
  updated: Math.floor(Math.random() * 50),
  deleted: Math.floor(Math.random() * 10),
  currentRecords: Math.floor(Math.random() * 200),
  uniqueBase: Math.floor(Math.random() * 150),
});

let moduleUsage: ModuleUsage[] = allModules.map(moduleName => ({
  module: moduleName,
  roleData: roles.reduce((acc, role) => {

    return { ...acc, [role]: generateRoleMetrics() };
  }, {}),
}));

let activityLogs: ActivityLog[] = [
  { id: '1', action: 'CREATE AGENCY', module: 'BUSINESS AGENCY', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), details: 'Created Nova Media' },
  { id: '2', action: 'UPDATE PLAN', module: 'SUBSCRIPTION', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), details: 'Updated Starter plan price' },
  { id: '3', action: 'DELETE AGENCY', module: 'BUSINESS AGENCY', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), details: 'Deleted old test agency' },
  { id: '4', action: 'DELETE AGENCY', module: 'BUSINESS AGENCY', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), details: 'Deleted old test agency' },
  { id: '5', action: 'DELETE AGENCY', module: 'BUSINESS AGENCY', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), details: 'Deleted old test agency' },
  { id: '6', action: 'CREATE AGENCY', module: 'BUSINESS AGENCY', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), details: 'Created Nova Media' },
];

export const mockService = {
  agency: {
    async getAll(): Promise<Agency[]> {
      return [...agencies];
    },
    async add(agency: Omit<Agency, 'id'>): Promise<Agency> {
      const newAgency = { 
        ...agency, 
        id: Math.random().toString(36).substr(2, 9),
        expiryDate: agency.expiryDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()
      };
      agencies.push(newAgency);
      activityLogs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        action: 'Add Agency',
        module: 'Business Agency',
        timestamp: new Date().toISOString(),
        details: `Added ${agency.name}`
      });
      return newAgency;
    },
    async update(id: string, data: Partial<Agency>): Promise<Agency> {
      const index = agencies.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Agency not found');
      agencies[index] = { ...agencies[index], ...data };
      activityLogs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        action: 'Update Agency',
        module: 'Business Agency',
        timestamp: new Date().toISOString(),
        details: `Updated ${agencies[index].name}`
      });
      return agencies[index];
    },
    async delete(id: string): Promise<void> {
      const agency = agencies.find(a => a.id === id);
      agencies = agencies.filter(a => a.id !== id);
      if (agency) {
        activityLogs.unshift({
          id: Math.random().toString(36).substr(2, 9),
          action: 'Delete Agency',
          module: 'Business Agency',
          timestamp: new Date().toISOString(),
          details: `Deleted ${agency.name}`
        });
      }
    }
  },
  subscription: {
    async getAll(): Promise<SubscriptionPlan[]> {
      return [...subscriptions];
    },
    async updateStatus(id: string, status: 'active' | 'inactive'): Promise<SubscriptionPlan> {
      const index = subscriptions.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Subscription not found');
      subscriptions[index] = { ...subscriptions[index], status };
      activityLogs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        action: 'Toggle Status',
        module: 'Subscription',
        timestamp: new Date().toISOString(),
        details: `Marked ${subscriptions[index].planName} as ${status}`
      });
      return subscriptions[index];
    },
    async updatePlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
      const index = subscriptions.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Subscription not found');
      subscriptions[index] = { ...subscriptions[index], ...data };
      activityLogs.unshift({
        id: Math.random().toString(36).substr(2, 9),
        action: 'Update Plan',
        module: 'Subscription',
        timestamp: new Date().toISOString(),
        details: `Updated ${subscriptions[index].planName} details`
      });
      return subscriptions[index];
    }
  },
  dashboard: {
    async getModuleUsage(): Promise<ModuleUsage[]> {
      return [...moduleUsage];
    },
    async getActivityLogs(): Promise<ActivityLog[]> {
      return [...activityLogs];
    },
    async getRoleWiseUsage(): Promise<Record<string, { module: string; metrics: RoleMetrics }[]>> {
      const result: Record<string, { module: string; metrics: RoleMetrics }[]>= {};
      
      Object.entries(roleModules).forEach(([role, modules]) => {
        result[role] = modules.map(modName => {
          // Find the module in moduleUsage to get consistent data
          const mod = moduleUsage.find(m => m.module === modName);
          return {
            module: modName,
            metrics: mod ? mod.roleData[role] : generateRoleMetrics()
          };
        });
      });
      
      return result;
    }
  }
};
