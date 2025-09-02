import { BRAND_COLORS } from '@/lib/config'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    children: React.ReactNode
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    }

    const variantStyles = {
        primary: {
            background: BRAND_COLORS.PRIMARY,
            color: BRAND_COLORS.SECONDARY,
            hoverBackground: '#8BC34A', // Slightly darker green
        },
        secondary: {
            background: BRAND_COLORS.SECONDARY,
            color: BRAND_COLORS.BACKGROUND,
            hoverBackground: '#333333',
        },
        outline: {
            background: 'transparent',
            color: BRAND_COLORS.PRIMARY,
            hoverBackground: BRAND_COLORS.PRIMARY + '10',
        },
        danger: {
            background: BRAND_COLORS.ERROR,
            color: BRAND_COLORS.BACKGROUND,
            hoverBackground: '#DC2626',
        },
    }

    const styles = variantStyles[variant]
    const isDisabled = disabled || loading

    return (
        <button
            {...props}
            disabled={isDisabled}
            className={`
        ${sizeClasses[size]}
        font-medium rounded-lg transition-all duration-200
        focus:ring-2 focus:ring-offset-2 focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'outline' ? 'border-2' : ''}
        ${className}
      `}
            style={{
                backgroundColor: variant === 'outline' ? styles.background : styles.background,
                color: styles.color,
                borderColor: variant === 'outline' ? BRAND_COLORS.PRIMARY : 'transparent',
            }}
            onMouseEnter={(e) => {
                if (!isDisabled) {
                    e.currentTarget.style.backgroundColor = styles.hoverBackground
                }
            }}
            onMouseLeave={(e) => {
                if (!isDisabled) {
                    e.currentTarget.style.backgroundColor =
                        variant === 'outline' ? styles.background : styles.background
                }
            }}
        >
            {loading ? (
                <div className='flex items-center justify-center'>
                    <div
                        className='animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2'
                        style={{
                            borderColor: `${styles.color}33`,
                            borderTopColor: styles.color,
                        }}
                    />
                    Loading...
                </div>
            ) : (
                children
            )}
        </button>
    )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
    return (
        <div className='space-y-1'>
            {label && <label className='block text-sm font-medium text-gray-700'>{label}</label>}
            <input
                {...props}
                className={`
          w-full px-3 py-2 border rounded-lg text-base
          focus:ring-2 focus:ring-offset-1 focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
              error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
          }
          ${className}
        `}
            />
            {error && <p className='text-sm text-red-600'>{error}</p>}
            {helperText && !error && <p className='text-sm text-gray-500'>{helperText}</p>}
        </div>
    )
}

interface CardProps {
    children: React.ReactNode
    className?: string
    title?: string
}

export function Card({ children, className = '', title }: CardProps) {
    return (
        <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
            {title && (
                <div className='px-6 py-4 border-b border-gray-200'>
                    <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
                </div>
            )}
            <div className='p-6'>{children}</div>
        </div>
    )
}
