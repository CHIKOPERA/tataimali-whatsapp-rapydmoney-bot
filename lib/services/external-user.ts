/**
 * User Service Adapter for External API
 *
 * Maps WhatsApp bot user operations to external Rapyd Money Stablecoin API calls
 * Uses phone number as custom ID for all operations
 */

import { apiClient } from '../external-api'

export interface WalletUser {
    id: string
    phone: string // Not in API schema, but needed for our phone-based system
    email: string
    firstName?: string | null
    lastName?: string | null
    paymentIdentifier?: string | null
    publicKey?: string | null
    role?: string // Added per schema - ADMIN, MEMBER, CUSTOMER
    businessId?: string | null
    createdAt: string
    updatedAt?: string
}

export interface UserWallet {
    user: WalletUser
    wallet: {
        id: string
        balance: number
    }
}

/**
 * Check if a user exists by phone number
 * Uses /recipient/:id endpoint with email to lookup user efficiently
 */
export async function getUserByPhone(phoneE164: string): Promise<WalletUser | null> {
    try {
        // Convert phone to expected email format
        const expectedEmail = `${phoneE164.replace('+', '')}@tata-mali.com`

        // Use /recipient/{id} endpoint with email as the identifier
        // This endpoint accepts "Payment identifier or email of the user"
        const response = await apiClient.get(`/recipient/${encodeURIComponent(expectedEmail)}`)

        if (!response || !response.id) {
            return null
        }

        // Map RecipientDetails to WalletUser format
        return {
            id: response.id,
            phone: phoneE164,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            paymentIdentifier: response.paymentIdentifier,
            publicKey: response.publicKey,
            role: response.role,
            businessId: undefined, // Not available in RecipientDetails schema
            createdAt: new Date().toISOString(), // Not available in RecipientDetails schema
            updatedAt: undefined, // Not available in RecipientDetails schema
        }
    } catch (error) {
        console.error('Error getting user by phone:', error)
        // If user not found (404), return null instead of throwing
        if (error instanceof Error && error.message.includes('404')) {
            return null
        }
        return null
    }
}

/**
 * Get or create user and wallet
 */
export async function getOrCreateUserWallet(phoneE164: string): Promise<UserWallet> {
    try {
        // Check if user exists first
        let walletUser = await getUserByPhone(phoneE164)

        if (!walletUser) {
            // Create new user with phone as ID
            const email = `${phoneE164.replace('+', '')}@tata-mali.com`
            const createUserResponse = await apiClient.post('/users', {
                email: email,
                firstName: 'Default',
                lastName: 'Default:' + phoneE164,
            })

            if (createUserResponse?.user) {
                walletUser = {
                    id: createUserResponse.user.id || phoneE164,
                    phone: phoneE164,
                    email: email,
                    firstName: 'Default',
                    lastName: 'Default:' + phoneE164,
                    paymentIdentifier: createUserResponse.user.paymentIdentifier,
                    publicKey: createUserResponse.user.publicKey,
                    role: createUserResponse.user.role,
                    businessId: createUserResponse.user.businessId,
                    createdAt: createUserResponse.user.createdAt || new Date().toISOString(),
                    updatedAt: createUserResponse.user.updatedAt,
                }
            } else {
                throw new Error('Failed to create user')
            }
        }

        // Get user balance using the /{userId}/balance endpoint
        const balanceResponse = await apiClient.get(`/${walletUser.id}/balance`)

        // Extract balance from tokens array (based on API spec)
        let balance = 0
        if (balanceResponse?.tokens && Array.isArray(balanceResponse.tokens)) {
            // Find LZAR token or use first token
            const lzarToken = balanceResponse.tokens.find(
                (token: { symbol?: string; currency?: string; balance: string }) =>
                    token.symbol === 'LZAR' || token.currency === 'ZAR'
            )
            balance = lzarToken
                ? parseFloat(lzarToken.balance)
                : balanceResponse.tokens[0]
                ? parseFloat(balanceResponse.tokens[0].balance)
                : 0
        }

        return {
            user: walletUser,
            wallet: {
                id: walletUser.id,
                balance: balance,
            },
        }
    } catch (error) {
        console.error('Error getting or creating user wallet:', error)
        throw new Error('Failed to get or create user wallet')
    }
}
/**
 * Get wallet balance for a user
 */
export async function getWalletBalance(phoneE164: string): Promise<number> {
    try {
        const userWallet = await getOrCreateUserWallet(phoneE164)
        return userWallet.wallet.balance
    } catch (error) {
        console.error('Error getting wallet balance:', error)
        return 0
    }
}
