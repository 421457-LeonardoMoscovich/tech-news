'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Auth is handled via the modal in the Header.
// Redirect to home so the user can use the modal from there.
export default function LoginPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/') }, [router])
  return null
}
