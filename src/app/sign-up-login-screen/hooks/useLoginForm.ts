'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';


export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export const useLoginForm = () => {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    const result = await login(data.email, data.password);

    if (result.success) {
      router.refresh();
    } else {
    }
  };


  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isPending: isLoggingIn,
    showPassword,

    togglePasswordVisibility,
  };
};
