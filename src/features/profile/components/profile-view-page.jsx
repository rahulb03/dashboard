'use client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ChangePasswordDialog from './change-password-dialog';
import ProfilePhotoUpload from './profile-photo-upload';
import { IMAGE_URL } from '@/config/constant';

export default function ProfileViewPage() {
  const { user, fetchProfile, isLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    const loadProfile = async () => {
      // Only fetch if we don't have complete data and haven't loaded yet
      if (user && !user.mobile && !initialLoadComplete) {
        setProfileLoading(true);
        try {
          await fetchProfile();
          setInitialLoadComplete(true);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          setProfileLoading(false);
        }
      } else if (user && user.mobile) {
        // Mark as complete if we already have mobile data
        setInitialLoadComplete(true);
      }
    };
    
    loadProfile();
  }, [user?.id, user?.mobile, fetchProfile, initialLoadComplete]); // Only depend on id and mobile, not entire user object
  
  // Separate loading state for personal info - don't show loading when just updating photo
  const personalInfoLoading = profileLoading; // Only show loading for profile fetch, not photo upload
  
  if (!user) {
    return (
      <div className='flex w-full flex-col p-4 space-y-6'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='h-20 w-20 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
            <Skeleton className='h-5 w-20' />
          </div>
        </div>
      </div>
    );
  }

  const getProfilePhotoUrl = () => {
    if (user?.profilePhoto) {
      // Check if it's already a full URL
      if (user.profilePhoto.startsWith('http')) {
        return user.profilePhoto;
      }
      // Otherwise, prepend the base URL
      return `${IMAGE_URL}${user.profilePhoto}`;
    }
    return null;
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='flex w-full flex-col p-4 space-y-6'>
      <div className='flex items-center space-x-4'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={getProfilePhotoUrl()} alt={user.name} />
          <AvatarFallback className='text-lg'>
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className='text-2xl font-bold'>{user.name}</h1>
          <p className='text-muted-foreground'>{user.email}</p>
          <div className='flex gap-2 mt-1'>
            <Badge variant='secondary'>
              {user.role || 'User'}
            </Badge>
            <Badge variant='outline'>
              Active
            </Badge>
          </div>
        </div>
      </div>
      
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {personalInfoLoading && (
              <div className='space-y-4'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
              </div>
            )}
            {!personalInfoLoading && (
              <>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Full Name</label>
                  <p className='text-sm'>{user.name}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Email</label>
                  <p className='text-sm'>{user.email}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Mobile Number</label>
                  <p className='text-sm'>{user.mobile || 'Not provided'}</p>
                </div>
                <div>
                  <label className='text-sm font-medium text-muted-foreground'>Role</label>
                  <p className='text-sm capitalize'>{user.role || 'User'}</p>
                </div>
                {/* <div>
                  <label className='text-sm font-medium text-muted-foreground'>User ID</label>
                  <p className='text-sm font-mono'>{user.id}</p>
                </div> */}
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className='flex justify-center py-6'>
            <ProfilePhotoUpload user={user} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <ChangePasswordDialog>
              <Button variant='outline' className='w-full'>
                Change Password
              </Button>
            </ChangePasswordDialog>
            <Button 
              variant='outline' 
              className='w-full'
              onClick={() => fetchProfile()}
              disabled={personalInfoLoading}
            >
              {personalInfoLoading ? 'Refreshing...' : 'Refresh Profile'}
            </Button>
            <Button variant='outline' className='w-full'>
              Notification Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
