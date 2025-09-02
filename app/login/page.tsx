'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        // Validate phone number format
        if (!phone.startsWith('+') || phone.length < 10) {
            setMessage('❌ Please enter phone number in international format (+27831234567)')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneE164: phone }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('✅ OTP sent! Check your WhatsApp messages.')
                // Store phone in session storage for verification step
                sessionStorage.setItem('phoneE164', phone)
                // Redirect to verification page
                setTimeout(() => {
                    router.push('/verify')
                }, 2000)
            } else {
                setMessage(`❌ ${data.error || 'Failed to send OTP'}`)
            }
        } catch {
            setMessage('❌ Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4'>
            <div className='max-w-md w-full bg-white rounded-xl shadow-lg p-8'>
                <div className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-2'>Tata Mali</h1>
                    <p className='text-gray-600'>Enter your phone number to get started</p>
                </div>

                <form onSubmit={handleSendOtp} className='space-y-6'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Phone Number
                        </label>
                        <input
                            type='tel'
                            placeholder='+27831234567'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 text-lg'
                            required
                            disabled={loading}
                        />
                        <p className='text-sm text-gray-500 mt-1'>
                            Include country code (e.g., +27 for South Africa)
                        </p>
                    </div>

                    <button
                        type='submit'
                        disabled={loading}
                        className='w-full bg-lime-500 text-black py-3 px-6 rounded-lg font-semibold hover:bg-lime-600 focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                        {loading ? (
                            <div className='flex items-center justify-center'>
                                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2'></div>
                                Sending OTP...
                            </div>
                        ) : (
                            'Send OTP via WhatsApp'
                        )}
                    </button>
                </form>

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

                <div className='mt-8 text-center text-sm text-gray-500'>
                    <p>We&apos;ll send you a one-time code via WhatsApp</p>
                    <p>No account? One will be created automatically</p>
                </div>
            </div>
        </div>
    )
}
