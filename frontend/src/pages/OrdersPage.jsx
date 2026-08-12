import React, { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, Package, CheckCircle2, Truck } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'refunded', label: 'Remboursée' },
]

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-rose-100 text-rose-700',
  refunded: 'bg-slate-100 text-slate-700',
}

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

function escapeCsv(value) {
  if (value === null || value === undefined) return ''
  const stringValue = String(value).replace(/"/g, '""')
  return `"${stringValue}"`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  const loadOrders = async (override = {}) => {
    const currentStatus = override.statusFilter ?? statusFilter
    const currentDateFrom = override.dateFrom ?? dateFrom
    const currentDateTo = override.dateTo ?? dateTo

    setLoading(true)
    try {
      const { data } = await api.get('/orders', {
        params: {
          limit: 100,
          ...(currentStatus ? { status: currentStatus } : {}),
          ...(currentDateFrom ? { start_date: currentDateFrom } : {}),
          ...(currentDateTo ? { end_date: currentDateTo } : {}),
        },
      })
      setOrders(data)
    } catch (err) {
      toast.error('Erreur lors du chargement des commandes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const summary = useMemo(() => {
    const totalAmount = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
    return {
      count: orders.length,
      totalAmount,
    }
  }, [orders])

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, null, {
        params: { status: newStatus },
      })
      toast.success('Statut mis à jour')
      await loadOrders()
    } catch (err) {
      toast.error('Impossible de changer le statut')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const applyFilters = () => {
    loadOrders({ statusFilter, dateFrom, dateTo })
  }

  const resetFilters = () => {
    setStatusFilter('')
    setDateFrom('')
    setDateTo('')
    loadOrders({ statusFilter: '', dateFrom: '', dateTo: '' })
  }

  const exportOrders = () => {
    const rows = orders.map((order) => {
      const items = order.items
        .map((item) => `${item.product?.name || `Produit #${item.product_id}`} x${item.quantity}`)
        .join(' | ')

      return [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        order.customer_address,
        STATUS_LABELS[order.status] || order.status,
        order.payment_method,
        order.subtotal,
        order.shipping_cost,
        order.tax_amount,
        order.discount_amount,
        order.total_amount,
        order.delivery_notes || order.notes || '',
        new Date(order.created_at).toLocaleString('fr-FR'),
        items,
      ]
    })

    const csvHeader = [
      'Numéro de commande',
      'Nom client',
      'Email',
      'Téléphone',
      'Adresse',
      'Statut',
      'Mode de paiement',
      'Sous-total',
      'Livraison',
      'Taxe',
      'Remise',
      'Total',
      'Notes',
      'Date',
      'Produits',
    ]

    const csvContent = [csvHeader, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    toast.success('Export CSV prêt')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes en ligne</h1>
          <p className="text-sm text-gray-600">
            Les commandes passées via le site web apparaissent ici avec les coordonnées du client.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={applyFilters}
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Filtrer
          </button>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Réinitialiser
          </button>
          <button
            onClick={() => loadOrders()}
            className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <RefreshCw size={16} /> Actualiser
          </button>
          <button
            onClick={exportOrders}
            disabled={orders.length === 0}
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={16} /> Exporter CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600">
            <Package size={18} />
            <span className="font-semibold">Commandes</span>
          </div>
          <div className="text-2xl font-bold mt-2">{summary.count}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />
            <span className="font-semibold">CA total</span>
          </div>
          <div className="text-2xl font-bold mt-2">{summary.totalAmount.toFixed(2)} DT</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600">
            <Truck size={18} />
            <span className="font-semibold">Livraisons</span>
          </div>
          <div className="text-2xl font-bold mt-2">{orders.filter((order) => ['shipped', 'delivered'].includes(order.status)).length}</div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">Chargement...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          Aucune commande pour le moment.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">#{order.order_number}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Passée le {new Date(order.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{Number(order.total_amount || 0).toFixed(2)} DT</div>
                  <div className="text-sm text-gray-500">Mode paiement : {order.payment_method}</div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Coordonnées client</h3>
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p><span className="font-medium">Nom :</span> {order.customer_name}</p>
                    <p><span className="font-medium">Email :</span> {order.customer_email}</p>
                    <p><span className="font-medium">Téléphone :</span> {order.customer_phone}</p>
                    <p><span className="font-medium">Adresse :</span> {order.customer_address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Détails de la commande</h3>
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <p>Sous-total : {Number(order.subtotal || 0).toFixed(2)} DT</p>
                    <p>Livraison : {Number(order.shipping_cost || 0).toFixed(2)} DT</p>
                    <p>Taxe : {Number(order.tax_amount || 0).toFixed(2)} DT</p>
                    <p>Remise : {Number(order.discount_amount || 0).toFixed(2)} DT</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">Produits et statut</h3>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.product?.name || `Produit #${item.product_id}`} • {item.quantity} x {Number(item.unit_price || 0).toFixed(2)} DT
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">État</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updatingOrderId === order.id}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {order.delivery_notes || order.notes ? (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Notes :</span> {order.delivery_notes || order.notes}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
