'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import AppHeader from '@/components/AppHeader';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, []);

  return (
    <>
      <AppHeader />
      <main>{children}</main>
    </>
  );
}
