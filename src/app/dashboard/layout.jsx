import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'One Gred Dashboard',
  description: 'One Gred Dashboard'
};

export default async function DashboardLayout({
  children
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-col overflow-hidden">
            <Header />
            {/* page main content */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
            {/* page main content ends */}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </KBar>
  );
}
