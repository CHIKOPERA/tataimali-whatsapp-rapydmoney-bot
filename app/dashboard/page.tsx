'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SendMoneyForm from './components/SendMoneyForm'
import TransactionsList from './components/TransactionsList'
import ProfileView from './components/ProfileView'

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('send-money')
    const [userPhone, setUserPhone] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check authentication status
        const authStatus = sessionStorage.getItem('isAuthenticated')
        const phone = sessionStorage.getItem('userPhone')

        if (!authStatus || !phone) {
            router.push('/login')
            return
        }

        setIsAuthenticated(true)
        setUserPhone(phone)
    }, [router])

    const handleLogout = () => {
        sessionStorage.removeItem('isAuthenticated')
        sessionStorage.removeItem('userPhone')
        router.push('/login')
    }

    if (!isAuthenticated) {
        return (
            <div className='min-h-screen bg-gray-100 flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500'></div>
            </div>
        )
    }

    const menuItems = [
        { id: 'send-money', label: 'Transfer Funds', icon: 'transfer' },
        { id: 'transactions', label: 'Transaction History', icon: 'history' },
        { id: 'profile', label: 'Account Profile', icon: 'profile' },
    ]

    return (
        <div className='min-h-screen bg-gray-100 flex'>
            {/* Sidebar */}
            <div className='w-64 bg-gray-900 shadow-lg'>
                <div className='p-6 border-b border-gray-700'>
                    <h1 className='text-2xl font-bold text-white'>Tata Mali</h1>
                    <p className='text-sm text-gray-300 mt-1'>{userPhone}</p>
                </div>

                <nav className='mt-6'>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                                activeTab === item.id
                                    ? 'bg-lime-500 text-black hover:bg-lime-600'
                                    : 'text-gray-300 hover:text-white'
                            }`}
                        >
                            <div
                                className={`w-5 h-5 mr-3 rounded ${
                                    item.icon === 'transfer'
                                        ? 'bg-blue-500'
                                        : item.icon === 'history'
                                        ? 'bg-green-500'
                                        : 'bg-purple-500'
                                }`}
                            ></div>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className='absolute bottom-6 left-6 right-6'>
                    <button
                        onClick={handleLogout}
                        className='w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors'
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 p-8'>
                <div className='max-w-4xl mx-auto'>
                    {activeTab === 'send-money' && (
                        <div>
                            <h2 className='text-3xl font-bold text-gray-900 mb-8'>
                                Transfer Funds
                            </h2>
                            <SendMoneyForm userPhone={userPhone} />
                        </div>
                    )}

                    {activeTab === 'transactions' && (
                        <div>
                            <h2 className='text-3xl font-bold text-gray-900 mb-8'>
                                Transaction History
                            </h2>
                            <TransactionsList userPhone={userPhone} />
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div>
                            <h2 className='text-3xl font-bold text-gray-900 mb-8'>Profile</h2>
                            <ProfileView userPhone={userPhone} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
