'use client';

import { useCallback, useEffect, useState } from 'react';
import { createVehicle, deleteVehicle, fetchVehicles, updateVehicle } from '@/lib/api/vehicles';
import { fetchVehiclePhotoManifest, hydrateVehiclesWithPhotos } from '@/lib/vehiclePhotos';

export function useVehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadVehicles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [nextVehicles, photoManifest] = await Promise.all([
                fetchVehicles(),
                fetchVehiclePhotoManifest(),
            ]);
            const hydratedVehicles = hydrateVehiclesWithPhotos(Array.isArray(nextVehicles) ? nextVehicles : [], photoManifest);
            setVehicles(hydratedVehicles);
            return hydratedVehicles;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    const addVehicle = useCallback(async (payload) => {
        await createVehicle(payload);
        const nextVehicles = await loadVehicles();
        return nextVehicles.find((vehicle) => vehicle.matricula === payload.matricula) || null;
    }, [loadVehicles]);

    const editVehicle = useCallback(async (payload) => {
        await updateVehicle(payload);
        const nextVehicles = await loadVehicles();
        return nextVehicles.find((vehicle) => Number(vehicle.id) === Number(payload.id)) || null;
    }, [loadVehicles]);

    const removeVehicle = useCallback(async (id) => {
        await deleteVehicle(id);
        setVehicles((current) => current.filter((vehicle) => Number(vehicle.id) !== Number(id)));
    }, []);

    return { vehicles, loading, error, loadVehicles, addVehicle, editVehicle, removeVehicle };
}
