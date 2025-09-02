/**
 * External API Client Configuration for Tata Mali WhatsApp Bot
 *
 * This configuration sets up HTTP client for the external Rapyd Money API.
 * The WhatsApp bot will use this client instead of direct database access.
 * Phone numbers are used as custom IDs for all API operations.
 */

import { th } from 'zod/locales'

if (!process.env.RAPYD_API_TOKEN) {
    throw new Error('RAPYD_API_TOKEN environment variable is required')
}

if (!process.env.RAPYD_API_BASE_URL) {
    throw new Error('RAPYD_API_BASE_URL environment variable is required')
}

const API_BASE_URL = process.env.RAPYD_API_BASE_URL
const API_TOKEN = process.env.RAPYD_API_TOKEN

// HTTP client for external API calls
class ExternalApiClient {
    private baseUrl: string
    private apiToken: string

    constructor(baseUrl: string, apiToken: string) {
        this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
        this.apiToken = apiToken
    }

    async request(method: string, endpoint: string, data?: unknown) {
        const url = `${this.baseUrl}${endpoint}`

        console.log(`API Request: ${method} ${url}`, data, 'Token', this.apiToken)
        const headers: Record<string, string> = {
            Authorization: `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
        }

        const config: RequestInit = {
            method,
            headers,
        }

        if (data) {
            config.body = JSON.stringify(data)
        }

        const response = await fetch(url, config)

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    // GET request
    async get(endpoint: string) {
        return this.request('GET', endpoint)
    }

    // POST request
    async post(endpoint: string, data: unknown) {
        return this.request('POST', endpoint, data)
    }

    // PUT request
    async put(endpoint: string, data: unknown) {
        return this.request('PUT', endpoint, data)
    }

    // PATCH request
    async patch(endpoint: string, data: unknown) {
        return this.request('PATCH', endpoint, data)
    }

    // DELETE request
    async delete(endpoint: string) {
        return this.request('DELETE', endpoint)
    }
}

// Initialize the external API client
export const apiClient = new ExternalApiClient(API_BASE_URL, API_TOKEN)
