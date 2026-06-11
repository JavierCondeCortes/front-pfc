import { createHttpClient } from '@/lib/api/httpClient';
import { API_CONFIG } from '@/lib/config';

const authClient = createHttpClient(API_CONFIG.authBaseUrl);
const registerClient = createHttpClient(API_CONFIG.authBaseUrl);

export function loginUser(credentials) {
    return authClient.post('/usuarios/login', credentials, { auth: false });
}

export function registerUser(payload) {
    return registerClient.post('/usuarios/registro', payload, { auth: false });
}
