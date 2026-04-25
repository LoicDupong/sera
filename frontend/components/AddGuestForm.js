'use client';
import { useState } from 'react';
import s from '@/styles/eventDetail.module.scss';

export default function AddGuestForm({ onAdd }) {
  const [form, setForm] = useState({ first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setError('');
    setLoading(true);
    try {
      await onAdd(form.first_name.trim(), form.last_name.trim());
      setForm({ first_name: '', last_name: '' });
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={s.addForm} onSubmit={handleSubmit}>
      <input
        className={s.addInput}
        name="first_name"
        type="text"
        placeholder="Prénom"
        value={form.first_name}
        onChange={handleChange}
        required
      />
      <input
        className={s.addInput}
        name="last_name"
        type="text"
        placeholder="Nom"
        value={form.last_name}
        onChange={handleChange}
        required
      />
      <button className={s.addBtn} type="submit" disabled={loading}>
        {loading ? '...' : 'Ajouter'}
      </button>
      {error && <p className={s.addError}>{error}</p>}
    </form>
  );
}
