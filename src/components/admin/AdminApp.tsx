import React, { useEffect, useState } from 'react';

const API = '/api/admin';

function useToken() {
  const [token, setToken] = useState<string | null>(() => (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null));
  const save = (t: string | null) => {
    if (t) localStorage.setItem('admin_token', t); else localStorage.removeItem('admin_token');
    setToken(t);
  };
  return { token, setToken: save };
}

async function api(path: string, opts: RequestInit = {}, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || res.statusText);
  return json;
}

export default function AdminApp() {
  const { token, setToken } = useToken();
  const [tab, setTab] = useState<'products' | 'store' | 'orders'>('products');

  if (!token) return <Login onLogin={setToken} />;

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-900 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold">Panel Admin</h1>
        <button onClick={() => setToken(null)} className="text-sm underline">Salir</button>
      </header>
      <nav className="flex gap-2 p-3 bg-white border-b">
        {(['products','store','orders'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded ${tab === t ? 'bg-stone-900 text-white' : 'bg-stone-200'}`}>
            {t === 'products' ? 'Productos' : t === 'store' ? 'Mi Tienda' : 'Pedidos'}
          </button>
        ))}
      </nav>
      <main className="p-4 max-w-4xl mx-auto">
        {tab === 'products' && <Products token={token} />}
        {tab === 'store' && <Store token={token} />}
        {tab === 'orders' && <Orders token={token} />}
      </main>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const json: any = await api('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      onLogin(json.data.token);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-full max-w-sm space-y-3">
        <h2 className="text-xl font-bold">Acceso Admin</h2>
        <input className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button disabled={loading} className="w-full bg-stone-900 text-white py-2 rounded">{loading ? '...' : 'Entrar'}</button>
      </form>
    </div>
  );
}

function Products({ token }: { token: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: '', weight: '', price: 0, desc: '', image: '', stock: 0, active: 1 });
  const load = async () => {
    const json: any = await api('/products', {}, token);
    setProducts(json.data);
  };
  useEffect(() => { load(); }, []);
  const toggle = async (p: any) => {
    await api(`/products/${p.id}`, { method: 'PUT', body: JSON.stringify({ active: p.active ? 0 : 1 }) }, token);
    load();
  };
  const savePrice = async (p: any, price: number) => {
    await api(`/products/${p.id}`, { method: 'PUT', body: JSON.stringify({ price }) }, token);
    load();
  };
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api('/products', { method: 'POST', body: JSON.stringify(form) }, token);
    setForm({ name: '', weight: '', price: 0, desc: '', image: '', stock: 0, active: 1 });
    load();
  };
  const upload = async (id: string, file: File) => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch(API + '/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const json: any = await res.json();
    if (json.success) {
      await api(`/products/${id}`, { method: 'PUT', body: JSON.stringify({ image: json.data.url }) }, token);
      load();
    }
  };
  return (
    <div className="space-y-4">
      <form onSubmit={create} className="bg-white p-4 rounded shadow space-y-2">
        <h3 className="font-semibold">Nuevo producto</h3>
        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2 rounded" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Peso" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <input className="border p-2 rounded" type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <input className="border p-2 rounded" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
        </div>
        <input className="border p-2 rounded w-full" placeholder="Descripción" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
        <input className="border p-2 rounded w-full" placeholder="Imagen URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
        <button className="bg-stone-900 text-white px-3 py-1 rounded">Crear</button>
      </form>

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded shadow flex items-center gap-3">
            <div className="flex-1">
              <div className="font-semibold">{p.name} <span className="text-xs text-stone-500">{p.weight}</span></div>
              <div className="text-sm">Stock: {p.stock} · ${p.price}</div>
            </div>
            <input type="number" defaultValue={p.price} onBlur={(e) => savePrice(p, Number(e.target.value))} className="border p-1 w-20 rounded" />
            <button onClick={() => toggle(p)} className={`px-2 py-1 rounded text-white ${p.active ? 'bg-green-600' : 'bg-stone-400'}`}>
              {p.active ? 'Activo' : 'Pausado'}
            </button>
            <label className="text-xs cursor-pointer underline">
              Foto
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload(p.id, e.target.files[0])} />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function Store({ token }: { token: string }) {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const load = async () => {
    const json: any = await api('/store', {}, token);
    setData(json.data); setForm(json.data || {});
  };
  useEffect(() => { load(); }, []);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api('/store', { method: 'PUT', body: JSON.stringify(form) }, token);
    load();
  };
  if (!data) return <div>Cargando...</div>;
  return (
    <form onSubmit={save} className="bg-white p-4 rounded shadow space-y-2">
      <h3 className="font-semibold">Datos de la tienda</h3>
      {['name','whatsapp','clabe','bank','clabe_holder','btcpay_pos_url','sats_rate','logo_url','theme_color','domain'].map((f) => (
        <div key={f}>
          <label className="text-xs text-stone-500">{f}</label>
          <input className="border p-2 rounded w-full" value={form[f] ?? ''} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
        </div>
      ))}
      <button className="bg-stone-900 text-white px-3 py-1 rounded">Guardar</button>
    </form>
  );
}

function Orders({ token }: { token: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const load = async () => {
    const q = status ? `?status=${status}` : '';
    const json: any = await api('/orders' + q, {}, token);
    setOrders(json.data);
  };
  useEffect(() => { load(); }, [status]);
  const updateStatus = async (id: string, st: string) => {
    await api(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status: st }) }, token);
    load();
  };
  return (
    <div className="space-y-3">
      <select className="border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Todos</option>
        <option value="pending">Pendiente</option>
        <option value="paid">Pagado</option>
        <option value="delivered">Entregado</option>
      </select>
      {orders.map((o) => (
        <div key={o.id} className="bg-white p-3 rounded shadow">
          <div className="flex justify-between">
            <span className="font-semibold">{o.order_number}</span>
            <span className="text-sm">{o.status}</span>
          </div>
          <div className="text-sm">{o.customer_name} · {o.customer_phone}</div>
          <div className="text-sm">Total: ${o.total}</div>
          <div className="flex gap-2 mt-2">
            <button onClick={() => updateStatus(o.id, 'paid')} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Pagado</button>
            <button onClick={() => updateStatus(o.id, 'delivered')} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Entregado</button>
            <a href={`https://wa.me/${o.customer_phone}`} target="_blank" className="text-xs bg-green-500 text-white px-2 py-1 rounded">WhatsApp</a>
          </div>
        </div>
      ))}
    </div>
  );
}
