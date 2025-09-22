import { redirect } from 'next/navigation';

export default async function Page() {
  // Redirect to sign-in page by default
  // The middleware will handle authentication checks for protected routes
  redirect('/auth/sign-in');
}
