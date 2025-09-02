// Test script to validate WhatsApp interactive message format
// Run this with: node test-interactive.js

const testPayload = {
    messaging_product: 'whatsapp',
    to: '27653125518',
    type: 'interactive',
    interactive: {
        type: 'button',
        body: { text: 'What would you like to do?' },
        action: {
            buttons: [
                {
                    type: 'reply',
                    reply: { id: 'check_balance', title: 'Check Balance' },
                },
                {
                    type: 'reply',
                    reply: { id: 'send_money', title: 'Send Money' },
                },
                {
                    type: 'reply',
                    reply: { id: 'download_app', title: 'Download App' },
                },
            ],
        },
    },
}

console.log('=== EXPECTED INTERACTIVE MESSAGE PAYLOAD ===')
console.log(JSON.stringify(testPayload, null, 2))

console.log('\n=== EXPECTED BUTTON CLICK RESPONSE ===')
const expectedButtonClick = {
    object: 'whatsapp_business_account',
    entry: [
        {
            id: '1096680565296415',
            changes: [
                {
                    value: {
                        messaging_product: 'whatsapp',
                        metadata: {
                            display_phone_number: '15551797706',
                            phone_number_id: '779362798589942',
                        },
                        messages: [
                            {
                                from: '27653125518',
                                id: 'wamid.HBgLMjc2NTMxMjU1MTgVAgARGBIzQTdGRDhBNzc4MjFFRTlDNUEA',
                                timestamp: '1755761447',
                                type: 'interactive',
                                interactive: {
                                    type: 'button_reply',
                                    button_reply: {
                                        id: 'check_balance',
                                        title: 'Check Balance',
                                    },
                                },
                            },
                        ],
                    },
                    field: 'messages',
                },
            ],
        },
    ],
}

console.log(JSON.stringify(expectedButtonClick, null, 2))
