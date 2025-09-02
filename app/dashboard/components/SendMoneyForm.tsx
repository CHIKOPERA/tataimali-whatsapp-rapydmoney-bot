'use client'

import { useState, useEffect } from 'react'

interface SendMoneyFormProps {
    userPhone: string
}

export default function SendMoneyForm({ userPhone }: SendMoneyFormProps) {
    const [step, setStep] = useState(1)
    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [balance, setBalance] = useState<number | null>(null)

    useEffect(() => {
        // Fetch user's account balance
        fetch('/api/wallet/balance', {
            headers: { phone: userPhone },
        })
            .then((res) => res.json())
            .then((data) => setBalance(data.balance || 0))
            .catch(() => setBalance(0))
    }, [userPhone])

    const handleRecipientNext = () => {
        if (!recipient.startsWith('+') || recipient.length < 10) {
            setMessage('Error: Please enter a valid phone number with country code')
            return
        }
        if (recipient === userPhone) {
            setMessage('Error: You cannot transfer funds to yourself')
            return
        }
        setMessage('')
        setStep(2)
    }

    const handleAmountNext = () => {
        const numAmount = parseFloat(amount)
        if (!amount || numAmount <= 0) {
            setMessage('Error: Please enter a valid amount')
            return
        }
        if (balance !== null && numAmount > balance) {
            setMessage('Error: Insufficient balance')
            return
        }
        setMessage('')
        setStep(3)
    }

    const handleTransferFunds = async () => {
        setLoading(true)
        setMessage('')

        try {
            const res = await fetch('/api/wallet/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    phone: userPhone,
                },
                body: JSON.stringify({
                    toPhone: recipient,
                    amount: parseFloat(amount),
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('Transfer completed successfully')
                // Reset form after success
                setTimeout(() => {
                    setStep(1)
                    setRecipient('')
                    setAmount('')
                    setMessage('')
                    // Refresh balance
                    fetch('/api/wallet/balance', {
                        headers: { phone: userPhone },
                    })
                        .then((res) => res.json())
                        .then((data) => setBalance(data.balance || 0))
                }, 2000)
            } else {
                setMessage(`Error: ${data.error || 'Transfer failed'}`)
            }
        } catch {
            setMessage('Error: Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setRecipient('')
        setAmount('')
        setMessage('')
    }

    return (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Balance Card */}
            <div className='lg:col-span-1'>
                <div className='bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-medium opacity-90'>Account Balance</h3>
                        <div className='w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center'>
                            <div className='w-4 h-4 bg-white rounded opacity-80'></div>
                        </div>
                    </div>
                    <div className='text-3xl font-bold mb-2'>
                        {balance !== null ? `R${balance.toFixed(2)}` : 'Loading...'}
                    </div>
                    <p className='text-blue-100 text-sm'>Available for transfer</p>
                </div>
            </div>

            {/* Transfer Form */}
            <div className='lg:col-span-2'>
                <div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100'>
                    {/* Progress Steps */}
                    <div className='mb-8'>
                        <div className='flex items-center justify-between relative'>
                            {/* Progress Line */}
                            <div className='absolute top-4 left-8 right-8 h-0.5 bg-gray-200'>
                                <div
                                    className='h-full bg-lime-500 transition-all duration-500'
                                    style={{ width: `${((step - 1) / 2) * 100}%` }}
                                ></div>
                            </div>

                            {[
                                { num: 1, label: 'Recipient' },
                                { num: 2, label: 'Amount' },
                                { num: 3, label: 'Confirm' },
                            ].map((stepInfo) => (
                                <div
                                    key={stepInfo.num}
                                    className='flex flex-col items-center relative z-10'
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                                            step >= stepInfo.num
                                                ? 'bg-lime-500 text-black shadow-lg scale-110'
                                                : 'bg-white border-2 border-gray-300 text-gray-500'
                                        }`}
                                    >
                                        {stepInfo.num}
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium ${
                                            step >= stepInfo.num ? 'text-lime-600' : 'text-gray-400'
                                        }`}
                                    >
                                        {stepInfo.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 1: Recipient */}
                    {step === 1 && (
                        <div className='space-y-6'>
                            <h4 className='text-xl font-semibold text-gray-900'>
                                Who would you like to transfer funds to?
                            </h4>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Recipient Phone Number
                                </label>
                                <input
                                    type='tel'
                                    placeholder='+27831234567'
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all'
                                />
                                <p className='text-sm text-gray-500 mt-2'>
                                    Include country code (e.g., +27 for South Africa)
                                </p>
                            </div>
                            <button
                                onClick={handleRecipientNext}
                                className='w-full bg-lime-500 text-black py-3 px-6 rounded-xl font-medium hover:bg-lime-600 transition-all duration-200 hover:shadow-lg'
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Amount */}
                    {step === 2 && (
                        <div className='space-y-6'>
                            <h4 className='text-xl font-semibold text-gray-900'>
                                What amount would you like to transfer?
                            </h4>
                            <div className='text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
                                Transfer to:{' '}
                                <span className='font-medium text-gray-900'>{recipient}</span>
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Amount (Rands)
                                </label>
                                <input
                                    type='number'
                                    placeholder='0.00'
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min='0.01'
                                    step='0.01'
                                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-all'
                                />
                            </div>
                            <div className='flex space-x-4'>
                                <button
                                    onClick={() => setStep(1)}
                                    className='flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200'
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleAmountNext}
                                    className='flex-1 bg-lime-500 text-black py-3 px-6 rounded-xl font-medium hover:bg-lime-600 transition-all duration-200 hover:shadow-lg'
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 3 && (
                        <div className='space-y-6'>
                            <h4 className='text-xl font-semibold text-gray-900'>
                                Confirm your transfer
                            </h4>
                            <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200'>
                                <div className='space-y-4'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-gray-600'>Recipient:</span>
                                        <span className='font-medium text-gray-900'>
                                            {recipient}
                                        </span>
                                    </div>
                                    <div className='border-t border-gray-200 pt-4'>
                                        <div className='flex justify-between items-center'>
                                            <span className='text-gray-600'>Amount:</span>
                                            <span className='font-bold text-2xl text-green-600'>
                                                R{parseFloat(amount).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='flex space-x-4'>
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={loading}
                                    className='flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200 disabled:opacity-50'
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleTransferFunds}
                                    disabled={loading}
                                    className='flex-1 bg-green-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-green-700 transition-all duration-200 hover:shadow-lg disabled:opacity-50'
                                >
                                    {loading ? (
                                        <div className='flex items-center justify-center'>
                                            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Transfer Funds'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {message && (
                        <div
                            className={`mt-6 p-4 rounded-xl text-center border-2 ${
                                message.includes('successfully')
                                    ? 'bg-green-50 text-green-800 border-green-200'
                                    : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                        >
                            {message}
                            {message.includes('successfully') && (
                                <button
                                    onClick={resetForm}
                                    className='ml-4 text-green-600 hover:text-green-700 font-medium underline'
                                >
                                    New Transfer
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
