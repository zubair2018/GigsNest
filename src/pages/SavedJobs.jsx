import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSavedJobs } from '../firebase/db'
import JobCard from '../components/JobCard'

export default function SavedJobs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!user) return
    getSavedJobs(user.uid).then(j => {
      setJobs(j)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [user])

  if (!user) { navigate('/'); return null }

  return (
    <div className="min-h-screen bg-[#f8f7f4] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-syne font-extrabold text-2xl mb-1">Saved Jobs</h1>
        <p className="text-sm text-gray-400 mb-6">{jobs.length} saved</p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔖</p>
            <p className="font-syne font-bold text-lg text-gray-600 mb-1">No saved jobs yet</p>
            <p className="text-sm mb-4">Bookmark jobs you like from the home page</p>
            <button onClick={() => navigate('/')} className="btn-primary">Browse Jobs →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} onSaveToggle={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
