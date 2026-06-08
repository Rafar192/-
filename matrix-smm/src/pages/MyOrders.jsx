import { useState, useEffect } from 'react';
import { getOrders } from '../api/twiboost';

function statusClass(s) {
  const st = (s || '').toLowerCase();
  if (st === 'completed') return 'completed';
  if (st === 'in progress' || st === 'processing' || st === 'inprogress') return 'inprogress';
  if (st === 'cancelled' || st === 'canceled') return 'cancelled';
  return 'pending';
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(saved);

    if (saved.length > 0) {
      setLoading(true);
      const ids = saved.map(o => o.id).join(',');
      getOrders(ids)
        .then(data => {
          if (data && typeof data === 'object') {
            setOrders(prev => prev.map(o => {
              const upd = data[o.id];
              if (upd) return { ...o, status: upd.status, remains: upd.remains, start_count: upd.start_count };
              return o;
            }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Мои заказы</span>
        {loading && <div className="spinner" />}
      </div>
      <div className="page-content">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>Заказов пока нет</h3>
            <p>Создайте первый заказ во вкладке «Новый заказ»</p>
          </div>
        ) : (
          <div className="orders-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Услуга</th>
                  <th>Ссылка</th>
                  <th>Кол-во</th>
                  <th>Цена</th>
                  <th>Статус</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>#{o.id}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.service}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text2)' }}>{o.link}</td>
                    <td>{(o.qty || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>{o.price} $</td>
                    <td>
                      <span className={`status-badge ${statusClass(o.status)}`}>
                        {o.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
