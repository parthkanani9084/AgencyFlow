
export const getInitials = (name: string): string => {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const REGEX = {
  EMAIL: /^\S+@\S+\.\S+$/,
};
