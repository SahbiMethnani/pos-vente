import React, { useState, useEffect } from 'react'
import { ShoppingCart, Search, Filter, Heart, Share2 } from 'lucide-react'
import api, { getAssetUrl } from '../services/api'
import toast from 'react-hot-toast'

export default function WebsitePage() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({})
  const [wishlist, setWishlist] = useState([])

  const saveCart = (nextCart) => {
    setCart(nextCart)
    localStorage.setItem('website_cart', JSON.stringify(nextCart))
  }

  const loadProducts = () => {
    const params = { limit: 200 }
    if (search) params.search = search
    if (category) params.category_id = category

    api.get('/public/products', { params })
      .then(({ data }) => setProducts(data))
      .catch(() => toast.error('Erreur chargement produits'))
  }

  const loadSettings = () => {
    api.get('/public/settings')
      .then(({ data }) => setSettings(data))
      .catch(() => {})
  }

  const loadCategories = () => {
    api.get('/public/categories')
      .then(({ data }) => setCategories(data))
      .catch(() => {})
  }

  useEffect(() => {
    loadProducts()
    loadSettings()
    loadCategories()
    const saved = localStorage.getItem('website_cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  useEffect(() => {
    loadProducts()
  }, [search, category])

  const addToCart = (product) => {
    const availableStock = Number(product?.stock_quantity ?? 0)
    if (availableStock < 1) {
      toast.error('Ce produit est en rupture de stock')
      return
    }

    const existingItem = cart.find(i => i.product_id === product.id)
    const nextQuantity = existingItem ? existingItem.quantity + 1 : 1

    if (nextQuantity > availableStock) {
      toast.error(`Stock restant : ${availableStock}`)
      return
    }

    let nextCart
    if (existingItem) {
      nextCart = cart.map(i =>
        i.product_id === product.id
          ? { ...i, quantity: nextQuantity }
          : i
      )
    } else {
      nextCart = [...cart, {
        product_id: product.id,
        product,
        quantity: 1,
        unit_price: product.selling_price,
        discount: 0
      }]
    }

    saveCart(nextCart)
    toast.success('Produit ajouté au panier')
  }

  const removeFromCart = (productId) => {
    const nextCart = cart.filter(i => i.product_id !== productId)
    saveCart(nextCart)
    toast.success('Produit retiré du panier')
  }

  const updateQuantity = (productId, quantity) => {
    const item = cart.find(i => i.product_id === productId)
    const availableStock = Number(item?.product?.stock_quantity ?? 0)

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    if (quantity > availableStock) {
      toast.error(`Stock restant : ${availableStock}`)
      return
    }

    const nextCart = cart.map(i =>
      i.product_id === productId
        ? { ...i, quantity }
        : i
    )
    saveCart(nextCart)
  }

  const toggleWishlist = (productId) => {
    setWishlist(wishlist.includes(productId)
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId]
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  const tax = subtotal * 0.19
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{settings.store_name || 'Ma Boutique'}</h1>
              <p className="text-blue-100">{settings.address || ''}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                📞 {settings.phone || ''}
              </div>
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative px-4 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!showCart ? (
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600"
                  />
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                  <Filter size={20} /> Filtrer
                </button>
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setCategory('')}
                  className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${
                    category === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Tous
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${
                      category === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                  {product.image ? (
                    <img src={getAssetUrl(product.image)} alt={product.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">Pas d'image</span>
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg flex-1">{product.name}</h3>
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`p-1 ${wishlist.includes(product.id) ? 'text-red-600' : 'text-gray-400'}`}
                      >
                        <Heart size={20} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">{product.description?.substring(0, 50)}...</p>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {product.selling_price} {settings.currency_symbol}
                      </span>
                      {product.purchase_price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          {product.purchase_price}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock_quantity <= 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        {product.stock_quantity > 0 ? 'Ajouter' : 'Rupture'}
                      </button>
                      <button className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:border-blue-600">
                        <Share2 size={18} />
                      </button>
                    </div>

                    {product.stock_quantity <= product.alert_threshold && product.stock_quantity > 0 && (
                      <p className="text-sm text-orange-600 mt-2">Stock limité</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <ShoppingCartPage cart={cart} onRemove={removeFromCart} onQuantityChange={updateQuantity} subtotal={subtotal} tax={tax} total={total} />
        )}
      </div>
    </div>
  )
}

function ShoppingCartPage({ cart, onRemove, onQuantityChange, subtotal, tax, total }) {
  const [checkout, setCheckout] = useState(null)
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    delivery_notes: '',
    payment_method: 'card',
    shipping_cost: 5.0,
    discount_amount: 0
  })
  const [loading, setLoading] = useState(false)

  const handleCheckout = async (e) => {
    e.preventDefault()
    if (!form.customer_name || !form.customer_email || !form.customer_phone || !form.customer_address) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const stockIssue = cart.find(item => Number(item.product?.stock_quantity ?? 0) < item.quantity)
    if (stockIssue) {
      toast.error(`Stock insuffisant pour ${stockIssue.product?.name || 'un produit'}`)
      return
    }

    try {
      setLoading(true)
      const orderData = {
        ...form,
        items: cart.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount
        }))
      }

      const { data } = await api.post('/orders', orderData)
      toast.success('Commande créée avec succès!')
      setCheckout(data)
      localStorage.removeItem('website_cart')
    } catch (err) {
      toast.error('Erreur: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (checkout) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-green-600">✓ Commande confirmée!</h2>
        <div className="space-y-4 mb-6">
          <p><strong>Numéro de commande:</strong> {checkout.order_number}</p>
          <p><strong>Montant total:</strong> {checkout.total_amount} DT</p>
          <p><strong>État:</strong> {checkout.status}</p>
          <p className="text-gray-600">Un email de confirmation a été envoyé à {checkout.customer_email}</p>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          Retour à la boutique
        </button>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Votre panier ({cart.length} articles)</h2>

        {cart.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Votre panier est vide</p>
        ) : (
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.product_id} className="bg-white p-4 rounded-lg border-l-4 border-blue-600 flex gap-4">
                <img src={getAssetUrl(item.product?.image)} alt={item.product?.name} className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="font-bold">{item.product?.name}</h3>
                  <p className="text-gray-600">{item.unit_price} DT x <input
                    type="number"
                    min="1"
                    max={item.product?.stock_quantity ?? 1}
                    value={item.quantity}
                    onChange={e => onQuantityChange(item.product_id, parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-center"
                  /> = {item.unit_price * item.quantity} DT</p>
                  <p className="text-sm text-gray-500 mt-1">Stock disponible : {item.product?.stock_quantity ?? 0}</p>
                </div>
                <button
                  onClick={() => onRemove(item.product_id)}
                  className="text-red-600 font-bold hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-6 rounded-lg h-fit sticky top-4">
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Nom complet *</label>
            <input
              type="text"
              required
              value={form.customer_name}
              onChange={e => setForm({ ...form, customer_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.customer_email}
              onChange={e => setForm({ ...form, customer_email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Téléphone *</label>
            <input
              type="tel"
              required
              value={form.customer_phone}
              onChange={e => setForm({ ...form, customer_phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Adresse *</label>
            <input
              type="text"
              required
              value={form.customer_address}
              onChange={e => setForm({ ...form, customer_address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Notes de livraison</label>
            <textarea
              value={form.delivery_notes}
              onChange={e => setForm({ ...form, delivery_notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg h-16"
            />
          </div>

          <div className="border-t-2 pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span className="font-bold">{subtotal.toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison:</span>
              <span className="font-bold">{form.shipping_cost.toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between">
              <span>Taxe (19%):</span>
              <span className="font-bold">{tax.toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-blue-600">{(subtotal + tax + form.shipping_cost).toFixed(2)} DT</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Valider la commande'}
          </button>
        </form>
      </div>
    </div>
  )
}
