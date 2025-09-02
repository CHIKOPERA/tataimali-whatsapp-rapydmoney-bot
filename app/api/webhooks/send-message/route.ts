import { NextRequest, NextResponse } from 'next/server'
import { sendText, sendInteractive } from '@/lib/wa'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SendMessageRequest {
    to: string // Phone number in international format (+27831234567)
    message: string // Message content
    type?: 'text' | 'interactive' // Message type (default: text)
    buttons?: Array<{ id: string; title: string }> // For interactive messages
}

interface SendMessageResponse {
    success: boolean
    message: string
    messageId?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<SendMessageResponse>> {
    try {
        // Parse request body
        const body: SendMessageRequest = await req.json()

        // Validate required fields
        if (!body.to || !body.message) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing required fields: to and message are required',
                },
                { status: 400 }
            )
        }

        // Validate phone number format
        if (!isValidPhoneNumber(body.to)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid phone number format. Use international format: +27831234567',
                },
                { status: 400 }
            )
        }

        // Validate message length
        if (body.message.length > 4096) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Message too long. Maximum 4096 characters allowed.',
                },
                { status: 400 }
            )
        }

        // Check API authentication (optional - you can add API key validation here)
        const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')
        if (!isValidApiKey(apiKey)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unauthorized. Valid API key required.',
                },
                { status: 401 }
            )
        }

        // Normalize phone number (remove + for WhatsApp API)
        const normalizedPhone = body.to.startsWith('+') ? body.to.substring(1) : body.to

        let messageId: string | undefined

        // Send message based on type
        if (body.type === 'interactive' && body.buttons && body.buttons.length > 0) {
            // Validate buttons
            if (body.buttons.length > 3) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Maximum 3 buttons allowed for interactive messages',
                    },
                    { status: 400 }
                )
            }

            // Validate button format
            for (const button of body.buttons) {
                if (!button.id || !button.title) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: 'Each button must have id and title fields',
                        },
                        { status: 400 }
                    )
                }
                if (button.title.length > 20) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: 'Button title must be 20 characters or less',
                        },
                        { status: 400 }
                    )
                }
            }

            // Send interactive message
            const response = await sendInteractive(normalizedPhone, body.message, body.buttons)
            messageId = response?.messages?.[0]?.id
        } else {
            // Send text message
            const response = await sendText(normalizedPhone, body.message)
            messageId = response?.messages?.[0]?.id
        }

        // Log the sent message
        console.log('Message sent via webhook:', {
            to: body.to,
            type: body.type || 'text',
            messageId,
            timestamp: new Date().toISOString(),
        })

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully',
            messageId,
        })
    } catch (error) {
        console.error('Send message webhook error:', error)

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes('phone number')) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Invalid phone number or user not found on WhatsApp',
                    },
                    { status: 400 }
                )
            }
            if (error.message.includes('rate limit')) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Rate limit exceeded. Please try again later.',
                    },
                    { status: 429 }
                )
            }
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to send message. Please try again.',
            },
            { status: 500 }
        )
    }
}

// Helper function to validate phone number format
function isValidPhoneNumber(phone: string): boolean {
    // International format: +[country code][number]
    // Must start with + and have 10-15 digits total
    return /^\+[1-9]\d{8,14}$/.test(phone)
}

// Helper function to validate API key
function isValidApiKey(apiKey: string | null): boolean {
    if (!apiKey) {
        return false
    }

    // Remove 'Bearer ' prefix if present
    const cleanKey = apiKey.replace(/^Bearer\s+/i, '')

    // Check against environment variable
    const validApiKey = process.env.WEBHOOK_API_KEY || process.env.RAPYD_API_TOKEN

    return cleanKey === validApiKey
}

// GET endpoint to test the webhook is working
export async function GET(): Promise<NextResponse> {
    return NextResponse.json({
        service: 'WhatsApp Message Webhook',
        status: 'active',
        endpoints: {
            send: 'POST /api/webhooks/send-message',
        },
        documentation: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'your-api-key-here',
            },
            body: {
                to: '+27831234567',
                message: 'Hello from Tata Mali!',
                type: 'text', // or 'interactive'
                buttons: [
                    { id: 'button1', title: 'Option 1' },
                    { id: 'button2', title: 'Option 2' },
                ],
            },
        },
    })
}
