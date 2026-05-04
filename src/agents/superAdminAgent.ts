import { mockService } from '@/services/mockService';

export const superAdminAgent = {
  async processAction(params: { action: string; module: string; payload: any; role: string }) {
    const { action, module, payload, role } = params;
    
    console.log(`[SuperAdminAgent] Processing: ${module}/${action}`, payload);

    if (role !== 'Super Admin') {
      return { success: false, error: 'Unauthorized: Super Admin role required' };
    }

    try {
      switch (module) {
        case 'business-agency':
          switch (action) {
            case 'list':
              return { success: true, data: await mockService.agency.getAll() };
            case 'add':
              if (!payload.name || !payload.email) {
                return { success: false, error: 'Name and Email are required' };
              }
              const newAgency = await mockService.agency.add(payload);
              return { success: true, data: newAgency };
            case 'update':
              if (!payload.id) return { success: false, error: 'ID is required' };
              const updatedAgency = await mockService.agency.update(payload.id, payload.data);
              return { success: true, data: updatedAgency };
            case 'delete':
              if (!payload.id) return { success: false, error: 'ID is required' };
              await mockService.agency.delete(payload.id);
              return { success: true };
            default:
              return { success: false, error: 'Unknown agency action' };
          }

        case 'subscription':
          switch (action) {
            case 'list':
              return { success: true, data: await mockService.subscription.getAll() };
            case 'update-status':
              if (!payload.id || !payload.status) return { success: false, error: 'ID and Status are required' };
              const updatedSub = await mockService.subscription.updateStatus(payload.id, payload.status);
              return { success: true, data: updatedSub };
            case 'update-plan':
               if (!payload.id) return { success: false, error: 'ID is required' };
               const updatedPlan = await mockService.subscription.updatePlan(payload.id, payload.data);
               return { success: true, data: updatedPlan };
            default:
              return { success: false, error: 'Unknown subscription action' };
          }

        default:
          return { success: false, error: 'Unknown module' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred' };
    }
  }
};
