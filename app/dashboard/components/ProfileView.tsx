'use client'

import { useState, useEffect } from 'react'

interface User {
    phoneE164: string
    createdAt: string
}

interface Wallet {
    balance: number
    createdAt?: string
}

interface ProfileViewProps {
    userPhone: string
}

export default function ProfileView({ userPhone }: ProfileViewProps) {
    const [user, setUser] = useState<User | null>(null)
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch user profile
                const userRes = await fetch('/api/user/profile', {
                    headers: { phone: userPhone },
                })

                // Fetch wallet info
                const walletRes = await fetch('/api/wallet/balance', {
                    headers: { phone: userPhone },
                })

                if (userRes.ok && walletRes.ok) {
                    const userData = await userRes.json()
                    const walletData = await walletRes.json()
                    setUser(userData)
                    setWallet(walletData)
                } else {
                    setError('Failed to load profile')
                }
            } catch {
                setError('Network error')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [userPhone])

    const refreshProfile = async () => {
        setLoading(true)
        setError('')
        try {
            // Fetch user profile
            const userRes = await fetch('/api/user/profile', {
                headers: { phone: userPhone },
            })

            // Fetch wallet info
            const walletRes = await fetch('/api/wallet/balance', {
                headers: { phone: userPhone },
            })

            if (userRes.ok && walletRes.ok) {
                const userData = await userRes.json()
                const walletData = await walletRes.json()
                setUser(userData)
                setWallet(walletData)
            } else {
                setError('Failed to load profile')
            }
        } catch {
            setError('Network error')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                <div className='flex items-center justify-center py-12'>
                    <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-lime-500'></div>
                    <span className='ml-4 text-gray-600 font-medium'>Loading profile...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                <div className='text-center py-12'>
                    <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <div className='w-8 h-8 bg-red-600 rounded-full'></div>
                    </div>
                    <div className='text-red-600 mb-6 font-medium'>Error: {error}</div>
                    <button
                        onClick={refreshProfile}
                        className='bg-lime-500 text-black px-6 py-3 rounded-xl hover:bg-lime-600 transition-all duration-200 hover:shadow-lg font-medium'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-8'>
            {/* Profile Header */}
            <div className='bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl text-white p-8'>
                <div className='flex items-center space-x-6'>
                    <div className='w-20 h-20 bg-lime-500 rounded-2xl flex items-center justify-center shadow-lg'>
                        <div className='w-10 h-10 bg-white rounded-xl opacity-90'></div>
                    </div>
                    <div>
                        <h3 className='text-2xl font-bold mb-2'>Account Holder</h3>
                        <p className='text-gray-300 text-lg'>{userPhone}</p>
                        <p className='text-gray-400 text-sm mt-1'>
                            Member since {user ? formatDate(user.createdAt) : 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Account Balance Card */}
                <div className='bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl text-white p-8'>
                    <div className='flex items-center justify-between mb-4'>
                        <h4 className='text-lg font-medium opacity-90'>Account Balance</h4>
                        <div className='w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center'>
                            <div className='w-4 h-4 bg-white rounded opacity-80'></div>
                        </div>
                    </div>
                    <div className='text-4xl font-bold mb-2'>
                        R{wallet ? wallet.balance.toFixed(2) : '0.00'}
                    </div>
                    <p className='text-green-100 text-sm'>Available for transfer</p>
                </div>

                {/* Account Information */}
                <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
                    <h4 className='text-xl font-semibold text-gray-900 mb-6'>Account Details</h4>

                    <div className='space-y-4'>
                        <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                            <span className='text-gray-600 font-medium'>Phone Number</span>
                            <span className='text-gray-900 font-semibold'>{userPhone}</span>
                        </div>

                        <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                            <span className='text-gray-600 font-medium'>Account Type</span>
                            <span className='text-gray-900 font-semibold'>Standard</span>
                        </div>

                        <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                            <span className='text-gray-600 font-medium'>Status</span>
                            <span className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold'>
                                Active
                            </span>
                        </div>

                        <div className='flex justify-between items-center py-3'>
                            <span className='text-gray-600 font-medium'>Wallet Created</span>
                            <span className='text-gray-900 font-semibold'>
                                {user ? formatDate(user.createdAt) : 'Unknown'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Statistics */}
            <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
                <h4 className='text-xl font-semibold text-gray-900 mb-8'>Account Overview</h4>

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
                    <div className='text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200'>
                        <div className='w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-3 flex items-center justify-center'>
                            <div className='w-6 h-6 bg-white rounded opacity-90'></div>
                        </div>
                        <div className='text-2xl font-bold text-blue-600 mb-1'>--</div>
                        <div className='text-sm text-gray-600 font-medium'>Total Sent</div>
                    </div>

                    <div className='text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200'>
                        <div className='w-12 h-12 bg-green-600 rounded-xl mx-auto mb-3 flex items-center justify-center'>
                            <div className='w-6 h-6 bg-white rounded opacity-90'></div>
                        </div>
                        <div className='text-2xl font-bold text-green-600 mb-1'>--</div>
                        <div className='text-sm text-gray-600 font-medium'>Total Received</div>
                    </div>

                    <div className='text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200'>
                        <div className='w-12 h-12 bg-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center'>
                            <div className='w-6 h-6 bg-white rounded opacity-90'></div>
                        </div>
                        <div className='text-2xl font-bold text-purple-600 mb-1'>--</div>
                        <div className='text-sm text-gray-600 font-medium'>Transactions</div>
                    </div>

                    <div className='text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200'>
                        <div className='w-12 h-12 bg-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center'>
                            <div className='w-6 h-6 bg-white rounded opacity-90'></div>
                        </div>
                        <div className='text-2xl font-bold text-orange-600 mb-1'>--</div>
                        <div className='text-sm text-gray-600 font-medium'>This Month</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
