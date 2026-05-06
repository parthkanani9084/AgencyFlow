import { toast } from 'sonner';
import { get } from 'lodash';
import { getErrorMessage } from './errorHandler';

const extractSuccessMessage = (data: any): string | null => {
  if (!data) return null;

  const message =
    get(data, 'message') ||
    get(data, 'results.message') ||
    get(data, 'data.message') ||
    null;

  if (!message) return null;

  if (typeof message === 'string' && message.trim()) {
    return message.trim();
  }

  if (Array.isArray(message) && message.length > 0) {
    const firstMsg = message[0];
    return typeof firstMsg === 'string' ? firstMsg : firstMsg?.message || null;
  }

  if (typeof message === 'object' && message !== null) {
    return message.message || String(message) || null;
  }

  return null;
};

export const showSuccessToast = (response: any): void => {
  const message = extractSuccessMessage(response?.data || response);
  if (message) {
    toast.success(message);
  }
};

export const showErrorToast = (error: any): void => {
  const message = getErrorMessage(error);
  if (message) {
    toast.error(message);
  }
};

