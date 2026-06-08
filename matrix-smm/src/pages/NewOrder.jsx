import { useState, useEffect, useMemo, useCallback } from 'react';
import { getServices, createOrder } from '../api/twiboost';
import { icons, NETWORKS } from '../icons';
import { useToast } from '../components/Toast';

const toRub    = (rate, qty) => { const r = parseFloat(rate); return (!r||isNaN(r)) ? '0.00' : ((r*qty)/1000).toFixed(2); };
const rateRub  = (rate)      => { const r = parseFloat(rate); return (!r||isNaN(r)) ? '0.00' : r.toFixed(2); };
const fmt      = (n)         => Number(n).toLocaleString('ru-RU');

const PRESETS = [100, 500, 1000, 5000, 10000];

// ── Utilities ─────────────────────────────────────────────
// Pick the icon key for a category name (based on which network keyword matched)
function iconForCat(catName, network) {
  const cn = catName.toLowerCase();
  // Special case: Telegram Premium gets its own icon
  if (cn.includes('premium')) return 'telegram_premium';
  return network.icon;
}

// Match a service to a network via its category field
function svcMatchesNetwork(svc, network) {
  const cat = (svc.category || svc.name || '').toLowerCase();
  return network.keywords.some(k => cat.includes(k.toLowerCase()));
}

// ── Icons ─────────────────────────────────────────────────
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);
const ChevRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
  </svg>
);
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

