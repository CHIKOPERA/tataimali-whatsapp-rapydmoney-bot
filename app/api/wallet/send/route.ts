import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { transferTx } from '@/lib/services/external-transfer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get('content-type') || ''
        let fromPhone = ''
        let toPhone = ''
        let amount = 0

        if (contentType.includes('application/json')) {
            const body = await req.json()

            // Check if request is from WhatsApp webhook (has fromPhone in body)
            if (body.fromPhone) {
                fromPhone = body.fromPhone
                toPhone = body.toPhone
                amount = body.amount
            } else {
                // Web/API request: get user from phone header
                fromPhone = req.headers.get('phone') || ''
                toPhone = body.toPhone
                amount = body.amount
            }

            if (!fromPhone) {
                return NextResponse.json({ error: 'User authentication required' }, { status: 401 })
            }

            if (!toPhone || !amount) {
                return NextResponse.json(
                    { error: 'Recipient phone and amount required' },
                    { status: 400 }
                )
            }

            await transferTx({
                fromPhone,
                toPhone,
                amount: Math.round(Number(amount) * 100),
                idem: crypto.randomUUID(),
            })

            return NextResponse.json({ status: 'sent' })
        } else {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
        }
    } catch (e) {
        console.error('Send error:', e)
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Unknown error' },
            { status: 400 }
        )
    }
}
