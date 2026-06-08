import { useState, useEffect, useMemo } from 'react';
import { getServices, createOrder } from '../api/twiboost';
import { icons, NETWORKS } from '../icons';
import { useToast } from '../components/Toast';

export default function NewOrder() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('networks'); // networks | categories | service-form
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState('');
  const [link, setLink] = useState('');
  const [qty, setQty] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getServices()
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setServices([]); setLoading(false); });
  }, []);

  const servicesForNetwork = useMemo(() => {
    if (!selectedNetwork) return [];
    const kw = selectedNetwork.keywords;
    return services.filter(s => {
      const name = (s.name || s.category || '').toLowerCase();
      return kw.some(k => name.includes(k));
    });
  }, [services, selectedNetwork]);

  const filteredNetworks = useMemo(() => {
    if (!search) return NETWORKS;
    const q = search.toLowerCase();
    return NETWORKS.filter(n => n.name.toLowerCase().includes(q) || n.keywords.some(k => k.includes(q)));
  }, [search]);

  const minQty = selectedService ? parseInt(selectedService.min) || 10 : 10;
  const maxQty = selectedService ? parseInt(selectedService.max) || 100000 : 100000;
  const currentQty = qty ?? minQty;
  const priceK = selectedService ? parseFloat(selectedService.rate) : 0;
  const totalPrice = ((priceK * currentQty) / 1000).toFixed(4);

  const sliderPct = ((currentQty - minQty) / (maxQty - minQty)) * 100;

  function handleNetworkClick(network) {
    setSelectedNetwork(network);
    setView('categories');
    setSearch('');
  }

  function handleServiceClick(svc) {
    setSelectedService(svc);
    setQty(parseInt(svc.min) || 10);
    setLink('');
    setView('service-form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!link.trim()) { toast('Введите ссылку', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await createOrder({ service: selectedService.service, link: link.trim(), quantity: currentQty });
      if (res.order) {
        toast(`Заказ #${res.order} успешно создан!`);
        const saved = JSON.parse(localStorage.getItem('orders') || '[]');
        saved.unshift({ id: res.order, service: selectedService.name, link: link.trim(), qty: currentQty, price: totalPrice, status: 'Pending', date: new Date().toLocaleString() });
        localStorage.setItem('orders', JSON.stringify(saved));
        setView('networks');
        setSelectedNetwork(null);
        setSelectedService(null);
        setLink('');
      } else {
        toast(res.error || 'Ошибка при создании заказа', 'error');
      }
    } catch {
      toast('Ошибка соединения с API', 'error');
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <>
        <div className="topbar"><span className="topbar-title">Новый заказ</span></div>
        <div className="loading-wrap"><div className="spinner" /></div>
      </>
    );
  }

  if (view === 'networks') {
    return (
      <>
        <div className="topbar"><span className="topbar-title">Выберите соцсеть</span></div>
        <div className="page-content">
          <div className="search-bar">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              placeholder="Поиск сервиса или заказа"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="network-grid">
            {filteredNetworks.map(n => (
              <div key={n.id} className="network-card" onClick={() => handleNetworkClick(n)}>
                <div className="network-icon">{icons[n.icon]}</div>
                <span className="network-name">{n.name}</span>
                <svg className="network-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (view === 'categories') {
    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => { setView('networks'); setSearch(''); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Назад
          </button>
          <span className="topbar-title">{selectedNetwork.name}</span>
        </div>
        <div className="page-content">
          {servicesForNetwork.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>Услуги не найдены</h3>
              <p>Для {selectedNetwork.name} пока нет доступных услуг</p>
            </div>
          ) : (
            <div className="service-list">
              {servicesForNetwork.map(svc => (
                <div key={svc.service} className="service-item" onClick={() => handleServiceClick(svc)}>
                  <div className="network-icon" style={{ width: 36, height: 36 }}>{icons[selectedNetwork.icon]}</div>
                  <span className="service-name">{svc.name}</span>
                  <span className="service-price">{svc.rate} $/1000</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{ color: 'var(--text2)', flexShrink: 0 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  if (view === 'service-form') {
    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => setView('categories')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Назад
          </button>
          <span className="topbar-title">{selectedService.name}</span>
        </div>
        <div className="page-content">
          <div className="order-form-wrap">
            <div className="service-header-card">
              <div className="service-header-icon">{icons[selectedNetwork.icon]}</div>
              <div>
                <div className="service-header-name">{selectedService.name}</div>
                <div className="service-header-count">Мин: {selectedService.min} — Макс: {selectedService.max}</div>
              </div>
              <div className="price-badge">
                <div className="price-badge-label">за 1000</div>
                <div className="price-badge-val">{selectedService.rate} $</div>
              </div>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ссылка</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Количество</label>
                <input
                  type="range"
                  className="range-slider"
                  min={minQty} max={maxQty}
                  value={currentQty}
                  onChange={e => setQty(Number(e.target.value))}
                  style={{ '--pct': `${sliderPct}%` }}
                />
                <div className="slider-labels">
                  <span>{minQty.toLocaleString()}</span>
                  <span>{maxQty.toLocaleString()}</span>
                </div>
                <div className="slider-value">{currentQty.toLocaleString()}</div>
                <button
                  type="button"
                  className="custom-qty-btn"
                  onClick={() => {
                    const v = prompt('Введите количество:', currentQty);
                    if (v) {
                      const n = Math.max(minQty, Math.min(maxQty, parseInt(v) || minQty));
                      setQty(n);
                    }
                  }}
                >
                  Ввести своё кол-во
                </button>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span className="price-key">Цена за 1000</span>
                  <span className="price-val">{selectedService.rate} $</span>
                </div>
                <div className="price-row">
                  <span className="price-key">Итого</span>
                  <span className="price-val accent">{totalPrice} $</span>
                </div>
              </div>

              <button className="submit-btn" type="submit" disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white' }} /> : 'Запустить заказ'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }
}
