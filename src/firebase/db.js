// All database operations — import these anywhere you need data
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from './config'

const JOBS = 'jobs'

// ── Create a new job post ──────────────────────────────────
export async function createJob(jobData, user) {
  const ref = await addDoc(collection(db, JOBS), {
    ...jobData,
    postedBy: {
      uid: user.uid,
      name: user.displayName,
      photo: user.photoURL,
    },
    createdAt: serverTimestamp(),
    savedBy: [],
  })
  return ref.id
}

// ── Fetch all jobs (with optional category filter) ────────
export async function getJobs(category = null) {
  let q
  if (category && category !== 'All') {
    q = query(
      collection(db, JOBS),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
  } else {
    q = query(collection(db, JOBS), orderBy('createdAt', 'desc'))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Fetch a single job by ID ───────────────────────────────
export async function getJob(id) {
  const snap = await getDoc(doc(db, JOBS, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

// ── Fetch jobs posted by a specific user ──────────────────
export async function getMyJobs(uid) {
  const q = query(
    collection(db, JOBS),
    where('postedBy.uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Update a job ───────────────────────────────────────────
export async function updateJob(id, data) {
  await updateDoc(doc(db, JOBS, id), data)
}

// ── Delete a job ───────────────────────────────────────────
export async function deleteJob(id) {
  await deleteDoc(doc(db, JOBS, id))
}

// ── Toggle save/bookmark ───────────────────────────────────
export async function toggleSaveJob(jobId, uid, isSaved) {
  const ref = doc(db, JOBS, jobId)
  await updateDoc(ref, {
    savedBy: isSaved ? arrayRemove(uid) : arrayUnion(uid),
  })
}

// ── Fetch saved jobs for a user ───────────────────────────
export async function getSavedJobs(uid) {
  const q = query(
    collection(db, JOBS),
    where('savedBy', 'array-contains', uid)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
