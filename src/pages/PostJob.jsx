import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createJob } from '../firebase/db'

const CATEGORIES = ['Tech', 'Design', 'Local', 'Content', 'Education']
const PAY_TYPES = ['/project', '/month', '/day', '/hour', '/job']

export default function PostJob() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    category: 'Tech',
    location: '',
    description: '',
    payMin: '',
    payMax: '',
    payType: '/project',
    phone: '',
    tags: '',
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e63946" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="font-syne font-bold text-xl mb-2">Sign in to post a job</h2>
          <p className="text-sm text-gray-500 mb-6">Create an account to start posting gigs and reaching local talent on GigsNest.</p>
          <button
            onClick={signInWithGoogle}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.title || !form.description || !form.location || !form.phone) {
      setError('Please fill in all required fields.')
      return
    }
    if (Number(form.payMin) > Number(form.payMax)) {
      setError('Minimum pay cannot be higher than maximum pay.')
      return
    }
    setLoading(true)
    try {
      const tagsArr = form.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .slice(0, 5)

      const id = await createJob({
        title: form.title,
        category: form.category,
        location: form.location,
        description: form.description,
        payMin: Number(form.payMin),
        payMax: Number(form.payMax),
        payType: form.payType,
        phone: form.phone,
        tags: tagsArr,
      }, user)

      navigate(`/job/${id}`)
    } catch (err) {
      setError('Failed to post job. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-10 px-4">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-700 mb-6 flex items-center gap-1">
          ← Back
        </button>

        <h1 className="font-syne font-extrabold text-2xl mb-1">Post a Job</h1>
        <p className="text-sm text-gray-400 mb-6">Reach local talent in minutes</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          {/* Title */}
          <div>
            <label className="label">Job Title *</label>
            <input
              className="input"
              placeholder="e.g. Need a React Developer"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Category + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location *</label>
              <input
                className="input"
                placeholder="Srinagar, Remote..."
                value={form.location}
                onChange={e => set('location', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea
              className="input min-h-[100px] resize-y"
              placeholder="Describe the work, requirements, timeline..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Pay */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Min Pay (₹) *</label>
              <input
                className="input"
                type="number"
                placeholder="5000"
                value={form.payMin}
                onChange={e => set('payMin', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Max Pay (₹) *</label>
              <input
                className="input"
                type="number"
                placeholder="15000"
                value={form.payMax}
                onChange={e => set('payMax', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Per</label>
              <select className="input" value={form.payType} onChange={e => set('payType', e.target.value)}>
                {PAY_TYPES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Skills / Tags (comma separated)</label>
            <input
              className="input"
              placeholder="React, Tailwind, Remote"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">Your WhatsApp / Phone *</label>
            <input
              className="input"
              placeholder="+91 94190 00000"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-syne font-bold text-base py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Job →'}
          </button>
        </form>
      </div>
    </div>
  )
}
