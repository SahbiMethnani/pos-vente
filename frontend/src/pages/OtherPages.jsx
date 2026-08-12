// ─────────────────────────────────────────────────────────────────────────────
// CategoriesPage
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

export function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', status: true })
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/categories').then(({ data }) => setCategories(data))
  useEffect(() => { load() }, [])

  const openEdit = (cat) => { setForm(cat); setModal(cat) }
  const openNew = () => { setForm({ name: '', description: '', status: true }); setModal('new') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal?.id) { await api.put(`/categories/${modal.id}`, form); toast.success('Catégorie modifiée') }
      else { await api.post('/categories', form); toast.success('Catégorie créée') }
      setModal(null); load()
    } catch (err) { toast.error('Erreur') } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return
    await api.delete(`/categories/${id}`); toast.success('Supprimée'); load()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16} />Nouvelle catégorie</button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="table-th">Nom</th><th className="table-th">Description</th><th className="table-th">Statut</th><th className="table-th">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{c.name}</td>
                <td className="table-td text-gray-500">{c.description || '—'}</td>
                <td className="table-td"><span className={c.status ? 'badge-green' : 'badge-red'}>{c.status ? 'Active' : 'Inactive'}</span></td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1 text-blue-500 hover:text-blue-700"><Edit2 size={15}/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">{modal?.id ? 'Modifier' : 'Nouvelle'} catégorie</h2><button onClick={() => setModal(null)}><X size={20} className="text-gray-400"/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Nom *</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
              <div><label className="label">Description</label><input className="input" value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.status} onChange={e => setForm(f => ({...f, status: e.target.checked}))} /><label className="text-sm">Active</label></div>
              <div className="flex gap-3"><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button><button type="submit" disabled={loading} className="btn-primary flex-1">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StockPage
// ─────────────────────────────────────────────────────────────────────────────

export function StockPage() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ product_id: '', quantity: 1, note: '' })
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('stock')

  const load = () => {
    api.get('/products', { params: { limit: 500 } }).then(({ data }) => setProducts(data))
    api.get('/stocks/movements').then(({ data }) => setMovements(data))
  }
  useEffect(() => { load() }, [])

  const handleMouvement = async (type) => {
    setLoading(true)
    try {
      await api.post(`/stocks/${type}`, form)
      toast.success('Mouvement enregistré')
      setModal(null); load()
    } catch (err) { toast.error('Erreur') } finally { setLoading(false) }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion du stock</h1>
        <div className="flex gap-2">
          <button onClick={() => { setForm({ product_id: '', quantity: 1, note: '' }); setModal('in') }} className="btn-success flex items-center gap-2"><Plus size={16}/>Entrée stock</button>
          <button onClick={() => { setForm({ product_id: '', quantity: 1, note: '' }); setModal('out') }} className="btn-danger flex items-center gap-2"><Minus size={16}/>Sortie stock</button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('stock')} className={tab === 'stock' ? 'btn-primary' : 'btn-secondary'}>Stock actuel</button>
        <button onClick={() => setTab('movements')} className={tab === 'movements' ? 'btn-primary' : 'btn-secondary'}>Historique mouvements</button>
      </div>

      {tab === 'stock' && (
        <div className="card">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="table-th">Produit</th><th className="table-th">Référence</th><th className="table-th">Stock</th><th className="table-th">Seuil alerte</th><th className="table-th">Statut</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.filter(p => p.status).map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{p.name}</td>
                  <td className="table-td font-mono text-xs">{p.reference}</td>
                  <td className="table-td"><span className={p.stock_quantity <= p.alert_threshold ? 'badge-red' : 'badge-green'}>{p.stock_quantity}</span></td>
                  <td className="table-td text-gray-500">{p.alert_threshold}</td>
                  <td className="table-td">
                    {p.stock_quantity === 0 ? <span className="badge-red">Rupture</span>
                      : p.stock_quantity <= p.alert_threshold ? <span className="badge-yellow">Faible</span>
                      : <span className="badge-green">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'movements' && (
        <div className="card">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr><th className="table-th">Produit</th><th className="table-th">Type</th><th className="table-th">Qté</th><th className="table-th">Avant</th><th className="table-th">Après</th><th className="table-th">Note</th><th className="table-th">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{m.product?.name}</td>
                  <td className="table-td capitalize"><span className={m.movement_type === 'approvisionnement' ? 'badge-green' : m.movement_type === 'vente' ? 'badge-blue' : 'badge-red'}>{m.movement_type}</span></td>
                  <td className="table-td">{m.quantity}</td>
                  <td className="table-td text-gray-500">{m.old_stock}</td>
                  <td className="table-td font-semibold">{m.new_stock}</td>
                  <td className="table-td text-gray-400 text-xs">{m.note || '—'}</td>
                  <td className="table-td text-gray-400 text-xs">{new Date(m.created_at).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold">{modal === 'in' ? 'Entrée de stock' : 'Sortie de stock'}</h2>
              <button onClick={() => setModal(null)}><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="space-y-4">
              <div><label className="label">Produit *</label>
                <select className="input" value={form.product_id} onChange={e => setForm(f => ({...f, product_id: e.target.value}))} required>
                  <option value="">-- Choisir --</option>
                  {products.filter(p => p.status).map(p => <option key={p.id} value={p.id}>{p.name} (stock : {p.stock_quantity})</option>)}
                </select>
              </div>
              <div><label className="label">Quantité *</label><input className="input" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: parseFloat(e.target.value)}))} required /></div>
              <div><label className="label">Note</label><input className="input" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} /></div>
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button>
                <button onClick={() => handleMouvement(modal)} disabled={!form.product_id || loading} className={`flex-1 ${modal === 'in' ? 'btn-success' : 'btn-danger'} disabled:opacity-50`}>Valider</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Minus({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
}

// ─────────────────────────────────────────────────────────────────────────────
// CustomersPage
// ─────────────────────────────────────────────────────────────────────────────

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '', address: '' })
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/customers', { params: { search } }).then(({ data }) => setCustomers(data))
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal?.id) { await api.put(`/customers/${modal.id}`, form); toast.success('Client modifié') }
      else { await api.post('/customers', form); toast.success('Client créé') }
      setModal(null); load()
    } catch { toast.error('Erreur') } finally { setLoading(false) }
  }

  const openEdit = (c) => { setForm(c); setModal(c) }
  const openNew = () => { setForm({ first_name: '', last_name: '', phone: '', email: '', address: '' }); setModal('new') }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={16}/>Nouveau client</button>
      </div>
      <div className="card">
        <input className="input mb-4 max-w-sm" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="table-th">Nom</th><th className="table-th">Téléphone</th><th className="table-th">Email</th><th className="table-th">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{c.first_name} {c.last_name}</td>
                <td className="table-td">{c.phone || '—'}</td>
                <td className="table-td">{c.email || '—'}</td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="p-1 text-blue-500 hover:text-blue-700"><Edit2 size={15}/></button>
                    <button onClick={async () => { if (!confirm('Supprimer ?')) return; await api.delete(`/customers/${c.id}`); toast.success('Supprimé'); load() }} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">{modal?.id ? 'Modifier' : 'Nouveau'} client</h2><button onClick={() => setModal(null)}><X size={20} className="text-gray-400"/></button></div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Prénom *</label><input className="input" value={form.first_name} onChange={e => setForm(f => ({...f, first_name: e.target.value}))} required /></div>
                <div><label className="label">Nom *</label><input className="input" value={form.last_name} onChange={e => setForm(f => ({...f, last_name: e.target.value}))} required /></div>
              </div>
              <div><label className="label">Téléphone</label><input className="input" value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email || ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
              <div><label className="label">Adresse</label><input className="input" value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button><button type="submit" disabled={loading} className="btn-primary flex-1">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SuppliersPage
