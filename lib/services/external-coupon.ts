/**
 * Coupon Service Adapter for External API
 *
 * Maps WhatsApp bot coupon operations to external Rapyd Money Stablecoin API calls
 * Uses phone numbers as user IDs for all operations
 */

import { apiClient } from '../external-api'
import { getOrCreateUserWallet } from './external-user'

export interface CouponRedemptionRequest {
    token: string
    walletId: string // This will be the phone number in our case
}

export interface CouponRedemptionResult {
    success: boolean
    message: string
    amount?: number
    expiresAt?: string
}

/**
 * Redeem a coupon for a user using /coupons/claim/{userId} endpoint
 */
export async function redeemCouponTx(
    params: CouponRedemptionRequest
): Promise<CouponRedemptionResult> {
    try {
        const { token, walletId } = params

        // Get or create user to ensure they exist in the system
        const userWallet = await getOrCreateUserWallet(walletId)

        // Use /coupons/claim/{userId} endpoint from the API spec
        const response = await apiClient.patch(`/coupons/claim/${userWallet.user.id}`, {
            couponId: token, // Based on API spec, it expects couponId
        })

        // API returns ClaimCouponResponse with message, transaction, and receipt
        if (response?.message || response?.transaction) {
            return {
                success: true,
                message:
                    response.message ||
                    `Coupon redeemed successfully! Check your transaction history for details.`,
                // Note: Amount would need to be extracted from transaction details if needed
            }
        } else {
            return {
                success: false,
                message: 'Coupon redemption failed',
            }
        }
    } catch (error) {
        console.error('Coupon redemption error:', error)

        if (error instanceof Error) {
            const errorMessage = error.message.toLowerCase()

            if (errorMessage.includes('expired')) {
                return {
                    success: false,
                    message: 'This coupon has expired',
                }
            }
            if (errorMessage.includes('already used') || errorMessage.includes('already claimed')) {
                return {
                    success: false,
                    message: 'This coupon has already been used',
                }
            }
            if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
                return {
                    success: false,
                    message: 'Invalid coupon code',
                }
            }
            if (errorMessage.includes('400') || errorMessage.includes('validation')) {
                return {
                    success: false,
                    message: 'Invalid coupon code',
                }
            }
        }

        return {
            success: false,
            message: 'Coupon redemption failed. Please try again.',
        }
    }
}
