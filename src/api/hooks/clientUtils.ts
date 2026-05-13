import { STATIC_STRINGS, CLIENT_PLATFORMS, CLIENT_SERVICES } from '@/utils/constants';
import { FormState, Client } from '@/app/client-management/types';

export const validateClientForm = (form: FormState) => {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!form.name.trim()) e.name = STATIC_STRINGS.CLIENT_MGMT_NAME_REQUIRED;
  if (!form.brand.trim()) e.brand = STATIC_STRINGS.CLIENT_MGMT_BRAND_REQUIRED;
  if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = STATIC_STRINGS.FORM_EMAIL_REQUIRED;
  if (!form.packageAmount || isNaN(Number(form.packageAmount)) || Number(form.packageAmount) <= 0) {
    e.packageAmount = STATIC_STRINGS.CLIENT_MGMT_PACKAGE_REQUIRED;
  }
  if (!form.perDaySpend || isNaN(Number(form.perDaySpend)) || Number(form.perDaySpend) < 0) {
    e.perDaySpend = STATIC_STRINGS.CLIENT_MGMT_ERR_PER_DAY_SPEND;
  }
  if (!form.platformType) e.platformType = STATIC_STRINGS.CLIENT_MGMT_ERR_PLATFORM_TYPE;
  if (form.platformType === CLIENT_PLATFORMS.WEBSITE && !form.websiteLink.trim()) e.websiteLink = STATIC_STRINGS.CLIENT_MGMT_ERR_WEBSITE_LINK;
  if (form.platformType === CLIENT_PLATFORMS.OFFLINE && !form.location.trim()) e.location = STATIC_STRINGS.CLIENT_MGMT_ERR_LOCATION;
  if (form.services.length === 0) e.services = STATIC_STRINGS.CLIENT_MGMT_ERR_SERVICES;
  if (form.services.includes(CLIENT_SERVICES.REELS) && (!form.reelsPerMonth || Number(form.reelsPerMonth) <= 0)) {
    e.reelsPerMonth = STATIC_STRINGS.CLIENT_MGMT_ERR_REELS_PER_MONTH;
  }
  return e;
};

export const prepareClientPayload = (form: FormState, editingClient: Client | null) => {
  const submissionData = {
    name: form.name.trim(),
    email: form.email.trim(),
    brand: form.brand.trim(),
    packageAmount: Number(form.packageAmount),
    perDaySpend: Number(form.perDaySpend) || 0,
    planType: form.planType,
    adType: form.adType.trim(),
    platformType: form.platformType as typeof CLIENT_PLATFORMS.WEBSITE | typeof CLIENT_PLATFORMS.OFFLINE,
    location: form.location.trim(),
    websiteLink: form.websiteLink.trim(),
    reelsPerMonth: Number(form.reelsPerMonth) || 0,
    services: form.services
  };

  if (!editingClient) {
    return {
      submissionData,
      payload: {
        client_name: submissionData.name,
        brand_name: submissionData.brand,
        email: submissionData.email,
        service_required: submissionData.services,
        package_amount: submissionData.packageAmount,
        per_day_spend_amount: submissionData.perDaySpend,
        plan_type: submissionData.planType,
        reels_per_month: submissionData.reelsPerMonth,
        platform_type: submissionData.platformType === CLIENT_PLATFORMS.WEBSITE ? STATIC_STRINGS.CLIENT_MGMT_PLATFORM_ONLINE : STATIC_STRINGS.CLIENT_MGMT_PLATFORM_OFFLINE,
        weblink: submissionData.platformType === CLIENT_PLATFORMS.WEBSITE ? submissionData.websiteLink : undefined,
        file_location: submissionData.platformType === CLIENT_PLATFORMS.OFFLINE ? submissionData.location : undefined,
      }
    };
  }

  const payload: any = {};
  if (submissionData.name !== editingClient.name) payload.client_name = submissionData.name;
  if (submissionData.brand !== editingClient.brand) payload.brand_name = submissionData.brand;
  if (submissionData.email !== editingClient.email) payload.email = submissionData.email;
  if (JSON.stringify(submissionData.services.sort()) !== JSON.stringify([...editingClient.services].sort())) payload.service_required = submissionData.services;
  if (submissionData.packageAmount !== editingClient.packageAmount) payload.package_amount = submissionData.packageAmount;
  if (submissionData.perDaySpend !== editingClient.perDaySpend) payload.per_day_spend_amount = submissionData.perDaySpend;
  if (submissionData.planType !== editingClient.planType) payload.plan_type = submissionData.planType;
  if (submissionData.reelsPerMonth !== editingClient.reelsPerMonth) payload.reels_per_month = submissionData.reelsPerMonth;
  
  const platformValue = submissionData.platformType === CLIENT_PLATFORMS.WEBSITE ? STATIC_STRINGS.CLIENT_MGMT_PLATFORM_ONLINE : STATIC_STRINGS.CLIENT_MGMT_PLATFORM_OFFLINE;
  const oldPlatformValue = editingClient.platformType === CLIENT_PLATFORMS.WEBSITE ? STATIC_STRINGS.CLIENT_MGMT_PLATFORM_ONLINE : STATIC_STRINGS.CLIENT_MGMT_PLATFORM_OFFLINE;
  if (platformValue !== oldPlatformValue) payload.platform_type = platformValue;
  
  if (submissionData.websiteLink !== editingClient.websiteLink) payload.weblink = submissionData.websiteLink;
  if (submissionData.location !== editingClient.location) payload.file_location = submissionData.location;

  return { submissionData, payload };
};
