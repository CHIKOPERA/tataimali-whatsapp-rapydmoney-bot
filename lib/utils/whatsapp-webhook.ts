/**
 * WhatsApp Webhook Integration Utilities
 *
 * This module provides helper functions to send WhatsApp messages
 * using the webhook endpoint from within the application.
 */

export interface SendMessageOptions {
    to: string
    message: string
    type?: 'text' | 'interactive'
    buttons?: Array<{ id: string; title: string }>
}

export interface SendMessageResult {
    success: boolean
    message: string
    messageId?: string
}

/**
 * Send a WhatsApp message using the internal webhook
 */
export async function sendWhatsAppMessage(options: SendMessageOptions): Promise<SendMessageResult> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const webhookUrl = `${baseUrl}/api/webhooks/send-message`
    const apiKey = process.env.WEBHOOK_API_KEY || process.env.RAPYD_API_TOKEN

    if (!apiKey) {
        throw new Error('API key not configured. Set WEBHOOK_API_KEY or RAPYD_API_TOKEN.')
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
            },
            body: JSON.stringify(options),
        })

        const result = await response.json()
        return result as SendMessageResult
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

/**
 * Send a simple text message
 */
export async function sendTextMessage(to: string, message: string): Promise<SendMessageResult> {
    return sendWhatsAppMessage({
        to,
        message,
        type: 'text',
    })
}

/**
 * Send an interactive message with buttons
 */
export async function sendInteractiveMessage(
    to: string,
    message: string,
    buttons: Array<{ id: string; title: string }>
): Promise<SendMessageResult> {
    return sendWhatsAppMessage({
        to,
        message,
        type: 'interactive',
        buttons,
    })
}

/**
 * Send a balance notification
 */
export async function sendBalanceNotification(
    to: string,
    balance: number
): Promise<SendMessageResult> {
    return sendInteractiveMessage(to, `💰 Your Tata Mali balance is R${balance.toFixed(2)}.`, [
        { id: 'send_money', title: 'Send Money' },
        { id: 'download_app', title: 'Download App' },
    ])
}

/**
 * Send a transaction confirmation
 */
export async function sendTransactionConfirmation(
    to: string,
    amount: number,
    recipient: string,
    newBalance: number
): Promise<SendMessageResult> {
    return sendTextMessage(
        to,
        `✅ Successfully sent R${amount.toFixed(
            2
        )} to ${recipient}!\n\n💰 Your new balance: R${newBalance.toFixed(2)}`
    )
}

/**
 * Send a payment received notification
 */
export async function sendPaymentReceivedNotification(
    to: string,
    amount: number,
    sender: string,
    newBalance: number
): Promise<SendMessageResult> {
    return sendInteractiveMessage(
        to,
        `💸 You received R${amount.toFixed(
            2
        )} from ${sender}!\n\n💰 Your new balance: R${newBalance.toFixed(2)}`,
        [
            { id: 'check_balance', title: 'Check Balance' },
            { id: 'send_money', title: 'Send Money' },
        ]
    )
}

/**
 * Send a welcome message for new users
 */
export async function sendWelcomeMessage(
    to: string,
    firstName?: string
): Promise<SendMessageResult> {
    const greeting = firstName ? `Hello ${firstName}!` : 'Hello!'

    return sendInteractiveMessage(
        to,
        `👋 ${greeting} Welcome to Tata Mali!\n\nYour account has been created successfully. You can now send money, check your balance, and more.`,
        [
            { id: 'check_balance', title: 'Check Balance' },
            { id: 'send_money', title: 'Send Money' },
            { id: 'download_app', title: 'Download App' },
        ]
    )
}

/**
 * Send a low balance warning
 */
export async function sendLowBalanceWarning(
    to: string,
    balance: number
): Promise<SendMessageResult> {
    return sendInteractiveMessage(
        to,
        `⚠️ Low Balance Alert!\n\nYour Tata Mali balance is only R${balance.toFixed(
            2
        )}. Consider adding funds to continue using our services.`,
        [
            { id: 'add_funds', title: 'Add Funds' },
            { id: 'download_app', title: 'Download App' },
        ]
    )
}
