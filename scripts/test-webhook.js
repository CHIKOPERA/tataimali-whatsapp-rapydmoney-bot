#!/usr/bin/env node

/**
 * Test script for the WhatsApp Send Message Webhook
 *
 * Usage:
 * node scripts/test-webhook.js [phone_number] [message] [type]
 *
 * Examples:
 * node scripts/test-webhook.js "+27831234567" "Hello World"
 * node scripts/test-webhook.js "+27831234567" "Choose option" "interactive"
 */

const readline = require('readline')

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/send-message'
const API_KEY = process.env.WEBHOOK_API_KEY || process.env.RAPYD_API_TOKEN

if (!API_KEY) {
    console.error(
        '❌ Error: API key not found. Set WEBHOOK_API_KEY or RAPYD_API_TOKEN environment variable.'
    )
    process.exit(1)
}

// Get command line arguments
const args = process.argv.slice(2)
const phoneNumber = args[0]
const message = args[1]
const messageType = args[2] || 'text'

// Interactive mode if no arguments provided
if (!phoneNumber || !message) {
    console.log('🚀 WhatsApp Message Webhook Test\n')

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.question('📱 Enter phone number (e.g., +27831234567): ', (phone) => {
        rl.question('💬 Enter message: ', (msg) => {
            rl.question('📋 Message type (text/interactive) [text]: ', (type) => {
                rl.close()

                const msgType = type.trim() || 'text'

                if (msgType === 'interactive') {
                    testInteractiveMessage(phone, msg)
                } else {
                    testTextMessage(phone, msg)
                }
            })
        })
    })
} else {
    // Command line mode
    if (messageType === 'interactive') {
        testInteractiveMessage(phoneNumber, message)
    } else {
        testTextMessage(phoneNumber, message)
    }
}

// Test text message
async function testTextMessage(to, text) {
    console.log('📤 Sending text message...')

    const payload = {
        to,
        message: text,
        type: 'text',
    }

    await sendMessage(payload)
}

// Test interactive message
async function testInteractiveMessage(to, text) {
    console.log('📤 Sending interactive message...')

    const payload = {
        to,
        message: text,
        type: 'interactive',
        buttons: [
            { id: 'option1', title: 'Option 1' },
            { id: 'option2', title: 'Option 2' },
            { id: 'option3', title: 'Option 3' },
        ],
    }

    await sendMessage(payload)
}

// Send message to webhook
async function sendMessage(payload) {
    try {
        console.log('🔗 Webhook URL:', WEBHOOK_URL)
        console.log('📋 Payload:', JSON.stringify(payload, null, 2))
        console.log('⏳ Sending...\n')

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY,
            },
            body: JSON.stringify(payload),
        })

        const result = await response.json()

        if (response.ok && result.success) {
            console.log('✅ Success!')
            console.log('📨 Message ID:', result.messageId)
            console.log('📄 Response:', JSON.stringify(result, null, 2))
        } else {
            console.log('❌ Failed!')
            console.log('📄 Response:', JSON.stringify(result, null, 2))
            console.log('🔢 Status Code:', response.status)
        }
    } catch (error) {
        console.error('❌ Error:', error.message)

        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure your server is running on the correct port.')
        }
    }
}

// Test webhook availability
async function testWebhookHealth() {
    try {
        console.log('🔍 Testing webhook availability...')

        const response = await fetch(WEBHOOK_URL, {
            method: 'GET',
        })

        if (response.ok) {
            const result = await response.json()
            console.log('✅ Webhook is available')
            console.log('📋 Service info:', JSON.stringify(result, null, 2))
            return true
        } else {
            console.log('⚠️ Webhook returned status:', response.status)
            return false
        }
    } catch (error) {
        console.log('❌ Webhook not available:', error.message)
        return false
    }
}

// Export functions for programmatic use
module.exports = {
    testTextMessage,
    testInteractiveMessage,
    testWebhookHealth,
}
