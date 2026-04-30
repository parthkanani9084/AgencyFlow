import { Reel, AuthUser } from '@/types';
import { reelAgent } from '../agent/reelAgent';

// Mock DB relations
const MOCK_CAMPAIGNS = [
  { id: 'c_spring', name: 'Spring Collection Launch', client: 'Luma Apparel' },
  { id: 'c_cyber', name: 'Cyber-Week Sale', client: 'TechWorld' },
  { id: 'c_gt', name: 'GT Showcase', client: 'Velocity Motors' },
];

/**
 * Service Layer: Reel Scheduling Logic
 * Responsibility: Atomic data access for reels.
 */
export const reelService = {
  /**
   * Fetches reels enriched with campaign and client data.
   */
  getReelsByUserId: async (userId: string): Promise<Reel[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const savedReels = typeof window !== 'undefined' ? localStorage.getItem('agencyflow_reels') : null;
    let reels: Reel[] = savedReels ? JSON.parse(savedReels) : [];

    // For Demo purposes: If we have fewer than 5 reels, inject a robust set of dummy data
    if (reels.length < 5) {
      const dummyReels: Reel[] = [
        { id: 'r1', title: 'Spring Collection Reel #1', campaignId: 'c_spring', assignedToUserId: userId, scheduledDate: new Date(Date.now() + 86400000).toISOString(), status: 'Production', createdAt: new Date().toISOString() },
        { id: 'r2', title: 'Behind the Scenes: Luxe Shoot', campaignId: 'c_spring', assignedToUserId: userId, scheduledDate: new Date(Date.now() + 172800000).toISOString(), status: 'Production', createdAt: new Date().toISOString() },
        { id: 'r3', title: 'Cyber Week Teaser #1', campaignId: 'c_cyber', assignedToUserId: userId, scheduledDate: new Date(Date.now() - 86400000).toISOString(), status: 'Production', createdAt: new Date().toISOString() },
        { id: 'r4', title: 'Trending Gear Review', campaignId: 'c_cyber', assignedToUserId: userId, scheduledDate: new Date(Date.now() + 259200000).toISOString(), status: 'Scheduled', createdAt: new Date().toISOString() },
        { id: 'r5', title: 'Daily Driver Spotlight', campaignId: 'c_gt', assignedToUserId: userId, scheduledDate: new Date(Date.now() + 345600000).toISOString(), status: 'Scheduled', createdAt: new Date().toISOString() },
        { id: 'r6', title: 'Customer Success Story', campaignId: 'c_gt', assignedToUserId: userId, scheduledDate: new Date(Date.now()).toISOString(), status: 'Production', createdAt: new Date().toISOString() },
        { id: 'r7', title: 'Product Unboxing: 4K Camera', campaignId: 'c_cyber', assignedToUserId: userId, scheduledDate: new Date(Date.now() - 172800000).toISOString(), status: 'Upload', createdAt: new Date().toISOString() },
        { id: 'r8', title: 'How-To: Professional Lighting', campaignId: 'c_spring', assignedToUserId: userId, scheduledDate: new Date(Date.now() - 259200000).toISOString(), status: 'Upload', createdAt: new Date().toISOString() },
        { id: 'r9', title: 'Weekend Vlog Teaser', campaignId: 'c_gt', assignedToUserId: userId, scheduledDate: new Date(Date.now() + 432000000).toISOString(), status: 'Scheduled', createdAt: new Date().toISOString() },
      ];
      
      // Merge and remove duplicates by ID
      const allReels = [...reels, ...dummyReels];
      reels = Array.from(new Map(allReels.map(r => [r.id, r])).values());
    }

    // AI Agent enrichment: Attach clientName via relations
    return reelAgent.enrichReelData(reels, MOCK_CAMPAIGNS);
  },

  /**
   * Creates a new reel within a simulated transaction.
   */
  createReel: async (data: { title: string; campaignId: string; scheduledDate: string }, user: AuthUser): Promise<Reel> => {
    // 1. Validate via AI Agent
    reelAgent.validateCreation(data);

    // 2. Simulated Transaction
    const newReel: Reel = {
      id: `r${Date.now()}`,
      title: data.title,
      campaignId: data.campaignId,
      assignedToUserId: user.id,
      scheduledDate: new Date(data.scheduledDate).toISOString(),
      status: 'Production',
      createdAt: new Date().toISOString()
    };

    // 3. Persist (Mock Data Layer)
    const savedReels = typeof window !== 'undefined' ? localStorage.getItem('agencyflow_reels') : null;
    const reels: Reel[] = savedReels ? JSON.parse(savedReels) : [];
    const updatedReels = [newReel, ...reels];
    localStorage.setItem('agencyflow_reels', JSON.stringify(updatedReels));

    // 4. Return enriched object
    const enriched = reelAgent.enrichReelData([newReel], MOCK_CAMPAIGNS);
    return enriched[0];
  }
};

