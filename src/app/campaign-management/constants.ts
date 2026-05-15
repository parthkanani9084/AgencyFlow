export const CAMPAIGN_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  PAUSE: 'pause',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export const WORKFLOW_STAGE = {
  DRAFT: 'in draft',
  REVIEW: 'in review',
  PROCESS: 'process',
  PUBLISH: 'publish',
} as const;

export const PLATFORMS = {
  META: 'Meta',
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
  GOOGLE: 'Google',
  TIKTOK: 'TikTok',
  LINKEDIN: 'LinkedIn',
  MULTI: 'Multi',
} as const;
