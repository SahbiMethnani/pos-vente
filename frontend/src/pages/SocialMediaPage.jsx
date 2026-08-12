import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function SocialMediaPage() {
  const [posts, setPosts] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    image_url: '',
    video_url: '',
    platforms: ['website']
  })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')

  const platformOptions = ['website', 'facebook', 'instagram', 'tiktok']
  
  const load = () => {
    setLoading(true)
    api.get('/posts').then(({ data }) => setPosts(data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) {
      toast.error('Titre et contenu requis')
      return
    }

    try {
      setLoading(true)
      if (modal?.id) {
        await api.put(`/posts/${modal.id}`, form)
        toast.success('Publication modifiée')
      } else {
        await api.post('/posts', form)
        toast.success('Publication créée')
      }
      setModal(null)
      setForm({ title: '', content: '', image_url: '', video_url: '', platforms: ['website'] })
      load()
    } catch (err) {
      toast.error('Erreur: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const publish = async (postId) => {
    try {
      setLoading(true)
      await api.post(`/posts/${postId}/publish`)
      toast.success('Publication envoyée à tous les réseaux')
      load()
    } catch (err) {
      toast.error('Erreur: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (postId) => {
    if (!confirm('Supprimer cette publication?')) return
    try {
      setLoading(true)
      await api.delete(`/posts/${postId}`)
      toast.success('Publication supprimée')
      load()
    } catch (err) {
      toast.error('Erreur: ' + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (post) => {
    setForm({
      title: post.title,
      content: post.content,
      image_url: post.image_url || '',
      video_url: post.video_url || '',
      platforms: post.platforms.split(',')
    })
    setModal(post)
  }

  const filteredPosts = posts.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion Réseaux Sociaux</h1>
        <button
          onClick={() => {
            setForm({ title: '', content: '', image_url: '', video_url: '', platforms: ['website'] })
            setModal({ mode: 'create' })
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} /> Nouvelle Publication
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'draft', 'scheduled', 'published'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f === 'all' ? 'Tout' : f === 'draft' ? 'Brouillons' : f === 'scheduled' ? 'Programmés' : 'Publiés'}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{post.title}</h3>
                <div className="flex gap-2 mt-2">
                  {post.platforms.split(',').map(p => (
                    <span key={p} className="px-2 py-1 bg-gray-200 text-gray-800 text-sm rounded capitalize">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.status === 'draft' && <Clock size={20} className="text-orange-500" />}
                {post.status === 'published' && <CheckCircle size={20} className="text-green-500" />}
                {post.status === 'failed' && <AlertCircle size={20} className="text-red-500" />}
              </div>
            </div>

            <p className="text-gray-700 mb-4">{post.content.substring(0, 150)}...</p>

            {post.image_url && (
              <img src={post.image_url} alt={post.title} className="w-full max-h-64 object-cover rounded mb-4" />
            )}

            <div className="flex gap-2 justify-between flex-wrap">
              <div className="text-sm text-gray-600">
                {post.likes_count} ❤️ {post.comments_count} 💬 {post.shares_count} 🔄
              </div>
              <div className="flex gap-2">
                {post.status === 'draft' && (
                  <>
                    <button
                      onClick={() => openEdit(post)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      <Edit2 size={16} /> Modifier
                    </button>
                    <button
                      onClick={() => publish(post.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      <Send size={16} /> Publier
                    </button>
                  </>
                )}
                <button
                  onClick={() => deletePost(post.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  <Trash2 size={16} /> Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {modal.id ? 'Modifier Publication' : 'Nouvelle Publication'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Titre"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <textarea
                placeholder="Contenu"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg h-24"
              />

              <input
                type="url"
                placeholder="URL Image (optionnel)"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="url"
                placeholder="URL Vidéo (optionnel)"
                value={form.video_url}
                onChange={e => setForm({ ...form, video_url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <div>
                <label className="block font-bold mb-2">Réseaux Sociaux</label>
                <div className="space-y-2">
                  {platformOptions.map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={form.platforms.includes(p)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm({ ...form, platforms: [...form.platforms, p] })
                          } else {
                            setForm({ ...form, platforms: form.platforms.filter(x => x !== p) })
                          }
                        }}
                        className="w-4 h-4"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
