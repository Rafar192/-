import { useState, useEffect, useMemo } from 'react';
import { getServices, createOrder } from '../api/twiboost';
import { icons, NETWORKS } from '../icons';
import { useToast } from '../components/Toast';

const USD_RUB = 90;

function toRub(usdRate, qty) {
  const r = parseFloat(usdRate);
  if (!r || isNaN(r)) return '0.00';
  return ((r * USD_RUB * qty) / 1000).toFixed(2);
}
function rateRub(usdRate) {
  const r = parseFloat(usdRate);
  if (!r || isNaN(r)) return '0';
  return (r * USD_RUB).toFixed(2);
}
function fmt(n) { return Number(n).toLocaleString('ru-RU'); }

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
const QtyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
);

const PRESETS = [100, 500, 1000, 5000, 10000];

export default function NewOrder() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('networks');
  const [net, setNet] = useState(null);
  const [svc, setSvc] = useState(null);
  const [search, setSearch] = useState('');
  const [link, setLink] = useState('');
  const [qty, setQty] = useState(100);
  const [qtyRaw, setQtyRaw] = useState('100');
  const [useInterval, setUseInterval] = useState(false);
  const [intRuns, setIntRuns] = useState('');
  const [intMin, setIntMin] = useState('');
  const [fav, setFav] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getServices()
      .then(d => { setServices(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setServices([]); setLoading(false); });
  }, []);

  const netServices = useMemo(() => {
    if (!net) return [];
    return services.filter(s => {
      const nm = (s.name || '').toLowerCase();
      return net.keywords.some(k => nm.includes(k));
    });
  }, [services, net]);

  const filteredNets = useMemo(() => {
    if (!search) return NETWORKS;
    const q = search.toLowerCase();
    return NETWORKS.filter(n => n.name.toLowerCase().includes(q) || n.keywords.some(k => k.includes(q)));
  }, [search]);

  const minQ = svc ? Math.max(1, parseInt(svc.min) || 10) : 10;
  const maxQ = svc ? parseInt(svc.max) || 100000 : 100000;
  const safeQty = Math.max(minQ, Math.min(maxQ, qty));
  const sliderPct = maxQ > minQ ? Math.max(0, Math.min(100, ((safeQty - minQ) / (maxQ - minQ)) * 100)) : 0;
  const total = svc ? toRub(svc.rate, safeQty) : '0.00';
  const rate = svc ? rateRub(svc.rate) : '0';

  function pickSvc(s) {
    setSvc(s);
    const q = Math.max(1, parseInt(s.min) || 10);
    setQty(q); setQtyRaw(String(q));
    setLink(''); setFav(false); setDescOpen(false); setUseInterval(false);
    setIntRuns(''); setIntMin('');
    setView('form');
  }

  function handleSlider(e) {
    const v = Number(e.target.value);
    setQty(v); setQtyRaw(String(v));
  }
  function handleQtyChange(e) {
    const raw = e.target.value.replace(/\D/g, '');
    setQtyRaw(raw);
    if (raw) setQty(Math.max(minQ, Math.min(maxQ, parseInt(raw))));
  }
  function handleQtyBlur() {
    const v = Math.max(minQ, Math.min(maxQ, parseInt(qtyRaw) || minQ));
    setQty(v); setQtyRaw(String(v));
  }
  function applyPreset(p) {
    const v = Math.max(minQ, Math.min(maxQ, p));
    setQty(v); setQtyRaw(String(v));
  }

  async function submit(e) {
    e.preventDefault();
    if (!link.trim()) { toast('Введите ссылку', 'error'); return; }
    setBusy(true);
    try {
      const res = await createOrder({ service: svc.service, link: link.trim(), quantity: safeQty });
      if (res.order) {
        toast(`Заказ #${res.order} создан`);
        const saved = JSON.parse(localStorage.getItem('orders') || '[]');
        saved.unshift({ id: res.order, service: svc.name, link: link.trim(), qty: safeQty, price: total + ' ₽', status: 'Pending', date: new Date().toLocaleString('ru-RU') });
        localStorage.setItem('orders', JSON.stringify(saved));
        setView('networks'); setNet(null); setSvc(null); setLink('');
      } else {
        toast(res.error || 'Ошибка создания заказа', 'error');
      }
    } catch { toast('Ошибка соединения с API', 'error'); }
    setBusy(false);
  }

  /* ── LOADING ── */
  if (loading) return (
    <>
      <div className="topbar"><span className="topbar-title">Новый заказ</span></div>
      <div className="loading-wrap"><div className="spinner" /><span>Загрузка услуг...</span></div>
    </>
  );

  /* ── NETWORKS ── */
  if (view === 'networks') return (
    <>
      <div className="topbar">
        <span className="topbar-title">Выберите соцсеть</span>
        <span className="topbar-badge">{services.length} услуг</span>
      </div>
      <div className="page-content">
        <div className="search-wrap">
          <svg className="search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input placeholder="Поиск соцсети..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="network-grid">
          {filteredNets.map(n => {
            const cnt = services.filter(s => n.keywords.some(k => (s.name||'').toLowerCase().includes(k))).length;
            return (
              <div key={n.id} className="network-card-outer" onClick={() => { setNet(n); setView('services'); setSearch(''); }}>
                <div className="network-card-inner">
                  <div className="net-icon-wrap">{icons[n.icon]}</div>
                  <div style={{ flex: 1 }}>
                    <div className="net-name">{n.name}</div>
                    {cnt > 0 && <div className="net-count">{cnt} услуг</div>}
                  </div>
                  <svg className="net-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  /* ── SERVICES ── */
  if (view === 'services') return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={() => { setView('networks'); setSearch(''); }}><BackIcon /> Назад</button>
        <span className="topbar-title">{net.name}</span>
        <span className="topbar-badge">{netServices.length} услуг</span>
      </div>
      <div className="page-content">
        {netServices.length === 0 ? (
          <div className="empty-state">
            <div className="ico">?</div>
            <h3>Услуги не найдены</h3>
            <p>Для {net.name} пока нет доступных услуг</p>
          </div>
        ) : (
          <>
            <div className="svc-list-header">
              <span className="svc-list-title">{net.name} — все услуги</span>
              <span className="svc-list-price-label">Цена за 1000</span>
            </div>
            <div className="service-list">
              {netServices.map(s => (
                <div key={s.service} className="service-item" onClick={() => pickSvc(s)}>
                  <div className="svc-icon">{icons[net.icon]}</div>
                  <span className="svc-name">{s.name}</span>
                  <span className="svc-price-val">{rateRub(s.rate)} ₽</span>
                  <ChevronRight />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );

  /* ── ORDER FORM ── */
  if (view === 'form') {
    const hasCancel = svc.cancel === '1' || svc.cancel === true || svc.cancel === 1;
    const speedLabel = { '0': 'Медленно', '1': 'Быстро', '2': 'Молниеносно' }[svc.speed] || 'Быстро';

    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => setView('services')}><BackIcon /> Назад</button>
          <span className="topbar-title" style={{ fontSize: 14 }}>{net.name}</span>
        </div>
        <div className="page-content">
          <div className="order-layout">

            {/* Header — full width */}
            <div className="svc-header">
              <div className="svc-header-icon">{icons[net.icon]}</div>
              <div className="svc-header-body">
                <div className="svc-header-name">{svc.name}</div>
                <div className="svc-chips">
                  <span className="svc-chip violet">ID: {svc.service}</span>
                  <span className="svc-chip">Мин: {fmt(svc.min)}</span>
                  <span className="svc-chip">Макс: {fmt(svc.max)}</span>
                  <span className="svc-chip">{speedLabel}</span>
                  <span className={`svc-chip ${hasCancel ? 'green' : 'red'}`}>{hasCancel ? 'Есть отмена' : 'Нет отмены'}</span>
                </div>
              </div>
              <button
                type="button"
                className={`fav-btn${fav ? ' on' : ''}`}
                onClick={() => setFav(v => !v)}
                title={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
              >
                {fav ? '★' : '☆'}
              </button>
            </div>

            {/* LEFT: form */}
            <form className="form-card" onSubmit={submit}>
              {/* Link */}
              <div className="f-group">
                <label className="f-label"><LinkIcon /> Ссылка</label>
                <input
                  className="f-input"
                  placeholder="https://t.me/username"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  required
                />
              </div>

              {/* Quantity */}
              <div className="f-group">
                <label className="f-label"><QtyIcon /> Количество</label>
                <div className="qty-row">
                  <div className="range-track">
                    <input
                      type="range"
                      className="range-slider"
                      min={minQ} max={maxQ}
                      value={safeQty}
                      onChange={handleSlider}
                      style={{ '--pct': `${sliderPct}%` }}
                    />
                    <div className="slider-labels">
                      <span>{fmt(minQ)}</span>
                      <span>{fmt(maxQ)}</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="qty-number-input"
                    value={qtyRaw}
                    onChange={handleQtyChange}
                    onBlur={handleQtyBlur}
                  />
                </div>
                <div className="qty-presets">
                  {PRESETS.filter(p => p >= minQ && p <= maxQ).map(p => (
                    <button
                      key={p} type="button"
                      className={`qty-preset${safeQty === p ? ' active' : ''}`}
                      onClick={() => applyPreset(p)}
                    >
                      {fmt(p)}
                    </button>
                  ))}
                  <button type="button" className={`qty-preset${safeQty === maxQ ? ' active' : ''}`} onClick={() => applyPreset(maxQ)}>Макс</button>
                </div>
              </div>

              {/* Interval toggle */}
              <div className="f-group">
                <div className={`toggle-row${useInterval ? ' open' : ''}`} onClick={() => setUseInterval(v => !v)}>
                  <div>
                    <div className="toggle-lbl">Интервальная подача</div>
                    <div className="toggle-sub">Равномерное распределение заказа</div>
                  </div>
                  <div className={`toggle-sw${useInterval ? ' on' : ''}`} />
                </div>
                {useInterval && (
                  <div className="interval-fields">
                    <div className="int-field">
                      <label>Кол-во запусков</label>
                      <input
                        className="int-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="10"
                        value={intRuns}
                        onChange={e => setIntRuns(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <div className="int-field">
                      <label>Интервал (мин)</label>
                      <input
                        className="int-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="60"
                        value={intMin}
                        onChange={e => setIntMin(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button className="submit-btn" type="submit" disabled={busy}>
                {busy
                  ? <span className="spinner" style={{ width:18,height:18,borderTopColor:'white',verticalAlign:'middle' }} />
                  : `Запустить за ${total} ₽`}
              </button>
            </form>

            {/* RIGHT: info panel */}
            <div className="info-panel">
              {/* Price card */}
              <div className="price-card">
                <div className="pc-label">Итого к оплате</div>
                <div className="pc-amount">{total} ₽</div>
                <div className="pc-sub">за {fmt(safeQty)} шт.</div>
                <div className="pc-divider" />
                <div className="pc-row">
                  <span className="pc-key">Цена за 1000</span>
                  <span className="pc-val">{rate} ₽</span>
                </div>
                <div className="pc-row">
                  <span className="pc-key">Цена за 1 шт.</span>
                  <span className="pc-val">{(parseFloat(rate) / 1000).toFixed(4)} ₽</span>
                </div>
              </div>

              {/* Info chips */}
              <div className="info-chips">
                <div className="info-chip">
                  <div className="chip-lbl">ID услуги</div>
                  <div className="chip-val v">{svc.service}</div>
                </div>
                <div className="info-chip">
                  <div className="chip-lbl">Скорость</div>
                  <div className="chip-val y">{speedLabel}</div>
                </div>
                <div className="info-chip">
                  <div className="chip-lbl">Отмена</div>
                  <div className={`chip-val ${hasCancel ? 'g' : 'r'}`}>{hasCancel ? 'Есть' : 'Нет'}</div>
                </div>
                <div className="info-chip">
                  <div className="chip-lbl">Мин / Макс</div>
                  <div className="chip-val" style={{ fontSize: 11 }}>{fmt(svc.min)} / {fmt(svc.max)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="desc-card">
                <div className="desc-head" onClick={() => setDescOpen(v => !v)}>
                  <span style={{ display:'flex', alignItems:'center', gap:7 }}><InfoIcon /> Описание услуги</span>
                  <svg className={`desc-chevron${descOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div className={`desc-body${descOpen ? ' open' : ''}`}>
                  {svc.description ||
                    `Услуга "${svc.name}". Подача начинается в течение нескольких минут. Рекомендуем использовать открытые профили и каналы. После запуска отслеживайте прогресс в разделе "Мои заказы".`}
                </div>
              </div>
            </div>

          </div>
        </div>
      </>
    );
  }
}
