// modules/catalogo/hooks/useFavoritos.ts

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/services/http/apiClient";
import { useAuthStore } from "@/store/authStore";

export interface FavoriteVehicle {
  id: string;
  brandName: string;
  model: string;
  dailyRate: number;
  categoryName: string;
  transmissionName: string;
  passengerCapacity: number;
  mainImageUrl?: string | null;
}

export function useFavoritos(usuarioId: string | null) {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [vehiculosFavoritos, setVehiculosFavoritos] = useState<FavoriteVehicle[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => !!s.token);

  const fetchFavoritos = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoritos([]);
      setVehiculosFavoritos([]);
      return;
    }
    setCargando(true);
    try {
      // HU-10: Cargar favoritos desde el backend (/v1/users/me/favorites)
      // La API devuelve una lista de objetos completos. Extraemos solo los IDs para el estado local.
      setError(null);
      const response = await apiClient.get<FavoriteVehicle[]>("/v1/users/me/favorites");
      const vehicles = Array.isArray(response.data) ? response.data : [];
      const ids = vehicles.map((vehicle) => String(vehicle.id));
      setFavoritos(ids);
      setVehiculosFavoritos(vehicles);
    } catch (e) {
      console.error("Error cargando favoritos desde backend:", e);
      setFavoritos([]);
      setVehiculosFavoritos([]);
      setError("No fue posible cargar tus favoritos.");
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavoritos();
  }, [fetchFavoritos]);

  const toggleFavorito = useCallback(
    async (vehiculoId: string | number) => {
      if (!isAuthenticated) return;

      const normalizedId = String(vehiculoId);
      const esFav = favoritos.includes(normalizedId);
      const nuevos = esFav
        ? favoritos.filter((id) => id !== normalizedId)
        : [...favoritos, normalizedId];
        
      setFavoritos(nuevos); // Optimistic update
      if (esFav) {
        setVehiculosFavoritos((current) => current.filter((vehicle) => String(vehicle.id) !== normalizedId));
      }
      
      try {
        if (esFav) {
          await apiClient.delete(`/v1/users/me/favorites/${normalizedId}`);
        } else {
          await apiClient.post(`/v1/users/me/favorites/${normalizedId}`);
          await fetchFavoritos();
        }
      } catch (e) {
        console.error("Error actualizando favoritos en backend:", e);
        await fetchFavoritos();
      }
    },
    [favoritos, isAuthenticated, fetchFavoritos]
  );

  const esFavorito = useCallback(
    (vehiculoId: string | number): boolean => favoritos.includes(String(vehiculoId)),
    [favoritos]
  );

  return { favoritos, vehiculosFavoritos, toggleFavorito, esFavorito, cargando, error, refetch: fetchFavoritos };
}
