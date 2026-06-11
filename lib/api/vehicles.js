import { createHttpClient } from '@/lib/api/httpClient';
import { API_CONFIG } from '@/lib/config';

const vehicleClient = createHttpClient(API_CONFIG.coreBaseUrl);

export function fetchVehicles() {
    return vehicleClient.post('/vehiculos/mis-vehiculos', {});
}

export function createVehicle(payload) {
    return vehicleClient.post('/vehiculos/guardar', payload);
}

export function updateVehicle(payload) {
    return vehicleClient.post('/vehiculos/editar', payload);
}

export function deleteVehicle(id) {
    return vehicleClient.post('/vehiculos/eliminar', { id: Number(id) });
}

export function fetchBrands() {
    return vehicleClient.post('/marcas/todas', {});
}
