import { BRAND_COLORS } from '@/lib/config'

interface ErrorMessageProps {
    message: string
    type?: 'error' | 'warning' | 'info'
    onRetry?: () => void
    className?: string
}

export function ErrorMessage({
    message,
    type = 'error',
    onRetry,
    className = '',
}: ErrorMessageProps) {
    const typeStyles = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: '❌',
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-800',
            icon: '⚠️',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: 'ℹ️',
        },
    }

    const styles = typeStyles[type]

    return (
        <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border} ${className}`}>
            <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                    <span className='text-lg mr-2'>{styles.icon}</span>
                    <span className={`${styles.text} font-medium`}>{message}</span>
                </div>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className='ml-4 px-3 py-1 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity'
                        style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                    >
                        Retry
                    </button>
                )}
            </div>
        </div>
    )
}

interface SuccessMessageProps {
    message: string
    onAction?: () => void
    actionLabel?: string
    className?: string
}

export function SuccessMessage({
    message,
    onAction,
    actionLabel = 'Continue',
    className = '',
}: SuccessMessageProps) {
    return (
        <div className={`p-4 rounded-lg border bg-green-50 border-green-200 ${className}`}>
            <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                    <span className='text-lg mr-2'>✅</span>
                    <span className='text-green-800 font-medium'>{message}</span>
                </div>
                {onAction && (
                    <button
                        onClick={onAction}
                        className='ml-4 px-3 py-1 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity'
                        style={{ backgroundColor: BRAND_COLORS.PRIMARY }}
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    )
}
