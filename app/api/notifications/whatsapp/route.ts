import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppMessage } from '@/lib/utils/whatsapp-webhook'
import { getOrCreateUserWallet } from '@/lib/services/external-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface NotificationRequest {
    type: 'balance' | 'welcome' | 'transaction' | 'promotion'
    to: string
    data?: Record<string, unknown>
}

/**
 * API endpoint for sending various types of WhatsApp notifications
 * POST /api/notifications/whatsapp
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body: NotificationRequest = await req.json()

        if (!body.to || !body.type) {
            return NextResponse.json(
                { error: 'Missing required fields: to and type' },
                { status: 400 }
            )
        }

        // Validate phone number format
        if (!/^\+[1-9]\d{8,14}$/.test(body.to)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
        }

        let result

        switch (body.type) {
            case 'balance':
                result = await sendBalanceNotification(body.to)
                break

            case 'welcome':
                result = await sendWelcomeNotification(body.to, body.data?.firstName as string)
                break

            case 'transaction':
                result = await sendTransactionNotification(body.to, body.data)
                break

            case 'promotion':
                result = await sendPromotionNotification(body.to, body.data?.campaign as string)
                break

            default:
                return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Notification API error:', error)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}

async function sendBalanceNotification(to: string) {
    const userWallet = await getOrCreateUserWallet(to)
    const balance = userWallet.wallet.balance

    return sendWhatsAppMessage({
        to,
        message: `💰 Your Tata Mali balance is R${balance.toFixed(2)}.`,
        type: 'interactive',
        buttons: [
            { id: 'send_money', title: 'Send Money' },
            { id: 'download_app', title: 'Download App' },
        ],
    })
}

async function sendWelcomeNotification(to: string, firstName?: string) {
    const greeting = firstName ? `Hello ${firstName}!` : 'Hello!'

    return sendWhatsAppMessage({
        to,
        message: `👋 ${greeting} Welcome to Tata Mali!\n\nYour account has been created successfully. You can now send money, check your balance, and more.`,
        type: 'interactive',
        buttons: [
            { id: 'check_balance', title: 'Check Balance' },
            { id: 'send_money', title: 'Send Money' },
            { id: 'download_app', title: 'Download App' },
        ],
    })
}

async function sendTransactionNotification(to: string, data?: Record<string, unknown>) {
    const amount = data?.amount as number
    const recipient = data?.recipient as string
    const type = data?.type as string

    if (type === 'sent') {
        return sendWhatsAppMessage({
            to,
            message: `✅ Successfully sent R${amount?.toFixed(2)} to ${recipient}!`,
            type: 'text',
        })
    } else if (type === 'received') {
        const sender = data?.sender as string
        return sendWhatsAppMessage({
            to,
            message: `💸 You received R${amount?.toFixed(2)} from ${sender}!`,
            type: 'interactive',
            buttons: [
                { id: 'check_balance', title: 'Check Balance' },
                { id: 'send_money', title: 'Send Money' },
            ],
        })
    }

    return { success: false, message: 'Invalid transaction type' }
}

async function sendPromotionNotification(to: string, campaign?: string) {
    const campaigns = {
        new_feature: {
            message: '🎉 New Feature Alert!\n\nTata Mali now supports instant transfers!',
            buttons: [
                { id: 'try_transfer', title: 'Try Transfer' },
                { id: 'learn_more', title: 'Learn More' },
            ],
        },
        weekend_special: {
            message: '🎯 Weekend Special!\n\nSend money with zero fees this weekend!',
            buttons: [
                { id: 'send_money', title: 'Send Money' },
                { id: 'invite_friends', title: 'Invite Friends' },
            ],
        },
    }

    const promo = campaigns[campaign as keyof typeof campaigns]
    if (!promo) {
        return { success: false, message: 'Unknown campaign' }
    }

    return sendWhatsAppMessage({
        to,
        message: promo.message,
        type: 'interactive',
        buttons: promo.buttons,
    })
}

/**
 * GET endpoint for documentation
 */
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        service: 'WhatsApp Notifications API',
        endpoints: {
            balance: 'POST /api/notifications/whatsapp with type: "balance"',
            welcome: 'POST /api/notifications/whatsapp with type: "welcome"',
            transaction: 'POST /api/notifications/whatsapp with type: "transaction"',
            promotion: 'POST /api/notifications/whatsapp with type: "promotion"',
        },
        examples: {
            balance: {
                to: '+27831234567',
                type: 'balance',
            },
            welcome: {
                to: '+27831234567',
                type: 'welcome',
                data: { firstName: 'John' },
            },
            transaction: {
                to: '+27831234567',
                type: 'transaction',
                data: {
                    type: 'sent',
                    amount: 100,
                    recipient: '+27831234568',
                },
            },
            promotion: {
                to: '+27831234567',
                type: 'promotion',
                data: { campaign: 'weekend_special' },
            },
        },
    })
}
