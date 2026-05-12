'use client';

import React, { useState } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { useAuth, ROLE_HOME } from '@/context/AuthContext';
import { STATIC_STRINGS, STORAGE_KEYS } from '@/utils/constants';
import { ROUTES } from '@/constants/routes';
import { UserRole, AuthUser } from '@/types';
import { useLogin, mapRole } from '@/api/hooks/useLogin';
import store from '@/utils/localstorage';
import LoginSidebar from './LoginSidebar';

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

const getInitials = (name: string) => {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const LoadingSpinner = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

interface AuthInputProps {
  id: keyof FormValues;
  label: string;
  type?: string;
  placeholder: string;
  register: UseFormRegister<FormValues>;
  errors: FieldErrors<FormValues>;
  validation?: object;
  autoComplete?: string;
  children?: React.ReactNode;
}

const AuthInput = ({ id, label, type = 'text', placeholder, register, errors, validation, autoComplete, children }: AuthInputProps) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-700">
        {label}
      </label>
      {children}
    </div>
    <input
      id={id}
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 rounded-lg border text-[13.5px] bg-white text-slate-900 placeholder-slate-400 transition-colors outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${
        errors[id] ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
      } ${id === 'password' ? 'pr-10' : ''}`}
      {...register(id, validation)}
    />
    {errors[id] && (
      <p className="mt-1.5 text-[12px] text-red-600 flex items-center gap-1">
        {errors[id]?.message as string}
      </p>
    )}
  </div>
);

export default function LoginForm() {
  const router = useRouter();
  const { setAuthenticatedUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: loginApi, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await loginApi({ email: data.email, password: data.password });

      if (response.success && response.results) {
        const { user: apiUser, accessToken } = response.results;
        const mappedRole = mapRole(apiUser.role);

        if (!mappedRole) throw new Error(STATIC_STRINGS.LOGIN_ERR_UNAUTHORIZED_ROLE);

        const authUser: AuthUser = {
          id: apiUser.id,
          name: apiUser.full_name,
          email: apiUser.email,
          role: mappedRole as UserRole,
          avatarInitials: getInitials(apiUser.full_name || ''),
        };

        setAuthenticatedUser(authUser);
        if (accessToken) store.setValue(STORAGE_KEYS.AUTH_TOKEN, accessToken);

        router.push(ROLE_HOME[authUser.role] || ROUTES.OWNER_DASHBOARD);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || STATIC_STRINGS.LOGIN_LOGIN_FAILED);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <LoginSidebar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 bg-slate-50">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-semibold text-slate-900 text-lg">{STATIC_STRINGS.LOGIN_PLATFORM_NAME}</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">{STATIC_STRINGS.LOGIN_FORM_SIGN_IN_BTN}</h2>
            <p className="mt-1 text-[13.5px] text-slate-500">{STATIC_STRINGS.LOGIN_SUBTITLE}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <AuthInput
              id="email"
              label={STATIC_STRINGS.LOGIN_FORM_EMAIL_LABEL}
              type="email"
              autoComplete="email"
              placeholder={STATIC_STRINGS.LOGIN_FORM_EMAIL_PLACEHOLDER}
              register={register}
              errors={errors}
              validation={{
                required: STATIC_STRINGS.LOGIN_ERR_EMAIL_REQ,
                pattern: { value: /^\S+@\S+\.\S+$/, message: STATIC_STRINGS.LOGIN_ERR_EMAIL_INVALID },
              }}
            />

            <div className="relative">
              <AuthInput
                id="password"
                label={STATIC_STRINGS.LOGIN_FORM_PWD_LABEL}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={STATIC_STRINGS.LOGIN_FORM_PWD_PLACEHOLDER}
                register={register}
                errors={errors}
                validation={{
                  required: STATIC_STRINGS.LOGIN_ERR_PWD_REQ,
                  minLength: { value: STATIC_STRINGS.LOGIN_PWD_MIN_LENGTH as number, message: STATIC_STRINGS.LOGIN_ERR_PWD_MIN },
                }}
              >
                {/* <button type="button" className="text-[12px] text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  {STATIC_STRINGS.LOGIN_FORM_PWD_FORGOT}
                </button> */}
              </AuthInput>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-violet-600 cursor-pointer" {...register('remember')} />
              <label htmlFor="remember" className="text-[13px] text-slate-600 cursor-pointer">{STATIC_STRINGS.LOGIN_FORM_REMEMBER}</label>
            </div> */}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-2.5 rounded-lg transition-all duration-150"
            >
              {isPending ? <><LoadingSpinner />{STATIC_STRINGS.LOGIN_FORM_SIGNING_IN}</> : <>{STATIC_STRINGS.LOGIN_FORM_SIGN_IN_BTN}<ArrowRight size={15} /></>}
            </button>
          </form>

          {/* <p className="mt-6 text-center text-[12px] text-slate-500">
            {STATIC_STRINGS.LOGIN_NO_ACCOUNT}{' '}
            <button type="button" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
              {STATIC_STRINGS.LOGIN_REQUEST_ACCESS}
            </button>
          </p> */}

          {/* <p className="mt-4 text-center text-[11px] text-slate-400">
            {STATIC_STRINGS.LOGIN_TERMS_AGREEMENT}{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">{STATIC_STRINGS.LOGIN_TERMS_SERVICE}</button>{' '}
            {STATIC_STRINGS.LOGIN_AND}{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">{STATIC_STRINGS.LOGIN_PRIVACY_POLICY}</button>.
          </p> */}
        </div>
      </div>
    </div>
  );
}

