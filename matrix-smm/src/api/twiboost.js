const API_KEY = 'd0iZ50X5IR8NIceAvQ0v5KIAvACNEpdBl2D1Ufc5f1t4ki7ZsW6R9ePpssG3';
const BASE = '/api-proxy';

async function call(body) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: API_KEY, ...body }),
  });
  return res.json();
}

export const getServices = () => call({ action: 'services' });
export const getBalance = () => call({ action: 'balance' });
export const createOrder = ({ service, link, quantity }) =>
  call({ action: 'add', service, link, quantity });
export const getOrders = (orders) => call({ action: 'status', orders });
