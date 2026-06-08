import { useState, useEffect, useMemo } from 'react';
import { getServices, createOrder } from '../api/twiboost';
import { icons, NETWORKS } from '../icons';
import { useToast } from '../components/Toast';

const USD_TO_RUB = 90;
const toRub = (usdPer1000, qty) => ((parseFloat(usdPer1000) * USD_TO_RUB * qty) / 1000).toFixed(2);
const ratePer1000Rub = (usdRate) => (parseFloat(usdRate) * USD_TO_RUB).toFixed(1);

export default function NewOrder() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('networks');
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [search, setSearch] = useState('');
  const [link, setLink] = useState('');
  const [qty, setQty] = useState(null);
  const [qtyInput, setQtyInput] = useState('');
  const [interval, setInterval] = useState(false);
  const [fav, setFav] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getServices()
      .then(data => { setServices(Array.isArray(data) ? data : []); setLoading(false); })
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
  const sliderPct = Math.max(0, Math.min(100, ((currentQty - minQty) / (maxQty - minQty)) * 100));
  const totalRub = selectedService ? toRub(selectedService.rate, currentQty) : '0';
  const rateRub = selectedService ? ratePer1000Rub(selectedService.rate) : '0';

  function handleSlider(e) {
    const v = Number(e.target.value);
    setQty(v);
    setQtyInput(String(v));
  }

  function handleQtyInput(e) {
    const raw = e.target.value.replace(/\D/g, '');
    setQtyInput(raw);
    if (raw) {
      const v = Math.max(minQty, Math.min(maxQty, parseInt(raw)));
      setQty(v);
    }
  }

  function handleQtyBlur() {
    const v = parseInt(qtyInput) || minQty;
    const clamped = Math.max(minQty, Math.min(maxQty, v));
    setQty(clamped);
    setQtyInput(String(clamped));
  }

  function handleNetworkClick(network) {
    setSelectedNetwork(network);
    setView('categories');
    setSearch('');
  }

  function handleServiceClick(svc) {
    setSelectedService(svc);
    const q = parseInt(svc.min) || 10;
    setQty(q);
    setQtyInput(String(q));
    setLink('');
    setFav(false);
    setDescOpen(false);
    setInterval(false);
    setView('service-form');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!link.trim()) { toast('Введите ссылку', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await createOrder({ service: selectedService.service, link: link.trim(), quantity: currentQty });
      if (res.order) {
        toast(`Заказ #${res.order} создан успешно! 🚀`);
        const saved = JSON.parse(localStorage.getItem('orders') || '[]');
        saved.unshift({
          id: res.order,
          service: selectedService.name,
          link: link.trim(),
          qty: currentQty,
          price: totalRub + ' ₽',
          status: 'Pending',
          date: new Date().toLocaleString('ru-RU'),
        });
        localStorage.setItem('orders', JSON.stringify(saved));
        setView('networks'); setSelectedNetwork(null); setSelectedService(null); setLink('');
      } else {
        toast(res.error || 'Ошибка при создании заказа', 'error');
      }
    } catch { toast('Ошибка соединения с API', 'error'); }
    setSubmitting(false);
  }

  const ChevronRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  );
  const BackArrow = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
      <path d="M19 12H5M12 5l-7 7 7 7"/>
    </svg>
  );

  if (loading) {
    return (
      <>
        <div className="topbar"><span className="topbar-title">Новый заказ</span></div>
        <div className="loading-wrap"><div className="spinner" /><span>Загрузка услуг...</span></div>
      </>
    );
  }

  /* ── NETWORKS ── */
  if (view === 'networks') {
    return (
      <>
        <div className="topbar">
          <span className="topbar-title">Выберите соцсеть</span>
          <span className="topbar-sub">{services.length} услуг загружено</span>
        </div>
        <div className="page-content">
          <div className="search-bar">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input placeholder="Поиск соцсети или услуги..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="network-grid">
            {filteredNetworks.map(n => {
              const count = services.filter(s => {
                const nm = (s.name || '').toLowerCase();
                return n.keywords.some(k => nm.includes(k));
              }).length;
              return (
                <div key={n.id} className="network-card" onClick={() => handleNetworkClick(n)}>
                  <div className="network-icon">{icons[n.icon]}</div>
                  <div style={{ flex: 1 }}>
                    <div className="network-name">{n.name}</div>
                    {count > 0 && <div className="network-count">{count} услуг</div>}
                  </div>
                  <svg className="network-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  /* ── CATEGORIES ── */
  if (view === 'categories') {
    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => { setView('networks'); setSearch(''); }}><BackArrow /> Назад</button>
          <span className="topbar-title">{selectedNetwork.name}</span>
          <span className="topbar-sub">{servicesForNetwork.length} услуг</span>
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
                  <div className="network-icon" style={{ width: 38, height: 38, borderRadius: 10 }}>{icons[selectedNetwork.icon]}</div>
                  <span className="service-name">{svc.name}</span>
                  <span className="service-price">{ratePer1000Rub(svc.rate)} ₽/1000</span>
                  <ChevronRight />
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  /* ── SERVICE FORM ── */
  if (view === 'service-form') {
    const hasCancel = selectedService.cancel === '1' || selectedService.cancel === true;
    const speedMap = { '0': '🐢 Медленно', '1': '🚀 Быстро', '2': '⚡ Мгновенно' };
    const speed = speedMap[selectedService.speed] || '🚀 Быстро';

    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => setView('categories')}><BackArrow /> Назад</button>
          <span className="topbar-title" style={{ fontSize: 14 }}>{selectedService.name}</span>
        </div>
        <div className="page-content">
          <div className="order-layout">
            {/* Service title card — full width */}
            <div className="service-title-card">
              <div className="svc-title-icon">{icons[selectedNetwork.icon]}</div>
              <div className="svc-title-text">
                <div className="svc-title-name">{selectedService.name}</div>
                <div className="svc-title-meta">
                  <span className="svc-meta-chip">🆔 ID: {selectedService.service}</span>
                  <span className="svc-meta-chip">📦 Мин: {parseInt(selectedService.min).toLocaleString()}</span>
                  <span className="svc-meta-chip">📦 Макс: {parseInt(selectedService.max).toLocaleString()}</span>
                  <span className="svc-meta-chip">{speed}</span>
                  {hasCancel && <span className="svc-meta-chip">✅ Есть отмена</span>}
                </div>
              </div>
              <button className={`fav-btn${fav ? ' active' : ''}`} type="button" onClick={() => setFav(f => !f)} title="Избранное">
                {fav ? '⭐' : '☆'}
              </button>
            </div>

            {/* LEFT: form */}
            <form className="form-card" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  Ссылка
                </label>
                <input
                  className="form-input"
                  placeholder="https://t.me/username или другая ссылка"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                  Количество
                </label>
                <div className="qty-row">
                  <div>
                    <input
                      type="range"
                      className="range-slider"
                      min={minQty} max={maxQty}
                      value={currentQty}
                      onChange={handleSlider}
                      style={{ '--pct': `${sliderPct}%` }}
                    />
                    <div className="slider-labels">
                      <span>{minQty.toLocaleString()}</span>
                      <span>{maxQty.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="qty-input-wrap">
                    <input
                      type="text"
                      className="qty-number"
                      value={qtyInput}
                      onChange={handleQtyInput}
                      onBlur={handleQtyBlur}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Интервальная подача</div>
                    <div className="toggle-sub">Равномерное распределение заказа</div>
                  </div>
                  <div className={`toggle-switch${interval ? ' on' : ''}`} onClick={() => setInterval(v => !v)} />
                </div>
              </div>

              <button className="submit-btn" type="submit" disabled={submitting}>
                {submitting
                  ? <><span className="spinner" style={{ width: 18, height: 18, borderTopColor: 'white', display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />Запуск...</>
                  : `🚀 Запустить — ${totalRub} ₽`}
              </button>
            </form>

            {/* RIGHT: info panel */}
            <div className="info-panel">
              {/* Big price card */}
              <div className="price-card">
                <div className="price-card-label">Итого к оплате</div>
                <div className="price-card-amount">{totalRub} ₽</div>
                <div className="price-card-per">за {currentQty.toLocaleString()} шт.</div>
                <div className="price-divider" />
                <div className="price-row2">
                  <span className="price-key2">Цена за 1000</span>
                  <span className="price-val2">{rateRub} ₽</span>
                </div>
                <div className="price-row2">
                  <span className="price-key2">Цена за 1 шт.</span>
                  <span className="price-val2">{(parseFloat(rateRub) / 1000).toFixed(4)} ₽</span>
                </div>
              </div>

              {/* Info chips */}
              <div className="info-chips">
                <div className="info-chip">
                  <div className="chip-icon">🆔</div>
                  <div className="chip-label">ID услуги</div>
                  <div className="chip-val">{selectedService.service}</div>
                </div>
                <div className="info-chip">
                  <div className="chip-icon">⚡</div>
                  <div className="chip-label">Скорость</div>
                  <div className="chip-val yellow">{speed.split(' ').slice(1).join(' ')}</div>
                </div>
                <div className="info-chip">
                  <div className="chip-icon">{hasCancel ? '✅' : '❌'}</div>
                  <div className="chip-label">Отмена</div>
                  <div className={`chip-val ${hasCancel ? 'green' : 'red'}`}>{hasCancel ? 'Есть' : 'Нет'}</div>
                </div>
                <div className="info-chip">
                  <div className="chip-icon">📈</div>
                  <div className="chip-label">Мин/Макс</div>
                  <div className="chip-val" style={{ fontSize: 11 }}>{parseInt(selectedService.min).toLocaleString()} / {parseInt(selectedService.max).toLocaleString()}</div>
                </div>
              </div>

              {/* Description */}
              <div className="desc-card">
                <div className="desc-header" onClick={() => setDescOpen(v => !v)}>
                  <span className="desc-header-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    Описание услуги
                  </span>
                  <svg className={`desc-chevron${descOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div className={`desc-body${descOpen ? ' open' : ''}`}>
                  {selectedService.description
                    ? selectedService.description
                    : `Качественная накрутка «${selectedService.name}». Гарантированная доставка в пределах указанного диапазона. Рекомендуется использовать открытые аккаунты/каналы. Перед запуском ознакомьтесь с условиями использования.`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
