'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Shield, 
  Mail, 
  Key, 
  Globe, 
  Lock, 
  Activity, 
  Server 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import AppLogo from '@/components/ui/AppLogo';
import { STATIC_STRINGS } from '@/utils/constants';

interface LoginFormValues {
  email: string;
  password?: string;
  otp?: string;
}

const adminFeatures = [
  { icon: Globe, text: 'Manage 500+ agencies and global workspace distribution' },
  { icon: Server, text: 'Real-time system health monitoring and infrastructure control' },
  { icon: Activity, text: 'Track user engagement and platform-wide performance metrics' },
  { icon: Lock, text: 'Enforce security protocols and multi-layer authentication' },
];

const RESEND_COOLDOWN = 60;

export default function SuperAdminLoginForm() {
  const router = useRouter();
  const { setAuthenticatedUser } = useAuth();
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [secondsRemaining, setSecondsRemaining] = useState(0);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [secondsRemaining]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (otpStep === 'verify') {
        inputRefs.current[0]?.focus();
      } else if (otpStep === 'email') {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        emailInput?.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [otpStep, authMode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>();

  const toggleAuthMode = () => {
    const newMode = authMode === 'password' ? 'otp' : 'password';
    setAuthMode(newMode);
    setOtpStep('email');
    setOtpValues(['', '', '', '', '', '']);
    setSecondsRemaining(0);
    reset();
  };

  const onPasswordLogin = async (data: LoginFormValues) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await authService.loginWithPassword(data.email, data.password || '');

      if (result.success && result.user) {
        setAuthenticatedUser(result.user);
        toast.success(STATIC_STRINGS.LOGIN_WELCOME_BACK);
        // Redirect handled by AuthContext
      } else {
        toast.error(result.error ?? STATIC_STRINGS.LOGIN_INVALID_CREDENTIALS);
        setIsLoading(false);
      }
    } catch (e) {
      toast.error(STATIC_STRINGS.LOGIN_LOGIN_FAILED);
      setIsLoading(false);
    }
  };

  const onOtpRequest = async (data: { email: string }) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await authService.requestOTP(data.email);
      
      if (result.success) {
        setEmail(data.email);
        setOtpStep('verify');
        setOtpValues(['', '', '', '', '', '']);
        setSecondsRemaining(RESEND_COOLDOWN);
        toast.success(STATIC_STRINGS.LOGIN_OTP_SENT);
      } else {
        toast.error(result.error ?? 'Failed to send OTP');
      }
    } catch (e) {
      toast.error(STATIC_STRINGS.FORM_SYSTEM_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (finalOtp: string) => {
    if (isLoading || !email) return;
    setIsLoading(true);

    console.log('[SuperAdminLogin] Starting verification...', { email, otp: finalOtp });

    try {
      const result = await authService.verifyOTP(email, finalOtp);

      console.log('[SuperAdminLogin] Verification response:', result);

      if (result.success && result.user) {
        setAuthenticatedUser(result.user);
        toast.success(STATIC_STRINGS.LOGIN_OTP_VERIFIED);
        

      } else {
        toast.error(result.error ?? STATIC_STRINGS.LOGIN_INVALID_OTP);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[SuperAdminLogin] Verification crash:', error);
      toast.error('System error during verification');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    
    const newOtp = [...otpValues];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtpValues(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="min-h-screen flex bg-white w-full">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col bg-gradient-to-br from-[#0F0A1E] via-[#1A0F3C] to-[#2D1B69] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <span className="text-white font-semibold text-xl tracking-tight">AgencyFlow</span>
          </div>

          <div className="mt-6 xl:mt-10">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 rounded-full px-3 py-1 mb-6">
              <Shield size={12} className="text-violet-400" />
              <span className="text-violet-300 text-[12px] font-medium uppercase tracking-wider">{STATIC_STRINGS.LOGIN_CONTROL_VAULT}</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              {STATIC_STRINGS.LOGIN_PLATFORM_GOVERNANCE}
              <br />
              <span className="text-violet-400">{STATIC_STRINGS.LOGIN_REDEFINED}</span>
            </h1>
            <p className="mt-4 text-slate-400 text-[14.5px] leading-relaxed max-w-sm">
              {STATIC_STRINGS.LOGIN_DESCRIPTION}
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {adminFeatures.map((f) => {
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
                { value: '500+', label: STATIC_STRINGS.DASHBOARD_TOTAL_AGENCIES },
                { value: '1.2M+', label: STATIC_STRINGS.LOGIN_TASKS_PROCESSED },
                { value: '99.9%', label: STATIC_STRINGS.LOGIN_UPTIME },
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

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 bg-slate-50">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-semibold text-slate-900 text-lg">AgencyFlow Admin</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{STATIC_STRINGS.LOGIN_TITLE}</h2>
            <p className="mt-1 text-[13.5px] text-slate-500">
              {STATIC_STRINGS.LOGIN_SUBTITLE}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            {authMode === 'password' ? (
              <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.LOGIN_EMAIL_LABEL}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      autoFocus
                      placeholder="admin@agencyflow.io"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none transition-all"
                      {...register('email', { required: STATIC_STRINGS.FORM_EMAIL_REQUIRED })}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{STATIC_STRINGS.LOGIN_PASSWORD_LABEL}</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none transition-all"
                      {...register('password', { required: 'Password is required' })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-[11px] text-red-500">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? STATIC_STRINGS.LOGIN_VERIFYING : STATIC_STRINGS.LOGIN_BUTTON}
                  {!isLoading && <ArrowRight size={15} />}
                </button>
              </form>
            ) : (
              /* OTP Flow */
              <div className="space-y-5">
                {otpStep === 'email' ? (
                  <form onSubmit={handleSubmit(onOtpRequest)} className="space-y-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          autoFocus
                          placeholder="admin@agencyflow.io"
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-[13.5px] focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none transition-all"
                          {...register('email', { required: STATIC_STRINGS.FORM_EMAIL_REQUIRED })}
                        />
                      </div>
                      {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? 'Requesting...' : 'Request OTP'}
                      {!isLoading && <ArrowRight size={15} />}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-700 mb-3 text-center">{STATIC_STRINGS.LOGIN_VERIFICATION_CODE}</label>
                      <div className="flex justify-between gap-2" onPaste={handlePaste}>
                        {otpValues.map((value, index) => (
                          <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={value}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-12 text-center text-lg font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 outline-none transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
                            disabled={isLoading}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading || otpValues.join('').length !== 6}
                      onClick={() => handleOtpVerify(otpValues.join(''))}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {isLoading ? STATIC_STRINGS.LOGIN_VERIFYING : STATIC_STRINGS.LOGIN_VERIFY_OTP_BUTTON}
                    </button>
                    
                    {/* Resend Section */}
                    <div className="text-center">
                      {secondsRemaining > 0 ? (
                        <p className="text-[12px] text-slate-400 font-medium">
                          {STATIC_STRINGS.LOGIN_RESEND_IN} <span className="text-slate-600 tabular-nums font-bold">{secondsRemaining}s</span>
                        </p>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => onOtpRequest({ email })}
                          disabled={isLoading}
                          className="text-[12px] text-violet-600 hover:text-violet-700 font-bold transition-colors disabled:opacity-50"
                        >
                          {STATIC_STRINGS.LOGIN_RESEND_OTP}
                        </button>
                      )}
                    </div>

                    <button 
                      type="button" 
                      onClick={() => {
                        setOtpStep('email');
                        setOtpValues(['', '', '', '', '', '']);
                      }} 
                      disabled={isLoading}
                      className="w-full text-center text-[12px] text-slate-400 hover:text-slate-600 disabled:opacity-50"
                    >
                      {STATIC_STRINGS.LOGIN_DIFFERENT_EMAIL}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            {!isLoading && (
              <button 
                type="button" 
                onClick={toggleAuthMode}
                className="text-violet-600 hover:text-violet-700 text-[13px] font-semibold transition-colors"
              >
                {authMode === 'password' ? STATIC_STRINGS.LOGIN_LOGIN_WITH_OTP : STATIC_STRINGS.LOGIN_LOGIN_WITH_PASSWORD}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
