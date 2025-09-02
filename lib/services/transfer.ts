import { prisma } from '../prisma'

export async function transferTx({
    fromPhone,
    toPhone,
    amountMinor,
    idem,
}: {
    fromPhone: string
    toPhone: string
    amountMinor: number
    idem: string
}) {
    return await prisma.$transaction(async (tx) => {
        const fromUser = await tx.user.findUnique({ where: { phoneE164: fromPhone } })
        const toUser = await tx.user.findUnique({ where: { phoneE164: toPhone } })
        if (!fromUser || !toUser) throw new Error('User not found')
        const fromWallet = await tx.wallet.findUnique({ where: { userId: fromUser.id } })
        const toWallet = await tx.wallet.findUnique({ where: { userId: toUser.id } })
        if (!fromWallet || !toWallet) throw new Error('Wallet not found')

        console.log('Wallets', fromWallet, 'toWallet', toWallet)

        if (fromWallet.balanceMinor < amountMinor) throw new Error('Insufficient funds')
        const transfer = await tx.transfer.upsert({
            where: { idempotencyKey: idem },
            update: {},
            create: {
                fromWalletId: fromWallet.id,
                toWalletId: toWallet.id,
                amountMinor,
                idempotencyKey: idem,
            },
        })
        await tx.wallet.update({
            where: { id: fromWallet.id },
            data: { balanceMinor: { decrement: amountMinor } },
        })
        await tx.wallet.update({
            where: { id: toWallet.id },
            data: { balanceMinor: { increment: amountMinor } },
        })
        await tx.ledgerEntry.create({
            data: { walletId: fromWallet.id, type: 'debit', amountMinor, transferId: transfer.id },
        })
        await tx.ledgerEntry.create({
            data: { walletId: toWallet.id, type: 'credit', amountMinor, transferId: transfer.id },
        })
        return transfer
    })
}
