import { NextRequest, NextResponse } from 'next/server'
import {
    notifyTransferParties,
    notifyRecipientOnly,
    notifyBulkTransfer,
} from '@/lib/services/transfer-notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface TransferNotificationRequest {
    type: 'single' | 'recipient_only' | 'bulk'
    senderPhone: string
    recipientPhone?: string // Required for 'single' and 'recipient_only'
    amount?: number // Required for 'single' and 'recipient_only'
    transactionId?: string
    transfers?: Array<{
        // Required for 'bulk'
        recipientPhone: string
        amount: number
        transactionId?: string
    }>
}

/**
 * API endpoint for triggering transfer notifications
 * POST /api/transfer/notifications
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body: TransferNotificationRequest = await req.json()

        // Validate API key
        const apiKey =
            req.headers.get('x-api-key') ||
            req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
        const validApiKey = process.env.WEBHOOK_API_KEY || process.env.RAPYD_API_TOKEN

        if (!apiKey || apiKey !== validApiKey) {
            return NextResponse.json(
                { error: 'Unauthorized. Valid API key required.' },
                { status: 401 }
            )
        }

        // Validate request body
        if (!body.type || !body.senderPhone) {
            return NextResponse.json(
                { error: 'Missing required fields: type and senderPhone' },
                { status: 400 }
            )
        }

        // Validate phone number format
        const phonePattern = /^\+[1-9]\d{8,14}$/
        if (!phonePattern.test(body.senderPhone)) {
            return NextResponse.json(
                { error: 'Invalid senderPhone format. Use international format: +27831234567' },
                { status: 400 }
            )
        }

        switch (body.type) {
            case 'single':
                if (!body.recipientPhone || typeof body.amount !== 'number') {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields for single notification: recipientPhone and amount',
                        },
                        { status: 400 }
                    )
                }

                if (!phonePattern.test(body.recipientPhone)) {
                    return NextResponse.json(
                        {
                            error: 'Invalid recipientPhone format. Use international format: +27831234567',
                        },
                        { status: 400 }
                    )
                }

                if (body.amount <= 0) {
                    return NextResponse.json(
                        { error: 'Amount must be greater than 0' },
                        { status: 400 }
                    )
                }

                await notifyTransferParties({
                    senderPhone: body.senderPhone,
                    recipientPhone: body.recipientPhone,
                    amount: body.amount,
                    transactionId: body.transactionId,
                })

                return NextResponse.json({
                    success: true,
                    message: 'Transfer notifications sent to both parties',
                })

            case 'recipient_only':
                if (!body.recipientPhone || typeof body.amount !== 'number') {
                    return NextResponse.json(
                        {
                            error: 'Missing required fields for recipient notification: recipientPhone and amount',
                        },
                        { status: 400 }
                    )
                }

                if (!phonePattern.test(body.recipientPhone)) {
                    return NextResponse.json(
                        {
                            error: 'Invalid recipientPhone format. Use international format: +27831234567',
                        },
                        { status: 400 }
                    )
                }

                if (body.amount <= 0) {
                    return NextResponse.json(
                        { error: 'Amount must be greater than 0' },
                        { status: 400 }
                    )
                }

                await notifyRecipientOnly({
                    senderPhone: body.senderPhone,
                    recipientPhone: body.recipientPhone,
                    amount: body.amount,
                    transactionId: body.transactionId,
                })

                return NextResponse.json({
                    success: true,
                    message: 'Transfer notification sent to recipient',
                })

            case 'bulk':
                if (
                    !body.transfers ||
                    !Array.isArray(body.transfers) ||
                    body.transfers.length === 0
                ) {
                    return NextResponse.json(
                        { error: 'Missing or empty transfers array for bulk notification' },
                        { status: 400 }
                    )
                }

                // Validate each transfer
                for (const transfer of body.transfers) {
                    if (!transfer.recipientPhone || typeof transfer.amount !== 'number') {
                        return NextResponse.json(
                            { error: 'Each transfer must have recipientPhone and amount' },
                            { status: 400 }
                        )
                    }

                    if (!phonePattern.test(transfer.recipientPhone)) {
                        return NextResponse.json(
                            {
                                error: `Invalid recipientPhone format: ${transfer.recipientPhone}. Use international format: +27831234567`,
                            },
                            { status: 400 }
                        )
                    }

                    if (transfer.amount <= 0) {
                        return NextResponse.json(
                            {
                                error: `Amount must be greater than 0 for recipient ${transfer.recipientPhone}`,
                            },
                            { status: 400 }
                        )
                    }
                }

                await notifyBulkTransfer(body.senderPhone, body.transfers)

                return NextResponse.json({
                    success: true,
                    message: `Bulk transfer notifications sent to ${body.transfers.length} recipients`,
                })

            default:
                return NextResponse.json(
                    {
                        error: 'Invalid notification type. Must be: single, recipient_only, or bulk',
                    },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Transfer notification API error:', error)
        return NextResponse.json(
            { error: 'Failed to send transfer notifications' },
            { status: 500 }
        )
    }
}

/**
 * GET endpoint for documentation
 */
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        service: 'Transfer Notifications API',
        description: 'Send WhatsApp notifications for money transfers',
        endpoints: {
            single: 'POST /api/transfer/notifications with type: "single"',
            recipient_only: 'POST /api/transfer/notifications with type: "recipient_only"',
            bulk: 'POST /api/transfer/notifications with type: "bulk"',
        },
        examples: {
            single: {
                type: 'single',
                senderPhone: '+27831234567',
                recipientPhone: '+27831234568',
                amount: 100.5,
                transactionId: 'tx_123456',
            },
            recipient_only: {
                type: 'recipient_only',
                senderPhone: '+27831234567',
                recipientPhone: '+27831234568',
                amount: 100.5,
                transactionId: 'tx_123456',
            },
            bulk: {
                type: 'bulk',
                senderPhone: '+27831234567',
                transfers: [
                    { recipientPhone: '+27831234568', amount: 100.5, transactionId: 'tx_123456' },
                    { recipientPhone: '+27831234569', amount: 200.0, transactionId: 'tx_123457' },
                ],
            },
        },
        authentication: {
            header: 'X-API-Key: your-api-key',
            alternative: 'Authorization: Bearer your-api-key',
        },
    })
}
