import { NextRequest, NextResponse } from 'next/server'
import { sendInteractive, sendText } from '@/lib/wa'
import { getOrCreateUserWallet } from '@/lib/services/external-user'
import { redeemCouponTx } from '@/lib/services/external-coupon'
import { transferTx } from '@/lib/services/external-transfer'
import { ca } from 'zod/locales'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// In-memory conversation state
type WaState = {
    step: 'main' | 'await_recipient' | 'await_amount'
    tmp?: { toPhone?: string }
}

const getConversationState = (): Record<string, WaState> => {
    const globalWa = globalThis as { __waState?: Record<string, WaState> }
    return globalWa.__waState || (globalWa.__waState = {})
}

interface WhatsAppMessage {
    id: string
    from: string
    type?: string
    text?: { body: string }
    button?: { payload: string }
    interactive?: {
        type: string
        button_reply?: { id: string; title: string }
        list_reply?: { id: string; title: string }
    }
}

interface WhatsAppStatus {
    id: string
    status: string
    timestamp: string
    recipient_id: string
}

interface WhatsAppWebhook {
    entry?: Array<{
        changes?: Array<{
            value?: {
                messaging_product?: string
                metadata?: { display_phone_number: string; phone_number_id: string }
                messages?: WhatsAppMessage[]
                statuses?: WhatsAppStatus[]
            }
        }>
    }>
}
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 })
    }
    return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
    let wamid = ''

    try {
        // Get raw body text first
        const bodyText = await req.text()

        // Handle empty or non-JSON requests
        if (!bodyText || bodyText.trim() === '') {
            console.log('Empty webhook body - likely test ping')
            return NextResponse.json({ status: 'ok' })
        }

        let body: WhatsAppWebhook
        try {
            body = JSON.parse(bodyText)
        } catch (parseError) {
            console.error('JSON parse error:', parseError)
            console.log('Invalid JSON body:', bodyText)
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
        }

        // Check if this is a status update (read, delivered, etc.)
        const statusUpdate = body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]
        if (statusUpdate) {
            console.log(
                'Status update received:',
                statusUpdate.status,
                'for message:',
                statusUpdate.id
            )
            return NextResponse.json({ status: 'ok' })
        }

        // Extract message data
        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

        if (!message) {
            console.log('No message found in payload - unknown webhook type')
            return NextResponse.json({ status: 'ok' })
        }

        wamid = message.id
        const from = message.from
        const text = message.text?.body || ''
        const buttonId = message.interactive?.button_reply?.id || message.button?.payload

        console.log('Processing message:', {
            wamid,
            from,
            text,
            buttonId,
            messageType: message.type,
            interactive: message.interactive ? 'yes' : 'no',
            fullMessage: JSON.stringify(message, null, 2),
        })

        if (!wamid || !from) {
            return NextResponse.json({ error: 'Missing required message fields' }, { status: 400 })
        }

        // Normalize phone number to E.164
        const normalizedFrom = from.startsWith('+') ? from : `+${from}`
        // Log message
        await logMessage(wamid, body, buttonId, text)

        // Get conversation state
        const state = getConversationState()
        state[from] = state[from] || { step: 'main' }

        // Handle different message types with better error handling
        const claimMatch = text.match(/^claim\s+tx=(.+)$/i)

        console.log('Processing claim:', claimMatch)

        if (claimMatch) {
            await handleClaim(claimMatch[1], normalizedFrom, from)
        } else {
            // Check if user is registered before allowing other operations
            const isRegistered = await checkUserRegistration(normalizedFrom)

            if (!isRegistered && buttonId !== 'register_account') {
                await handleUnregisteredUser(from)
                return NextResponse.json({ status: 'ok' })
            }

            if (buttonId === 'check_balance') {
                await handleCheckBalance(normalizedFrom, from)
            } else if (buttonId === 'send_money') {
                await handleSendMoneyStart(from, state)
            } else if (buttonId === 'download_app') {
                await handleDownloadApp(from)
            } else if (buttonId === 'register_account') {
                await handleRegisterRedirect(from, normalizedFrom)
            } else if (state[from].step === 'await_recipient') {
                // Check for cancel first
                if (text.toLowerCase().includes('cancel')) {
                    state[from] = { step: 'main' }
                    await safeSendText(from, '✅ Send money cancelled. What would you like to do?')
                    await showMainMenu(from)
                } else {
                    await handleRecipientStep(from, text, state)
                }
            } else if (state[from].step === 'await_amount') {
                // Check for cancel first
                if (text.toLowerCase().includes('cancel')) {
                    state[from] = { step: 'main' }
                    await safeSendText(from, '✅ Send money cancelled. What would you like to do?')
                    await showMainMenu(from)
                } else {
                    await handleAmountStep(normalizedFrom, from, text, state, wamid)
                }
            } else {
                await handleUnrecognizedMessage(from, text, state)
            }
        }

        return NextResponse.json({ status: 'ok' })
    } catch (error) {
        console.error('WhatsApp webhook error:', error)

        // Log error message
        try {
            console.log('Error occurred:', {
                wamid: wamid || 'unknown',
                error: String(error),
                intent: 'error',
                timestamp: new Date().toISOString(),
            })
        } catch (logError) {
            console.error('Failed to log error:', logError)
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Helper functions
// Check if user is registered
async function checkUserRegistration(phoneE164: string): Promise<boolean> {
    try {
        const userWallet = await getOrCreateUserWallet(phoneE164)
        return userWallet !== null
    } catch (error) {
        console.error('Error checking user registration:', error)
        return false
    }
}

// Handle unregistered user
async function handleUnregisteredUser(from: string) {
    await safeSendInteractive(
        from,
        '👋 Welcome to Tata Mali!\n\nYou do not have a registered account yet. To use our banking services, you will need to create an account first.',
        [{ id: 'register_account', title: 'Create Account' }]
    )
}

// Handle registration redirect
async function handleRegisterRedirect(from: string, normalizedFrom: string) {
    const registrationUrl =
        process.env.APP_USER_REGISTER_URL || 'https://your-registration-app.com/register'
    const callbackUrl = `${
        process.env.NEXTAUTH_URL || 'https://your-app.com'
    }/api/auth/register-callback`
    const fullRegistrationUrl = `${registrationUrl}?phone=${encodeURIComponent(
        normalizedFrom
    )}&callback=${encodeURIComponent(callbackUrl)}`

    await safeSendText(
        from,
        `🔗 Click the link below to create your Tata Mali account:\n\n${fullRegistrationUrl}\n\nOnce you complete registration, you will be able to:\n• Check your balance\n• Send money to contacts\n• Receive payments\n• Access all banking features\n\nThe registration will only take a few minutes!`
    )
}

async function safeSendText(to: string, body: string): Promise<boolean> {
    try {
        await sendText(to, body)
        return true
    } catch (error) {
        console.error('Failed to send WhatsApp text message:', error)
        return false
    }
}

async function safeSendInteractive(
    to: string,
    body: string,
    buttons: { id: string; title: string }[]
): Promise<boolean> {
    try {
        await sendInteractive(to, body, buttons)
        return true
    } catch (error) {
        console.error('Failed to send WhatsApp interactive message:', error)
        return false
    }
}

async function logMessage(
    wamid: string,
    payload: WhatsAppWebhook,
    buttonId?: string,
    text?: string
) {
    try {
        console.log('Message received:', {
            wamid,
            intent: buttonId || (text?.startsWith('claim tx=') ? 'claim' : null),
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error('Failed to log message:', error)
    }
}

async function handleClaim(token: string, normalizedFrom: string, from: string) {
    try {
        const { wallet } = await getOrCreateUserWallet(normalizedFrom)

        console.log('Handling claim for wallet:', wallet)

        try {
            const coupon = await redeemCouponTx({ token, walletId: wallet.id })
            const updatedWallet = await getOrCreateUserWallet(normalizedFrom)
            const balance = updatedWallet.wallet.balance ?? 0

            await safeSendInteractive(
                from,
                `🎉 You've claimed R${
                    coupon?.amount?.toFixed(2) || '0.00'
                }. New balance is R${balance.toFixed(2)}. What would you like to do next?`,
                [
                    { id: 'check_balance', title: 'Check Balance' },
                    { id: 'send_money', title: 'Send Money' },
                    { id: 'download_app', title: 'Download App' },
                ]
            )
        } catch (error) {
            console.error('Claim error:', error)
            await safeSendText(from, 'Unable to redeem. Maybe already used or expired.')
        }
    } catch (error) {
        console.error('Claim error:', error)
        await safeSendText(from, 'Unable to redeem. Maybe already used or expired.')
    }
}

async function handleCheckBalance(normalizedFrom: string, from: string) {
    try {
        const { wallet } = await getOrCreateUserWallet(normalizedFrom)
        const balance = wallet.balance ?? 0

        await safeSendInteractive(from, `Your balance is R${balance.toFixed(2)}.`, [
            { id: 'send_money', title: 'Send Money' },
        ])
    } catch (error) {
        console.error('Check balance error:', error)
        await safeSendText(from, 'Sorry, unable to check balance right now. Please try again.')
    }
}

async function handleSendMoneyStart(from: string, state: Record<string, WaState>) {
    state[from] = { step: 'await_recipient' }
    await safeSendText(
        from,
        '💸 *Send Money*\n\nEnter recipient phone number in international format:\n\n📱 Examples:\n• +27831234567 (South Africa)\n• +1234567890 (US)\n• +44123456789 (UK)\n\nOr type "cancel" to return to main menu.'
    )
}

async function handleDownloadApp(from: string) {
    const downloadUrl = process.env.APP_DOWNLOAD_URL || 'https://your-app.com/download'
    await safeSendText(from, downloadUrl)
}

async function handleRecipientStep(from: string, text: string, state: Record<string, WaState>) {
    if (!text.trim()) {
        await safeSendText(from, '❌ Please enter a phone number. Format: +27831234567')
        return
    }

    if (isValidPhoneNumber(text)) {
        state[from] = { step: 'await_amount', tmp: { toPhone: text } }
        await safeSendText(
            from,
            `✅ Recipient: ${text}\n\nNow enter the amount in Rands (e.g., 25.50):`
        )
    } else {
        await safeSendText(
            from,
            '❌ Invalid phone number format.\n\nPlease use international format:\n• +27831234567\n• Include country code\n• Start with +'
        )
    }
}

async function handleAmountStep(
    normalizedFrom: string,
    from: string,
    text: string,
    state: Record<string, WaState>,
    wamid: string
) {
    if (!text.trim()) {
        await safeSendText(from, '❌ Please enter an amount. Format: 25.50')
        return
    }

    if (!isValidAmount(text)) {
        await safeSendText(
            from,
            '❌ Invalid amount format.\n\nValid examples:\n• 25\n• 25.50\n• 100.00\n\nPlease enter a valid amount:'
        )
        return
    }

    const amount = parseFloat(text)
    if (amount <= 0) {
        await safeSendText(
            from,
            '❌ Amount must be greater than 0.\n\nPlease enter a valid amount:'
        )
        return
    }

    if (amount > 10000) {
        await safeSendText(from, '❌ Maximum amount is R10,000.\n\nPlease enter a smaller amount:')
        return
    }

    // Check user's balance before proceeding
    try {
        const { wallet } = await getOrCreateUserWallet(normalizedFrom)
        const currentBalance = wallet.balance ?? 0

        if (currentBalance < amount) {
            await safeSendText(
                from,
                `❌ Insufficient funds!\n\n💰 Your balance: R${currentBalance.toFixed(
                    2
                )}\n💸 Requested amount: R${amount.toFixed(
                    2
                )}\n\nPlease enter a smaller amount or check your balance:`
            )
            // Show balance check option
            await safeSendInteractive(from, 'What would you like to do?', [
                { id: 'check_balance', title: 'Check Balance' },
                { id: 'send_money', title: 'Try Again' },
            ])
            // Reset to main menu
            state[from] = { step: 'main' }
            return
        }
    } catch (error) {
        console.error('Error checking balance:', error)
        await safeSendText(from, '❌ Unable to check balance. Please try again.')
        return
    }

    const toPhone = state[from].tmp?.toPhone

    if (!toPhone) {
        await safeSendText(from, "❌ Error: recipient not found. Let's start over.")
        await handleSendMoneyStart(from, state)
        return
    }

    // Proceed with transfer (balance already verified)
    await handleAmountInput(normalizedFrom, from, text, state, wamid)
}

async function handleUnrecognizedMessage(
    from: string,
    text: string,
    state: Record<string, WaState>
) {
    const currentStep = state[from]?.step || 'main'

    console.log(`Unrecognized message from ${from}: "${text}" (step: ${currentStep})`)

    if (currentStep === 'await_recipient') {
        await safeSendText(
            from,
            '❌ Invalid phone number format.\n\nPlease enter a phone number in international format:\n• +27831234567\n• +1234567890\n\nOr type "cancel" to return to main menu.'
        )
        return // Don't show main menu when waiting for recipient
    } else if (currentStep === 'await_amount') {
        await safeSendText(
            from,
            '❌ Invalid amount format.\n\nPlease enter a valid amount:\n• 25\n• 25.50\n• 100.00\n\nOr type "cancel" to return to main menu.'
        )
        return // Don't show main menu when waiting for amount
    } else {
        // Main menu - unrecognized command
        state[from] = { step: 'main' } // Ensure we're in main state

        if (text.toLowerCase().includes('help')) {
            await safeSendText(
                from,
                '📋 *Available Commands:*\n\n• Type "balance" to check balance\n• Type "send" to send money\n• Type "download" for app link\n• Or use the buttons below:'
            )
        } else if (text.toLowerCase().includes('cancel')) {
            await safeSendText(from, '✅ Cancelled. What would you like to do?')
        } else {
            await safeSendText(
                from,
                '❓ I didn\'t understand that message.\n\nType "help" for commands or use the buttons below:'
            )
        }

        // Always show main menu for unrecognized messages in main state
        await showMainMenu(from)
    }
}

function isValidPhoneNumber(phone: string): boolean {
    // International format: +[country code][number]
    // Must start with + and have 10-15 digits total
    return /^\+[1-9]\d{8,14}$/.test(phone)
}

async function handleAmountInput(
    normalizedFrom: string,
    from: string,
    text: string,
    state: Record<string, WaState>,
    wamid: string
) {
    const toPhone = state[from].tmp?.toPhone
    const amount = parseFloat(text)

    if (!toPhone) {
        await safeSendText(from, 'Error: recipient not found. Please start over.')
        state[from] = { step: 'main' }
        return
    }

    try {
        // Attempt the transfer (balance was already verified in handleAmountStep)
        const transferResult = await transferTx({
            fromPhone: normalizedFrom,
            toPhone,
            amount: amount,
            idem: wamid,
        })

        if (transferResult.success) {
            // Get updated balance after successful transfer
            const updatedWallet = await getOrCreateUserWallet(normalizedFrom)
            const balance = updatedWallet.wallet.balance ?? 0

            await safeSendText(
                from,
                `✅ Successfully sent R${amount.toFixed(
                    2
                )} to ${toPhone}!\n\n💰 Your new balance: R${balance.toFixed(
                    2
                )}\n\n📱 The recipient has been notified via WhatsApp.`
            )
        } else {
            // Transfer failed - show the error message from the transfer service
            await safeSendText(from, `❌ Transfer failed: ${transferResult.message}`)
        }
    } catch (error) {
        console.error('Transfer error:', error)

        // Get current balance to show user
        try {
            const { wallet } = await getOrCreateUserWallet(normalizedFrom)
            const balance = wallet.balance ?? 0
            await safeSendText(
                from,
                `❌ Transfer failed due to an error.\n\n💰 Your current balance: R${balance.toFixed(
                    2
                )}\n\nPlease try again.`
            )
        } catch {
            await safeSendText(from, '❌ Transfer failed. Please try again.')
        }
    }

    // Always return to main menu after transfer attempt
    state[from] = { step: 'main' }
    await showMainMenu(from)
}

async function showMainMenu(from: string) {
    await safeSendInteractive(from, 'What would you like to do?', [
        { id: 'check_balance', title: 'Check Balance' },
        { id: 'send_money', title: 'Send Money' },
        { id: 'download_app', title: 'Download App' },
    ])
}

function isValidAmount(text: string): boolean {
    return /^[0-9]+(\.[0-9]{1,2})?$/.test(text)
}
