export async function sendText(to: string, body: string) {
    const phoneNumberId = process.env.WA_PHONE_NUMBER_ID
    const token = process.env.WA_TOKEN

    if (!phoneNumberId || !token) {
        console.error('Missing WhatsApp credentials:', {
            hasPhoneNumberId: !!phoneNumberId,
            hasToken: !!token,
        })
        throw new Error('Missing WhatsApp credentials')
    }

    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
    }

    console.log('Sending WhatsApp text message:', { to, body: body.substring(0, 50) + '...' })

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const result = await res.json()

        if (!res.ok) {
            console.error('WhatsApp API error:', {
                status: res.status,
                statusText: res.statusText,
                error: result,
            })
            throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`)
        }

        console.log('WhatsApp message sent successfully:', result)
        return result
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error)
        throw error
    }
}

export async function sendInteractive(
    to: string,
    body: string,
    buttons: { id: string; title: string }[]
) {
    const phoneNumberId = process.env.WA_PHONE_NUMBER_ID
    const token = process.env.WA_TOKEN

    if (!phoneNumberId || !token) {
        console.error('Missing WhatsApp credentials:', {
            hasPhoneNumberId: !!phoneNumberId,
            hasToken: !!token,
        })
        throw new Error('Missing WhatsApp credentials')
    }

    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: { text: body },
            action: {
                buttons: buttons.map((b) => ({
                    type: 'reply',
                    reply: { id: b.id, title: b.title },
                })),
            },
        },
    }

    console.log('Sending WhatsApp interactive message:', {
        to,
        body: body.substring(0, 50) + '...',
        buttonCount: buttons.length,
    })

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        const result = await res.json()

        if (!res.ok) {
            console.error('WhatsApp API error:', {
                status: res.status,
                statusText: res.statusText,
                error: result,
            })
            throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`)
        }

        console.log('WhatsApp interactive message sent successfully:', result)
        return result
    } catch (error) {
        console.error('Failed to send WhatsApp interactive message:', error)
        throw error
    }
}
