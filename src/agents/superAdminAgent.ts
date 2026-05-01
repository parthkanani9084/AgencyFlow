import { superAdminService } from '@/services/superAdminService';

export const superAdminAgent = {
  async processAction(action: 'get_owners' | 'add_owner' | 'delete_owner' | 'update_owner', payload: any) {
    console.log(`[SuperAdminAgent] Processing action: ${action}`, payload);

    switch (action) {
      case 'get_owners':
        const owners = await superAdminService.getOwners();
        return { success: true, data: owners };

      case 'add_owner':
        if (!payload.name || !payload.email || !payload.agencyName) {
          return { success: false, error: 'Name, email, and agency name are required' };
        }
        // Basic validation
        if (!payload.email.includes('@')) {
          return { success: false, error: 'Invalid email format' };
        }
        return await superAdminService.addOwner(payload);

      case 'delete_owner':
        if (!payload.id) {
          return { success: false, error: 'Owner ID is required' };
        }
        return await superAdminService.deleteOwner(payload.id);

      case 'update_owner':
        if (!payload.id) {
          return { success: false, error: 'Owner ID is required' };
        }
        return await superAdminService.updateOwner(payload.id, payload.data);

      default:
        return { success: false, error: 'Unknown action' };
    }
  }
};
