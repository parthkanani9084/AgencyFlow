

import { get } from 'lodash';

export const getErrorMessage = (error: any): string | null => {
  
  const responseData = get(error, 'response.data', null);
  
  if (responseData) {
   
    const errorMessage =
      get(responseData, 'message') ||
      get(responseData, 'error.message') ||
      get(responseData, 'error') ||
      get(responseData, 'results.message') ||
      get(responseData, 'results.error') ||
      get(responseData, 'errors[0].message') ||
      get(responseData, 'errors[0]') ||
      null;

    if (errorMessage) {

      if (Array.isArray(errorMessage)) {
        if (errorMessage.length > 0) {
          const firstError = errorMessage[0];
          return typeof firstError === 'string' 
            ? firstError 
            : firstError?.message || null;
        }
      }


      if (typeof errorMessage === 'object' && errorMessage !== null) {
        return errorMessage.message || String(errorMessage) || null;
      }

      
      if (typeof errorMessage === 'string' && errorMessage.trim()) {
        return errorMessage.trim();
      }
    }


    const errorsArray = get(responseData, 'errors');
    if (Array.isArray(errorsArray) && errorsArray.length > 0) {
      const firstError = errorsArray[0];
      if (typeof firstError === 'string') {
        return firstError;
      }
      if (typeof firstError === 'object' && firstError?.message) {
        return firstError.message;
      }
    }
  }

  return null;
};
