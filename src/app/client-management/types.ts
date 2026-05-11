import { STATIC_STRINGS, CLIENT_SERVICES, CLIENT_PLANS, CLIENT_PLATFORMS } from '@/utils/constants';

export interface Payment {
  amount: number;
  date: string;
  notes: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  brand: string;
  packageAmount: number; 
  perDaySpend: number;   
  planType: typeof CLIENT_PLANS[keyof typeof CLIENT_PLANS];
  adType?: string;
  platformType?: typeof CLIENT_PLATFORMS.WEBSITE | typeof CLIENT_PLATFORMS.OFFLINE;
  location?: string;
  websiteLink?: string;
  reelsPerMonth?: number;
  services: string[];
  payments: Payment[];
  createdAt: string;
}

export interface FormState {
  name: string; 
  email: string;
  brand: string; 
  packageAmount: string; 
  perDaySpend: string; 
  planType: typeof CLIENT_PLANS[keyof typeof CLIENT_PLANS];
  adType: string;
  platformType: typeof CLIENT_PLATFORMS.WEBSITE | typeof CLIENT_PLATFORMS.OFFLINE | '';
  location: string;
  websiteLink: string;
  reelsPerMonth: string;
  services: string[];
}

export const EMPTY_FORM: FormState = { 
  name: '', 
  email: '',
  brand: '', 
  packageAmount: '', 
  perDaySpend: '', 
  planType: CLIENT_PLANS.MONTHLY,
  adType: '',
  platformType: '',
  location: '',
  websiteLink: '',
  reelsPerMonth: '',
  services: []
};

export const SERVICE_OPTIONS = [
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_REELS, value: CLIENT_SERVICES.REELS },
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_CAMPAIGN, value: CLIENT_SERVICES.CAMPAIGN },
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_META, value: CLIENT_SERVICES.META },
  { label: STATIC_STRINGS.CLIENT_MGMT_SERVICE_SOCIAL, value: CLIENT_SERVICES.SOCIAL_MEDIA },
];

export const getClientTotalPaid = (client: Client) => {
  return client.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
};
