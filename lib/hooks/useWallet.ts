'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'
import { API_ENDPOINTS } from '../config'
import { getAuthenticatedUserPhone, isValidPhone, formatPhoneE164, isValidAmount } from '../utils'
import type { WalletBalance, Transaction } from '../types'

export function useWallet() {
    const [userPhone, setUserPhone] = useState<string | null>(null)

    const balanceApi = useApi<WalletBalance>()
    const historyApi = useApi<Transaction[]>()
    const sendApi = useApi<{ status: string }>()

    useEffect(() => {
        const phone = getAuthenticatedUserPhone()
        setUserPhone(phone)
    }, [])

    const fetchBalance = useCallback(async () => {
        if (!userPhone) return

        return await balanceApi.execute(API_ENDPOINTS.WALLET.BALANCE, {
            method: 'GET',
            headers: {
                phone: userPhone,
            },
        })
    }, [userPhone, balanceApi])

    const fetchHistory = useCallback(async () => {
        if (!userPhone) return

        return await historyApi.execute(API_ENDPOINTS.WALLET.HISTORY, {
            method: 'GET',
            headers: {
                phone: userPhone,
            },
        })
    }, [userPhone, historyApi])

    const sendMoney = useCallback(
        async (toPhone: string, amount: string) => {
            if (!userPhone) {
                throw new Error('User not authenticated')
            }

            if (!isValidPhone(toPhone)) {
                throw new Error('Please enter a valid recipient phone number')
            }

            if (!isValidAmount(amount)) {
                throw new Error('Please enter a valid amount')
            }

            const formattedToPhone = formatPhoneE164(toPhone)

            if (formattedToPhone === userPhone) {
                throw new Error('You cannot send money to yourself')
            }

            const requestData = {
                toPhone: formattedToPhone,
                amount: parseFloat(amount),
            }

            const result = await sendApi.execute(API_ENDPOINTS.WALLET.SEND, {
                method: 'POST',
                headers: {
                    phone: userPhone,
                },
                body: JSON.stringify(requestData),
            })

            // Refresh balance and history after successful transfer
            if (result.data?.status === 'sent') {
                await Promise.all([fetchBalance(), fetchHistory()])
            }

            return result
        },
        [userPhone, sendApi, fetchBalance, fetchHistory]
    )

    // Auto-fetch data when userPhone is available
    useEffect(() => {
        if (userPhone) {
            fetchBalance()
            fetchHistory()
        }
    }, [userPhone, fetchBalance, fetchHistory])

    return {
        balance: balanceApi.data?.balance ?? 0,
        transactions: historyApi.data ?? [],
        fetchBalance,
        fetchHistory,
        sendMoney,
        balanceLoading: balanceApi.loading,
        balanceError: balanceApi.error,
        historyLoading: historyApi.loading,
        historyError: historyApi.error,
        sendLoading: sendApi.loading,
        sendError: sendApi.error,
    }
}
