'use client';
import { useState } from 'react';
import { parseGuestInput, validateGuestList } from '@/lib/guestParser';
import s from '@/styles/bulkGuestImporter.module.scss';

export default function BulkGuestImporter({ onImport, onCancel }) {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleParse = () => {
    const parsed = parseGuestInput(input);
    const { validGuests, errors: validationErrors } = validateGuestList(parsed);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    handleSubmit(validGuests);
  };

  const handleSubmit = async (guests) => {
    setLoading(true);
    try {
      await onImport(guests);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const canSubmit = input.trim().length > 0 && !loading;

  return (
    <div className={s.panel}>
      <div className={s.header}>
        <h3>Importer des invités</h3>
        <p className={s.hint}>Un par ligne ou séparés par des virgules</p>
      </div>
      <textarea
        className={s.input}
        placeholder="Alice Smith&#10;Bob, Jones&#10;Charlie Brown"
        value={input}
        onChange={(e) => { setInput(e.target.value); setErrors([]); }}
        disabled={loading}
      />
      {errors.length > 0 && (
        <div className={s.errors}>
          {errors.map((err, i) => <p key={i} className={s.error}>{err}</p>)}
        </div>
      )}
      <div className={s.actions}>
        <button type="button" className={s.secondary} onClick={onCancel} disabled={loading}>
          Annuler
        </button>
        <button type="button" className={s.primary} onClick={handleParse} disabled={!canSubmit}>
          {loading ? 'Importation...' : 'Importer'}
        </button>
      </div>
    </div>
  );
}
