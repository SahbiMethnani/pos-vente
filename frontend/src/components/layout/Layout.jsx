import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/store'
import {
  LayoutDashboard, Package, Tag, Warehouse, Users, Truck,
  ShoppingCart, History, BarChart2, Settings, LogOut, Store, Share2, Globe
} from 'lucide-react'

const navItems = [
  { path: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: '/admin/caisse', label: 'Caisse', icon: ShoppingCart },
  { path: '/admin/produits', label: 'Produits', icon: Package },
  { path: '/admin/categories', label: 'Catégories', icon: Tag },
  { path: '/admin/stock', label: 'Stock', icon: Warehouse },
  { path: '/admin/clients', label: 'Clients', icon: Users },
  { path: '/admin/fournisseurs', label: 'Fournisseurs', icon: Truck },
  { path: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
  { path: '/admin/ventes', label: 'Historique ventes', icon: History },
  { path: '/admin/rapports', label: 'Rapports', icon: BarChart2 },
  { path: '/admin/reseaux-sociaux', label: 'Réseaux Sociaux', icon: Share2 },
  { path: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-700">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Store size={20} />
          </div>
          <div>
            <div className="font-bold text-sm">POS System</div>
            <div className="text-gray-400 text-xs">Point de Vente</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-700 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 rounded-full w-9 h-9 flex items-center justify-center font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.full_name || user?.username}</div>
              <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-full"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
