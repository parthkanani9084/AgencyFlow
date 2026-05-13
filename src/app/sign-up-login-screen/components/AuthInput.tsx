'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

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

const AuthInput = ({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  errors,
  validation,
  autoComplete,
  children,
}: AuthInputProps) => (
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

export default AuthInput;
