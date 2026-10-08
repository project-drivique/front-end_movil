// modules/catalogo/hooks/useFavoritos.ts

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/services/http/apiClient";
import { useAuthStore } from "@/store/authStore";

export function useFavoritos(usuarioId: string | null) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [cargando, setCargando] = useState(false);
  const isAuthenticated = useAuthStore((s) => !!s.token);

  const fetchFavoritos = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoritos([]);
      return;
    }
    setCargando(true);
    try {
      // HU-10: Cargar favoritos desde el backend (/v1/users/me/favorites)
      // La API devuelve una lista de objetos completos. Extraemos solo los IDs para el estado local.
      const response = await apiClient.get<any[]>("/v1/users/me/favorites");
      const ids = (response.data || []).map(v => v.id);
      setFavoritos(ids);
    } catch (e) {
      console.error("Error cargando favoritos desde backend:", e);
      setFavoritos([]);
    } finally {
      setCargando(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavoritos();
  }, [fetchFavoritos]);

  const toggleFavorito = useCallback(
    async (vehiculoId: number) => {
      if (!isAuthenticated) return;
      
      const esFav = favoritos.includes(vehiculoId);
      const nuevos = esFav
        ? favoritos.filter((id) => id !== vehiculoId)
        : [...favoritos, vehiculoId];
        
      setFavoritos(nuevos); // Optimistic update
      
      try {
        if (esFav) {
          await apiClient.delete(`/v1/users/me/favorites/${vehiculoId}`);
        } else {
          await apiClient.post(`/v1/users/me/favorites/${vehiculoId}`);
        }
      } catch (e) {
        console.error("Error actualizando favoritos en backend:", e);
        // Rollback
        setFavoritos(favoritos);
      }
    },
    [favoritos, isAuthenticated]
  );

  const esFavorito = useCallback(
    (vehiculoId: number): boolean => favoritos.includes(vehiculoId),
    [favoritos]
  );

  return { favoritos, toggleFavorito, esFavorito, cargando, refetch: fetchFavoritos };
}