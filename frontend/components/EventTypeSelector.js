'use client';
import s from '@/styles/eventTypeSelector.module.scss';

export default function EventTypeSelector({ value, onChange }) {
  return (
    <fieldset className={s.selector}>
      <legend className={s.legend}>Type d'événement</legend>
      <div className={s.options}>
        <label className={`${s.option} ${value === 'private' ? s.active : ''}`}>
          <input
            type="radio"
            name="event_type"
            value="private"
            checked={value === 'private'}
            onChange={(e) => onChange(e.target.value)}
            className={s.radio}
          />
          <div className={s.content}>
            <span className={s.title}>Liste d'invités privée</span>
            <span className={s.description}>Vous créez la liste, vos invités répondent</span>
          </div>
        </label>
        <label className={`${s.option} ${value === 'open' ? s.active : ''}`}>
          <input
            type="radio"
            name="event_type"
            value="open"
            checked={value === 'open'}
            onChange={(e) => onChange(e.target.value)}
            className={s.radio}
          />
          <div className={s.content}>
            <span className={s.title}>Événement ouvert</span>
            <span className={s.description}>Les gens rejoignent directement via le lien</span>
          </div>
        </label>
      </div>
    </fieldset>
  );
}
