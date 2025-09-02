import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUserWallet } from '@/lib/services/external-user'

export async function GET(request: NextRequest) {
    try {
        const phone = request.headers.get('phone')

        if (!phone) {
            return NextResponse.json({ error: 'Phone number required' }, { status: 400 })
        }

        // Get user from external API
        const userWallet = await getOrCreateUserWallet(phone)

        return NextResponse.json({
            phoneE164: userWallet.user.phone,
            email: userWallet.user.email,
            firstName: userWallet.user.firstName,
            lastName: userWallet.user.lastName,
            createdAt: userWallet.user.createdAt,
        })
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
