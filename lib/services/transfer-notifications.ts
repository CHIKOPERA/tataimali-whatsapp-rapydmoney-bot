/**
 * Transfer Notification Service
 *
 * This service handles sending WhatsApp notifications for transfers
 * that happen outside of the WhatsApp bot flow (e.g., web app, API)
 */

import { getOrCreateUserWallet } from '../services/external-user'
import {
    sendPaymentReceivedNotification,
    sendTransactionConfirmation,
} from '../utils/whatsapp-webhook'

export interface TransferNotificationData {
    senderPhone: string
    recipientPhone: string
    amount: number
    transactionId?: string
}

/**
 * Send WhatsApp notifications for a completed transfer
 * This function can be called from anywhere in the application
 */
export async function notifyTransferParties(data: TransferNotificationData): Promise<void> {
    const { senderPhone, recipientPhone, amount, transactionId } = data

    try {
        // Get updated balances for both parties
        const [senderWallet, recipientWallet] = await Promise.all([
            getOrCreateUserWallet(senderPhone),
            getOrCreateUserWallet(recipientPhone),
        ])

        // Send notifications in parallel
        const notifications = [
            // Notify sender of successful transfer
            sendTransactionConfirmation(
                senderPhone,
                amount,
                recipientPhone,
                senderWallet.wallet.balance
            ),
            // Notify recipient of received payment
            sendPaymentReceivedNotification(
                recipientPhone,
                amount,
                senderPhone,
                recipientWallet.wallet.balance
            ),
        ]

        const results = await Promise.allSettled(notifications)

        // Log results
        results.forEach((result, index) => {
            const party = index === 0 ? 'sender' : 'recipient'
            const phone = index === 0 ? senderPhone : recipientPhone

            if (result.status === 'fulfilled') {
                console.log(`✅ WhatsApp notification sent to ${party} (${phone})`)
            } else {
                console.error(
                    `❌ Failed to send WhatsApp notification to ${party} (${phone}):`,
                    result.reason
                )
            }
        })

        console.log(
            `Transfer notifications completed for transaction ${transactionId || 'unknown'}`
        )
    } catch (error) {
        console.error('Error sending transfer notifications:', error)
    }
}

/**
 * Send WhatsApp notification only to the recipient
 * Useful when sender confirmation is handled elsewhere
 */
export async function notifyRecipientOnly(data: TransferNotificationData): Promise<void> {
    const { senderPhone, recipientPhone, amount, transactionId } = data

    try {
        // Get recipient's updated balance
        const recipientWallet = await getOrCreateUserWallet(recipientPhone)

        // Send notification to recipient
        const result = await sendPaymentReceivedNotification(
            recipientPhone,
            amount,
            senderPhone,
            recipientWallet.wallet.balance
        )

        if (result.success) {
            console.log(
                `✅ WhatsApp notification sent to recipient ${recipientPhone} for transaction ${
                    transactionId || 'unknown'
                }`
            )
        } else {
            console.error(
                `❌ Failed to send WhatsApp notification to recipient ${recipientPhone}:`,
                result.message
            )
        }
    } catch (error) {
        console.error('Error sending recipient notification:', error)
    }
}

/**
 * Send bulk transfer notifications for multiple recipients
 * Useful for payroll or promotional distributions
 */
export async function notifyBulkTransfer(
    senderPhone: string,
    transfers: Array<{ recipientPhone: string; amount: number; transactionId?: string }>
): Promise<void> {
    console.log(`Sending bulk transfer notifications for ${transfers.length} recipients...`)

    for (const transfer of transfers) {
        try {
            await notifyRecipientOnly({
                senderPhone,
                recipientPhone: transfer.recipientPhone,
                amount: transfer.amount,
                transactionId: transfer.transactionId,
            })

            // Add small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
            console.error(`Failed to notify recipient ${transfer.recipientPhone}:`, error)
        }
    }

    console.log('Bulk transfer notifications completed')
}
