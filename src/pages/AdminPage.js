// src/pages/AdminPage.js

import { useState } from 'react';

export function AdminPage({ isMobile }) {
  const [password, setPassword]     = useState('');
  const [authed, setAuthed]         = useState(false);
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [loginError, setLoginError] = useState('');
  const [toast, setToast]           = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const login = async () => {
    if (!password) return;
    setLoading(true); setLoginError('');
    try {
      const res = await fetch(`/api/orders?password=${encodeURIComponent(password)}`);
      if (res.status === 401) { setLoginError('Incorrect password.'); setLoading(false); return; }
      const data = await res.json();
      setOrders(data.orders || []);
      setAuthed(true);
    } catch { setLoginError('Something went wrong. Try again.'); }
    setLoading(false);
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch('/api/update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, orderId, status }),
      });
      if (!res.ok) throw new Error();
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
      showToast(status === 'delivered' ? '✓ Marked delivered — customer emailed' : '✓ Status updated');
    } catch { showToast('Failed to update. Try again.'); }
  };

  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'received').length,
    progress:  orders.filter(o => o.status === 'in_progress').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue:   orders.reduce((s, o) => s + parseFloat(o.amount || 0), 0),
  };

  const statusLabel = { received: 'Received', in_progress: 'In Progress', delivered: 'Delivered' };
  const statusColor = {
    received:    { bg: '#fef3c7', color: '#92400e' },
    in_progress: { bg: '#dbeafe', color: '#1e40af' },
    delivered:   { bg: '#d1fae5', color: '#065f46' },
  };

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '20px', padding: isMobile ? '36px 24px' : '48px 40px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ background: 'black', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1d1d1f', marginBottom: '8px' }}>Admin Login</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>RimViz order management</p>
        <input type="password" placeholder="Enter password" value={password}
          onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '16px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' }} />
        <button onClick={login} disabled={loading}
          style={{ width: '100%', padding: '14px', borderRadius: '9999px', background: loading ? '#666' : 'black', color: 'white', fontSize: '15px', fontWeight: '600', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        {loginError && <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '12px' }}>{loginError}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      <nav style={{ background: '#000', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ color: 'white', fontSize: '18px', fontWeight: '300' }}>Rim<b style={{ fontWeight: 700 }}>Viz</b></span>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>Admin</span>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total Orders', value: stats.total,     color: '#1d1d1f' },
            { label: 'Pending',      value: stats.pending,   color: '#d97706' },
            { label: 'In Progress',  value: stats.progress,  color: '#2563eb' },
            { label: 'Delivered',    value: stats.delivered, color: '#059669' },
            { label: 'Revenue',      value: `R${stats.revenue.toFixed(2)}`, color: '#1d1d1f', small: true },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e5e7eb' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>{s.label}</p>
              <p style={{ fontSize: s.small ? '20px' : '28px', fontWeight: '700', color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f', marginBottom: '16px' }}>All Orders</p>

        {orders.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
            No orders yet. They will appear here once customers pay.
          </div>
        ) : orders.map(order => (
          <div key={order.orderId} style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '14px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '3px' }}>{order.orderId}</p>
                <p style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f' }}>{order.customerName}</p>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', background: statusColor[order.status]?.bg, color: statusColor[order.status]?.color }}>
                {statusLabel[order.status]}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Email',    value: order.customerEmail },
                { label: 'Phone',    value: order.customerPhone || 'N/A' },
                { label: 'Rim Size', value: `${order.rimSize}"` },
                { label: 'Amount',   value: `R${order.amount}` },
                { label: 'Date',     value: order.orderDate },
              ].map((d, i) => (
                <div key={i}>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>{d.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1d1d1f', wordBreak: 'break-all' }}>{d.value}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              {['received', 'in_progress', 'delivered'].map(s => (
                <button key={s} onClick={() => updateStatus(order.orderId, s)}
                  style={{ padding: '8px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600', border: '1.5px solid', borderColor: order.status === s ? '#000' : '#e5e7eb', background: order.status === s ? '#000' : 'white', color: order.status === s ? 'white' : '#374151', cursor: 'pointer' }}>
                  {statusLabel[s]}
                </button>
              ))}
              {order.rimImageUrl && (
                <a href={order.rimImageUrl} target="_blank" rel="noreferrer"
                  style={{ padding: '8px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600', background: '#f3f4f6', color: '#374151', textDecoration: 'none' }}>
                  Rim Image
                </a>
              )}
              {order.vehicleImageUrl && (
                <a href={order.vehicleImageUrl} target="_blank" rel="noreferrer"
                  style={{ padding: '8px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600', background: '#f3f4f6', color: '#374151', textDecoration: 'none' }}>
                  Car Image
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#000', color: 'white', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500', zIndex: 999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
