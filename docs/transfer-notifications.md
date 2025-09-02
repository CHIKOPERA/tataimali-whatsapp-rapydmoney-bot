# Transfer WhatsApp Notifications

## 🎯 Overview

The system now automatically sends WhatsApp notifications to recipients when they receive money transfers. This ensures that recipients are immediately aware of incoming payments and can see their updated balance.

## 🔄 How It Works

### 1. WhatsApp Bot Transfers

When users send money through the WhatsApp bot:

1. **Sender** initiates transfer through WhatsApp
2. **Transfer** is processed via the external API
3. **Sender** receives confirmation with their new balance
4. **Recipient** automatically receives WhatsApp notification with:
    - Amount received
    - Sender's phone number
    - Their updated balance
    - Interactive buttons (Check Balance, Send Money)

### 2. External System Transfers

For transfers initiated outside the WhatsApp bot (web app, API, etc.):

-   Use the `/api/transfer/notifications` endpoint
-   Automatically notifies recipient via WhatsApp
-   Optionally notify sender as well

## 📱 Recipient Notification Format

When someone receives money, they get this WhatsApp message:

```
💸 You received R100.50 from +27831234567!

💰 Your new balance: R1,250.75

[Check Balance] [Send Money]
```

## 🔧 Technical Implementation

### Core Files Modified/Created

1. **`/lib/services/external-transfer.ts`**

    - Enhanced to send recipient notifications
    - Handles notification failures gracefully

2. **`/lib/services/transfer-notifications.ts`**

    - Standalone notification service
    - Supports single, recipient-only, and bulk notifications

3. **`/app/api/transfer/notifications/route.ts`**

    - API endpoint for external systems
    - Authenticated webhook for triggering notifications

4. **`/app/api/webhooks/whatsapp/route.ts`**
    - Updated to inform sender that recipient was notified

### Integration Points

```typescript
// Automatic - happens in transferTx function
const result = await transferTx({
    fromPhone: '+27831234567',
    toPhone: '+27831234568',
    amount: 100.5,
    idem: 'unique-id',
})
// Recipient automatically gets WhatsApp notification

// Manual - for external systems
import { notifyRecipientOnly } from '@/lib/services/transfer-notifications'

await notifyRecipientOnly({
    senderPhone: '+27831234567',
    recipientPhone: '+27831234568',
    amount: 100.5,
    transactionId: 'tx_123',
})
```

## 🌐 API Endpoint for External Systems

### Endpoint

```
POST /api/transfer/notifications
```

### Authentication

```bash
X-API-Key: your-api-key
# OR
Authorization: Bearer your-api-key
```

### Examples

#### Single Transfer Notification

```bash
curl -X POST "https://your-domain.com/api/transfer/notifications" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "type": "single",
    "senderPhone": "+27831234567",
    "recipientPhone": "+27831234568",
    "amount": 100.50,
    "transactionId": "tx_123456"
  }'
```

#### Recipient Only Notification

```bash
curl -X POST "https://your-domain.com/api/transfer/notifications" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "type": "recipient_only",
    "senderPhone": "+27831234567",
    "recipientPhone": "+27831234568",
    "amount": 100.50,
    "transactionId": "tx_123456"
  }'
```

#### Bulk Transfer Notifications (Payroll)

```bash
curl -X POST "https://your-domain.com/api/transfer/notifications" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "type": "bulk",
    "senderPhone": "+27831234567",
    "transfers": [
      {"recipientPhone": "+27831234568", "amount": 1500.00, "transactionId": "tx_001"},
      {"recipientPhone": "+27831234569", "amount": 1750.00, "transactionId": "tx_002"},
      {"recipientPhone": "+27831234570", "amount": 2000.00, "transactionId": "tx_003"}
    ]
  }'
```

## 🛡️ Error Handling

### Graceful Degradation

-   Transfer success is not dependent on notification success
-   If WhatsApp notification fails, transfer still completes
-   Errors are logged but don't affect core functionality

### Notification Failure Scenarios

-   Invalid phone numbers
-   WhatsApp API rate limits
-   Network connectivity issues
-   Webhook service unavailable

### Logging

```
✅ WhatsApp notification sent to recipient +27831234568
❌ Failed to send WhatsApp notification to recipient +27831234568: Rate limit exceeded
```

## 🔄 Flow Diagrams

### WhatsApp Bot Transfer Flow

```
User sends money via WhatsApp
    ↓
Transfer processed via external API
    ↓
Transfer successful?
    ↓ YES
Sender gets confirmation ← → Recipient gets notification
    ↓                           ↓
"Transfer sent successfully"    "You received R100!"
"Recipient notified"           [Check Balance] [Send Money]
```

### External System Integration

```
External System/Web App
    ↓
POST /api/transfer/notifications
    ↓
Recipient gets WhatsApp notification
    ↓
"You received R100 from +27..."
[Check Balance] [Send Money]
```

## 📊 Benefits

1. **Instant Awareness** - Recipients know immediately about incoming payments
2. **Balance Visibility** - Updated balance shown with each notification
3. **Action Options** - Quick access to check balance or send money back
4. **Fraud Prevention** - Recipients can verify unexpected payments
5. **User Engagement** - Encourages continued use of the platform
6. **Trust Building** - Transparent, real-time communication

## 🎯 Next Steps

The recipient notification system is now fully implemented and active. Recipients will automatically receive WhatsApp notifications whenever they receive money transfers, whether initiated through:

-   WhatsApp bot conversations
-   Web application transfers
-   API-based transfers (using the notification endpoint)
-   Bulk/payroll distributions

No additional configuration is required - the system is ready for production use!
