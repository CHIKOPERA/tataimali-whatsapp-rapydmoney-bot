import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendText } from '@/lib/wa'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const { phoneE164 } = await req.json()
        if (!phoneE164) {
            return NextResponse.json({ error: 'Missing phone number' }, { status: 400 })
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        const codeHash = crypto.createHash('sha256').update(code).digest('hex')
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
        await prisma.otp.create({
            data: { phoneE164, codeHash, expiresAt },
        })
        // Send WhatsApp template message via Graph API
        await sendText(phoneE164, `Your code is ${code}`)
        return NextResponse.json({ status: 'sent' })
    } catch (e) {
        console.error('OTP send error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
