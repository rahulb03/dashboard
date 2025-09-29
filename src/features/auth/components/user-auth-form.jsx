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
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-4'>
        <FormInput
          control={form.control}
          name='email'
          label='Email'
          placeholder='Enter your email...'
          disabled={loading}
        />
        <FormInput
          control={form.control}
          name='password'
          label='Password'
          placeholder='Enter your password...'
          type='password'
          disabled={loading}
        />
        <Button
          disabled={loading}
          className='mt-4 w-full'
          type='submit'
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        </form>
      </FormProvider>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Or continue with
          </span>
        </div>
      </div>
      <GithubSignInButton />
    </>
  );
}
