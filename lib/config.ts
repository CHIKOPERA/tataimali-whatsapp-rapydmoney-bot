// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
    GRAPH_API_VERSION: 'v21.0',
    GRAPH_API_URL: 'https://graph.facebook.com',
    WEBHOOK_VERIFY_TOKEN: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'verify_token_here',
    ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
    PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
} as const

// Database Configuration
export const DATABASE_CONFIG = {
    URL: process.env.DATABASE_URL || '',
} as const

// Application Configuration
export const APP_CONFIG = {
    NAME: 'Tata Mali',
    CURRENCY: 'ZAR',
    CURRENCY_SYMBOL: 'R',
    PHONE_REGEX: /^\+\d{10,15}$/,
    OTP_LENGTH: 6,
    OTP_EXPIRY_MINUTES: 10,
} as const

// Tata Mali Brand Colors
export const BRAND_COLORS = {
    PRIMARY: '#9ACD32', // Lime green from the logo
    SECONDARY: '#000000', // Black
    ACCENT: '#ADFF2F', // Green yellow
    BACKGROUND: '#FFFFFF', // White
    TEXT_PRIMARY: '#000000', // Black
    TEXT_SECONDARY: '#666666', // Gray
    SUCCESS: '#22C55E', // Green
    ERROR: '#EF4444', // Red
    WARNING: '#F59E0B', // Amber
    INFO: '#3B82F6', // Blue
} as const

// API Endpoints
export const API_ENDPOINTS = {
    WHATSAPP_WEBHOOK: '/api/webhooks/whatsapp',
    AUTH: {
        SEND_OTP: '/api/auth/otp/send',
        VERIFY_OTP: '/api/auth/otp/verify',
    },
    WALLET: {
        BALANCE: '/api/wallet/balance',
        SEND: '/api/wallet/send',
        HISTORY: '/api/wallet/history',
    },
    USER: {
        PROFILE: '/api/user/profile',
    },
    COUPONS: {
        ISSUE: '/api/coupons/issue',
        REDEEM: '/api/coupons/redeem',
    },
} as const

// Validation Rules
export const VALIDATION = {
    PHONE: {
        MIN_LENGTH: 10,
        MAX_LENGTH: 15,
        PATTERN: WHATSAPP_CONFIG.GRAPH_API_VERSION,
    },
    AMOUNT: {
        MIN: 0.01,
        MAX: 50000,
    },
    OTP: {
        LENGTH: APP_CONFIG.OTP_LENGTH,
        PATTERN: /^\d{6}$/,
    },
} as const

// Error Messages
export const ERROR_MESSAGES = {
    INVALID_PHONE: 'Please enter a valid phone number with country code',
    INVALID_AMOUNT: 'Please enter a valid amount',
    INSUFFICIENT_BALANCE: 'Insufficient wallet balance',
    INVALID_OTP: 'Invalid or expired OTP code',
    USER_NOT_FOUND: 'User not found',
    WALLET_NOT_FOUND: 'Wallet not found',
    NETWORK_ERROR: 'Network error. Please try again.',
    UNAUTHORIZED: 'Authentication required',
    TRANSFER_FAILED: 'Transfer failed. Please try again.',
    SAME_USER: 'You cannot send money to yourself',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
    OTP_SENT: '✅ OTP sent! Check your WhatsApp messages.',
    LOGIN_SUCCESS: '✅ Login successful! Redirecting...',
    TRANSFER_SUCCESS: '✅ Money sent successfully!',
    COUPON_ISSUED: '✅ Coupon issued successfully!',
    COUPON_REDEEMED: '✅ Coupon redeemed successfully!',
} as const
