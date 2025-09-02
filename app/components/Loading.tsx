import { BRAND_COLORS } from '@/lib/config'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    color?: string
    className?: string
}

export function LoadingSpinner({
    size = 'md',
    color = BRAND_COLORS.PRIMARY,
    className = '',
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    }

    return (
        <div
            className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${className}`}
            style={{ borderColor: `${color}33`, borderTopColor: color }}
        />
    )
}

interface LoadingPageProps {
    message?: string
}

export function LoadingPage({ message = 'Loading...' }: LoadingPageProps) {
    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
            <div className='text-center'>
                <LoadingSpinner size='lg' className='mx-auto mb-4' />
                <p className='text-gray-600 text-lg'>{message}</p>
            </div>
        </div>
    )
}
