import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setAuth } from '../store/store'
import api from '../services/api'
import toast from 'react-hot-toast'
import { Store, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [clientId, setClientId] = useState(localStorage.getItem('pos_client_id') || '')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // store client id in localStorage so api adds X-Client-Id header
      if (clientId) localStorage.setItem('pos_client_id', clientId)
      const { data } = await api.post('/auth/login', form)
      dispatch(setAuth({ user: data.user, token: data.access_token }))
      navigate('/admin')
      toast.success(`Bienvenue, ${data.user.full_name || data.user.username} !`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Point de Vente</h1>
          <p className="text-gray-500 mt-1 text-sm">Connectez-vous à votre espace caisse</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nom d'utilisateur</label>
            <input
              className="input"
              placeholder="admin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Client ID (optionnel)</label>
            <input
              className="input"
              placeholder="X-Client-Id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">
          Compte par défaut : <span className="font-mono font-semibold">admin / admin123</span>
        </p>
      </div>
    </div>
  )
}
