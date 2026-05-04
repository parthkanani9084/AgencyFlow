'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Zap, BarChart3, Users, Shield } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { toast } from 'sonner';
import { useAuth, ROLE_HOME } from '@/context/AuthContext';

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

type Role = 'Owner' | 'Shooter' | 'Editor' | 'Ads Manager' | 'Manager' | 'Social Media Manager' | 'Client';

interface DemoCredential {
  role: Role;
  email: string;
  password: string;
  color: string;
}

const demoCredentials: DemoCredential[] = [
  { role: 'Owner', email: 'alex.owens@agencyflow.io', password: 'Owner@2026', color: 'bg-violet-100 text-violet-700' },
  { role: 'Manager', email: 'priya.sharma@agencyflow.io', password: 'Manager@2026', color: 'bg-blue-100 text-blue-700' },
  { role: 'Shooter', email: 'marco.reyes@agencyflow.io', password: 'Shooter@2026', color: 'bg-emerald-100 text-emerald-700' },
  { role: 'Editor', email: 'jin.park@agencyflow.io', password: 'Editor@2026', color: 'bg-amber-100 text-amber-700' },
  { role: 'Ads Manager', email: 'sofia.nguyen@agencyflow.io', password: 'AdsManager@2026', color: 'bg-rose-100 text-rose-700' },
  { role: 'Social Media Manager', email: 'sam.rivera@agencyflow.io', password: 'Social@2026', color: 'bg-indigo-100 text-indigo-700' },
  { role: 'Client', email: 'jordan.lee@novabrew.com', password: 'Client@2026', color: 'bg-indigo-100 text-indigo-700' },
];

const features = [
  { icon: Zap, text: 'Auto-route tasks through your entire production pipeline' },
  { icon: BarChart3, text: 'Track ad spend, ROAS, and leads across Meta & Google' },
  { icon: Users, text: 'Manage 50+ clients and 200+ active tasks simultaneously' },
  { icon: Shield, text: 'Role-based access for every team member' },
];

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const handleUseCredential = useCallback((cred: DemoCredential) => {
    setValue('email', cred.email, { shouldValidate: true });
    setValue('password', cred.password, { shouldValidate: true });
    toast.success(`Autofilled ${cred.role} credentials`);
  }, [setValue]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const result = await login(data.email, data.password);

    if (!result.success) {
      setIsLoading(false);
      toast.error(result.error ?? 'Invalid credentials');
      return;
    }

    const matched = demoCredentials.find((c) => c.email === data.email);
    const home = matched ? ROLE_HOME[matched.role] : '/dashboard';
    toast.success(`Welcome back! Signing in as ${matched?.role ?? 'user'}…`);
    await new Promise((r) => setTimeout(r, 500));
    router.push(home);
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
            <span className="text-white font-semibold text-xl tracking-tight">AgencyFlow</span>
          </div>

          <div className="mt-16 xl:mt-20">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-400/30 rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-violet-300 text-[12px] font-medium">Campaign Automation Platform</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              Your entire agency
              <br />
              <span className="text-violet-400">on autopilot.</span>
            </h1>
            <p className="mt-4 text-slate-400 text-[14.5px] leading-relaxed max-w-sm">
              From shoot to ad launch — AgencyFlow routes every task automatically so your team ships faster and your clients see results.
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
                { value: '50+', label: 'Active Clients' },
                { value: '200+', label: 'Tasks Managed' },
                { value: '4.2×', label: 'Avg ROAS' },
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
            <span className="font-semibold text-slate-900 text-lg">AgencyFlow</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 text-[13.5px] text-slate-500">
              Access your agency dashboard and campaign tools.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@agency.io"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-[13.5px] bg-white text-slate-900 placeholder-slate-400 transition-colors outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
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
                <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                <button type="button" className="text-[12px] text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-[13.5px] bg-white text-slate-900 placeholder-slate-400 transition-colors outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
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
                Keep me signed in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-2.5 rounded-lg transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11.5px] text-slate-400 font-medium whitespace-nowrap">Demo accounts</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">Role</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">Email</th>
                    <th className="px-2 py-2 text-slate-500 font-semibold text-center">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {demoCredentials.map((cred) => (
                    <tr
                      key={`cred-${cred.role}`}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10.5px] font-semibold ${cred.color}`}>
                          {cred.role}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600 font-mono text-[11px] max-w-[160px] truncate">
                        {cred.email}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleUseCredential(cred)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-violet-50 hover:bg-violet-100 text-violet-700 text-[10.5px] font-semibold transition-colors"
                        >
                          <ArrowRight size={10} />
                          Use
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              All demo accounts share the same password format: <span className="font-mono text-slate-500">Role@2026</span>
            </p>
          </div>

          <p className="mt-6 text-center text-[12px] text-slate-500">
            Don&apos;t have an account?{' '}
            <button type="button" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
              Request access
            </button>
          </p>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            By signing in, you agree to our{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">Terms of Service</button>
            {' '}and{' '}
            <button type="button" className="underline hover:text-slate-600 transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </div>
  );
}