'use client'

import { useState, useCallback } from 'react'
import { useApi } from './useApi'
import { API_ENDPOINTS } from '../config'
import { isValidPhone, formatPhoneE164, isValidOTP } from '../utils'
import { setSessionStorage } from '../utils'
import type { OtpRequest, OtpVerifyRequest } from '../types'

export function useOtp() {
    const [step, setStep] = useState<'phone' | 'verify'>('phone')
    const [phoneNumber, setPhoneNumber] = useState('')

    const sendOtpApi = useApi<{ success: boolean }>()
    const verifyOtpApi = useApi<{ success: boolean }>()

    const sendOtp = useCallback(
        async (phone: string) => {
            if (!isValidPhone(phone)) {
                throw new Error('Please enter a valid phone number with country code')
            }

            const formattedPhone = formatPhoneE164(phone)
            const requestData: OtpRequest = { phoneE164: formattedPhone }

            const result = await sendOtpApi.execute(
                API_ENDPOINTS.AUTH.SEND_OTP,
                {
                    method: 'POST',
                    body: JSON.stringify(requestData),
                },
                {
                    onSuccess: () => {
                        setPhoneNumber(formattedPhone)
                        setSessionStorage('phoneE164', formattedPhone)
                        setStep('verify')
                    },
                }
            )

            return result
        },
        [sendOtpApi]
    )

    const verifyOtp = useCallback(
        async (code: string) => {
            if (!isValidOTP(code)) {
                throw new Error('Please enter a valid 6-digit code')
            }

            if (!phoneNumber) {
                throw new Error('Phone number not found. Please restart the process.')
            }

            const requestData: OtpVerifyRequest = {
                phoneE164: phoneNumber,
                code,
            }

            const result = await verifyOtpApi.execute(
                API_ENDPOINTS.AUTH.VERIFY_OTP,
                {
                    method: 'POST',
                    body: JSON.stringify(requestData),
                },
                {
                    onSuccess: () => {
                        setSessionStorage('isAuthenticated', 'true')
                        setSessionStorage('userPhone', phoneNumber)
                    },
                }
            )

            return result
        },
        [phoneNumber, verifyOtpApi]
    )

    const resetOtp = useCallback(() => {
        setStep('phone')
        setPhoneNumber('')
        sendOtpApi.reset()
        verifyOtpApi.reset()
    }, [sendOtpApi, verifyOtpApi])

    return {
        step,
        phoneNumber,
        sendOtp,
        verifyOtp,
        resetOtp,
        sendOtpLoading: sendOtpApi.loading,
        sendOtpError: sendOtpApi.error,
        verifyOtpLoading: verifyOtpApi.loading,
        verifyOtpError: verifyOtpApi.error,
    }
}
