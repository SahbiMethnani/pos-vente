import { useState } from 'react'
import axios from 'axios'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ClientRegisterPage() {
  const [form, setForm] = useState({ company_name: '', admin_username: '', admin_email: '', admin_password: '', contact_email: '', contact_phone: '' })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validate() {
    if (!form.company_name || !form.admin_username || !form.admin_email || !form.admin_password) {
      return 'Les champs Nom de la société, utilisateur admin, email et mot de passe sont obligatoires.'
    }
    // basic email check
    if (!form.admin_email.includes('@')) return 'Email admin invalide.'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus(null)
    const err = validate()
    if (err) {
      setStatus({ ok: false, msg: err })
      return
    }
    setLoading(true)
    try {
      const url = BACKEND ? `${BACKEND.replace(/\/$/, '')}/clients/register` : '/clients/register'
      const res = await axios.post(url, form)
      setStatus({ ok: true, msg: 'Demande envoyée: ID ' + res.data.id })
      setForm({ company_name: '', admin_username: '', admin_email: '', admin_password: '', contact_email: '', contact_phone: '' })
    } catch (err) {
      setStatus({ ok: false, msg: err.response?.data?.detail || err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Demande d'inscription - Admin</h1>
      {status && <div role="status" className={status.ok ? 'text-green-600' : 'text-red-600'}>{status.msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <label className="block">
          <span className="text-sm">Nom de la société *</span>
          <input name="company_name" placeholder="Nom de la société" value={form.company_name} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm">Nom d'utilisateur admin *</span>
          <input name="admin_username" placeholder="Nom d'utilisateur admin" value={form.admin_username} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm">Email admin *</span>
          <input name="admin_email" placeholder="Email admin" value={form.admin_email} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm">Mot de passe admin *</span>
          <input name="admin_password" type="password" placeholder="Mot de passe admin" value={form.admin_password} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm">Email contact (optionnel)</span>
          <input name="contact_email" placeholder="Email contact (optionnel)" value={form.contact_email} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          <span className="text-sm">Téléphone (optionnel)</span>
          <input name="contact_phone" placeholder="Téléphone (optionnel)" value={form.contact_phone} onChange={handleChange} className="w-full p-2 border rounded" />
        </label>
        <div>
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {loading ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </form>
    </div>
  )
}
