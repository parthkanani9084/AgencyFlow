'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Zap, BarChart3, Users, Shield } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { useAuth, ROLE_HOME } from '@/context/AuthContext';
import { STATIC_STRINGS, ROLES } from '@/utils/constants';
import { ROUTES } from '@/constants/routes';
import { UserRole, AuthUser } from '@/types';
import { useLogin, mapRole } from '@/api/hooks/useLogin';
import store from '@/utils/localstorage';
import { STORAGE_KEYS } from '@/utils/constants';

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

const features = [
  { icon: Zap, text: STATIC_STRINGS.LOGIN_FEATURE_PIPELINE },
  { icon: BarChart3, text: STATIC_STRINGS.LOGIN_FEATURE_ADS },
  { icon: Users, text: STATIC_STRINGS.LOGIN_FEATURE_SCALE },
  { icon: Shield, text: STATIC_STRINGS.LOGIN_FEATURE_ROLES },
];

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
      const response = await loginApi({
        email: data.email,
        password: data.password,
      });

      if (response.success && response.results) {
        const { user: apiUser, accessToken } = response.results;

        const mappedRole = mapRole(apiUser.role);

        if (!mappedRole) {
          throw new Error('Unauthorized role access');
        }

        const authUser: AuthUser = {
          id: apiUser.id,
          name: apiUser.full_name,
          email: apiUser.email,
          role: mappedRole as UserRole,
          avatarInitials: (apiUser.full_name || '')
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        };

        setAuthenticatedUser(authUser);

        if (accessToken) {
          store.setValue(STORAGE_KEYS.AUTH_TOKEN, accessToken);
        }

        const home = ROLE_HOME[authUser.role] || ROUTES.OWNER_DASHBOARD;

        router.push(home);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';

      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col bg-gradient-to-br from-[#0F0A1E] via-[#1A0F3C] to-[#2D1B69] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <span className="text-white font-semibold text-xl tracking-tight">
              {STATIC_STRINGS.LOGIN_PLATFORM_NAME}
            </span>
          </div>

          <div className="mt-16 xl:mt-20">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-[12px] font-medium">
                {STATIC_STRINGS.LOGIN_SUBTITLE_PLATFORM}
              </span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              {STATIC_STRINGS.LOGIN_HERO_TITLE_PART1}
              <br />
              <span className="text-violet-400">{STATIC_STRINGS.LOGIN_HERO_TITLE_PART2}</span>
            </h1>
            <p className="mt-4 text-slate-400 text-[14.5px] leading-relaxed max-w-sm">
              {STATIC_STRINGS.LOGIN_HERO_DESC}
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={`feature-${f.text.slice(0, 20)}`} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={14} className="text-violet-400" />
                  </div>
                  <p className="text-slate-400 text-[13px] leading-snug">{f.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-auto pt-10">
            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              {[
                { value: '50+', label: STATIC_STRINGS.LOGIN_STAT_CLIENTS },
                { value: '200+', label: STATIC_STRINGS.LOGIN_STAT_TASKS },
                { value: '4.2×', label: STATIC_STRINGS.LOGIN_STAT_ROAS },
              ].map((stat) => (
                <div key={`stat-${stat.label}`}>
                  <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 bg-slate-50">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-semibold text-slate-900 text-lg">
              {STATIC_STRINGS.LOGIN_PLATFORM_NAME}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {STATIC_STRINGS.LOGIN_FORM_SIGN_IN_BTN}
            </h2>
            <p className="mt-1 text-[13.5px] text-slate-500">{STATIC_STRINGS.LOGIN_SUBTITLE}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-semibold text-slate-700 mb-1.5"
              >
                {STATIC_STRINGS.LOGIN_FORM_EMAIL_LABEL}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={STATIC_STRINGS.LOGIN_FORM_EMAIL_PLACEHOLDER}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13.5px] bg-white text-slate-900 placeholder-slate-400 transition-colors outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${
                  errors.email
                    ? 'border-red-400 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                {...register('email', {
                  required: STATIC_STRINGS.LOGIN_ERR_EMAIL_REQ,
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: STATIC_STRINGS.LOGIN_ERR_EMAIL_INVALID,
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-red-600 flex items-center gap-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-semibold text-slate-700"
                >
                  {STATIC_STRINGS.LOGIN_FORM_PWD_LABEL}
                </label>
                <button
                  type="button"
                  className="text-[12px] text-violet-600 hover:text-violet-700 font-medium transition-colors"
                >
                  {STATIC_STRINGS.LOGIN_FORM_PWD_FORGOT}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={STATIC_STRINGS.LOGIN_FORM_PWD_PLACEHOLDER}
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-[13.5px] bg-white text-slate-900 placeholder-slate-400 transition-colors outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${
                    errors.password
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  {...register('password', {
                    required: STATIC_STRINGS.LOGIN_ERR_PWD_REQ,
                    minLength: { value: 6, message: STATIC_STRINGS.LOGIN_ERR_PWD_MIN },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[12px] text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 accent-violet-600 cursor-pointer"
                {...register('remember')}
              />
              <label htmlFor="remember" className="text-[13px] text-slate-600 cursor-pointer">
                {STATIC_STRINGS.LOGIN_FORM_REMEMBER}
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-2.5 rounded-lg transition-all duration-150"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  {STATIC_STRINGS.LOGIN_FORM_SIGNING_IN}
                </>
              ) : (
                <>
                  {STATIC_STRINGS.LOGIN_FORM_SIGN_IN_BTN}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

       

          <p className="mt-6 text-center text-[12px] text-slate-500">
            {STATIC_STRINGS.LOGIN_NO_ACCOUNT}{' '}
            <button
              type="button"
              className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
            >
              {STATIC_STRINGS.LOGIN_REQUEST_ACCESS}
            </button>
          </p>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            {STATIC_STRINGS.LOGIN_TERMS_AGREEMENT}{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">
              {STATIC_STRINGS.LOGIN_TERMS_SERVICE}
            </button>{' '}
            {STATIC_STRINGS.LOGIN_AND}{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">
              {STATIC_STRINGS.LOGIN_PRIVACY_POLICY}
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
