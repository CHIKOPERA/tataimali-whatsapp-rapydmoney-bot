import { NextRequest, NextResponse } from 'next/server'
import { getWalletHistory } from '@/lib/services/external-transactions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const phone = req.headers.get('phone')
        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
        }

        // Get transaction history from external API
        const transactions = await getWalletHistory(phone)

        return NextResponse.json(transactions)
    } catch (e) {
        console.error('History error:', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
