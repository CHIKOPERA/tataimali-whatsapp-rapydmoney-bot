# QR Code Registration Flow

This document explains the QR code registration flow for unregistered users in the Tata Mali WhatsApp bot.

## Overview

When a user scans a QR code and interacts with the WhatsApp bot without having a registered account, they are redirected to a registration site to create their account before they can use banking features.

## Flow Components

### 1. Environment Variables

Add to your `.env` file:

```
APP_USER_REGISTER_URL=https://your-registration-app.com/register
```

This URL points to your external registration application.

### 2. User Registration Check

The WhatsApp webhook now checks if a user is registered before allowing access to banking features:

-   **Registered users**: Get normal banking menu (Check Balance, Send Money, Download App)
-   **Unregistered users**: Get registration prompt with "Create Account" button

### 3. Registration Redirect

When an unregistered user clicks "Create Account", they receive a registration link with:

-   Their phone number as a parameter
-   A callback URL for after registration

Example link:

```
https://your-registration-app.com/register?phone=%2B27831234567&callback=https%3A//your-app.com/api/auth/register-callback
```

### 4. Registration Callback

After registration (success or failure), the external app should redirect to:

```
GET /api/auth/register-callback?phone={phone}&status={success|error}&error={error_code}
```

### 5. Confirmation Code API

The external registration app can call this endpoint to send WhatsApp confirmation codes:

```
POST /api/auth/send-confirmation
Content-Type: application/json

{
  "phoneNumber": "+27831234567"
}
```

This sends a 6-digit confirmation code via WhatsApp that expires in 10 minutes.

## Integration with External Registration App

Your external registration application should:

1. **Accept parameters**:

    - `phone`: The user's phone number
    - `callback`: The callback URL to redirect to after registration

2. **Send confirmation codes** (optional):

    ```javascript
    const response = await fetch('https://your-app.com/api/auth/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '+27831234567' }),
    })
    ```

3. **Create the user account** in your system

4. **Redirect to callback** with appropriate status:

    ```
    // Success
    https://your-app.com/api/auth/register-callback?phone=+27831234567&status=success

    // Error
    https://your-app.com/api/auth/register-callback?phone=+27831234567&status=error&error=validation_failed
    ```

## User Experience

1. **User scans QR code** and messages the bot
2. **Bot detects unregistered user** and shows welcome message with "Create Account" button
3. **User clicks "Create Account"** and receives registration link
4. **User completes registration** on external site
5. **User is redirected back** with success/error status
6. **Bot sends welcome message** (if successful) and user can now use banking features

## Error Handling

The system handles various error scenarios:

-   Registration failures
-   Network issues when sending WhatsApp messages
-   Invalid phone numbers
-   Missing environment variables

## Database Changes

The system uses the existing `User` and `Otp` models. No schema changes are required.

## Security Considerations

-   Phone numbers are validated using E.164 format
-   Confirmation codes expire after 10 minutes
-   Callback URLs are properly encoded
-   Registration status is verified before allowing banking operations

## Testing

To test the flow:

1. Use a phone number not in your database
2. Send any message to the WhatsApp bot
3. Verify you get the registration prompt
4. Complete the registration flow
5. Verify you can now access banking features
