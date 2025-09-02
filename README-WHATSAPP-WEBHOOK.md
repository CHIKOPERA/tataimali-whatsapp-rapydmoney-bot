# WhatsApp Webhook System - Complete Implementation

## 🎯 Overview

I've created a comprehensive WhatsApp messaging webhook system that allows you to send WhatsApp messages programmatically. The system includes multiple layers for different use cases.

## 📁 Files Created

### 1. Core Webhook Endpoint

-   **`/app/api/webhooks/send-message/route.ts`** - Main webhook for sending WhatsApp messages

### 2. Utility Functions

-   **`/lib/utils/whatsapp-webhook.ts`** - TypeScript utilities for internal use
-   **`/lib/examples/whatsapp-integration.ts`** - Integration examples

### 3. Notification API

-   **`/app/api/notifications/whatsapp/route.ts`** - High-level notification endpoint

### 4. Documentation & Testing

-   **`/docs/webhooks/send-message.md`** - Complete API documentation
-   **`/scripts/test-webhook.js`** - Test script for the webhook
-   **`.env.example`** - Environment variables template

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
# In your .env file
WEBHOOK_API_KEY=your_secret_api_key
RAPYD_API_TOKEN=your_rapyd_api_token
NEXTAUTH_URL=https://your-domain.com
```

### 2. Basic Usage

#### Send Text Message

```bash
curl -X POST "https://your-domain.com/api/webhooks/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "to": "+27831234567",
    "message": "Hello from Tata Mali!",
    "type": "text"
  }'
```

#### Send Interactive Message

```bash
curl -X POST "https://your-domain.com/api/webhooks/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "to": "+27831234567",
    "message": "Choose an option:",
    "type": "interactive",
    "buttons": [
      {"id": "balance", "title": "Check Balance"},
      {"id": "send", "title": "Send Money"}
    ]
  }'
```

### 3. Using TypeScript Utilities (Internal)

```typescript
import { sendTextMessage, sendInteractiveMessage } from '@/lib/utils/whatsapp-webhook'

// Send text message
await sendTextMessage('+27831234567', 'Hello!')

// Send interactive message
await sendInteractiveMessage('+27831234567', 'Choose an option:', [
    { id: 'option1', title: 'Option 1' },
    { id: 'option2', title: 'Option 2' },
])
```

### 4. Using Notification API

```bash
curl -X POST "https://your-domain.com/api/notifications/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+27831234567",
    "type": "balance"
  }'
```

## 🔧 API Endpoints

### Primary Webhook

-   **POST** `/api/webhooks/send-message` - Send any WhatsApp message
-   **GET** `/api/webhooks/send-message` - API documentation

### Notification API

-   **POST** `/api/notifications/whatsapp` - Send predefined notifications
-   **GET** `/api/notifications/whatsapp` - API documentation

## 📋 Message Types

### 1. Text Messages

```json
{
    "to": "+27831234567",
    "message": "Your message here",
    "type": "text"
}
```

### 2. Interactive Messages

```json
{
    "to": "+27831234567",
    "message": "Choose an option:",
    "type": "interactive",
    "buttons": [
        { "id": "btn1", "title": "Button 1" },
        { "id": "btn2", "title": "Button 2" }
    ]
}
```

## 🛡️ Security Features

-   **API Key Authentication** - Required for all requests
-   **Phone Number Validation** - International format validation
-   **Rate Limiting** - Built-in error handling for rate limits
-   **Input Validation** - Message length, button count, etc.

## 📊 Pre-built Notification Types

### Balance Notification

```json
{
    "to": "+27831234567",
    "type": "balance"
}
```

### Welcome Message

```json
{
    "to": "+27831234567",
    "type": "welcome",
    "data": { "firstName": "John" }
}
```

### Transaction Notification

```json
{
    "to": "+27831234567",
    "type": "transaction",
    "data": {
        "type": "sent",
        "amount": 100,
        "recipient": "+27831234568"
    }
}
```

### Promotional Message

```json
{
    "to": "+27831234567",
    "type": "promotion",
    "data": { "campaign": "weekend_special" }
}
```

## 🔄 Integration Examples

### Enhanced Transfer with Notifications

```typescript
import { transferWithNotifications } from '@/lib/examples/whatsapp-integration'

// This will automatically send WhatsApp notifications
const result = await transferWithNotifications({
    fromPhone: '+27831234567',
    toPhone: '+27831234568',
    amount: 100,
    idem: 'unique-id',
})
```

### Send Daily Balance Summary

```typescript
import { sendDailyBalanceSummary } from '@/lib/examples/whatsapp-integration'

// Send to multiple users
await sendDailyBalanceSummary(['+27831234567', '+27831234568', '+27831234569'])
```

## 🧪 Testing

### Test Script

```bash
# Interactive mode
node scripts/test-webhook.js

# Command line mode
node scripts/test-webhook.js "+27831234567" "Hello World" "text"
node scripts/test-webhook.js "+27831234567" "Choose option" "interactive"
```

### Environment Variables for Testing

```bash
WEBHOOK_URL=http://localhost:3000/api/webhooks/send-message
WEBHOOK_API_KEY=your-api-key
```

## 📈 Use Cases

1. **Transaction Notifications** - Send payment confirmations
2. **Balance Alerts** - Notify users of balance changes
3. **Marketing Campaigns** - Send promotional messages
4. **System Alerts** - Send system notifications
5. **User Onboarding** - Welcome new users
6. **Customer Support** - Send support messages

## 🔍 Error Handling

The system handles various error scenarios:

-   Invalid phone numbers
-   Missing API keys
-   Rate limiting
-   Network errors
-   WhatsApp API errors

## 📝 Response Format

All endpoints return consistent JSON responses:

### Success

```json
{
    "success": true,
    "message": "Message sent successfully",
    "messageId": "wamid.xxx..."
}
```

### Error

```json
{
    "success": false,
    "message": "Error description"
}
```

## 🎉 Ready to Use!

The WhatsApp webhook system is now fully implemented and ready for production use. You can:

1. Send messages directly via the webhook
2. Use the TypeScript utilities in your application
3. Leverage pre-built notification types
4. Integrate with existing services
5. Test using the provided scripts

All files are properly typed, documented, and include comprehensive error handling.
