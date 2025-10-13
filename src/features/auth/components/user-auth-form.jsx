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
import Link from 'next/link';

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
    email: '',
    password: ''
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
            className='text-base [&_input]:border-gray-300 [&_input]:focus-visible:border-[#1D92FF]'
          />
          <FormInput
            control={form.control}
            name='password'
            label='Password'
            placeholder='Enter your password'
            type='password'
            disabled={loading}
            className='text-base [&_input]:border-gray-300 [&_input]:focus-visible:border-[#1D92FF]'
          />

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
      
      <div className='text-center mt-4'>
        <p className='text-sm text-gray-500'>
          Don't have an account?{' '}
          <Link href='/auth/sign-up' className='text-[#1D92FF] hover:underline underline-offset-4 font-medium'>
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}
