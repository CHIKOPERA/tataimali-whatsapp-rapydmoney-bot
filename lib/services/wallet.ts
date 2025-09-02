import { prisma } from '../prisma'

export async function getUserWallet(phoneE164: string) {
    const user = await prisma.user.findUnique({ where: { phoneE164 } })
    if (!user) {
        return null
    }
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
    if (!wallet) {
        return null
    }
    return { user, wallet }
}

export async function getOrCreateUserWallet(phoneE164: string) {
    let user = await prisma.user.findUnique({ where: { phoneE164 } })
    if (!user) {
        user = await prisma.user.create({ data: { phoneE164 } })
    }
    let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
    if (!wallet) {
        wallet = await prisma.wallet.create({ data: { userId: user.id } })
    }
    return { user, wallet }
}

export async function getWalletBalance(userId: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } })
    return wallet?.balanceMinor ?? 0
}

export async function getWalletHistory(userId: string, cursor?: string) {
    return prisma.ledgerEntry.findMany({
        where: { walletId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    })
}
