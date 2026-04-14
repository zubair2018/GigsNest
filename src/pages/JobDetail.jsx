import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getJob, toggleSaveJob, deleteJob } from '../firebase/db'
import { useAuth } from '../context/AuthContext'

const CAT_STYLES = {
  Tech:      'bg-teal-50 text-teal-700',
  Design:    'bg-purple-50 text-purple-700',
  Local:     'bg-red-50 text-red-600',
  Content:   'bg-orange-50 text-orange-600',
  Education: 'bg-blue-50 text-blue-700',
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getJob(id).then(j => {
      setJob(j)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!job) return (
    <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center text-gray-400">
      Job not found.
    </div>
  )

  const isOwner = user?.uid === job.postedBy?.uid
  const isSaved = user && job.savedBy?.includes(user.uid)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await toggleSaveJob(job.id, user.uid, isSaved)
    const updated = await getJob(id)
    setJob(updated)
    setSaving(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this job post?')) return
    setDeleting(true)
    await deleteJob(id)
    navigate('/')
  }

  const waLink = `https://wa.me/${job.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I saw your job post "${job.title}" on GigsNest and I'm interested.`)}`

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-700 mb-6 flex items-center gap-1">
          ← Back to jobs
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT_STYLES[job.category] || ''} mb-2 inline-block`}>
                {job.category}
              </span>
              <h1 className="font-syne font-extrabold text-2xl leading-snug text-gray-900">
                {job.title}
              </h1>
            </div>
            {user && !isOwner && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`mt-1 p-2 rounded-lg border transition-all ${isSaved ? 'border-brand text-brand bg-red-50' : 'border-gray-200 text-gray-400 hover:border-brand hover:text-brand'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            )}
          </div>

          {/* Poster info */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
            {job.postedBy?.photo
              ? <img src={job.postedBy.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
              : <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold">
                  {job.postedBy?.name?.[0]}
                </div>
            }
            <div>
              <p className="text-sm font-medium text-gray-800">{job.postedBy?.name}</p>
              <p className="text-xs text-gray-400">{job.location}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">About this job</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">Skills required</p>
              <div className="flex flex-wrap gap-2">
                {job.tags.map(t => (
                  <span key={t} className="text-xs px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-gray-600">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Pay */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">Pay range</p>
            <p className="font-syne font-extrabold text-2xl text-gray-900">
              ₹{Number(job.payMin).toLocaleString()} – ₹{Number(job.payMax).toLocaleString()}
              <span className="text-sm font-normal text-gray-400 font-dm ml-1">{job.payType}</span>
            </p>
          </div>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/edit/${id}`)}
                className="btn-outline flex-1 py-2.5"
              >
                Edit Post
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-all disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-medium text-sm py-3 rounded-xl transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp {job.postedBy?.name?.split(' ')[0]}
              </a>
              <a
                href={`tel:${job.phone}`}
                className="btn-outline px-5 py-3"
              >
                Call
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
