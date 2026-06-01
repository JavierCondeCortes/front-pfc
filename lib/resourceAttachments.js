import { readImageFile } from '@/lib/vehiclePhotos';
import { uploadFile } from '@/lib/uploadFile';

const PREFIX = 'resource_attachment:';

export function getAttachmentKey(type, item) {
    const key = item?.id || item?.nombre || item?.componente_cambiado;
    return key ? `${PREFIX}${type}:${key}` : null;
}

function getFallbackAttachmentKey(type, item) {
    const key = item?.nombre || item?.componente_cambiado;
    return key ? `${PREFIX}${type}:${key}` : null;
}

export function getResourceAttachment(type, item) {
    if (typeof window === 'undefined') return null;
    const key = getAttachmentKey(type, item);
    const fallbackKey = getFallbackAttachmentKey(type, item);
    return (key ? localStorage.getItem(key) : null) || (fallbackKey ? localStorage.getItem(fallbackKey) : null);
}

export function saveResourceAttachment(type, item, attachment) {
    if (typeof window === 'undefined' || !attachment) return;
    const key = getAttachmentKey(type, item);
    if (key) localStorage.setItem(key, JSON.stringify(attachment));
}

export async function readAttachmentFile(file) {
    if (!file) return null;
    const [preview, uploaded] = await Promise.all([
        readImageFile(file),
        uploadFile(file, 'documents'),
    ]);

    return {
        name: uploaded.name || file.name,
        type: uploaded.type || file.type,
        size: uploaded.size || file.size,
        url: uploaded.url,
        dataUrl: uploaded.url || preview,
    };
}
