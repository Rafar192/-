import { useEffect, useState } from 'react';
import { getBalance } from '../api/twiboost';

const NAV = [
  {
    section: 'Заказы',
    items: [
      { id: 'new',    label: 'Новый заказ',    icon: PlusIcon },
      { id: 'orders', label: 'Мои заказы',     icon: ListIcon },
      { id: 'mass',   label: 'Массовый заказ', icon: LayersIcon },
    ],
  },
  {
    section: 'Аккаунт',
    items: [
      { id: 'referral', label: 'Рефералка',  icon: GiftIcon },
      { id: 'profile', label: 'Профиль',    icon: UserIcon },
      { id: 'api',     label: 'API',        icon: CodeIcon },
      { id: 'support', label: 'Поддержка',  icon: SupportIcon },
    ],
  },
];

export default function Sidebar({ page, setPage }) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    getBalance()
      .then(d => {
        const bal = parseFloat(d?.balance);
        setBalance(isNaN(bal) ? '—' : bal.toFixed(2) + ' ₽');
      })
      .catch(() => setBalance('—'));
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-inner">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
              <polygon points="12 6 18 9.5 18 14.5 12 18 6 14.5 6 9.5"/>
            </svg>
          </div>
          <div>
            <div className="logo-text">Matrix SMM</div>
            <div className="logo-tag">Pro Panel</div>
          </div>
        </div>
      </div>

      <div className="sidebar-balance">
        <div className="bal-label">Баланс</div>
        <div className="bal-amount">
          {balance === null ? <span className="spinner" style={{ width:18,height:18 }} /> : balance}
        </div>
        <button className="bal-topup">+ Пополнить</button>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(g => (
          <div key={g.section} className="nav-section">
            <div className="nav-sect-title">{g.section}</div>
            {g.items.map(item => (
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
      <circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>
    </svg>
  );
}
function ListIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  );
}
function LayersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  );
}
function GiftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
    </svg>
  );
}
function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function CodeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}
function SupportIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/>
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/>
    </svg>
  );
}
