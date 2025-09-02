import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const { phoneE164, code } = await req.json()
        if (!phoneE164 || !code) {
            return NextResponse.json({ error: 'Missing phone or code' }, { status: 400 })
        }
        const codeHash = crypto.createHash('sha256').update(code).digest('hex')
        const otp = await prisma.otp.findFirst({
            where: { phoneE164, codeHash, expiresAt: { gt: new Date() } },
        })
        if (!otp) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
        // Upsert user and wallet
        const { getOrCreateUserWallet } = await import('@/lib/services/wallet')
        await getOrCreateUserWallet(phoneE164)
        // TODO: Issue JWT cookie
        return NextResponse.json({ status: 'verified' })
    } catch (e) {
        console.error('OTP verify error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
