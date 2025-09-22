'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
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
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function UserSignupForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, startTransition] = useTransition();
  const { register } = useAuth();
  
  const defaultValues = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data) => {
    startTransition(async () => {
      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...userData } = data;
        const result = await register(userData);
        
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
      <Form
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full space-y-4'
      >
        <FormInput
          control={form.control}
          name='name'
          label='Full Name'
          placeholder='Enter your full name...'
          disabled={loading}
        />
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
          placeholder='Create a password...'
          type='password'
          disabled={loading}
        />
        <FormInput
          control={form.control}
          name='confirmPassword'
          label='Confirm Password'
          placeholder='Confirm your password...'
          type='password'
          disabled={loading}
        />
        <Button
          disabled={loading}
          className='mt-4 w-full'
          type='submit'
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Form>
      
      <div className='text-center'>
        <p className='text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/auth/sign-in' className='hover:text-primary underline underline-offset-4'>
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}