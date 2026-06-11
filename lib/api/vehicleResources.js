import { createHttpClient } from '@/lib/api/httpClient';
import { API_CONFIG } from '@/lib/config';

const apiClient = createHttpClient(API_CONFIG.coreBaseUrl);

export const vehicleResourcesApi = {
    listLiquids: (vehiculoId) => apiClient.post('/liquidos/por-vehiculo', { vehiculoId: Number(vehiculoId) }),
    listAllLiquids: () => apiClient.post('/liquidos/historial', {}),
    createLiquid: (payload) => apiClient.post('/liquidos/guardar', payload),
    updateLiquid: (payload) => apiClient.post('/liquidos/editar', payload),
    deleteLiquid: (id) => apiClient.post('/liquidos/eliminar', { id: Number(id) }),

    listReports: (vehiculoId) => apiClient.post('/informes/vehiculo', { vehiculoId: Number(vehiculoId) }),
    listAllReports: () => apiClient.post('/informes/historial', {}),
    createReport: (payload) => apiClient.post('/informes/guardar', payload),
    updateReport: (payload) => apiClient.post('/informes/editar', payload),
    deleteReport: (id) => apiClient.post('/informes/eliminar', { id: Number(id) }),

    listMaintenances: (vehiculoId) => apiClient.post('/mantenimientos/vehiculo', { vehiculoId: Number(vehiculoId) }),
    listAllMaintenances: () => apiClient.post('/mantenimientos/historial', {}),
    createMaintenance: (payload) => apiClient.post('/mantenimientos/guardar', payload),
    updateMaintenance: (payload) => apiClient.post('/mantenimientos/editar', payload),
    deleteMaintenance: (id) => apiClient.post('/mantenimientos/eliminar', { id: Number(id) }),

    listFolders: () => apiClient.post('/carpetas/mis-carpetas', {}),
    createFolder: (payload) => apiClient.post('/carpetas/guardar', payload),
    updateFolder: (payload) => apiClient.post('/carpetas/editar', payload),
    deleteFolder: (id) => apiClient.post('/carpetas/eliminar', { id: Number(id) }),
    getFolderContent: (id) => apiClient.post('/carpetas/contenido', { id: Number(id) }),
    linkReportToFolder: (carpetaId, informeId) => apiClient.post('/carpetas/vincular', {
        carpetaId: Number(carpetaId),
        informeId: Number(informeId),
    }),
};
