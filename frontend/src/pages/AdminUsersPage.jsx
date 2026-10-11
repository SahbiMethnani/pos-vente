import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', full_name: '', role: 'admin', password: '' })
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  async function fetchUsers() {
    setLoading(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  function startEdit(u) {
    setEditingId(u.id)
    setForm({ username: u.username || '', email: u.email || '', full_name: u.full_name || '', role: u.role || 'admin', password: '' })
  }

  function resetForm() {
    setEditingId(null)
    setForm({ username: '', email: '', full_name: '', role: 'admin', password: '' })
  }

  async function saveUser(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const payload = { ...form }
        // don't send empty password
        if (!payload.password) delete payload.password
        await api.put(`/users/${editingId}`, payload)
        toast.success('Utilisateur mis à jour')
      } else {
        await api.post('/users', form)
        toast.success('Utilisateur créé')
      }
      resetForm()
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function removeUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('Utilisateur désactivé')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <div className="mb-6">
        <form onSubmit={saveUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Nom d'utilisateur" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})} className="p-2 border rounded" required />
          <input placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} className="p-2 border rounded" />
          <input placeholder="Nom complet" value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} className="p-2 border rounded" />
          <select value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})} className="p-2 border rounded">
            <option value="admin">admin</option>
            <option value="caissier">caissier</option>
            <option value="gestionnaire">gestionnaire</option>
          </select>
          <input placeholder="Mot de passe (laisser vide pour ne pas changer)" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} className="p-2 border rounded col-span-1 md:col-span-2" />
          <div className="col-span-1 md:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">{saving? 'Enregistrement...' : (editingId ? 'Mettre à jour' : 'Créer utilisateur')}</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded">Annuler</button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Liste des utilisateurs</h2>
        {loading ? (
          <div>Chargement...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100"><th className="p-2 text-left">ID</th><th>Username</th><th>Email</th><th>Nom</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.full_name}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">
                    <button onClick={()=>startEdit(u)} className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded">Modifier</button>
                    <button onClick={()=>removeUser(u.id)} className="px-3 py-1 bg-red-600 text-white rounded">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