// ─────────────────────────────────────────────────────────────────────────────

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', address: '', tax_number: '' })
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/suppliers', { params: { search } }).then(({ data }) => setSuppliers(data))
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal?.id) { await api.put(`/suppliers/${modal.id}`, form); toast.success('Fournisseur modifié') }
      else { await api.post('/suppliers', form); toast.success('Fournisseur créé') }
      setModal(null); load()
    } catch { toast.error('Erreur') } finally { setLoading(false) }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fournisseurs</h1>
        <button onClick={() => { setForm({ name: '', contact: '', phone: '', email: '', address: '', tax_number: '' }); setModal('new') }} className="btn-primary flex items-center gap-2"><Plus size={16}/>Nouveau fournisseur</button>
      </div>
      <div className="card">
        <input className="input mb-4 max-w-sm" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="table-th">Nom</th><th className="table-th">Contact</th><th className="table-th">Téléphone</th><th className="table-th">Email</th><th className="table-th">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="table-td font-medium">{s.name}</td>
                <td className="table-td">{s.contact || '—'}</td>
                <td className="table-td">{s.phone || '—'}</td>
                <td className="table-td">{s.email || '—'}</td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => { setForm(s); setModal(s) }} className="p-1 text-blue-500 hover:text-blue-700"><Edit2 size={15}/></button>
                    <button onClick={async () => { if (!confirm('Supprimer ?')) return; await api.delete(`/suppliers/${s.id}`); toast.success('Supprimé'); load() }} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={15}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4"><h2 className="text-lg font-bold">{modal?.id ? 'Modifier' : 'Nouveau'} fournisseur</h2><button onClick={() => setModal(null)}><X size={20} className="text-gray-400"/></button></div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="label">Nom / Raison sociale *</label><input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required /></div>
              <div><label className="label">Contact</label><input className="input" value={form.contact || ''} onChange={e => setForm(f => ({...f, contact: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Téléphone</label><input className="input" value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
                <div><label className="label">Email</label><input className="input" type="email" value={form.email || ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
              </div>
              <div><label className="label">Adresse</label><input className="input" value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))} /></div>
              <div><label className="label">N° fiscal</label><input className="input" value={form.tax_number || ''} onChange={e => setForm(f => ({...f, tax_number: e.target.value}))} /></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button><button type="submit" disabled={loading} className="btn-primary flex-1">Enregistrer</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
