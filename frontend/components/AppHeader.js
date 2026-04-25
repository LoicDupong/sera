'use client';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import s from '@/styles/header.module.scss';

export default function AppHeader() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className={s.header}>
      <span className={s.logo}>Sera</span>
      <div className={s.right}>
        {user && <span className={s.name}>{user.name}</span>}
        <button className={s.logout} onClick={handleLogout}>Déconnexion</button>
      </div>
    </header>
  );
}
