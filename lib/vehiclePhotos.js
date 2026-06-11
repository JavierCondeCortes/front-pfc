import { withBasePath } from '@/lib/paths';

const PHOTO_PREFIX = 'vehicle_photo:';

export function getVehiclePhotoKey(vehicle) {
    const key = vehicle?.id || vehicle?.matricula;
    return key ? `${PHOTO_PREFIX}${key}` : null;
}

export function getVehiclePhoto(vehicle) {
    if (vehicle?.foto_url) return withBasePath(vehicle.foto_url);
    if (typeof window === 'undefined') return null;
    const idKey = vehicle?.id ? `${PHOTO_PREFIX}${vehicle.id}` : null;
    const plateKey = vehicle?.matricula ? `${PHOTO_PREFIX}${vehicle.matricula}` : null;
    const photo = (idKey && localStorage.getItem(idKey)) || (plateKey && localStorage.getItem(plateKey)) || null;
    return photo ? withBasePath(photo) : null;
}

export function saveVehiclePhoto(vehicle, photo) {
    if (typeof window === 'undefined' || !photo) return;
    const key = getVehiclePhotoKey(vehicle);
    if (key) localStorage.setItem(key, photo);
}

export async function fetchVehiclePhotoManifest() {
    const response = await fetch(withBasePath('/api/uploads?folder=vehicles'), { cache: 'no-store' });
    if (!response.ok) return {};
    return response.json().catch(() => ({}));
}

export function hydrateVehiclesWithPhotos(vehicles, manifest = {}) {
    return vehicles.map((vehicle) => {
        const byId = vehicle?.id ? manifest[`vehicle:${vehicle.id}`] : null;
        const byPlate = vehicle?.matricula ? manifest[`plate:${String(vehicle.matricula).toLowerCase()}`] || manifest[`plate:${vehicle.matricula}`] : null;
        const photoUrl = byId || byPlate || vehicle.foto_url || null;
        return { ...vehicle, foto_url: photoUrl ? withBasePath(photoUrl) : null };
    });
}

export function readImageFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
