'use client';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FormProvider } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import GithubSignInButton from './github-auth-button';
import { FormInput } from '@/components/forms/form-input';
import { useAuth } from '@/lib/auth';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' })
});


export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const { login } = useAuth();
  const defaultValues = {
    email: 'demo@gmail.com',
    password: 'password123'
  };
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data) => {
    startTransition(async () => {
      try {
        const result = await login(data.email, data.password);
        if (result.success) {
          toast.success('Signed In Successfully!');
        } else {
          toast.error(result.error || 'Failed to sign in. Please try again.');
        }
      } catch (error) {
        toast.error(error.message || 'Failed to sign in. Please try again.');
      }
    });
  };

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
          <FormInput
            control={form.control}
            name='email'
            label='Email Address'
            placeholder='name@example.com'
            disabled={loading}
            className='text-base'
          />
          <FormInput
            control={form.control}
            name='password'
            label='Password'
            placeholder='Enter your password'
            type='password'
            disabled={loading}
            className='text-base'
          />
          
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <input
                type='checkbox'
                id='remember'
                className='h-4 w-4 rounded border-gray-300 text-[#1D92FF] focus:ring-[#1D92FF]'
              />
              <label
                htmlFor='remember'
                className='text-sm text-gray-600 cursor-pointer'
              >
                Remember me
              </label>
            </div>
            <a
              href='#'
              className='text-sm font-medium hover:text-[#1D92FF] transition-colors'
              style={{ color: '#1D92FF' }}
            >
              Forgot password?
            </a>
          </div>

          <Button
            disabled={loading}
            className='mt-6 w-full h-11 text-base font-medium'
            type='submit'
            style={{ backgroundColor: '#1D92FF' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </FormProvider>
    </>
  );
}
