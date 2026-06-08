import { useEffect, useState } from 'react';
import { getBalance } from '../api/twiboost';

const NAV = [
  {
    section: 'Заказы',
    items: [
      { id: 'new', label: 'Новый заказ', icon: PlusIcon },
      { id: 'orders', label: 'Мои заказы', icon: ListIcon },
      { id: 'mass', label: 'Массовый заказ', icon: LayersIcon },
    ],
  },
  {
    section: 'Аккаунт',
    items: [
      { id: 'bonus', label: 'Бонус 3%', icon: GiftIcon },
      { id: 'profile', label: 'Профиль', icon: UserIcon },
      { id: 'api', label: 'API', icon: CodeIcon },
      { id: 'support', label: 'Поддержка', icon: SupportIcon },
    ],
  },
];

export default function Sidebar({ page, setPage }) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    getBalance()
      .then(d => setBalance(d?.balance ?? '—'))
      .catch(() => setBalance('—'));
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">
          <div className="logo-icon">⬡</div>
          Matrix SMM
        </div>
      </div>

      <div className="sidebar-balance">
        <div className="balance-label">Баланс</div>
        <div className="balance-amount">
          {balance === null ? <span className="spinner" style={{ width: 16, height: 16 }} /> : `$${balance}`}
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(group => (
          <div key={group.section} className="nav-section">
            <div className="nav-section-title">{group.section}</div>
            {group.items.map(item => (
              <div
                key={item.id}
                className={`nav-item${page === item.id ? ' active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <item.icon className="nav-icon" />
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function PlusIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function ListIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="3" rx="1" /><rect x="3" y="10.5" width="18" height="3" rx="1" /><rect x="3" y="17" width="18" height="3" rx="1" />
    </svg>
  );
}
function LayersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}
function GiftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  );
}
function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function CodeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function SupportIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" /><line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  );
}
