'use client'

import { useState, useEffect } from 'react'

interface Transaction {
    id: string
    type: string
    amountMinor: number
    createdAt: string
    fromPhone?: string
    toPhone?: string
    description?: string
}

interface TransactionsListProps {
    userPhone: string
}

export default function TransactionsList({ userPhone }: TransactionsListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await fetch('/api/wallet/history', {
                    headers: { phone: userPhone },
                })

                if (res.ok) {
                    const data = await res.json()
                    setTransactions(data || [])
                } else {
                    setError('Failed to load transactions')
                }
            } catch {
                setError('Network error')
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [userPhone])

    const refreshTransactions = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/wallet/history', {
                headers: { phone: userPhone },
            })

            if (res.ok) {
                const data = await res.json()
                setTransactions(data || [])
            } else {
                setError('Failed to load transactions')
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getTransactionIcon = (type: string, isIncoming: boolean) => {
        if (type === 'TRANSFER') {
            return isIncoming ? '⬇' : '⬆'
        }
        if (type === 'DEPOSIT') return '+'
        if (type === 'WITHDRAWAL') return '-'
        return '•'
    }

    const getTransactionColor = (type: string, isIncoming: boolean) => {
        if (type === 'TRANSFER') {
            return isIncoming ? 'text-green-600' : 'text-red-600'
        }
        if (type === 'DEPOSIT') return 'text-green-600'
        if (type === 'WITHDRAWAL') return 'text-red-600'
        return 'text-gray-600'
    }

    if (loading) {
        return (
            <div className='bg-white rounded-2xl shadow-xl p-8 border border-gray-100'>
                <div className='flex items-center justify-center py-12'>
                    <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-lime-500'></div>
                    <span className='ml-4 text-gray-600 font-medium'>Loading transactions...</span>
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
                        onClick={refreshTransactions}
                        className='bg-lime-500 text-black px-6 py-3 rounded-xl hover:bg-lime-600 transition-all duration-200 hover:shadow-lg font-medium'
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
            <div className='flex justify-between items-center mb-8'>
                <h3 className='text-2xl font-bold text-gray-900'>Recent Transactions</h3>
                <button
                    onClick={refreshTransactions}
                    className='text-lime-600 hover:text-lime-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-lime-50 transition-all duration-200'
                >
                    Refresh
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className='text-center py-16'>
                    <div className='w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center'>
                        <div className='w-10 h-10 bg-gray-400 rounded-xl'></div>
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 mb-3'>
                        No transactions yet
                    </h4>
                    <p className='text-gray-600 max-w-md mx-auto'>
                        Your transaction history will appear here once you start using your account.
                    </p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {transactions.map((tx) => {
                        const isIncoming = tx.toPhone === userPhone
                        const otherPhone = isIncoming ? tx.fromPhone : tx.toPhone

                        return (
                            <div
                                key={tx.id}
                                className='border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-all duration-200 hover:shadow-md'
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-4'>
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                                                isIncoming
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}
                                        >
                                            {getTransactionIcon(tx.type, isIncoming)}
                                        </div>
                                        <div>
                                            <div className='font-semibold text-gray-900 text-lg'>
                                                {tx.type === 'TRANSFER'
                                                    ? isIncoming
                                                        ? 'Funds Received'
                                                        : 'Funds Sent'
                                                    : tx.type.charAt(0) +
                                                      tx.type.slice(1).toLowerCase()}
                                            </div>
                                            <div className='text-sm text-gray-600 mt-1'>
                                                {otherPhone && (
                                                    <span className='font-medium'>
                                                        {isIncoming ? 'From' : 'To'}: {otherPhone}
                                                    </span>
                                                )}
                                                {tx.description && (
                                                    <div className='mt-1 text-gray-500'>
                                                        {tx.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-right'>
                                        <div
                                            className={`font-bold text-xl ${getTransactionColor(
                                                tx.type,
                                                isIncoming
                                            )}`}
                                        >
                                            {isIncoming ? '+' : '-'}R
                                            {Math.abs(tx.amountMinor).toFixed(2)}
                                        </div>
                                        <div className='text-sm text-gray-500 mt-1'>
                                            {formatDate(tx.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
