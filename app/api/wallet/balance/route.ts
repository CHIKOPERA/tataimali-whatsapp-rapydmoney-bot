import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUserWallet } from '@/lib/services/external-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const phone = req.headers.get('phone')
        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
        }

        // Get user wallet from external API
        const userWallet = await getOrCreateUserWallet(phone)

        return NextResponse.json({
            balance: userWallet.wallet.balance,
        })
    } catch (e) {
        console.error('Balance error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
