import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendMessage, subscribeMessages, getMyChats } from '../firebase/db'

export default function Chat() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [chatInfo, setChatInfo] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user || !chatId) return
    // Get chat info
    getMyChats(user.uid).then(chats => {
      const c = chats.find(ch => ch.id === chatId)
      if (c) setChatInfo(c)
    })
    // Subscribe to messages
    const unsub = subscribeMessages(chatId, setMessages)
    return unsub
  }, [chatId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) { navigate('/'); return null }

  const otherUid = chatInfo?.participants?.find(p => p !== user.uid)
  const otherName = chatInfo?.participantNames?.[otherUid] || 'User'
  const otherPhoto = chatInfo?.participantPhotos?.[otherUid] || ''

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    try { await sendMessage(chatId, user.uid, text); setText('') }
    catch (err) { console.error(err) }
    finally { setSending(false) }
  }

  function formatTime(ts) {
    if (!ts?.toDate) return ''
    return ts.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]" style={{ background: 'var(--cream)' }}>
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 shadow-sm flex-shrink-0" style={{ background: 'var(--forest)' }}>
        <button onClick={() => navigate('/messages')} className="text-sm hover:opacity-70" style={{ color: 'rgba(246,233,208,0.7)' }}>←</button>
        {otherPhoto
          ? <img src={otherPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
          : <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'var(--gold)', color: 'var(--forest)' }}>
              {otherName[0]}
            </div>
        }
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>{otherName}</p>
          {chatInfo?.jobTitle && (
            <p className="text-[10px] truncate max-w-[200px]" style={{ color: 'rgba(246,233,208,0.5)' }}>
              re: {chatInfo.jobTitle}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Say hi to start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderUid === user.uid
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%]">
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: isMe ? 'var(--forest)' : '#fff',
                    color: isMe ? 'var(--cream)' : 'var(--text)',
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                    border: isMe ? 'none' : '1px solid rgba(4,50,34,0.1)',
                  }}>
                  {msg.text}
                </div>
                <p className={`text-[10px] mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`} style={{ color: 'var(--muted)' }}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 px-4 py-3 flex-shrink-0"
        style={{ background: '#fff', borderTop: '1px solid rgba(4,50,34,0.1)' }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          className="input flex-1"
          autoFocus
        />
        <button type="submit" disabled={sending || !text.trim()}
          className="px-5 py-2 rounded-xl font-medium text-sm transition-all disabled:opacity-40"
          style={{ background: 'var(--forest)', color: 'var(--cream)' }}>
          Send
        </button>
      </form>
    </div>
  )
}