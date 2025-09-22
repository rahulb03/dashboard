import { Suspense } from 'react';
import ProfileViewPage from '@/features/profile/components/profile-view-page';

export const metadata = {
  title: 'Dashboard : Profile',
  description: 'Profile page for user management.'
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileViewPage />
    </Suspense>
  );
}