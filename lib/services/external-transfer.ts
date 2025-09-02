/**
 * Transfer Service Adapter for External API
 *
 * Maps WhatsApp bot transfer operations to external Rapyd Money Stablecoin API calls
 * Uses phone numbers as user IDs for all operations
 */

import { apiClient } from '../external-api'
import { getOrCreateUserWallet } from './external-user'
import { sendPaymentReceivedNotification } from '../utils/whatsapp-webhook'

export interface TransferRequest {
    fromPhone: string
    toPhone: string
    amount: number
    idem: string // idempotency key
}

export interface TransferResult {
    success: boolean
    message: string
    transactionId?: string
}

/**
 * Transfer money between phone numbers using /transfer/{userId} endpoint
 */
export async function transferTx(params: TransferRequest): Promise<TransferResult> {
    try {
        const { fromPhone, toPhone, amount } = params

        // Ensure sender exists (auto-create if needed)
        const fromUserWallet = await getOrCreateUserWallet(fromPhone)
        // Ensure recipient exists and get their paymentIdentifier
        const toUserWallet = await getOrCreateUserWallet(toPhone)

        // Check if sender has sufficient balance
        if (fromUserWallet.wallet.balance < amount) {
            return {
                success: false,
                message: `Insufficient funds. Available: R${fromUserWallet.wallet.balance.toFixed(
                    2
                )}, Required: R${amount.toFixed(2)}`,
            }
        }

        // Execute transfer using external API /transfer/{userId} endpoint
        // API expects: { transactionAmount: number, transactionRecipient: string, transactionNotes?: string }
        // transactionRecipient should be the paymentIdentifier of the recipient
        const transferResponse = await apiClient.post(`/transfer/${fromUserWallet.user.id}`, {
            transactionAmount: amount,
            transactionRecipient: toUserWallet.user.paymentIdentifier || toPhone, // Use paymentIdentifier or fallback to phone
            transactionNotes: `Transfer from ${fromPhone} to ${toPhone}`,
        })

        if (transferResponse?.message?.includes('successful') || transferResponse?.transaction) {
            // Transfer successful - send notification to recipient
            try {
                // Get recipient's updated balance
                const recipientUpdatedWallet = await getOrCreateUserWallet(toPhone)
                const recipientBalance = recipientUpdatedWallet.wallet.balance

                // Send WhatsApp notification to recipient
                await sendPaymentReceivedNotification(toPhone, amount, fromPhone, recipientBalance)

                console.log(`WhatsApp notification sent to recipient ${toPhone}`)
            } catch (notificationError) {
                console.error(
                    'Failed to send WhatsApp notification to recipient:',
                    notificationError
                )
                // Don't fail the transfer if notification fails
            }

            return {
                success: true,
                message: `Successfully transferred R${amount.toFixed(2)} to ${toPhone}`,
                transactionId: transferResponse.transaction?.id || transferResponse.transactionId,
            }
        } else {
            return {
                success: false,
                message: transferResponse?.message || 'Transfer failed',
            }
        }
    } catch (error) {
        console.error('Transfer error:', error)

        if (error instanceof Error) {
            if (error.message.includes('insufficient') || error.message.includes('balance')) {
                return {
                    success: false,
                    message: 'Insufficient funds',
                }
            }
        }

        return {
            success: false,
            message: 'Transfer failed. Please try again.',
        }
    }
}
