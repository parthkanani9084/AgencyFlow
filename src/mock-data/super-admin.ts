import { AuthUser, TeamMember } from '@/types';

export const SUPER_ADMIN_CREDENTIALS = {
  email: 'admin@agencyflow.io',
  password: 'Admin@2026',
};

// Mock OTP storage (temporary)
export const mockOTPs: Record<string, string> = {};

// Mock Owners
export const mockOwners: TeamMember[] = [
  {
    id: 'u1',
    name: 'Alex Owens',
    email: 'alex.owens@agencyflow.io',
    role: 'Owner',
    status: 'active',
    joinedAt: '2024-01-15',
    tasksCompleted: 45,
    tasksActive: 12,
    agencyName: 'AgencyFlow Main',
  },
];
