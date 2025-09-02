import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendText } from '@/lib/wa'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const phoneNumber = searchParams.get('phone')
        const status = searchParams.get('status')

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
        }

        // Normalize phone number to E.164
        const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`

        if (status === 'success') {
            // Check if user was successfully created
            const user = await prisma.user.findUnique({
                where: { phoneE164: normalizedPhone },
            })

            if (user) {
                // Welcome the user back to WhatsApp
                const welcomeMessage = `🎉 Welcome to Tata Mali!

Your account has been successfully created. You can now:

💰 Check your balance
💸 Send money to contacts
📱 Use all our banking features

What would you like to do first?`

                try {
                    await sendText(normalizedPhone, welcomeMessage)
                    console.log(`Sent welcome message to registered user: ${normalizedPhone}`)
                } catch (error) {
                    console.error('Failed to send welcome message:', error)
                }

                return NextResponse.redirect(new URL('/registration-success', req.url))
            } else {
                return NextResponse.redirect(
                    new URL('/registration-error?error=user_not_found', req.url)
                )
            }
        } else if (status === 'error') {
            const errorMessage = searchParams.get('error') || 'unknown'

            // Inform user about registration failure
            const failureMessage = `❌ Registration was not completed.

Please try again or contact support if you continue to have issues.

You can start over by scanning the QR code again.`

            try {
                await sendText(normalizedPhone, failureMessage)
                console.log(`Sent registration failure message to: ${normalizedPhone}`)
            } catch (error) {
                console.error('Failed to send failure message:', error)
            }

            return NextResponse.redirect(
                new URL(`/registration-error?error=${errorMessage}`, req.url)
            )
        } else {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }
    } catch (error) {
        console.error('Registration callback error:', error)
        return NextResponse.json(
            { error: 'Failed to process registration callback' },
            { status: 500 }
        )
    }
}