// ── SpeedGauge ────────────────────────────────────────────
function SpeedGauge({ speed }) {
  const levels = { '0': 0.15, '1': 0.5, '2': 0.88 };
  const pct = levels[String(speed)] ?? 0.5;
  const angle = -150 + pct * 300;
  const label = { '0':'Медленно','1':'Быстро','2':'Молниеносно' }[String(speed)] ?? 'Быстро';
  const color = pct < 0.4 ? '#f59e0b' : pct < 0.7 ? '#10b981' : '#22d3ee';
  const toXY = (deg, r) => {
    const rad = (deg - 90) * Math.PI / 180;
    return [90 + r * Math.cos(rad), 90 + r * Math.sin(rad)];
  };
  const arcPath = (startDeg, endDeg, r) => {
    const [x1,y1] = toXY(startDeg, r);
    const [x2,y2] = toXY(endDeg, r);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const needleEnd = toXY(angle, 52);
  return (
    <div className="speed-gauge-wrap">
      <svg viewBox="0 0 180 110" width="160" height="95">
        <path d={arcPath(-150, 150, 68)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" strokeLinecap="round"/>
        <path d={arcPath(-150, angle - 90, 68)} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          style={{filter:`drop-shadow(0 0 6px ${color})`}}/>
        <line x1="90" y1="90" x2={needleEnd[0]} y2={needleEnd[1]} stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="90" cy="90" r="5" fill={color}/>
        <text x="18" y="100" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">Мед.</text>
        <text x="90" y="20" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">Норм.</text>
        <text x="162" y="100" fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="middle">Быст.</text>
      </svg>
      <div className="speed-label" style={{color}}>{label}</div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────
export default function NewOrder() {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState('networks'); // networks | categories | services | form
  const [net, setNet]               = useState(null);
  const [inPremium, setInPremium]   = useState(false);  // inside Telegram Premium sub-tab
  const [cat, setCat]               = useState(null);   // { name, icon, services[] }
  const [svc, setSvc]               = useState(null);
  const [comments, setComments]     = useState('');
  const [link, setLink]             = useState('');
  const [qty, setQty]               = useState(100);
  const [qtyRaw, setQtyRaw]         = useState('100');
  const [useInterval, setUseInterval] = useState(false);
  const [intRuns, setIntRuns]       = useState('');
  const [intMin, setIntMin]         = useState('');
  const [fav, setFav]               = useState(false);
  const [descOpen, setDescOpen]     = useState(false);
  const [busy, setBusy]             = useState(false);
  const toast = useToast();

  useEffect(() => {
    getServices()
      .then(d => { setServices(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setServices([]); setLoading(false); });
  }, []);

  // ── Parse categories from API for selected network ────────
  const { regularCats, premiumCats } = useMemo(() => {
    if (!net) return { regularCats: [], premiumCats: [] };
    const netSvcs = services.filter(s => svcMatchesNetwork(s, net));
    const map = {};
    netSvcs.forEach(s => {
      const catName = s.category || s.name || 'Другое';
      if (!map[catName]) map[catName] = { name: catName, services: [], icon: iconForCat(catName, net) };
      map[catName].services.push(s);
    });
    const all = Object.values(map).sort((a, b) => b.services.length - a.services.length);
    if (net.id === 'telegram') {
      return {
        premiumCats: all.filter(c => c.name.toLowerCase().includes('premium')),
        regularCats: all.filter(c => !c.name.toLowerCase().includes('premium')),
      };
    }
    return { regularCats: all, premiumCats: [] };
  }, [services, net]);

  const catsForNet = inPremium ? premiumCats : regularCats;

  // Services in selected category
  const catServices = cat ? cat.services : [];

  // Total service count for a network
  const netCount = (n) => services.filter(s => svcMatchesNetwork(s, n)).length;

  // ── Order form state ──────────────────────────────────────
  const minQ    = svc ? Math.max(1, parseInt(svc.min) || 10) : 10;
  const maxQ    = svc ? parseInt(svc.max) || 100000 : 100000;
  const safeQty = Math.max(minQ, Math.min(maxQ, qty));
  const sliderPct = maxQ > minQ ? Math.max(0, Math.min(100, ((safeQty-minQ)/(maxQ-minQ))*100)) : 0;
  const total   = svc ? toRub(svc.rate, safeQty) : '0.00';
  const rate    = svc ? rateRub(svc.rate) : '0.00';

  function pickNet(n) {
    setNet(n); setInPremium(false);
    const count = services.filter(s => svcMatchesNetwork(s, n)).length;
    if (count === 0) { toast(`Для ${n.name} услуг пока нет`, 'error'); return; }
    setView('categories');
  }
  function pickCat(c) {
    // If only 1 service in category — jump straight to form
    if (c.services.length === 1) { pickSvc(c.services[0]); return; }
    setCat(c); setView('services');
  }
  function pickSvc(s) {
    setSvc(s);
    const q = Math.max(1, parseInt(s.min) || 10);
    setQty(q); setQtyRaw(String(q));
    setLink(''); setComments(''); setFav(false); setDescOpen(false);
    setUseInterval(false); setIntRuns(''); setIntMin('');
    setView('form');
  }

  function handleSlider(e) { const v=Number(e.target.value); setQty(v); setQtyRaw(String(v)); }
  function handleQtyChange(e) {
    const raw = e.target.value.replace(/\D/g,'');
    setQtyRaw(raw);
    if (raw) setQty(Math.max(minQ,Math.min(maxQ,parseInt(raw))));
  }
  function handleQtyBlur() {
    const v = Math.max(minQ,Math.min(maxQ,parseInt(qtyRaw)||minQ));
    setQty(v); setQtyRaw(String(v));
  }
  function applyPreset(p) { const v=Math.max(minQ,Math.min(maxQ,p)); setQty(v); setQtyRaw(String(v)); }

  async function submit(e) {
    e.preventDefault();
    if (!link.trim()) { toast('Введите ссылку','error'); return; }
    setBusy(true);
    try {
        const orderPayload = { service: svc.service, link: link.trim(), quantity: safeQty };
      const isComment = svc.type && ['comment','like_to_comment','dislike_to_comment'].includes(svc.type.toLowerCase());
      if (isComment && comments.trim()) orderPayload.comments = comments.trim();
      if (svc.type?.toLowerCase() === 'vote' && comments.trim()) orderPayload.answer = comments.trim();
      const res = await createOrder(orderPayload);
      if (res.order) {
        toast(`Заказ #${res.order} создан`);
        const saved = JSON.parse(localStorage.getItem('orders')||'[]');
        saved.unshift({ id:res.order, service:svc.name, link:link.trim(), qty:safeQty, price:`${total} ₽`, status:'Pending', date:new Date().toLocaleString('ru-RU') });
        localStorage.setItem('orders', JSON.stringify(saved));
        setView('networks'); setNet(null); setCat(null); setSvc(null); setLink('');
      } else { toast(res.error||'Ошибка','error'); }
    } catch { toast('Ошибка соединения','error'); }
    setBusy(false);
  }

  // ════════════════════════════════════════════════════════════
  if (loading) return (
    <>
      <div className="topbar"><span className="topbar-title">Новый заказ</span></div>
      <div className="loading-wrap"><div className="spinner"/><span>Загрузка услуг...</span></div>
    </>
  );

  /* ── 1. NETWORKS ── */
  if (view === 'networks') return (
    <>
      <div className="topbar">
        <span className="topbar-title">Выберите соцсеть</span>
        <span className="topbar-badge">{services.length} услуг</span>
      </div>
      <div className="page-content">
        <div className="network-grid">
          {NETWORKS.map(n => {
            const cnt = netCount(n);
            return (
              <div key={n.id} className="network-card-outer" onClick={()=>pickNet(n)}>
                <div className="network-card-inner">
                  <div className="net-icon-wrap">{icons[n.icon]}</div>
                  <div style={{flex:1}}>
                    <div className="net-name">{n.name}</div>
                    <div className="net-count">{cnt > 0 ? `${cnt} услуг` : 'нет услуг'}</div>
                  </div>
                  {cnt > 0 && <svg className="net-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  /* ── 2. CATEGORIES (from API) ── */
  if (view === 'categories') {
    const totalPremSvcs = premiumCats.reduce((s, c) => s + c.services.length, 0);
    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => {
            if (inPremium) { setInPremium(false); } else { setView('networks'); }
          }}><BackIcon/> Назад</button>
          <span className="topbar-title">{inPremium ? 'Telegram Premium' : net.name}</span>
          <span className="topbar-badge">{catsForNet.length} категорий</span>
        </div>
        <div className="page-content">
          {catsForNet.length === 0 && !(!inPremium && premiumCats.length > 0) ? (
            <div className="empty-state"><div className="ico">?</div><h3>Нет категорий</h3><p>API не вернул категории для {net.name}</p></div>
          ) : (
            <div className="subcat-grid">
              {/* Telegram Premium special card — show only when NOT in premium mode */}
              {!inPremium && premiumCats.length > 0 && (
                <div className="subcat-card premium" onClick={() => setInPremium(true)}>
                  <div className="subcat-icon">{icons['telegram_premium']}</div>
                  <div className="subcat-body">
                    <div className="subcat-name">Telegram Premium</div>
                    <div className="subcat-count">{totalPremSvcs} услуг</div>
                    <span className="premium-badge">Premium</span>
                  </div>
                  <ChevRight/>
                </div>
              )}
              {catsForNet.map(c => (
                <div key={c.name} className="subcat-card" onClick={()=>pickCat(c)}>
                  <div className="subcat-icon">{icons[c.icon] || icons[net.icon]}</div>
                  <div className="subcat-body">
                    <div className="subcat-name">{c.name}</div>
                    <div className="subcat-count">{c.services.length} услуг</div>
                  </div>
                  <ChevRight/>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  /* ── 3. SERVICES ── */
  if (view === 'services') return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={()=>setView('categories')}><BackIcon/> Назад</button>
        <span className="topbar-title">{cat.name}</span>
        <span className="topbar-badge">{catServices.length} услуг</span>
      </div>
      <div className="page-content">
        <div className="svc-list-header">
          <span className="svc-list-title">{cat.name}</span>
          <span className="svc-list-price-label">Цена за 1000</span>
        </div>
        <div className="service-list">
          {catServices.map(s => (
            <div key={s.service} className="service-item" onClick={()=>pickSvc(s)}>
              <div className="svc-icon">{icons[cat.icon] || icons[net.icon]}</div>
              <span className="svc-name">{s.name}</span>
              <span className="svc-price-val">{rateRub(s.rate)} ₽</span>
              <ChevRight/>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  /* ── 4. ORDER FORM ── */
  if (view === 'form') {
    const hasCancel  = svc.cancel === '1' || svc.cancel === true || svc.cancel === 1;
    const speedLabel = { '0':'Медленно','1':'Быстро','2':'Молниеносно' }[svc.speed] || 'Быстро';
    const displayIcon = (cat?.icon) || net?.icon || 'telegram';
    const COMMENT_TYPES_FORM = ['comment', 'like_to_comment', 'dislike_to_comment'];
    const isCustomComments = svc.type && COMMENT_TYPES_FORM.includes(svc.type.toLowerCase());
    const isVote = svc.type && svc.type.toLowerCase() === 'vote';

    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={()=>setView('services')}><BackIcon/> Назад</button>
          <span className="topbar-title" style={{fontSize:13}}>{svc.name}</span>
        </div>
        <div className="page-content">
          <div className="order-layout">

            {/* Header */}
            <div className="svc-header">
              <div className="svc-header-icon">{icons[displayIcon] || icons[net?.icon]}</div>
              <div className="svc-header-body">
                <div className="svc-header-name">{svc.name}</div>
                <div className="svc-chips">
                  <span className="svc-chip violet">ID: {svc.service}</span>
                  <span className="svc-chip">Мин: {fmt(svc.min)}</span>
                  <span className="svc-chip">Макс: {fmt(svc.max)}</span>
                  <span className="svc-chip">{speedLabel}</span>
                  <span className={`svc-chip ${hasCancel?'green':'red'}`}>{hasCancel?'Есть отмена':'Нет отмены'}</span>
                </div>
              </div>
              <button type="button" className={`fav-btn${fav?' on':''}`} onClick={()=>setFav(v=>!v)}>
                {fav?'★':'☆'}
              </button>
            </div>

            {/* LEFT: form */}
            <form className="form-card" onSubmit={submit}>
              <div className="f-group">
                <label className="f-label"><LinkIcon/> Ссылка</label>
                <input className="f-input" placeholder="https://t.me/username" value={link} onChange={e=>setLink(e.target.value)} required/>
              </div>

              {isCustomComments && (
                <div className="f-group">
                  <label className="f-label">Комментарии (по одному на строку)</label>
                  <textarea className="f-textarea" rows={5} placeholder={"Комментарий 1\nКомментарий 2\n..."} value={comments} onChange={e=>setComments(e.target.value)}/>
                </div>
              )}
              {isVote && (
                <div className="f-group">
                  <label className="f-label">Вариант ответа в опросе</label>
                  <input className="f-input" placeholder="Введите текст ответа..." value={comments} onChange={e=>setComments(e.target.value)} required/>
                </div>
              )}

              <div className="f-group">
                <label className="f-label">Количество</label>
                <div className="qty-row">
                  <div className="range-track">
                    <input type="range" className="range-slider" min={minQ} max={maxQ} value={safeQty} onChange={handleSlider} style={{'--pct':`${sliderPct}%`}}/>
                    <div className="slider-labels"><span>{fmt(minQ)}</span><span>{fmt(maxQ)}</span></div>
                  </div>
                  <input type="text" className="qty-number-input" value={qtyRaw} onChange={handleQtyChange} onBlur={handleQtyBlur}/>
                </div>
                <div className="qty-presets">
                  {PRESETS.filter(p=>p>=minQ&&p<=maxQ).map(p=>(
                    <button key={p} type="button" className={`qty-preset${safeQty===p?' active':''}`} onClick={()=>applyPreset(p)}>{fmt(p)}</button>
                  ))}
                  <button type="button" className={`qty-preset${safeQty===maxQ?' active':''}`} onClick={()=>applyPreset(maxQ)}>Макс</button>
                </div>
              </div>

              <div className="f-group">
                <div className={`toggle-row${useInterval?' open':''}`} onClick={()=>setUseInterval(v=>!v)}>
                  <div>
                    <div className="toggle-lbl">Интервальная подача</div>
                    <div className="toggle-sub">Равномерное распределение заказа</div>
                  </div>
                  <div className={`toggle-sw${useInterval?' on':''}`}/>
                </div>
                {useInterval && (
                  <div className="interval-fields">
                    <div className="int-field">
                      <label>Кол-во запусков</label>
                      <input className="int-input" type="text" inputMode="numeric" placeholder="10" value={intRuns} onChange={e=>setIntRuns(e.target.value.replace(/\D/g,''))}/>
                    </div>
                    <div className="int-field">
                      <label>Интервал (мин)</label>
                      <input className="int-input" type="text" inputMode="numeric" placeholder="60" value={intMin} onChange={e=>setIntMin(e.target.value.replace(/\D/g,''))}/>
                    </div>
                  </div>
                )}
              </div>

              <button className="submit-btn" type="submit" disabled={busy}>
                {busy
                  ? <span className="spinner" style={{width:18,height:18,borderTopColor:'white',verticalAlign:'middle'}}/>
                  : `Запустить за ${total} ₽`}
              </button>

              <hr className="desc-divider"/>
              <div className="desc-card">
                <div className="desc-head" onClick={()=>setDescOpen(v=>!v)}>
                  <span style={{display:'flex',alignItems:'center',gap:7}}><InfoIcon/> Описание услуги</span>
                  <svg className={`desc-chevron${descOpen?' open':''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <div className={`desc-body${descOpen?' open':''}`} style={{whiteSpace:'pre-wrap'}}>
                  {svc.description || `Услуга "${svc.name}". Подача начинается в течение нескольких минут. Рекомендуем открытые профили. Отслеживайте прогресс в "Мои заказы".`}
                </div>
              </div>
            </form>

            {/* RIGHT: info panel */}
            <div className="info-panel">
              <div className="price-card">
                <div className="pc-label">Итого к оплате</div>
                <div className="pc-amount">{total} ₽</div>
                <div className="pc-sub">за {fmt(safeQty)} шт.</div>
                <div className="pc-divider"/>
                <div className="pc-row"><span className="pc-key">Цена за 1000</span><span className="pc-val">{rate} ₽</span></div>
                <div className="pc-row"><span className="pc-key">Цена за 1 шт.</span><span className="pc-val">{(parseFloat(rate)/1000).toFixed(4)} ₽</span></div>
              </div>

              <div className="speed-card">
                <SpeedGauge speed={svc.speed ?? '1'} />
              </div>

              <div className="info-chips">
                <div className="info-chip"><div className="chip-lbl">ID услуги</div><div className="chip-val v">{svc.service}</div></div>
                <div className="info-chip"><div className="chip-lbl">Отмена</div><div className={`chip-val ${hasCancel?'g':'r'}`}>{hasCancel?'Есть':'Нет'}</div></div>
              </div>

            </div>

          </div>
        </div>
      </>
    );
  }
}
