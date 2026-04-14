import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toggleSaveJob } from '../firebase/db'
import { useState } from 'react'

const CAT_STYLES = {
  Tech:      'bg-teal-50 text-teal-700 border-teal-100',
  Design:    'bg-purple-50 text-purple-700 border-purple-100',
  Local:     'bg-red-50 text-red-600 border-red-100',
  Content:   'bg-orange-50 text-orange-600 border-orange-100',
  Education: 'bg-blue-50 text-blue-700 border-blue-100',
}

const AVATAR_COLORS = [
  'bg-brand', 'bg-accent', 'bg-purple-500', 'bg-blue-500', 'bg-orange-500'
]

function timeAgo(ts) {
  if (!ts) return 'just now'
  const diff = Date.now() - ts.toMillis()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function JobCard({ job, onSaveToggle }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isSaved = user && job.savedBy?.includes(user.uid)
  const [saving, setSaving] = useState(false)

  const avatarColor = AVATAR_COLORS[
    (job.postedBy?.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length
  ]
  const initials = job.postedBy?.name
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  async function handleSave(e) {
    e.stopPropagation()
    if (!user) { navigate('/'); return }
    setSaving(true)
    await toggleSaveJob(job.id, user.uid, isSaved)
    onSaveToggle?.()
    setSaving(false)
  }

  return (
    <div
      onClick={() => navigate(`/job/${job.id}`)}
      className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 relative group"
    >
      {/* New badge */}
      {job.createdAt && Date.now() - job.createdAt.toMillis() < 86400000 && (
        <div className="absolute -top-px right-3 bg-accent text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-b-md">
          New
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${CAT_STYLES[job.category] || CAT_STYLES.Tech}`}>
          {job.category}
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`p-1 rounded-md transition-colors ${isSaved ? 'text-brand' : 'text-gray-300 hover:text-brand'}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Title */}
      <h3 className="font-syne font-bold text-[15px] leading-snug text-gray-900 mb-2 group-hover:text-brand transition-colors">
        {job.title}
      </h3>

      {/* Poster */}
      <div className="flex items-center gap-2 mb-2">
        {job.postedBy?.photo
          ? <img src={job.postedBy.photo} alt="" className="w-5 h-5 rounded-full object-cover" />
          : <div className={`w-5 h-5 rounded-full ${avatarColor} flex items-center justify-center text-white text-[8px] font-bold`}>{initials}</div>
        }
        <span className="text-xs text-gray-400">{job.postedBy?.name} · {timeAgo(job.createdAt)}</span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
        {job.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        <span className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md flex items-center gap-1">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {job.location}
        </span>
        {job.tags?.slice(0, 2).map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md">{t}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="font-syne font-bold text-gray-900">
            ₹{Number(job.payMin).toLocaleString()}–{Number(job.payMax).toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-400">{job.payType}</p>
        </div>
        <span className="btn-primary text-xs">View →</span>
      </div>
    </div>
  )
}
