'use client';

import { useCallback, useEffect, useState } from 'react';
import { vehicleResourcesApi } from '@/lib/api/vehicleResources';

export function useVehicleResources(vehicleId) {
    const [liquids, setLiquids] = useState([]);
    const [reports, setReports] = useState([]);
    const [maintenances, setMaintenances] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadResources = useCallback(async () => {
        if (!vehicleId) return;

        setLoading(true);
        setError(null);

        try {
            const [nextLiquids, nextReports, nextMaintenances, nextFolders] = await Promise.all([
                vehicleResourcesApi.listLiquids(vehicleId),
                vehicleResourcesApi.listReports(vehicleId),
                vehicleResourcesApi.listMaintenances(vehicleId),
                vehicleResourcesApi.listFolders(),
            ]);

            const baseFolders = Array.isArray(nextFolders) ? nextFolders : [];
            const hydratedFolders = await Promise.all(baseFolders.map(async (folder) => {
                try {
                    return await vehicleResourcesApi.getFolderContent(folder.id);
                } catch {
                    return folder;
                }
            }));
            setLiquids(Array.isArray(nextLiquids) ? nextLiquids : []);
            setReports(Array.isArray(nextReports) ? nextReports : []);
            setMaintenances(Array.isArray(nextMaintenances) ? nextMaintenances : []);
            setFolders(hydratedFolders);
            return {
                liquids: Array.isArray(nextLiquids) ? nextLiquids : [],
                reports: Array.isArray(nextReports) ? nextReports : [],
                maintenances: Array.isArray(nextMaintenances) ? nextMaintenances : [],
                folders: hydratedFolders,
            };
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [vehicleId]);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    const addLiquid = useCallback(async (payload) => {
        await vehicleResourcesApi.createLiquid({ ...payload, vehiculo: { id: Number(vehicleId) } });
        const nextResources = await loadResources();
        return nextResources?.liquids?.find((liquid) => liquid.nombre === payload.nombre && liquid.tipo === payload.tipo) || null;
    }, [loadResources, vehicleId]);

    const editLiquid = useCallback(async (payload) => {
        await vehicleResourcesApi.updateLiquid(payload);
        await loadResources();
    }, [loadResources]);

    const removeLiquid = useCallback(async (id) => {
        await vehicleResourcesApi.deleteLiquid(id);
        await loadResources();
    }, [loadResources]);

    const addReport = useCallback(async (payload) => {
        await vehicleResourcesApi.createReport({ ...payload, vehiculo: { id: Number(vehicleId) } });
        const nextResources = await loadResources();
        return nextResources?.reports?.find((report) => report.nombre === payload.nombre && Number(report.costo || 0) === Number(payload.costo || 0)) || null;
    }, [loadResources, vehicleId]);

    const editReport = useCallback(async (payload) => {
        await vehicleResourcesApi.updateReport(payload);
        await loadResources();
    }, [loadResources]);

    const removeReport = useCallback(async (id) => {
        await vehicleResourcesApi.deleteReport(id);
        await loadResources();
    }, [loadResources]);

    const addMaintenance = useCallback(async (payload) => {
        await vehicleResourcesApi.createMaintenance({ ...payload, vehiculo: { id: Number(vehicleId) } });
        const nextResources = await loadResources();
        return nextResources?.maintenances?.find((maintenance) => maintenance.componente_cambiado === payload.componente_cambiado && Number(maintenance.km_cambiado || 0) === Number(payload.km_cambiado || 0)) || null;
    }, [loadResources, vehicleId]);

    const editMaintenance = useCallback(async (payload) => {
        await vehicleResourcesApi.updateMaintenance(payload);
        await loadResources();
    }, [loadResources]);

    const removeMaintenance = useCallback(async (id) => {
        await vehicleResourcesApi.deleteMaintenance(id);
        await loadResources();
    }, [loadResources]);

    const addFolder = useCallback(async (payload) => {
        await vehicleResourcesApi.createFolder(payload);
        await loadResources();
    }, [loadResources]);

    const editFolder = useCallback(async (payload) => {
        await vehicleResourcesApi.updateFolder(payload);
        await loadResources();
    }, [loadResources]);

    const removeFolder = useCallback(async (id) => {
        await vehicleResourcesApi.deleteFolder(id);
        await loadResources();
    }, [loadResources]);

    const getFolderContent = useCallback((id) => vehicleResourcesApi.getFolderContent(id), []);

    const linkReportToFolder = useCallback(async (carpetaId, informeId) => {
        await vehicleResourcesApi.linkReportToFolder(carpetaId, informeId);
        await loadResources();
    }, [loadResources]);

    return {
        liquids,
        reports,
        maintenances,
        folders,
        loading,
        error,
        addLiquid,
        editLiquid,
        removeLiquid,
        addReport,
        editReport,
        removeReport,
        addMaintenance,
        editMaintenance,
        removeMaintenance,
        addFolder,
        editFolder,
        removeFolder,
        getFolderContent,
        linkReportToFolder,
        reload: loadResources,
    };
}
