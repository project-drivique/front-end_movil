import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertModal } from "@/components/ui/AlertModal";
import { EstadoAlerta, suscribirAlertas } from "@/utils/alerta";

// Muestra en web las alertas lanzadas con utils/alerta (en celular se usa el Alert nativo)
export function AlertHost() {
  const { t } = useTranslation();
  const [estado, setEstado] = useState<EstadoAlerta>({ visible: false, titulo: "", mensaje: "", botones: [] });

  useEffect(() => suscribirAlertas(setEstado), []);

  const cerrar = () => setEstado((e) => ({ ...e, visible: false }));
  const botones = estado.botones.length
    ? estado.botones.map((b, i) => ({
        texto: b.text ?? t("comun.aceptar"),
        variante: (b.style === "cancel" ? "secundario" : i === estado.botones.length - 1 ? "primario" : "secundario") as "primario" | "secundario",
        onPress: () => {
          cerrar();
          b.onPress?.();
        },
      }))
    : [{ texto: t("comun.aceptar"), variante: "primario" as const, onPress: cerrar }];

  return <AlertModal visible={estado.visible} titulo={estado.titulo} mensaje={estado.mensaje} botones={botones} onCerrar={cerrar} />;
}
