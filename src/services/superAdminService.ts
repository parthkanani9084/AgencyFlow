import { mockOwners } from '@/mock-data/super-admin';
import { TeamMember } from '@/types';

export const superAdminService = {
  async getOwners(): Promise<TeamMember[]> {
    return [...mockOwners];
  },

  async addOwner(ownerData: Omit<TeamMember, 'id' | 'joinedAt' | 'tasksCompleted' | 'tasksActive'>): Promise<{ success: boolean; data?: TeamMember; error?: string }> {
    if (mockOwners.find(o => o.email === ownerData.email)) {
      return { success: false, error: 'Owner with this email already exists' };
    }

    const newOwner: TeamMember = {
      ...ownerData,
      id: `u${Date.now()}`,
      joinedAt: new Date().toISOString().split('T')[0],
      tasksCompleted: 0,
      tasksActive: 0,
      status: 'active',
      role: 'Owner',
    };

    mockOwners.push(newOwner);
    return { success: true, data: newOwner };
  },

  async deleteOwner(id: string): Promise<{ success: boolean; error?: string }> {
    const index = mockOwners.findIndex(o => o.id === id);
    if (index === -1) return { success: false, error: 'Owner not found' };
    
    mockOwners.splice(index, 1);
    return { success: true };
  },

  async updateOwner(id: string, data: Partial<TeamMember>): Promise<{ success: boolean; data?: TeamMember; error?: string }> {
    const index = mockOwners.findIndex(o => o.id === id);
    if (index === -1) return { success: false, error: 'Owner not found' };

    mockOwners[index] = { ...mockOwners[index], ...data };
    return { success: true, data: mockOwners[index] };
  }
};
