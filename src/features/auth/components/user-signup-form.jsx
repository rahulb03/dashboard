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
import { FormInput } from '@/components/forms/form-input';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  mobile: z.string().min(10, { message: 'Enter a valid mobile number' }).regex(/^[0-9]+$/, { message: 'Mobile number must contain only digits' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

export default function UserSignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const { register } = useAuth();
  
  const defaultValues = {
    name: '',
    email: '',
    mobile: '',
    password: ''
  };
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data) => {
    startTransition(async () => {
      try {
        const result = await register(data);
        
        if (result.success) {
          toast.success('Account created successfully!');
        } else {
          toast.error(result.error || 'Failed to create account. Please try again.');
        }
      } catch (error) {
        toast.error(error.message || 'Failed to create account. Please try again.');
      }
    });
  };

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
          <FormInput
            control={form.control}
            name='name'
            label='Full Name'
            placeholder='John Doe'
            disabled={loading}
            className='text-base [&_input]:border-gray-300 [&_input]:focus-visible:border-[#1D92FF]'
          />
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
            name='mobile'
            label='Mobile Number'
            placeholder='9876543210'
            type='tel'
            disabled={loading}
            className='text-base [&_input]:border-gray-300 [&_input]:focus-visible:border-[#1D92FF]'
          />
          <FormInput
            control={form.control}
            name='password'
            label='Password'
            placeholder='Create a password'
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </FormProvider>
      
      <div className='text-center mt-4'>
        <p className='text-sm text-gray-500'>
          Already have an account?{' '}
          <Link href='/auth/sign-in' className='text-[#1D92FF] hover:underline underline-offset-4 font-medium'>
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}