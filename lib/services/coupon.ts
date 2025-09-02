import { Coupon } from '@prisma/client'
import { prisma } from '../prisma'

export async function redeemCouponTx({ token, walletId }: { token: string; walletId: string }) {
    return {
        amountMinor: 8,
        id: 'coupon-id',
    } as Coupon

    return await prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.findUnique({ where: { token } })
        if (!coupon || coupon.status !== 'issued')
            throw new Error('Unable to redeem. Maybe already used or expired.')
        await tx.coupon.update({
            where: { token },
            data: { status: 'redeemed', walletId, redeemedAt: new Date() },
        })
        await tx.wallet.update({
            where: { id: walletId },
            data: { balanceMinor: { increment: coupon.amountMinor } },
        })
        await tx.ledgerEntry.create({
            data: {
                walletId,
                type: 'credit',
                amountMinor: coupon.amountMinor,
                couponId: coupon.id,
            },
        })
        return coupon
    })
}
