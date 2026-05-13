'use client';

import React from 'react';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

import AppLogo from '@/components/ui/AppLogo';
import { STATIC_STRINGS } from '@/utils/constants';
import { REGEX } from '@/utils/helpers';
import LoginSidebar from './LoginSidebar';
import AuthInput from './AuthInput';
import { useLoginForm } from '../hooks/useLoginForm';

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    errors,
    isPending,
    showPassword,
    togglePasswordVisibility,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex bg-white">
      <LoginSidebar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 bg-slate-50">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-semibold text-slate-900 text-lg">
              {STATIC_STRINGS.LOGIN_PLATFORM_NAME}
            </span>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{STATIC_STRINGS.LOGIN_FORM_SIGN_IN_BTN}</h2>
            <p className="mt-1 text-[13.5px] text-slate-500">{STATIC_STRINGS.LOGIN_SUBTITLE}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {/* Email Input */}
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
                pattern: { value: REGEX.EMAIL, message: STATIC_STRINGS.LOGIN_ERR_EMAIL_INVALID },
              }}
            />

            {/* Password Input */}
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
                  minLength: {
                    value: STATIC_STRINGS.LOGIN_PWD_MIN_LENGTH as number,
                    message: STATIC_STRINGS.LOGIN_ERR_PWD_MIN,
                  },
                }}
              >
                {/* <button type="button" className="text-[12px] text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  {STATIC_STRINGS.LOGIN_FORM_PWD_FORGOT}
                </button> */}
              </AuthInput>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? STATIC_STRINGS.LOGIN_ARIA_HIDE_PWD : STATIC_STRINGS.LOGIN_ARIA_SHOW_PWD}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* <div className="flex items-center gap-2">
              <input id="remember" type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-violet-600 cursor-pointer" {...register('remember')} />
              <label htmlFor="remember" className="text-[13px] text-slate-600 cursor-pointer">{STATIC_STRINGS.LOGIN_FORM_REMEMBER}</label>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-2.5 rounded-lg transition-all duration-150"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
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

          {/* <p className="mt-6 text-center text-[12px] text-slate-500">
            {STATIC_STRINGS.LOGIN_NO_ACCOUNT}{' '}
            <button type="button" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
              {STATIC_STRINGS.LOGIN_REQUEST_ACCESS}
            </button>
          </p> */}

          {/* <p className="mt-4 text-center text-[11px] text-slate-400">
            {STATIC_STRINGS.LOGIN_TERMS_AGREEMENT}{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">
              {STATIC_STRINGS.LOGIN_TERMS_SERVICE}
            </button>{' '}
            {STATIC_STRINGS.LOGIN_AND}{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">{STATIC_STRINGS.LOGIN_PRIVACY_POLICY}</button>.
          </p> */}
        </div>
      </div>
    </div>
  );
}

