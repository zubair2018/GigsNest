import { useState, useEffect } from 'react'
import { getJobs } from '../firebase/db'

export function useJobs(category = null) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getJobs(category)
      .then(setJobs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [category])

  const refresh = () => {
    setLoading(true)
    getJobs(category)
      .then(setJobs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  return { jobs, loading, error, refresh }
}
