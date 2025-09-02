import { APP_CONFIG, VALIDATION } from './config'

/**
 * Format phone number to E164 format
 */
export function formatPhoneE164(phone: string): string {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '')

    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
        return `+${cleaned}`
    }

    return cleaned
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
    const formatted = formatPhoneE164(phone)
    return (
        APP_CONFIG.PHONE_REGEX.test(formatted) &&
        formatted.length >= VALIDATION.PHONE.MIN_LENGTH + 1 && // +1 for the +
        formatted.length <= VALIDATION.PHONE.MAX_LENGTH + 1
    )
}

/**
 * Format amount to currency string
 */
export function formatCurrency(amount: number): string {
    return `${APP_CONFIG.CURRENCY_SYMBOL}${amount.toFixed(2)}`
}

/**
 * Convert currency string to minor units (cents)
 */
export function currencyToMinor(amount: string | number): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return Math.round(numAmount * 100)
}

/**
 * Validate amount
 */
export function isValidAmount(amount: string | number): boolean {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return (
        !isNaN(numAmount) &&
        numAmount >= VALIDATION.AMOUNT.MIN &&
        numAmount <= VALIDATION.AMOUNT.MAX
    )
}

/**
 * Validate OTP code
 */
export function isValidOTP(code: string): boolean {
    return VALIDATION.OTP.PATTERN.test(code)
}

/**
 * Format date for display
 */
export function formatDate(dateString: string, locale = 'en-ZA'): string {
    return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

/**
 * Format datetime for display
 */
export function formatDateTime(dateString: string, locale = 'en-ZA'): string {
    return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/**
 * Generate random OTP code
 */
export function generateOTP(): string {
    return Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
}

/**
 * Sleep for given milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T
    } catch {
        return fallback
    }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Get session storage item safely
 */
export function getSessionStorage(key: string): string | null {
    if (typeof window === 'undefined') return null
    try {
        return sessionStorage.getItem(key)
    } catch {
        return null
    }
}

/**
 * Set session storage item safely
 */
export function setSessionStorage(key: string, value: string): void {
    if (typeof window === 'undefined') return
    try {
        sessionStorage.setItem(key, value)
    } catch {
        // Silently fail
    }
}

/**
 * Remove session storage item safely
 */
export function removeSessionStorage(key: string): void {
    if (typeof window === 'undefined') return
    try {
        sessionStorage.removeItem(key)
    } catch {
        // Silently fail
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    const authStatus = getSessionStorage('isAuthenticated')
    const userPhone = getSessionStorage('userPhone')
    return authStatus === 'true' && !!userPhone
}

/**
 * Get authenticated user phone
 */
export function getAuthenticatedUserPhone(): string | null {
    if (!isAuthenticated()) return null
    return getSessionStorage('userPhone')
}
