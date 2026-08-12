import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Zap, Globe, Share2, ArrowRight } from 'lucide-react'
import api from '../services/api'

export default function PublicHomePage() {
  const token = useSelector((s) => s.auth.token)
  const navigate = useNavigate()
  const [settings, setSettings] = useState({})
  const [posts, setPosts] = useState([])

  useEffect(() => {
    api.get('/public/settings').then(({ data }) => setSettings(data)).catch(() => {})
    api.get('/public/posts?limit=3').then(({ data }) => setPosts(data)).catch(() => {})
  }, [])

  if (token) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag size={32} className="text-blue-600" />
            <span className="text-xl font-bold">{settings.store_name || 'Ma Boutique'}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-bold hover:bg-blue-50"
            >
              Boutique
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
            >
              Admin Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Bienvenue à {settings.store_name || 'Ma Boutique'}</h1>
        <p className="text-xl mb-8 opacity-90">Découvrez la meilleure sélection de produits de qualité</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 flex items-center gap-2 mx-auto"
        >
          🛍️ Accéder à la Boutique <ArrowRight size={20} />
        </button>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-2">Livraison Rapide</h3>
              <p className="text-gray-600">Expédition en 24-48 heures</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2">Produits de Qualité</h3>
              <p className="text-gray-600">Garantie 100% satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold mb-2">Support Client</h3>
              <p className="text-gray-600">Disponible 24h/24</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="bg-blue-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Actualités & Promotions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.content.substring(0, 100)}...</p>
                    <div className="flex gap-2">
                      {post.platforms.split(',').map(p => (
                        <span key={p} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Nous Contacter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-2xl mb-2">📍</p>
              <p className="text-gray-300">{settings.address || 'Adresse'}</p>
            </div>
            <div>
              <p className="text-2xl mb-2">📞</p>
              <a href={`tel:${settings.phone}`} className="text-blue-400 hover:underline">
                {settings.phone || 'Téléphone'}
              </a>
            </div>
            <div>
              <p className="text-2xl mb-2">✉️</p>
              <a href={`mailto:${settings.email}`} className="text-blue-400 hover:underline">
                {settings.email || 'Email'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 {settings.store_name || 'Ma Boutique'}. Tous droits réservés.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="hover:text-white">Facebook</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">TikTok</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
