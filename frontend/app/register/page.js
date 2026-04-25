'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import s from '@/styles/auth.module.scss';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>Sera</div>
        <h1 className={s.title}>Créer un compte</h1>
        <p className={s.subtitle}>Commence à organiser tes événements</p>

        <form className={s.form} onSubmit={handleSubmit}>
          <div className={s.field}>
            <label htmlFor="name">Prénom</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Sophie"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={s.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="toi@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={s.field}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          {error && <p className={s.error}>{error}</p>}

          <button className={s.btn} type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className={s.footer}>
          Déjà un compte ? <Link href="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
