import { redirect } from 'next/navigation';

export default async function Dashboard() {
  // Redirect to overview page - middleware handles auth protection
  redirect('/dashboard/overview');
}
