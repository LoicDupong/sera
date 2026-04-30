'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import EventTypeSelector from '@/components/EventTypeSelector';
import BulkGuestImporter from '@/components/BulkGuestImporter';
import s from '@/styles/create.module.scss';

export default function CreateEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '', event_type: 'private' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEventTypeChange = (event_type) => setForm({ ...form, event_type });

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

  const handleBulkImport = async (guests) => {
    try {
      // First create the event
      const { data: event } = await api.post('/events', form);
      // Then import guests
      await api.post(`/events/${event.id}/guests/bulk`, { guests });
      router.push(`/dashboard/${event.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  return (
    <div className={s.page}>
      <Link href="/dashboard" className={s.back}>← Retour</Link>
      <h1 className={s.heading}>Nouvel événement</h1>

      {showBulkImport ? (
        <BulkGuestImporter
          onImport={handleBulkImport}
          onCancel={() => setShowBulkImport(false)}
        />
      ) : (
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

          <EventTypeSelector value={form.event_type} onChange={handleEventTypeChange} />

          {error && <p className={s.error}>{error}</p>}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={s.btn} type="submit" disabled={loading}>
              {loading ? 'Création...' : "Créer l'événement"}
            </button>
            {form.event_type === 'private' && (
              <button
                className={s.btn}
                type="button"
                onClick={() => setShowBulkImport(true)}
                disabled={!form.title || !form.date || !form.location}
              >
                Créer + Importer invités
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
