import { View, TouchableOpacity, Text } from 'react-native'
import { styles } from './DatesLocationForm.styles'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function DatesLocationFormPart({ METODOS_PAGO, actualizarFechasLugar, c, efectivoPermitido, fechasLugar, nombreSucursal, primaryAccent, setAlertaEfectivoVisible, setAlertaModal, t }: { METODOS_PAGO: ({ id: 'wompi'; titulo: string; descripcion: string; } | { id: 'efectivo'; titulo: string; descripcion: string; })[]; actualizarFechasLugar: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar>) => void; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; efectivoPermitido: boolean; fechasLugar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosFechasLugar; nombreSucursal: string; primaryAccent: string; setAlertaEfectivoVisible: React.Dispatch<React.SetStateAction<boolean>>; setAlertaModal: React.Dispatch<React.SetStateAction<{ visible: boolean; icono?: keyof typeof Ionicons.glyphMap; titulo: string; mensaje: string; botones?: { texto: string; onPress: () => void; variante?: 'primario' | 'secundario'; }[]; }>>; t: any }) {
  return (
    <View style={styles.metodosColumna}>
          {METODOS_PAGO.map((metodo) => {
            const activo = fechasLugar.metodoPago === metodo.id;
            const bloqueado = metodo.id === "efectivo" && !efectivoPermitido;
            return (
              <TouchableOpacity accessibilityRole="button"
                key={metodo.id}
                style={[
                  styles.metodoCard,
                  bloqueado && { opacity: 0.5 },
                  {
                    borderColor: c.border,
                    backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF",
                  },
                  activo && [styles.metodoCardActivo, { borderColor: primaryAccent, backgroundColor: c.primaryBg }],
                ]}
                onPress={() => {
                  if (bloqueado) {
                    setAlertaModal({
                      visible: true,
                      icono: "alert-circle-outline",
                      titulo: t("reserva.fechasLugar.efectivoNoDisponibleTitulo", { defaultValue: "Pago en efectivo no disponible" }),
                      mensaje: t("reserva.fechasLugar.efectivoNoDisponibleMensaje", {
                        sucursal: nombreSucursal,
                        defaultValue: "La sucursal {{sucursal}} no recibe pagos en efectivo. Elige pago en línea o un vehículo de otra sucursal.",
                      }),
                    });
                    return;
                  }
                  actualizarFechasLugar({
                    metodoPago: metodo.id,
                    ...(metodo.id === "efectivo"
                      ? {
                          lugarRetiro: nombreSucursal,
                          lugarDevolucion: nombreSucursal,
                        }
                      : {}),
                  });
                  if (metodo.id === "efectivo") setAlertaEfectivoVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.metodoHeaderRow}>
                  <Text style={[styles.metodoTitulo, { color: c.textPrimary }, activo && { color: primaryAccent }]}>
                    {metodo.titulo}
                  </Text>
                  <View style={[styles.radio, { borderColor: c.border }, activo && [styles.radioActivo, { borderColor: primaryAccent }]]}>
                    {activo && <View style={[styles.radioPunto, { backgroundColor: primaryAccent }]} />}
                  </View>
                </View>
                <Text style={[styles.metodoDesc, { color: c.textMuted }]}>
                  {metodo.descripcion}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
  )
}
