import s from '@/styles/eventDetail.module.scss';

const TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'yes', label: 'Oui' },
  { key: 'no', label: 'Non' },
  { key: 'maybe', label: 'Peut-être' },
  { key: 'pending', label: 'En attente' },
];

export default function RsvpFilters({ active, onChange, hideStatuses = [] }) {
  const filteredTabs = TABS.filter((tab) => !hideStatuses.includes(tab.key));

  return (
    <div className={s.filters}>
      {filteredTabs.map((tab) => (
        <button
          key={tab.key}
          className={`${s.filterTab} ${active === tab.key ? s.active : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
