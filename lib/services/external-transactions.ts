/**
 * Transaction History Service Adapter for External API
 *
 * Maps WhatsApp bot transaction history operations to external Rapyd Money Stablecoin API calls
 * Uses phone numbers as user IDs for all operations
 */

import { apiClient } from '../external-api'
import { getOrCreateUserWallet } from './external-user'

export interface Transaction {
    id: string
    type: string
    amount: number
    createdAt: string
    fromPhone?: string
    toPhone?: string
    description?: string
}

/**
 * Get transaction history for a user by phone number using /{userId}/transactions endpoint
 */
export async function getWalletHistory(phoneE164: string): Promise<Transaction[]> {
    try {
        // Get user to ensure they exist and get their ID
        const userWallet = await getOrCreateUserWallet(phoneE164)

        // Get transaction history using /{userId}/transactions endpoint from API spec
        const response = await apiClient.get(`/${userWallet.user.id}/transactions`)

        if (!response?.transactions) {
            return []
        }

        // Map external API transaction format to internal format
        // Transaction schema: id, userId, txType, method, currency, value, status, createdAt
        return response.transactions.map((tx: unknown) => {
            const transaction = tx as Record<string, unknown>
            return {
                id: transaction.id as string,
                type: mapTransactionType(transaction.txType as string),
                amount: transaction.value as number,
                createdAt: transaction.createdAt as string,
                // These fields may not be in the API response, but kept for compatibility
                fromPhone: (transaction.fromPhone as string) || undefined,
                toPhone: (transaction.toPhone as string) || undefined,
                description: (transaction.method as string) || (transaction.txType as string),
            }
        })
    } catch (error) {
        console.error('Error getting wallet history:', error)
        return []
    }
}

/**
 * Map external API transaction types to internal types
 */
function mapTransactionType(externalType: string): string {
    if (!externalType) return 'OTHER'

    switch (externalType.toLowerCase()) {
        case 'transfer':
        case 'send':
        case 'payment':
        case 'sent':
            return 'TRANSFER'
        case 'receive':
        case 'received':
        case 'credit':
            return 'RECEIVE'
        case 'coupon':
        case 'reward':
        case 'bonus':
        case 'claim':
            return 'COUPON'
        case 'deposit':
        case 'mint':
            return 'DEPOSIT'
        case 'withdrawal':
        case 'withdraw':
        case 'redeem':
            return 'WITHDRAWAL'
        default:
            return 'OTHER'
    }
}
