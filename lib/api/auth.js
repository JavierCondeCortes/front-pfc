import { createHttpClient } from '@/lib/api/httpClient';

const authClient = createHttpClient('http://localhost:8080');
const registerClient = createHttpClient('http://localhost:8080');

export function loginUser(credentials) {
    return authClient.post('/api/usuarios/login', credentials, { auth: false });
}

export function registerUser(payload) {
    return registerClient.post('/api/usuarios/registro', payload, { auth: false });
}
