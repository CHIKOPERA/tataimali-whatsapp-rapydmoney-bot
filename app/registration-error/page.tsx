'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegistrationErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error') || 'unknown'

    const getErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'user_not_found':
                return 'Account creation was not completed successfully.'
            case 'validation_failed':
                return 'The provided information could not be validated.'
            case 'phone_exists':
                return 'An account with this phone number already exists.'
            default:
                return 'An unknown error occurred during registration.'
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full'>
                <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                        className='w-8 h-8 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                        />
                    </svg>
                </div>

                <h1 className='text-2xl font-bold text-gray-900 mb-4'>Registration Failed</h1>

                <p className='text-gray-600 mb-6'>{getErrorMessage(error)}</p>

                <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
                    <p className='text-red-800 text-sm'>
                        Please try again or contact support if the issue persists.
                    </p>
                </div>

                <div className='space-y-3'>
                    <button
                        onClick={() => window.history.back()}
                        className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium'
                    >
                        Try Again
                    </button>

                    <div className='text-sm text-gray-500'>
                        <p>Error Code: {error}</p>
                        <p className='mt-2'>
                            You can also scan the QR code again to restart the registration process.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function RegistrationError() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-red-500'></div>
                </div>
            }
        >
            <RegistrationErrorContent />
        </Suspense>
    )
}
