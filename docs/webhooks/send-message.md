# WhatsApp Message Webhook API

This webhook allows you to send WhatsApp messages programmatically to any phone number.

## Endpoint

```
POST /api/webhooks/send-message
```

## Authentication

Include your API key in the request headers:

```bash
X-API-Key: your-api-key-here
# OR
Authorization: Bearer your-api-key-here
```

## Request Body

### Text Message

```json
{
    "to": "+27831234567",
    "message": "Hello! This is a message from Tata Mali.",
    "type": "text"
}
```

### Interactive Message with Buttons

```json
{
    "to": "+27831234567",
    "message": "Welcome to Tata Mali! What would you like to do?",
    "type": "interactive",
    "buttons": [
        {
            "id": "check_balance",
            "title": "Check Balance"
        },
        {
            "id": "send_money",
            "title": "Send Money"
        },
        {
            "id": "download_app",
            "title": "Download App"
        }
    ]
}
```

## Response

### Success Response

```json
{
    "success": true,
    "message": "Message sent successfully",
    "messageId": "wamid.HBgNMjc4MzEyMzQ1NjcVAgA..."
}
```

### Error Response

```json
{
    "success": false,
    "message": "Error description"
}
```

## Examples

### Using cURL

#### Send Text Message

```bash
curl -X POST "https://your-domain.com/api/webhooks/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "to": "+27831234567",
    "message": "Hello from Tata Mali! Your payment has been processed.",
    "type": "text"
  }'
```

#### Send Interactive Message

```bash
curl -X POST "https://your-domain.com/api/webhooks/send-message" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "to": "+27831234567",
    "message": "Welcome to Tata Mali! What would you like to do?",
    "type": "interactive",
    "buttons": [
      {"id": "balance", "title": "Check Balance"},
      {"id": "send", "title": "Send Money"}
    ]
  }'
```

### Using JavaScript/Node.js

```javascript
const sendWhatsAppMessage = async (to, message, options = {}) => {
    const response = await fetch('https://your-domain.com/api/webhooks/send-message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'your-api-key-here',
        },
        body: JSON.stringify({
            to,
            message,
            type: options.type || 'text',
            buttons: options.buttons,
        }),
    })

    return await response.json()
}

// Send text message
const result = await sendWhatsAppMessage('+27831234567', 'Hello! Your transaction was successful.')

// Send interactive message
const interactiveResult = await sendWhatsAppMessage('+27831234567', 'Choose an option:', {
    type: 'interactive',
    buttons: [
        { id: 'option1', title: 'Option 1' },
        { id: 'option2', title: 'Option 2' },
    ],
})
```

### Using Python

```python
import requests
import json

def send_whatsapp_message(to, message, message_type='text', buttons=None):
    url = 'https://your-domain.com/api/webhooks/send-message'
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here'
    }

    data = {
        'to': to,
        'message': message,
        'type': message_type
    }

    if buttons:
        data['buttons'] = buttons

    response = requests.post(url, headers=headers, data=json.dumps(data))
    return response.json()

# Send text message
result = send_whatsapp_message(
    '+27831234567',
    'Hello! Your payment was successful.'
)

# Send interactive message
interactive_result = send_whatsapp_message(
    '+27831234567',
    'Choose an option:',
    message_type='interactive',
    buttons=[
        {'id': 'option1', 'title': 'Option 1'},
        {'id': 'option2', 'title': 'Option 2'}
    ]
)
```

## Validation Rules

-   **Phone Number**: Must be in international format (+27831234567)
-   **Message**: Maximum 4096 characters
-   **Buttons**: Maximum 3 buttons for interactive messages
-   **Button Title**: Maximum 20 characters per button title
-   **API Key**: Required in headers

## Error Codes

-   `400` - Bad Request (invalid phone number, missing fields, etc.)
-   `401` - Unauthorized (invalid or missing API key)
-   `429` - Rate Limit Exceeded
-   `500` - Internal Server Error

## Environment Variables

Make sure to set these environment variables:

```bash
WEBHOOK_API_KEY=your-secret-api-key
# OR use the existing Rapyd API token
RAPYD_API_TOKEN=your-rapyd-api-token
```

## Use Cases

1. **Transaction Notifications**: Send payment confirmations
2. **Marketing Messages**: Send promotional content with action buttons
3. **Customer Support**: Send support messages with quick reply options
4. **System Alerts**: Send system notifications to administrators
5. **User Onboarding**: Send welcome messages with setup instructions
