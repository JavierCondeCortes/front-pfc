'use client';

export async function uploadFile(file, folder = 'documents', metadata = {}) {
    if (!file) return null;

    const data = new FormData();
    data.append('file', file);
    data.append('folder', folder);
    Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') data.append(key, String(value));
    });

    const response = await fetch('/api/uploads', {
        method: 'POST',
        body: data,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(body.message || 'No se pudo subir el archivo.');
    }

    return body;
}
