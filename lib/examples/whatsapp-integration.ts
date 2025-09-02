/**
 * Example: Enhanced Transfer Service with WhatsApp Notifications
 *
 * This example shows how to integrate WhatsApp notifications
 * into the existing transfer service using the webhook.
 */

import { transferTx, TransferRequest, TransferResult } from '../services/external-transfer'
import { getOrCreateUserWallet } from '../services/external-user'
import {
    sendTransactionConfirmation,
    sendPaymentReceivedNotification,
    sendTextMessage,
    sendInteractiveMessage,
} from '../utils/whatsapp-webhook'

/**
 * Enhanced transfer function with WhatsApp notifications
 */
export async function transferWithNotifications(params: TransferRequest): Promise<TransferResult> {
    try {
        // Execute the transfer
        const transferResult = await transferTx(params)

        if (transferResult.success) {
            // Get updated balances for both users
            const [senderWallet, recipientWallet] = await Promise.all([
                getOrCreateUserWallet(params.fromPhone),
                getOrCreateUserWallet(params.toPhone),
            ])

            // Send confirmation to sender
            await sendTransactionConfirmation(
                params.fromPhone,
                params.amount,
                params.toPhone,
                senderWallet.wallet.balance
            )

            // Send notification to recipient
            await sendPaymentReceivedNotification(
                params.toPhone,
                params.amount,
                params.fromPhone,
                recipientWallet.wallet.balance
            )

            console.log('Transfer completed with notifications sent')
        } else {
            // Send failure notification to sender
            await sendTextMessage(params.fromPhone, `❌ Transfer failed: ${transferResult.message}`)
        }

        return transferResult
    } catch (error) {
        console.error('Transfer with notifications error:', error)

        // Send error notification to sender
        await sendTextMessage(
            params.fromPhone,
            '❌ Transfer failed due to a technical error. Please try again.'
        )

        throw error
    }
}

/**
 * Example: Send daily balance summary to users
 */
export async function sendDailyBalanceSummary(phoneNumbers: string[]): Promise<void> {
    console.log(`Sending daily balance summary to ${phoneNumbers.length} users...`)

    for (const phone of phoneNumbers) {
        try {
            const userWallet = await getOrCreateUserWallet(phone)
            const balance = userWallet.wallet.balance

            await sendTextMessage(
                phone,
                `📊 Daily Balance Summary\n\n💰 Your current balance: R${balance.toFixed(
                    2
                )}\n\nHave a great day with Tata Mali! 🌟`
            )

            // Add small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
            console.error(`Failed to send balance summary to ${phone}:`, error)
        }
    }

    console.log('Daily balance summary completed')
}

/**
 * Example: Send promotional messages
 */
export async function sendPromotionalMessage(
    phoneNumbers: string[],
    campaign: string
): Promise<void> {
    const promotions = {
        new_feature: {
            message:
                '🎉 New Feature Alert!\n\nTata Mali now supports instant transfers! Send money faster than ever before.',
            buttons: [
                { id: 'try_transfer', title: 'Try Transfer' },
                { id: 'learn_more', title: 'Learn More' },
            ],
        },
        weekend_special: {
            message:
                '🎯 Weekend Special!\n\nSend money to friends and family this weekend with zero fees!',
            buttons: [
                { id: 'send_money', title: 'Send Money' },
                { id: 'invite_friends', title: 'Invite Friends' },
            ],
        },
    }

    const promo = promotions[campaign as keyof typeof promotions]
    if (!promo) {
        throw new Error(`Unknown campaign: ${campaign}`)
    }

    console.log(`Sending promotional campaign "${campaign}" to ${phoneNumbers.length} users...`)

    for (const phone of phoneNumbers) {
        try {
            await sendInteractiveMessage(phone, promo.message, promo.buttons)

            // Add delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 2000))
        } catch (error) {
            console.error(`Failed to send promo to ${phone}:`, error)
        }
    }

    console.log('Promotional campaign completed')
}

// Export the enhanced functions
export * from '../utils/whatsapp-webhook'
