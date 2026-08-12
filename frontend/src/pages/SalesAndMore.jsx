import { useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Eye, X, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

// ─── Sales History ────────────────────────────────────────────────────────────

export function VentesPage() {
  const [sales, setSales] = useState([])
  const [detail, setDetail] = useState(null)
  const [filters, setFilters] = useState({ date_from: '', date_to: '' })
  const [loading, setLoading] = useState(false)

  const load = () => {
    const params = {}
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    api.get('/sales', { params }).then(({ data }) => setSales(data))
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Annuler cette vente ?')) return
    setLoading(true)
    try {
      await api.post(`/sales/${id}/cancel`)
      toast.success('Vente annulée')
      load()
      setDetail(null)
    } catch (err) { toast.error(err.response?.data?.detail || 'Erreur') }
    finally { setLoading(false) }
  }

  const statusBadge = (status) => {
    if (status === 'completed') return <span className="badge-green">Validée</span>
    if (status === 'cancelled') return <span className="badge-red">Annulée</span>
    return <span className="badge-yellow">{status}</span>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historique des ventes</h1>
      </div>
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div><label className="label">Du</label><input type="date" className="input" value={filters.date_from} onChange={e => setFilters(f => ({...f, date_from: e.target.value}))} /></div>
          <div><label className="label">Au</label><input type="date" className="input" value={filters.date_to} onChange={e => setFilters(f => ({...f, date_to: e.target.value}))} /></div>
          <button onClick={load} className="btn-primary">Filtrer</button>
          <button onClick={() => { setFilters({ date_from: '', date_to: '' }); setTimeout(load, 50) }} className="btn-secondary">Réinitialiser</button>
        </div>
      </div>
      <div className="card">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr><th className="table-th">Ticket</th><th className="table-th">Date</th><th className="table-th">Caissier</th><th className="table-th">Client</th><th className="table-th">Total</th><th className="table-th">Paiement</th><th className="table-th">Statut</th><th className="table-th">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sales.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="table-td font-mono text-xs">{s.ticket_number}</td>
                <td className="table-td text-xs">{new Date(s.created_at).toLocaleString('fr-FR')}</td>
                <td className="table-td">{s.user?.full_name || s.user?.username}</td>
                <td className="table-td">{s.customer ? `${s.customer.first_name} ${s.customer.last_name}` : 'Anonyme'}</td>
                <td className="table-td font-bold text-blue-600">{s.total_amount.toFixed(2)} DT</td>
                <td className="table-td capitalize"><span className="badge-blue">{s.payment_method}</span></td>
                <td className="table-td">{statusBadge(s.status)}</td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => setDetail(s)} className="p-1 text-blue-500 hover:text-blue-700"><Eye size={15}/></button>
                    {s.status === 'completed' && <button onClick={() => handleCancel(s.id)} disabled={loading} className="p-1 text-red-400 hover:text-red-600"><XCircle size={15}/></button>}
                  </div>
                </td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={8} className="table-td text-center text-gray-400 py-10">Aucune vente</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <div><h2 className="text-lg font-bold">Ticket #{detail.ticket_number}</h2><p className="text-sm text-gray-500">{new Date(detail.created_at).toLocaleString('fr-FR')}</p></div>
              <button onClick={() => setDetail(null)}><X size={20} className="text-gray-400"/></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div><span className="text-gray-500">Caissier :</span> <strong>{detail.user?.full_name || detail.user?.username}</strong></div>
                <div><span className="text-gray-500">Client :</span> <strong>{detail.customer ? `${detail.customer.first_name} ${detail.customer.last_name}` : 'Anonyme'}</strong></div>
                <div><span className="text-gray-500">Mode paiement :</span> <strong className="capitalize">{detail.payment_method}</strong></div>
                <div><span className="text-gray-500">Statut :</span> {statusBadge(detail.status)}</div>
              </div>
              <table className="w-full text-sm mb-4">
                <thead className="bg-gray-50"><tr><th className="table-th">Produit</th><th className="table-th">Qté</th><th className="table-th">P.U.</th><th className="table-th">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {detail.items?.map(item => (
                    <tr key={item.id}><td className="table-td">{item.product?.name}</td><td className="table-td">{item.quantity}</td><td className="table-td">{item.unit_price.toFixed(2)} DT</td><td className="table-td font-semibold">{item.line_total.toFixed(2)} DT</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{detail.subtotal.toFixed(2)} DT</span></div>
                <div className="flex justify-between"><span className="text-gray-500">TVA</span><span>{detail.tax_amount.toFixed(2)} DT</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Remise</span><span>-{detail.discount_amount.toFixed(2)} DT</span></div>
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>TOTAL</span><span className="text-blue-600">{detail.total_amount.toFixed(2)} DT</span></div>
                <div className="flex justify-between text-gray-500"><span>Payé</span><span>{detail.paid_amount.toFixed(2)} DT</span></div>
                <div className="flex justify-between text-green-600 font-semibold"><span>Monnaie</span><span>{detail.change_amount.toFixed(2)} DT</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ─── Reports Page ─────────────────────────────────────────────────────────────

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function RapportsPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => setStats(data))
  }, [])

  if (!stats) return <div className="p-6 text-gray-400">Chargement...</div>

  const paymentData = [
    { name: 'Espèces', value: 60 },
    { name: 'Carte', value: 30 },
    { name: 'Mobile', value: 10 },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rapports & Statistiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">CA Aujourd'hui</p>
          <p className="text-3xl font-bold text-blue-600">{stats.today_revenue.toFixed(2)} DT</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">CA ce mois</p>
          <p className="text-3xl font-bold text-green-600">{stats.monthly_revenue.toFixed(2)} DT</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Ventes du jour</p>
          <p className="text-3xl font-bold text-purple-600">{stats.today_sales_count}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">CA 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.daily_sales_chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="date" tick={{ fontSize: 11 }}/>
              <YAxis tick={{ fontSize: 11 }}/>
              <Tooltip formatter={(v) => [`${v.toFixed(2)} DT`, 'CA']}/>
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Top 5 produits</h2>
          {stats.top_products.length === 0 ? (
            <p className="text-gray-400 text-sm py-10 text-center">Aucune donnée</p>
          ) : (
            <ul className="space-y-3">
              {stats.top_products.map((p, i) => (
                <li key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-gray-500">{p.qty} ventes</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (p.qty / (stats.top_products[0]?.qty || 1)) * 100)}%` }}/>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Alertes stock</h2>
        <div className="flex items-center gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex-1 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.low_stock_count}</p>
            <p className="text-sm text-gray-500 mt-1">Produits en stock faible ou rupture</p>
          </div>
        </div>
      </div>
    </div>
  )
}


// ─── Settings Page ─────────────────────────────────────────────────────────────

export function ParametresPage() {
  const [form, setForm] = useState({
    store_name: '',
    address: '',
    phone: '',
    email: '',
    currency: 'TND',
    currency_symbol: 'DT',
    default_tax: 19.0,
    receipt_footer: ''
  })
  const [socialForm, setSocialForm] = useState({
    facebook_page_id: '',
    facebook_access_token: '',
    instagram_business_id: '',
    instagram_access_token: '',
    tiktok_access_token: '',
    tiktok_video_id: '',
    website_banner: ''
  })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('general')

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        setForm(data)
        setSocialForm({
          facebook_page_id: data.facebook_page_id || '',
          facebook_access_token: data.facebook_access_token || '',
          instagram_business_id: data.instagram_business_id || '',
          instagram_access_token: data.instagram_access_token || '',
          tiktok_access_token: data.tiktok_access_token || '',
          tiktok_video_id: data.tiktok_video_id || '',
          website_banner: data.website_banner || ''
        })
        setLoading(false)
      })
      .catch(err => {
        toast.error('Erreur chargement paramètres: ' + (err.response?.data?.detail || err.message))
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/settings', form)
      toast.success('Paramètres enregistrés')
    } catch (err) {
      toast.error('Erreur: ' + (err.response?.data?.detail || err.message))
    }
    finally { setLoading(false) }
  }

  const handleSocialSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/settings/social', socialForm)
      toast.success('Paramètres réseaux sociaux enregistrés')
    } catch (err) {
      toast.error('Erreur: ' + (err.response?.data?.detail || err.message))
    }
    finally { setLoading(false) }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const sf = (k, v) => setSocialForm(p => ({ ...p, [k]: v }))

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setTab('general')}
          className={`px-4 py-2 font-bold ${tab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
        >
          Général
        </button>
        <button
          onClick={() => setTab('social')}
          className={`px-4 py-2 font-bold ${tab === 'social' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-700'}`}
        >
          Réseaux Sociaux
        </button>
      </div>

      {/* Onglet Général */}
      {tab === 'general' && (
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-gray-700 border-b pb-2">Informations du commerce</h2>
            <div><label className="label">Nom du commerce</label><input className="input" value={form.store_name || ''} onChange={e => f('store_name', e.target.value)} /></div>
            <div><label className="label">Adresse</label><textarea className="input" rows={2} value={form.address || ''} onChange={e => f('address', e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Téléphone</label><input className="input" value={form.phone || ''} onChange={e => f('phone', e.target.value)} /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email || ''} onChange={e => f('email', e.target.value)} /></div>
            </div>
            <h2 className="font-semibold text-gray-700 border-b pb-2 pt-2">Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Devise</label><input className="input" value={form.currency || ''} onChange={e => f('currency', e.target.value)} /></div>
              <div><label className="label">Symbole</label><input className="input" value={form.currency_symbol || ''} onChange={e => f('currency_symbol', e.target.value)} /></div>
            </div>
            <div><label className="label">TVA par défaut (%)</label><input className="input" type="number" min="0" value={form.default_tax || 0} onChange={e => f('default_tax', parseFloat(e.target.value))} /></div>
            <div><label className="label">Message de remerciement (ticket)</label><input className="input" value={form.receipt_footer || ''} onChange={e => f('receipt_footer', e.target.value)} /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </form>
        </div>
      )}

      {/* Onglet Réseaux Sociaux */}
      {tab === 'social' && (
        <div className="card">
          <form onSubmit={handleSocialSubmit} className="space-y-6">
            
            {/* Facebook */}
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">f</span> Facebook
              </h3>
              <div><label className="label">Page ID</label><input className="input" placeholder="123456789" value={socialForm.facebook_page_id || ''} onChange={e => sf('facebook_page_id', e.target.value)} /></div>
              <div><label className="label">Access Token</label><input className="input" placeholder="EAA..." type="password" value={socialForm.facebook_access_token || ''} onChange={e => sf('facebook_access_token', e.target.value)} /></div>
              <p className="text-xs text-gray-500 mt-2">👉 <a href="https://developers.facebook.com/" target="_blank" className="text-blue-600 underline">Obtenir les credentials sur Facebook Developers</a></p>
            </div>

            {/* Instagram */}
            <div className="border-l-4 border-pink-600 pl-4">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">📷</span> Instagram
              </h3>
              <div><label className="label">Business Account ID</label><input className="input" placeholder="123456789" value={socialForm.instagram_business_id || ''} onChange={e => sf('instagram_business_id', e.target.value)} /></div>
              <div><label className="label">Access Token</label><input className="input" placeholder="IGQV..." type="password" value={socialForm.instagram_access_token || ''} onChange={e => sf('instagram_access_token', e.target.value)} /></div>
              <p className="text-xs text-gray-500 mt-2">👉 <a href="https://business.instagram.com/" target="_blank" className="text-blue-600 underline">Configurer via Instagram Business</a></p>
            </div>

            {/* TikTok */}
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">🎵</span> TikTok
              </h3>
              <div><label className="label">Access Token</label><input className="input" placeholder="v1.xxx..." type="password" value={socialForm.tiktok_access_token || ''} onChange={e => sf('tiktok_access_token', e.target.value)} /></div>
              <div><label className="label">Video ID (pour les vidéos)</label><input className="input" placeholder="123456789" value={socialForm.tiktok_video_id || ''} onChange={e => sf('tiktok_video_id', e.target.value)} /></div>
              <p className="text-xs text-gray-500 mt-2">👉 <a href="https://developer.tiktok.com/" target="_blank" className="text-blue-600 underline">Créer une app sur TikTok Developers</a></p>
            </div>

            {/* Website Banner */}
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                <span className="text-2xl">🌐</span> Site Web
              </h3>
              <div><label className="label">URL Bannière (image)</label><input className="input" placeholder="https://..." value={socialForm.website_banner || ''} onChange={e => sf('website_banner', e.target.value)} /></div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50 bg-green-600 hover:bg-green-700">
              {loading ? 'Enregistrement...' : 'Sauvegarder les paramètres réseaux sociaux'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
