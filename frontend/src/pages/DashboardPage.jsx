import { useState, useEffect } from 'react'
import api from '../services/api'
import { TrendingUp, ShoppingBag, Package, AlertTriangle, Users, Truck } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(({ data }) => {
      setStats(data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="CA du jour" value={`${stats.today_revenue.toFixed(2)} DT`} icon={TrendingUp} color="bg-blue-500" subtitle={`CA mensuel : ${stats.monthly_revenue.toFixed(2)} DT`} />
        <StatCard title="Ventes du jour" value={stats.today_sales_count} icon={ShoppingBag} color="bg-green-500" />
        <StatCard title="Produits actifs" value={stats.total_products} icon={Package} color="bg-purple-500" />
        <StatCard title="Stocks faibles" value={stats.low_stock_count} icon={AlertTriangle} color="bg-orange-500" />
        <StatCard title="Clients" value={stats.total_customers} icon={Users} color="bg-pink-500" />
        <StatCard title="Fournisseurs" value={stats.total_suppliers} icon={Truck} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-4">Chiffre d'affaires – 7 derniers jours</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={stats.daily_sales_chart}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v.toFixed(2)} DT`, 'CA']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Top 5 produits</h2>
          {stats.top_products.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune vente enregistrée</p>
          ) : (
            <ul className="space-y-3">
              {stats.top_products.map((p, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate max-w-[130px]">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-800">{p.revenue.toFixed(2)} DT</div>
                    <div className="text-xs text-gray-400">Qté : {p.qty}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
