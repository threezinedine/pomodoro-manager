const AUTH_KEY = 'auth_token';

const BASE = '/api';

interface RequestOptions extends RequestInit {
    /** Append auth token from localStorage */
    auth?: boolean;
}

class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = 'HttpError';
    }
}

async function request<T = unknown>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { auth = true, ...fetchOptions } = options;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
    };

    if (auth) {
        const token = localStorage.getItem(AUTH_KEY);
        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${BASE}${path}`, {
        ...fetchOptions,
        headers,
    });

    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const body = await res.json();
            if (body?.message) message = body.message;
        } catch {
            // use status-based message
        }
        throw new HttpError(res.status, message);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const apiClient = {
    get: <T = unknown>(path: string, options?: RequestOptions) =>
        request(path, { ...options, method: 'GET' }) as Promise<T>,

    post: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
        request(path, { ...options, method: 'POST', body: JSON.stringify(body) }) as Promise<T>,

    put: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
        request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }) as Promise<T>,

    patch: <T = unknown>(path: string, body?: unknown, options?: RequestOptions) =>
        request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }) as Promise<T>,

    delete: <T = unknown>(path: string, options?: RequestOptions) =>
        request(path, { ...options, method: 'DELETE' }) as Promise<T>,
};

export { HttpError };
