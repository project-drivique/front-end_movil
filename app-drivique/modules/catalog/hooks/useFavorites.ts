// modules/catalogo/hooks/useFavoritos.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const CLAVE_BASE = "favoritosVehiculos";

export function useFavoritos(usuarioId: string | null) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [cargando, setCargando] = useState(false);

  const clave = usuarioId ? `${CLAVE_BASE}_${usuarioId}` : null;

  useEffect(() => {
    if (!clave) {
      setFavoritos([]);
      return;
    }
    const cargar = async () => {
      setCargando(true);
      try {
        const guardados = await AsyncStorage.getItem(clave);
        setFavoritos(guardados ? JSON.parse(guardados) : []);
      } catch (e) {
        console.error("Error cargando favoritos:", e);
        setFavoritos([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [clave]);

  const toggleFavorito = useCallback(
    async (vehiculoId: number) => {
      if (!clave) return;
      const nuevos = favoritos.includes(vehiculoId)
        ? favoritos.filter((id) => id !== vehiculoId)
        : [...favoritos, vehiculoId];
      setFavoritos(nuevos);
      try {
        await AsyncStorage.setItem(clave, JSON.stringify(nuevos));
      } catch (e) {
        console.error("Error guardando favoritos:", e);
        setFavoritos(favoritos);
      }
    },
    [clave, favoritos]
  );

  const esFavorito = useCallback(
    (vehiculoId: number): boolean => favoritos.includes(vehiculoId),
    [favoritos]
  );

  return { favoritos, toggleFavorito, esFavorito, cargando };
}