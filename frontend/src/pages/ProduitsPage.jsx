import { useState, useEffect } from 'react'
import api, { getAssetUrl } from '../services/api'
import toast from 'react-hot-toast'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'

function ProductModal({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(product || {
    reference: '', barcode: '', name: '', description: '',
    category_id: '', purchase_price: 0, selling_price: 0,
    stock_quantity: 0, alert_threshold: 5, tax_rate: 19, status: true,
    image: null
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image ? getAssetUrl(product.image) : null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (imageFile) {
        const data = new FormData()
        data.append('reference', form.reference)
        data.append('barcode', form.barcode || '')
        data.append('name', form.name)
        data.append('description', form.description || '')
        data.append('category_id', form.category_id || '')
        data.append('purchase_price', String(form.purchase_price))
        data.append('selling_price', String(form.selling_price))
        data.append('stock_quantity', String(form.stock_quantity))
        data.append('alert_threshold', String(form.alert_threshold))
        data.append('tax_rate', String(form.tax_rate))
        data.append('status', String(form.status))
        data.append('image', imageFile)

        if (product?.id) {
          await api.put(`/products/upload/${product.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          toast.success('Produit modifié')
        } else {
          await api.post('/products/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          toast.success('Produit créé')
        }
      } else {
        const payload = { ...form, category_id: form.category_id || null }
        if (product?.id) {
          await api.put(`/products/${product.id}`, payload)
          toast.success('Produit modifié')
        } else {
          await api.post('/products', payload)
          toast.success('Produit créé')
        }
      }
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-bold">{product?.id ? 'Modifier produit' : 'Nouveau produit'}</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Référence *</label>
              <input className="input" value={form.reference} onChange={e => f('reference', e.target.value)} required />
            </div>
            <div>
              <label className="label">Code-barres</label>
              <input className="input" value={form.barcode || ''} onChange={e => f('barcode', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Nom *</label>
            <input className="input" value={form.name} onChange={e => f('name', e.target.value)} required />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select className="input" value={form.category_id || ''} onChange={e => f('category_id', e.target.value)}>
              <option value="">-- Aucune --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Prix d'achat (DT)</label>
              <input className="input" type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => f('purchase_price', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="label">Prix de vente (DT) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.selling_price} onChange={e => f('selling_price', parseFloat(e.target.value))} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Stock initial</label>
              <input className="input" type="number" min="0" value={form.stock_quantity} onChange={e => f('stock_quantity', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="label">Seuil alerte</label>
              <input className="input" type="number" min="0" value={form.alert_threshold} onChange={e => f('alert_threshold', parseFloat(e.target.value))} />
            </div>
            <div>
              <label className="label">TVA (%)</label>
              <input className="input" type="number" min="0" value={form.tax_rate} onChange={e => f('tax_rate', parseFloat(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description || ''} onChange={e => f('description', e.target.value)} />
          </div>
          <div>
            <label className="label">Image du produit</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0] || null
                setImageFile(file)
                setImagePreview(file ? URL.createObjectURL(file) : form.image || null)
              }}
              className="input"
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-lg" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="status" checked={form.status} onChange={e => f('status', e.target.checked)} />
            <label htmlFor="status" className="text-sm text-gray-700">Produit actif</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProduitsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | product

  const load = () => {
    api.get('/products', { params: { search, limit: 200 } }).then(({ data }) => setProducts(data))
  }

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id) => {
    if (!confirm('Désactiver ce produit ?')) return
    await api.delete(`/products/${id}`)
    toast.success('Produit désactivé')
    load()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau produit
        </button>
      </div>
      <div className="card">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Image</th>
                <th className="table-th">Référence</th>
                <th className="table-th">Nom</th>
                <th className="table-th">Catégorie</th>
                <th className="table-th">Prix achat</th>
                <th className="table-th">Prix vente</th>
                <th className="table-th">Stock</th>
                <th className="table-th">Statut</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    {p.image ? (
                      <img src={getAssetUrl(p.image)} alt={p.name} className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">Aucune</div>
                    )}
                  </td>
                  <td className="table-td font-mono text-xs">{p.reference}</td>
                  <td className="table-td font-medium">{p.name}</td>
                  <td className="table-td text-gray-500">{p.category?.name || '—'}</td>
                  <td className="table-td">{p.purchase_price.toFixed(2)} DT</td>
                  <td className="table-td font-semibold text-blue-600">{p.selling_price.toFixed(2)} DT</td>
                  <td className="table-td">
                    <span className={p.stock_quantity <= p.alert_threshold ? 'badge-red' : 'badge-green'}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={p.status ? 'badge-green' : 'badge-red'}>{p.status ? 'Actif' : 'Inactif'}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <button onClick={() => setModal(p)} className="p-1 text-blue-500 hover:text-blue-700">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={9} className="table-td text-center text-gray-400 py-10">Aucun produit</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
