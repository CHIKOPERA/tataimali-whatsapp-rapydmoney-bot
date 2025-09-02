// User and Authentication Types
export interface User {
    id: string
    phoneE164: string
    createdAt: string
}

export interface AuthSession {
    isAuthenticated: boolean
    userPhone: string
}

// Wallet Types
export interface Wallet {
    id: string
    userId: string
    balanceMinor: number
}

export interface WalletBalance {
    balance: number
}

// Transaction Types
export interface Transaction {
    id: string
    type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL'
    amountMinor: number
    createdAt: string
    fromPhone?: string
    toPhone?: string
    description?: string
}

// Transfer Types
export interface Transfer {
    id: string
    fromWalletId: string
    toWalletId: string
    amountMinor: number
    createdAt: string
    idempotencyKey: string
}

export interface TransferRequest {
    fromPhone: string
    toPhone: string
    amountMinor: number
    idem: string
}

// Coupon Types
export interface Coupon {
    id: string
    code: string
    amountMinor: number
    isRedeemed: boolean
    redeemedBy?: string
    redeemedAt?: string
    createdAt: string
}

export interface CouponIssueRequest {
    amountMinor: number
}

// OTP Types
export interface OtpRequest {
    phoneE164: string
}

export interface OtpVerifyRequest {
    phoneE164: string
    code: string
}

// WhatsApp Types
export interface WhatsAppMessage {
    from: string
    id: string
    timestamp: string
    text?: {
        body: string
    }
    type: string
}

export interface WhatsAppWebhookPayload {
    object: string
    entry: Array<{
        id: string
        changes: Array<{
            value: {
                messaging_product: string
                metadata: {
                    display_phone_number: string
                    phone_number_id: string
                }
                messages?: WhatsAppMessage[]
                statuses?: Array<{
                    id: string
                    status: string
                    timestamp: string
                    recipient_id: string
                }>
            }
            field: string
        }>
    }>
}

// API Response Types
export interface ApiResponse<T = unknown> {
    data?: T
    error?: string
    status?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    cursor?: string
    hasMore: boolean
}

// Component Props Types
export interface SendMoneyFormProps {
    userPhone: string
}

export interface TransactionsListProps {
    userPhone: string
}

export interface ProfileViewProps {
    userPhone: string
}

// Form Types
export interface LoginFormData {
    phoneE164: string
}

export interface VerifyFormData {
    phoneE164: string
    code: string
}

export interface SendMoneyFormData {
    recipient: string
    amount: string
}
