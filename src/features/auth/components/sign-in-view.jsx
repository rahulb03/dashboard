import Link from 'next/link';
import Image from 'next/image';
import UserAuthForm from './user-auth-form';

export const metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage({ stars }) {
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
              &ldquo;This starter template has saved me countless hours of work
              and helped me deliver projects to my clients faster than ever
              before.&rdquo;
            </p>
            <footer className='text-sm'>Random Dude</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - White Background with Form */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8 bg-white'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
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
              <span className='text-2xl font-bold' style={{ color: '#1D92FF' }}>One Gred Dashboard</span>
            </div>
          </div>
          
          {/* Desktop Title */}
          <div className='hidden lg:block'>
            <div className='flex items-center'>
              <span className='text-2xl font-bold inline'>One Gred Dashboard</span>
            </div>
          </div>
          
          <div className='w-full'>
            <h1 className='text-2xl font-semibold tracking-tight text-center mb-6'>
              Welcome back
            </h1>
            <UserAuthForm />
          </div>

          <p className='text-gray-500 px-8 text-center text-sm'>
            By clicking continue, you agree to our{' '}
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
