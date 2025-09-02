import { NextRequest, NextResponse } from 'next/server'
import { sendText } from '@/lib/wa'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function generateConfirmationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { phoneNumber } = body

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
        }

        // Normalize phone number to E.164
        const normalizedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`

        // Validate phone number format
        if (!/^\+[1-9]\d{8,14}$/.test(normalizedPhone)) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
        }

        // Generate confirmation code
        const code = generateConfirmationCode()

        // Store or update OTP in database
        // First try to find existing OTP for this phone number
        const existingOtp = await prisma.otp.findFirst({
            where: { phoneE164: normalizedPhone },
        })

        if (existingOtp) {
            // Update existing OTP
            await prisma.otp.update({
                where: { id: existingOtp.id },
                data: {
                    codeHash: code, // Using codeHash field as per schema
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                },
            })
        } else {
            // Create new OTP
            await prisma.otp.create({
                data: {
                    phoneE164: normalizedPhone,
                    codeHash: code, // Using codeHash field as per schema
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
                },
            })
        }

        // Send confirmation code via WhatsApp
        const message = `Welcome to Tata Mali! 🎉

Your verification code is: *${code}*

This code will expire in 10 minutes. Please enter it in the registration form to complete your account setup.

Need help? Just reply to this message.`

        try {
            await sendText(normalizedPhone, message)

            console.log(`Sent confirmation code ${code} to ${normalizedPhone}`)

            return NextResponse.json({
                success: true,
                message: 'Confirmation code sent successfully',
            })
        } catch (whatsappError) {
            console.error('Failed to send WhatsApp message:', whatsappError)

            // Still return success since the code was stored, user can try again
            return NextResponse.json({
                success: true,
                message:
                    'Confirmation code generated. Please try requesting again if you did not receive it.',
            })
        }
    } catch (error) {
        console.error('Send confirmation error:', error)
        return NextResponse.json({ error: 'Failed to send confirmation code' }, { status: 500 })
    }
}
