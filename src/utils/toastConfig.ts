export const TOAST_CONFIG: {
  enableSuccessToasts: boolean;
  enableErrorToasts: boolean;
  excludeEndpoints: string[];
  excludeMethods: string[];
} = {
  enableSuccessToasts: true,
  enableErrorToasts: true,
  excludeEndpoints: [
  ],
  excludeMethods: [],
};

export const shouldShowToast = (url?: string, method?: string): boolean => {
  if (!url || !method) return true;

  if (TOAST_CONFIG.excludeMethods.includes(method.toUpperCase())) {
    return false;
  }
  const isExcluded = TOAST_CONFIG.excludeEndpoints.some(pattern =>
    url.includes(pattern)
  );

  return !isExcluded;
};
