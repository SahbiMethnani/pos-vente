import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addToCart, removeFromCart, updateCartItem, clearCart, setCustomer, setDiscount
} from '../store/store'
import api, { getAssetUrl } from '../services/api'
import toast from 'react-hot-toast'
import { Search, Plus, Minus, Trash2, User, CreditCard, X, Printer, CheckCircle } from 'lucide-react'

const PAYMENT_METHODS = [
  { value: 'especes', label: 'Espèces' },
  { value: 'carte', label: 'Carte bancaire' },
  { value: 'virement', label: 'Virement' },
  { value: 'mobile_money', label: 'Mobile Money' },
]

function ReceiptModal({ sale, settings, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
        <div className="text-center mb-4">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
          <h3 className="font-bold text-xl">Vente validée !</h3>
          <p className="text-gray-500 text-sm">Ticket #{sale.ticket_number}</p>
        </div>
        <div className="border border-dashed rounded-lg p-4 bg-gray-50 font-mono text-xs space-y-1 mb-4">
          <div className="text-center font-bold text-sm">{settings?.store_name || 'Ma Boutique'}</div>
          <div className="text-center text-gray-500 text-xs">{settings?.address}</div>
          <div className="border-t border-dashed my-2" />
          {sale.items?.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="truncate max-w-[150px]">{item.product?.name}</span>
              <span>{item.quantity} x {item.unit_price.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-dashed my-2" />
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{sale.total_amount.toFixed(2)} {settings?.currency_symbol || 'DT'}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Payé</span>
            <span>{sale.paid_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Monnaie</span>
            <span>{sale.change_amount.toFixed(2)}</span>
          </div>
          <div className="border-t border-dashed my-2" />
          <div className="text-center text-gray-500">{settings?.receipt_footer}</div>
        </div>
        <div className="flex gap-3">
          <button onClick={window.print} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Printer size={16} /> Imprimer
          </button>
          <button onClick={onClose} className="btn-primary flex-1">Fermer</button>
        </div>
      </div>
    </div>
  )
}

function PaymentModal({ total, onClose, onConfirm }) {
  const [method, setMethod] = useState('especes')
  const [paid, setPaid] = useState(total)
  const change = Math.max(paid - total, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Paiement</h2>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-gray-500">Montant à payer</p>
          <p className="text-4xl font-bold text-blue-600">{total.toFixed(2)} DT</p>
        </div>
        <div className="mb-4">
          <label className="label">Mode de paiement</label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMethod(m.value)}
                className={`py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                  method === m.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {method === 'especes' && (
          <div className="mb-4">
            <label className="label">Montant reçu (DT)</label>
            <input
              type="number"
              className="input text-xl font-bold text-center"
              value={paid}
              min={total}
              step="0.5"
              onChange={(e) => setPaid(parseFloat(e.target.value) || 0)}
            />
            <div className="mt-3 p-3 bg-green-50 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">Monnaie à rendre</span>
              <span className="text-xl font-bold text-green-600">{change.toFixed(2)} DT</span>
            </div>
          </div>
        )}
        <button
          onClick={() => onConfirm({ method, paid: method === 'especes' ? paid : total, change })}
          disabled={method === 'especes' && paid < total}
          className="btn-success w-full py-4 text-lg disabled:opacity-50"
        >
          Valider la vente
        </button>
      </div>
    </div>
  )
}

export default function CaissePage() {
  const dispatch = useDispatch()
  const { items, customer, discount } = useSelector((s) => s.cart)
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [settings, setSettings] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [completedSale, setCompletedSale] = useState(null)
  const searchRef = useRef(null)

  const subtotal = items.reduce((s, i) => s + i.line_total, 0)
  const total = Math.max(0, subtotal - discount)

  useEffect(() => {
    api.get('/settings').then(({ data }) => setSettings(data))
    api.get('/customers').then(({ data }) => setCustomers(data))
    searchRef.current?.focus()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/products', { params: { search, limit: 30 } }).then(({ data }) => setProducts(data))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleConfirmPayment = async ({ method, paid }) => {
    setLoading(true)
    try {
      const payload = {
        customer_id: customer?.id || null,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount,
        })),
        discount_amount: discount,
        payment_method: method,
        paid_amount: paid,
      }
      const { data } = await api.post('/sales', payload)
      const fullSale = await api.get(`/sales/${data.id}`)
      dispatch(clearCart())
      setShowPayment(false)
      setCompletedSale(fullSale.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la vente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Products panel */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="mb-4 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchRef}
            className="input pl-10"
            placeholder="Rechercher par nom, référence ou code-barres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.filter((p) => p.status).map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  if (product.stock_quantity <= 0) {
                    toast.error('Stock épuisé')
                    return
                  }
                  dispatch(addToCart(product))
                  toast.success(`${product.name} ajouté`, { duration: 1000 })
                }}
                className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-blue-400 hover:shadow-md transition-all group"
              >
                {product.image ? (
                <img
                  src={getAssetUrl(product.image)}
                  alt={product.name}
                  className="aspect-square w-full rounded-lg mb-2 object-cover"
                />
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-3xl">
                  📦
                </div>
              )}
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-400 mb-1">{product.reference}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold text-sm">{product.selling_price.toFixed(2)} DT</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${product.stock_quantity <= product.alert_threshold ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {product.stock_quantity}
                  </span>
                </div>
              </button>
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-16">Aucun produit trouvé</div>
            )}
          </div>
        </div>
      </div>

      {/* Cart panel */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-bold text-gray-800">Panier</h2>
          <div className="flex items-center gap-2 mt-2">
            <User size={14} className="text-gray-400" />
            <select
              className="text-sm text-gray-600 flex-1 border-0 outline-none bg-transparent"
              value={customer?.id || ''}
              onChange={(e) => {
                const c = customers.find((c) => c.id === parseInt(e.target.value))
                dispatch(setCustomer(c || null))
              }}
            >
              <option value="">Client anonyme</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {items.length === 0 && (
            <div className="text-center text-gray-400 py-16">
              <ShoppingIcon />
              <p className="mt-2 text-sm">Panier vide</p>
            </div>
          )}
          {items.map((item) => (
            <div key={item.product_id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2 gap-3">
                {item.product?.image && (
                  <img
                    src={getAssetUrl(item.product.image)}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.unit_price.toFixed(2)} DT / u</p>
                </div>
                <button onClick={() => dispatch(removeFromCart(item.product_id))}>
                  <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch(updateCartItem({ product_id: item.product_id, quantity: Math.max(1, item.quantity - 1) }))}
                    className="w-7 h-7 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateCartItem({ product_id: item.product_id, quantity: item.quantity + 1 }))}
                    className="w-7 h-7 bg-blue-100 text-blue-600 rounded flex items-center justify-center hover:bg-blue-200"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <span className="font-bold text-sm text-gray-800">{item.line_total.toFixed(2)} DT</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Sous-total</span>
            <span>{subtotal.toFixed(2)} DT</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Remise (DT)</span>
            <input
              type="number"
              min="0"
              max={subtotal}
              value={discount}
              onChange={(e) => dispatch(setDiscount(parseFloat(e.target.value) || 0))}
              className="w-24 border rounded px-2 py-1 text-right text-sm"
            />
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>TOTAL</span>
            <span className="text-blue-600">{total.toFixed(2)} DT</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => dispatch(clearCart())}
              disabled={items.length === 0}
              className="btn-secondary py-3 disabled:opacity-40"
            >
              Annuler
            </button>
            <button
              onClick={() => setShowPayment(true)}
              disabled={items.length === 0 || loading}
              className="btn-success py-3 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <CreditCard size={18} />
              Payer
            </button>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          total={total}
          onClose={() => setShowPayment(false)}
          onConfirm={handleConfirmPayment}
        />
      )}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          settings={settings}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  )
}

function ShoppingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto opacity-30">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}
