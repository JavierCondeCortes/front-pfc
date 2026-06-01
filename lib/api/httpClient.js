import { getAuthToken } from '@/lib/session';

async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const rawBody = await response.text();
    let body = rawBody;

    if (contentType.includes('application/json')) {
        try {
            body = JSON.parse(rawBody);
        } catch {
            body = rawBody;
        }
    }

    if (response.ok) return body;

    const errorMessage = typeof body === 'string' ? body : body?.message;
    const error = new Error(errorMessage || response.statusText || 'Request failed');
    error.status = response.status;
    error.errors = body?.errors;
    error.body = body;
    throw error;
}

export function createHttpClient(baseUrl, tokenProvider = getAuthToken) {
    const request = async (path, options = {}) => {
        const token = options.auth === false ? null : tokenProvider();
        const normalizedToken = token?.startsWith('Bearer ') ? token.slice(7) : token;
        const headers = {
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(normalizedToken ? { Authorization: `Bearer ${normalizedToken}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${baseUrl}${path}`, {
            ...options,
            headers,
            body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
        });

        return parseResponse(response);
    };

    return {
        get: (path, options) => request(path, { ...options, method: 'GET' }),
        post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    };
}
