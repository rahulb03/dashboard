'use client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ChangePasswordDialog from './change-password-dialog';

export default function ProfileViewPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex w-full flex-col p-4 space-y-6'>
      <div className='flex items-center space-x-4'>
        <Avatar className='h-20 w-20'>
          <AvatarImage src={user.avatar} alt={user.fullName} />
          <AvatarFallback className='text-lg'>
            {user.fullName
              .split(' ')
              .map((name) => name[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className='text-2xl font-bold'>{user.fullName}</h1>
          <p className='text-muted-foreground'>{user.email}</p>
          <Badge variant='secondary' className='mt-1'>
            Active User
          </Badge>
        </div>
      </div>
      
      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Full Name</label>
              <p className='text-sm'>{user.fullName}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Email</label>
              <p className='text-sm'>{user.email}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>User ID</label>
              <p className='text-sm font-mono'>{user.id}</p>
            </div>
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
            <Button variant='outline' className='w-full'>
              Update Profile Picture
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
