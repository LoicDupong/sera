'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import s from '@/styles/create.module.scss';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/events', form);
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Retour</Link>
      <h1 className={s.heading}>Nouvel événement</h1>

      <form className={s.form} onSubmit={handleSubmit}>
        <div className={s.field}>
          <label htmlFor="title">Nom de l'événement *</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Anniversaire de Marie"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={s.field}>
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className={s.field}>
          <label htmlFor="location">Lieu *</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Paris, 75001"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className={s.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Infos supplémentaires..."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {error && <p className={s.error}>{error}</p>}

        <button className={s.btn} type="submit" disabled={loading}>
          {loading ? 'Création...' : "Créer l'événement"}
        </button>
      </form>
    </div>
  );
}
