'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getAuthenticatedUserPhone, removeSessionStorage } from '../utils'

export function useAuth() {
    const [isAuth, setIsAuth] = useState(false)
    const [userPhone, setUserPhone] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const authStatus = isAuthenticated()
        const phone = getAuthenticatedUserPhone()

        setIsAuth(authStatus)
        setUserPhone(phone)
        setLoading(false)
    }, [])

    const logout = () => {
        removeSessionStorage('isAuthenticated')
        removeSessionStorage('userPhone')
        setIsAuth(false)
        setUserPhone(null)
        router.push('/login')
    }

    const redirectToLogin = () => {
        router.push('/login')
    }

    const redirectToDashboard = () => {
        router.push('/dashboard')
    }

    return {
        isAuthenticated: isAuth,
        userPhone,
        loading,
        logout,
        redirectToLogin,
        redirectToDashboard,
    }
}
