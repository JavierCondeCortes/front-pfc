'use client';

const KEY = 'resource_folder_links';

function readLinks() {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

function writeLinks(links) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(links));
}

export function assignResourceToFolder(folderId, type, resourceId) {
    if (!folderId || !type || !resourceId) return;
    const next = readLinks().filter((link) => !(String(link.folderId) === String(folderId) && link.type === type && String(link.resourceId) === String(resourceId)));
    next.push({ folderId: Number(folderId), type, resourceId: Number(resourceId) });
    writeLinks(next);
}

export function unassignResourceFromFolder(folderId, type, resourceId) {
    writeLinks(readLinks().filter((link) => !(String(link.folderId) === String(folderId) && link.type === type && String(link.resourceId) === String(resourceId))));
}

export function getFolderLinks(folderId) {
    return readLinks().filter((link) => String(link.folderId) === String(folderId));
}

export function countFolderLinks(folderId) {
    return getFolderLinks(folderId).length;
}
