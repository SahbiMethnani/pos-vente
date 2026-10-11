import { useState } from 'react'
import axios from 'axios'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function PODashboardPage() {
  const [poKey, setPoKey] = useState('')
  const [clients, setClients] = useState([])
  const [message, setMessage] = useState(null)

  async function fetchPending() {
    try {
      const res = await axios.get(`${BACKEND}/clients/pending`, { headers: { 'X-PO-Key': poKey } })
      setClients(res.data)
      setMessage(null)
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.detail || err.message })
      setClients([])
    }
  }

  async function approve(id) {
    try {
      await axios.post(`${BACKEND}/clients/${id}/approve`, null, { headers: { 'X-PO-Key': poKey } })
      setMessage({ ok: true, text: 'Client approuvé' })
      fetchPending()
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.detail || err.message })
    }
  }

  async function reject(id) {
    try {
      await axios.post(`${BACKEND}/clients/${id}/reject`, null, { headers: { 'X-PO-Key': poKey } })
      setMessage({ ok: true, text: 'Client refusé' })
      fetchPending()
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.detail || err.message })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau Product Owner</h1>
      <div className="flex gap-2 mb-4">
        <input className="p-2 border rounded flex-1" placeholder="Clé PO" value={poKey} onChange={(e) => setPoKey(e.target.value)} />
        <button onClick={fetchPending} className="px-4 py-2 bg-blue-600 text-white rounded">Charger</button>
      </div>
      {message && <div className={message.ok ? 'text-green-600' : 'text-red-600'}>{message.text}</div>}
      <table className="w-full mt-4 table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100"><th className="p-2">ID</th><th>Nom</th><th>Email admin</th><th>Contact</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.id}</td>
              <td className="p-2">{c.company_name}</td>
              <td className="p-2">{c.admin_email}</td>
              <td className="p-2">{c.contact_email || '-'}</td>
              <td className="p-2">
                <button onClick={() => approve(c.id)} className="mr-2 px-3 py-1 bg-green-600 text-white rounded">Accepter</button>
                <button onClick={() => reject(c.id)} className="px-3 py-1 bg-red-600 text-white rounded">Refuser</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
