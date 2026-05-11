import React from 'react';
import Modal from '@/components/ui/Modal';
import { STATIC_STRINGS, CLIENT_PLATFORMS, CLIENT_PLANS } from '@/utils/constants';
import { FormState, Client, SERVICE_OPTIONS } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient: Client | null;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Partial<Record<keyof FormState, string>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof FormState, string>>>>;
  onSave: () => void;
  isProcessing: boolean;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  editingClient,
  form,
  setForm,
  errors,
  setErrors,
  onSave,
  isProcessing,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={editingClient ? STATIC_STRINGS.CLIENT_MGMT_EDIT_CLIENT : STATIC_STRINGS.CLIENT_MGMT_ADD_CLIENT}
      subtitle={editingClient ? STATIC_STRINGS.CLIENT_MGMT_MODAL_EDIT_SUBTITLE : STATIC_STRINGS.CLIENT_MGMT_MODAL_ADD_SUBTITLE}
      size="lg"
    >
      <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_CLIENT_NAME} <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
              placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_NAME}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
            {errors.name && <p className="mt-1 text-[11.5px] text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_BRAND_NAME} <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => { setForm(f => ({ ...f, brand: e.target.value })); setErrors(er => ({ ...er, brand: '' })); }}
              placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_BRAND}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
            {errors.brand && <p className="mt-1 text-[11.5px] text-red-500">{errors.brand}</p>}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.FORM_EMAIL_ADDRESS} <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
              placeholder={STATIC_STRINGS.FORM_EMAIL_PLACEHOLDER_DEMO}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
            {errors.email && <p className="mt-1 text-[11.5px] text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-2.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_SERVICES}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SERVICE_OPTIONS.map((service) => (
              <label key={service.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={form.services.includes(service.value)}
                  onChange={(e) => {
                    const val = service.value;
                    setForm(f => ({
                      ...f,
                      services: e.target.checked ? [...f.services, val] : f.services.filter(s => s !== val)
                    }));
                    setErrors(er => ({ ...er, services: '' }));
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-violet-600 accent-violet-600 cursor-pointer"
                />
                <span className="text-[13px] text-slate-600 group-hover:text-slate-900 transition-colors font-medium">{service.label}</span>
              </label>
            ))}
          </div>
          {errors.services && <p className="mt-1 text-[11.5px] text-red-500">{errors.services}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PACKAGE} <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">{STATIC_STRINGS.CURRENCY_SYMBOL}</span>
              <input
                type="number"
                value={form.packageAmount}
                onChange={(e) => { setForm(f => ({ ...f, packageAmount: e.target.value })); setErrors(er => ({ ...er, packageAmount: '' })); }}
                placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_PACKAGE}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>
            {errors.packageAmount && <p className="mt-1 text-[11.5px] text-red-500">{errors.packageAmount}</p>}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PER_DAY_SPEND}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">{STATIC_STRINGS.CURRENCY_SYMBOL}</span>
              <input
                type="number"
                value={form.perDaySpend}
                onChange={(e) => { setForm(f => ({ ...f, perDaySpend: e.target.value })); setErrors(er => ({ ...er, perDaySpend: '' })); }}
                placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_SPEND}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>
            {errors.perDaySpend && <p className="mt-1 text-[11.5px] text-red-500">{errors.perDaySpend}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PLAN_TYPE} <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            {[
              { label: STATIC_STRINGS.CLIENT_MGMT_PLAN_WEEKLY, value: CLIENT_PLANS.WEEKLY },
              { label: STATIC_STRINGS.CLIENT_MGMT_PLAN_MONTHLY, value: CLIENT_PLANS.MONTHLY },
              { label: STATIC_STRINGS.CLIENT_MGMT_PLAN_YEARLY, value: CLIENT_PLANS.YEARLY },
            ].map((plan) => (
              <button
                key={plan.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, planType: plan.value as any }))}
                className={`flex-1 py-2.5 rounded-lg border text-[13px] font-semibold transition-all ${
                  form.planType === plan.value ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-500'
                }`}
              >
                {plan.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_REELS_PER_MONTH}</label>
            <input
              type="number"
              value={form.reelsPerMonth}
              onChange={(e) => { setForm(f => ({ ...f, reelsPerMonth: e.target.value })); setErrors(er => ({ ...er, reelsPerMonth: '' })); }}
              placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_REELS}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            />
            {errors.reelsPerMonth && <p className="mt-1 text-[11.5px] text-red-500">{errors.reelsPerMonth}</p>}
          </div>
          <div>
            <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.CLIENT_MGMT_LABEL_PLATFORM_TYPE}</label>
            <select
              value={form.platformType}
              onChange={(e) => { setForm(f => ({ ...f, platformType: e.target.value as any })); setErrors(er => ({ ...er, platformType: '' })); }}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
            >
              <option value="">{STATIC_STRINGS.CLIENT_MGMT_SELECT_PLATFORM}</option>
              <option value={CLIENT_PLATFORMS.WEBSITE}>{STATIC_STRINGS.CLIENT_MGMT_PLATFORM_WEBSITE}</option>
              <option value={CLIENT_PLATFORMS.OFFLINE}>{STATIC_STRINGS.CLIENT_MGMT_PLATFORM_OFFLINE}</option>
            </select>
            {errors.platformType && <p className="mt-1 text-[11.5px] text-red-500">{errors.platformType}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {form.platformType === CLIENT_PLATFORMS.WEBSITE && (
              <>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5 animate-in slide-in-from-top-1">{STATIC_STRINGS.CLIENT_MGMT_LABEL_WEBSITE_LINK}</label>
                <input
                  type="url"
                  value={form.websiteLink}
                  onChange={(e) => { setForm(f => ({ ...f, websiteLink: e.target.value })); setErrors(er => ({ ...er, websiteLink: '' })); }}
                  placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_WEBSITE}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 animate-in slide-in-from-top-1"
                />
                {errors.websiteLink && <p className="mt-1 text-[11.5px] text-red-500">{errors.websiteLink}</p>}
              </>
            )}
            {form.platformType === CLIENT_PLATFORMS.OFFLINE && (
              <>
                <label className="block text-[12.5px] font-semibold text-slate-700 mb-1.5 animate-in slide-in-from-top-1">{STATIC_STRINGS.CLIENT_MGMT_LABEL_LOCATION}</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => { setForm(f => ({ ...f, location: e.target.value })); setErrors(er => ({ ...er, location: '' })); }}
                  placeholder={STATIC_STRINGS.CLIENT_MGMT_PLACEHOLDER_LOCATION}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 animate-in slide-in-from-top-1"
                />
                {errors.location && <p className="mt-1 text-[11.5px] text-red-500">{errors.location}</p>}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">{STATIC_STRINGS.CAMPAIGN_MGMT_CANCEL}</button>
          <button 
            onClick={onSave} 
            disabled={isProcessing}
            className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? STATIC_STRINGS.FORM_SAVING : (editingClient ? STATIC_STRINGS.CAMPAIGN_MGMT_SAVE_CHANGES : STATIC_STRINGS.CLIENT_MGMT_ADD_CLIENT)}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(ClientModal);
