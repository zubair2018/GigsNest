import { useState, useMemo } from 'react'
import { useJobs } from '../hooks/useJobs'
import JobCard from '../components/JobCard'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['All', 'Tech', 'Design', 'Local', 'Content', 'Education']

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const { jobs, loading, refresh } = useJobs(activeCategory === 'All' ? null : activeCategory)
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const filtered = useMemo(() => {
    let list = [...jobs]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q) ||
        j.tags?.some(t => t.toLowerCase().includes(q)) ||
        j.location?.toLowerCase().includes(q)
      )
    }
    if (sort === 'pay-high') list.sort((a, b) => b.payMax - a.payMax)
    if (sort === 'pay-low') list.sort((a, b) => a.payMin - b.payMin)
    return list
  }, [jobs, search, sort])

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-medium bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 mb-4 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
          Kashmir &amp; beyond
        </div>
        <h1 className="font-syne font-extrabold text-4xl sm:text-5xl tracking-tight leading-tight mb-3">
          Find local <span className="text-brand">gigs</span> &amp;<br className="hidden sm:block" />
          skilled people nearby
        </h1>
        <p className="text-gray-500 text-base max-w-md mb-6">
          Mini Fiverr meets OLX — post jobs, offer skills, connect instantly with people in your city.
        </p>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          {[
            { n: jobs.length || '—', l: 'Active Jobs' },
            { n: '12', l: 'Categories' },
            { n: '100%', l: 'Free to Use' },
          ].map(s => (
            <div key={s.l}>
              <p className="font-syne font-bold text-xl text-gray-900">{s.n}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">{s.l}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!user && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="font-syne font-bold text-base">Ready to find your next gig?</p>
              <p className="text-sm text-gray-400">Sign in to post jobs and save listings on GigsNest</p>
            </div>
            <button onClick={signInWithGoogle} className="btn-primary whitespace-nowrap">
              Sign in free →
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="sticky top-14 z-40 bg-[#f8f7f4]/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search jobs, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-8 text-sm h-9"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  activeCategory === c
                    ? 'bg-brand text-white border-brand'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-brand hover:text-brand'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input h-9 text-xs w-auto pr-7"
          >
            <option value="newest">Newest first</option>
            <option value="pay-high">Highest pay</option>
            <option value="pay-low">Lowest pay</option>
          </select>
        </div>
      </div>

      {/* Jobs grid */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            <strong className="text-gray-700 font-medium">{filtered.length}</strong> jobs found
          </p>
          {user && (
            <button onClick={() => navigate('/post')} className="btn-primary text-xs">
              + Post a Job
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="h-3 w-16 bg-gray-100 rounded-full mb-3" />
                <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded mb-4" />
                <div className="h-16 bg-gray-50 rounded mb-3" />
                <div className="h-8 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-syne font-bold text-lg text-gray-600 mb-1">No jobs found</p>
            <p className="text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onSaveToggle={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
