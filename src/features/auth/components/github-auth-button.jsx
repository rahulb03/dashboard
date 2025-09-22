'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { toast } from 'sonner';

export default function GithubSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGithubSignIn = async () => {
    setLoading(true);
    try {
      // Simulate GitHub authentication with a demo email
      await login('github.user@example.com');
      toast.success('Signed in with GitHub!');
    } catch (error) {
      toast.error('Failed to sign in with GitHub.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className='w-full'
      variant='outline'
      type='button'
      onClick={handleGithubSignIn}
      disabled={loading}
    >
      <Icons.github className='mr-2 h-4 w-4' />
      {loading ? 'Connecting...' : 'Continue with Github'}
    </Button>
  );
}
