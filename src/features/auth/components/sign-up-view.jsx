import Link from 'next/link';
import Image from 'next/image';
import UserSignupForm from './user-signup-form';

export const metadata = {
  title: 'Sign Up - One Gred Dashboard',
  description: 'Create your account to access the dashboard'
};

export default function SignUpViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Left Side - Blue Background with Logo and Quote */}
      <div className='relative hidden h-full flex-col p-10 text-white lg:flex' style={{ backgroundColor: '#1D92FF' }}>
        {/* Logo at Top Left */}
        <div className='relative z-20 flex items-center'>
          <Image
            src='/assets/logo.svg'
            alt='Logo'
            width={120}
            height={120}
            className='h-24 w-24'
            priority
          />
        </div>
        
        {/* Quote at Bottom */}
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Join thousands of users who trust our platform
              to manage their business operations efficiently and securely.&rdquo;
            </p>
            <footer className='text-sm'>Happy Customer</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - White Background with Form */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8 bg-white text-black overflow-y-auto'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6 my-8'>
          {/* Mobile Logo */}
          <div className='lg:hidden'>
            <div className='flex items-center'>
              <Image
                src='/assets/logo.svg'
                alt='Logo'
                width={40}
                height={40}
                className='mr-2 h-10 w-10'
                priority
              />
              <span className='text-2xl font-bold text-[#1D92FF]'>One Gred Dashboard</span>
            </div>
          </div>
          
          {/* Desktop Title */}
          <div className='hidden lg:block'>
            <div className='flex items-center'>
              <span className='text-2xl font-bold inline text-[#1D92FF]'>One Gred Dashboard</span>
            </div>
          </div>
          
          <div className='w-full'>
            <h1 className='text-2xl font-semibold tracking-tight text-center mb-2'>
              Create an account
            </h1>
            <p className='text-sm text-gray-500 text-center mb-6'>
              Enter your details below to create your account
            </p>
            <UserSignupForm />
          </div>

          <p className='text-gray-500 px-8 text-center text-sm'>
            By creating an account, you agree to our{' '}
            <Link
              href='/terms'
              className='underline underline-offset-4 hover:text-[#1D92FF] transition-colors'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='underline underline-offset-4 hover:text-[#1D92FF] transition-colors'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}