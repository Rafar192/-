import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';
import NewOrder from './pages/NewOrder';
import MyOrders from './pages/MyOrders';
import Stub from './pages/Stub';
import './index.css';

export default function App() {
  const [page, setPage] = useState('new');

  const pages = {
    new: <NewOrder />,
    orders: <MyOrders />,
    mass: <Stub title="Массовый заказ" icon="📦" />,
    bonus: <Stub title="Бонус 3%" icon="🎁" />,
    profile: <Stub title="Профиль" icon="👤" />,
    api: <Stub title="API" icon="⚙️" />,
    support: <Stub title="Поддержка" icon="💬" />,
  };

  return (
    <ToastProvider>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="layout">
        <Sidebar page={page} setPage={setPage} />
        <main className="main">
          {pages[page] || pages.new}
        </main>
      </div>
    </ToastProvider>
  );
}
