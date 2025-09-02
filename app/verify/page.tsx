'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyPage() {
    const [code, setCode] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Get phone number from session storage
        const storedPhone = sessionStorage.getItem('phoneE164')
        if (storedPhone) {
            setPhone(storedPhone)
        } else {
            // If no phone stored, redirect back to login
            router.push('/login')
        }
    }, [router])

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        if (!code || code.length !== 6) {
            setMessage('❌ Please enter the 6-digit code')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneE164: phone, code }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('✅ Login successful! Redirecting...')
                // Store authentication state
                sessionStorage.setItem('isAuthenticated', 'true')
                sessionStorage.setItem('userPhone', phone)
                // Clear the stored phone
                sessionStorage.removeItem('phoneE164')
                // Redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard')
                }, 1500)
            } else {
                setMessage(`❌ ${data.error || 'Invalid or expired code'}`)
            }
        } catch {
            setMessage('❌ Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (!phone) return

        setLoading(true)
        setMessage('Resending OTP...')

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneE164: phone }),
            })

            if (res.ok) {
                setMessage('✅ New OTP sent! Check your WhatsApp.')
            } else {
                setMessage('❌ Failed to resend OTP')
            }
        } catch {
            setMessage('❌ Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
            <div className='max-w-md w-full bg-white rounded-xl shadow-lg p-8'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Verify OTP</h1>
                    <p className='text-gray-600'>Enter the 6-digit code sent to</p>
                    <p className='font-medium text-gray-900'>{phone}</p>
                </div>

                <form onSubmit={handleVerifyOtp} className='space-y-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Verification Code
                        </label>
                        <input
                            type='text'
                            placeholder='123456'
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-lg text-center tracking-wider'
                            maxLength={6}
                            required
                            disabled={loading}
                        />
                        <p className='text-sm text-gray-500 mt-1'>Check your WhatsApp messages</p>
                    </div>

                    <button
                        type='submit'
                        disabled={loading || code.length !== 6}
                        className='w-full bg-lime-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-lime-600 focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                        {loading ? (
                            <div className='flex items-center justify-center'>
                                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2'></div>
                                Verifying...
                            </div>
                        ) : (
                            'Verify & Login'
                        )}
                    </button>
                </form>

                <div className='mt-6 text-center'>
                    <button
                        onClick={handleResendOtp}
                        disabled={loading}
                        className='text-lime-500 hover:text-lime-600 font-medium disabled:opacity-50'
                    >
                        Resend OTP
                    </button>
                </div>

                <div className='mt-4 text-center'>
                    <button
                        onClick={() => router.push('/login')}
                        className='text-gray-500 hover:text-gray-700 text-sm'
                    >
                        ← Change phone number
                    </button>
                </div>

                {message && (
                    <div
                        className={`mt-4 p-4 rounded-lg text-center ${
                            message.includes('✅')
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                    >
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}
