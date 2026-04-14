import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyJobs } from '../firebase/db'
import JobCard from '../components/JobCard'

export default function MyJobs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMyJobs(user.uid).then(j => {
      setJobs(j)
      setLoading(false)
    })
  }, [user])

  if (!user) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-syne font-extrabold text-2xl">My Job Posts</h1>
            <p className="text-sm text-gray-400">{jobs.length} post{jobs.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/post')} className="btn-primary">+ Post New Job</button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-syne font-bold text-lg text-gray-600 mb-1">No posts yet</p>
            <p className="text-sm mb-4">Start by posting your first job</p>
            <button onClick={() => navigate('/post')} className="btn-primary">Post a Job →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onSaveToggle={() => getMyJobs(user.uid).then(setJobs)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
