'use client'

import { useState, useCallback } from 'react'
import type { ApiResponse } from '../types'

export function useApi<T>() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<T | null>(null)

    const execute = useCallback(
        async (
            url: string,
            requestOptions: RequestInit = {},
            callbacks: {
                onSuccess?: (data: T) => void
                onError?: (error: string) => void
            } = {}
        ): Promise<ApiResponse<T>> => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...requestOptions.headers,
                    },
                    ...requestOptions,
                })

                const result: ApiResponse<T> = await response.json()

                if (response.ok && result.data) {
                    setData(result.data)
                    callbacks.onSuccess?.(result.data)
                    return result
                } else {
                    const errorMessage = result.error || 'An error occurred'
                    setError(errorMessage)
                    callbacks.onError?.(errorMessage)
                    return result
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Network error'
                setError(errorMessage)
                callbacks.onError?.(errorMessage)
                return { error: errorMessage }
            } finally {
                setLoading(false)
            }
        },
        []
    )

    const reset = useCallback(() => {
        setLoading(false)
        setError(null)
        setData(null)
    }, [])

    return {
        loading,
        error,
        data,
        execute,
        reset,
    }
}
