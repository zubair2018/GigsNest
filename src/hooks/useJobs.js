import { useState, useEffect } from 'react'
import { getJobs } from '../firebase/db'

export function useJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getJobs()
      const now = new Date()
      // Featured jobs always on top
      const sorted = [...data].sort((a, b) => {
        const aF = a.featured && a.featuredUntil?.toDate?.() > now
        const bF = b.featured && b.featuredUntil?.toDate?.() > now
        if (aF && !bF) return -1
        if (!aF && bF) return 1
        return 0
      })
      setJobs(sorted)
    } catch (e) {
      setError(e.message)
      console.error('useJobs error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  return { jobs, loading, error, refresh: load }
}