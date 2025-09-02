'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        // Check if user is already authenticated
        const isAuthenticated = sessionStorage.getItem('isAuthenticated')
        const userPhone = sessionStorage.getItem('userPhone')

        if (isAuthenticated && userPhone) {
            // Redirect to dashboard if authenticated
            router.push('/dashboard')
        } else {
            // Redirect to login if not authenticated
            router.push('/login')
        }
    }, [router])

    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
            <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                <p className='text-gray-600'>Loading Tata Mali...</p>
            </div>
        </div>
    )
}
