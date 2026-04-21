import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyChats } from '../firebase/db'

export default function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMyChats(user.uid).then(c => { setChats(c); setLoading(false) })
  }, [user])

  if (!user) { navigate('/'); return null }

  function timeAgo(ts) {
    if (!ts?.toDate) return ''
    const h = Math.floor((Date.now() - ts.toDate().getTime()) / 3600000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'var(--cream)' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-black text-3xl mb-1 tracking-tight" style={{ fontFamily: '"Playfair Display",serif', color: 'var(--forest)' }}>Messages</h1>
        <p className="text-sm mb-7" style={{ color: 'var(--muted)' }}>{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl p-4 animate-pulse flex gap-3" style={{ background: '#fff' }}>
                <div className="w-11 h-11 rounded-full flex-shrink-0" style={{ background: 'var(--cream2)' }} />
                <div className="flex-1">
                  <div className="h-3 w-1/3 rounded mb-2" style={{ background: 'var(--cream2)' }} />
                  <div className="h-3 w-2/3 rounded" style={{ background: 'var(--cream)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">💬</p>
            <p className="font-bold text-xl mb-2" style={{ fontFamily: '"Playfair Display",serif', color: 'var(--forest)' }}>No messages yet</p>
            <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>When you contact someone about a job, your chat will appear here</p>
            <button onClick={() => navigate('/')} className="btn-primary">Browse Jobs →</button>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map(chat => {
              const otherUid = chat.participants?.find(p => p !== user.uid)
              const otherName = chat.participantNames?.[otherUid] || 'User'
              const otherPhoto = chat.participantPhotos?.[otherUid] || ''
              return (
                <button key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ background: '#fff', border: '1px solid rgba(4,50,34,0.08)' }}>
                  {otherPhoto
                    ? <img src={otherPhoto} alt="" className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                        style={{ background: 'var(--forest)', color: 'var(--cream)' }}>
                        {otherName[0]}
                      </div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-medium text-sm" style={{ color: 'var(--forest)' }}>{otherName}</p>
                      <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{timeAgo(chat.lastMessageAt)}</p>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                      {chat.lastMessage || `re: ${chat.jobTitle}`}
                    </p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}