import { Animated, View, Text, StyleSheet } from 'react-native'
import { VehicleGallery } from '@/modules/catalog/components/VehicleGallery'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { formatCurrency } from '@/utils/currencyUtils'
import { VehicleReviews } from '@/modules/catalog/components/VehicleReviews'
import { Vehiculo } from '@/modules/catalog/types/catalog.types'
import TieneDescuento from './TieneDescuento'
import IdPartPartPart7 from './IdPartPartPart7'
import IdPartPartPart6 from './IdPartPartPart6'
import IdPartPartPart5 from './IdPartPartPart5'
import IdPartPartPart4 from './IdPartPartPart4'
import IdPartPartPart3 from './IdPartPartPart3'
import IdPartPartPart2 from './IdPartPartPart2'
import IdPartPartPart from './IdPartPartPart'

function getSafeImages(vehiculo: Vehiculo): string[] {
  const imgs = vehiculo.imagenes ?? [];
  const filtradas = imgs.filter(Boolean);
  if (filtradas.length > 0) return filtradas;
  if (vehiculo.imagen) return [vehiculo.imagen];
  if (vehiculo.foto) return [vehiculo.foto];
  return [];
}
const s = StyleSheet.create({
  flex: { flex: 1 },
  contenedorVacio: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  vacioTexto: { fontSize: 14, textAlign: "center" },
  vacioBtn: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 16 },
  vacioBtnTexto: { fontSize: 14, fontWeight: "700" },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  volverBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  cardHeaderTitulo: {
    fontSize: 13,
    fontWeight: "700",
  },

  precioCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeDescuento: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDescuentoTexto: {
    fontSize: 11,
    fontWeight: "800",
    color: "#047857",
  },

  reservarBtnInline: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  reservarBtnInlineTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  sucursalNombre: {
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  infoRowTexto: {
    fontSize: 13,
    fontWeight: "400",
  },

  btnAccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    width: "100%",
  },
  btnAccionTexto: {
    fontSize: 13,
    fontWeight: "700",
  },

  parrafoTexto: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "400",
  },

  subCardInner: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filaTarifa: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  filaTarifaLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  filaTarifaPrecio: {
    fontSize: 13,
    fontWeight: "600",
  },
  divisorFila: {
    height: 1,
    width: "100%",
  },
  divisorSeccion: {
    height: 1,
    width: "100%",
    marginBottom: 14,
  },

  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    marginTop: 2,
  },
  chipItem: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipTexto: {
    fontSize: 12,
    fontWeight: "500",
    flexShrink: 1,
  },

  caracteristicasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    marginTop: 4,
  },
  columnaCaracteristica: {
    width: "50%",
    paddingRight: 8,
  },
  labelCaracteristica: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 2,
  },
  valorCaracteristica: {
    fontSize: 13,
    fontWeight: "600",
  },

  requisitosLista: {
    gap: 12,
    marginTop: 4,
  },
  requisitoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  requisitoIcono: {
    marginTop: 2,
  },
  requisitoTextCol: {
    flex: 1,
  },
  requisitoTitulo: {
    fontSize: 13.5,
    fontWeight: "600",
    marginBottom: 2,
  },
  requisitoDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
  },

  barraInferior: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  barraPrecioLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  barraPrecio: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1E3A8A",
  },
  barraPrecioDia: {
    fontSize: 12,
    fontWeight: "500",
  },
  reservarBtnWrap: {
    borderRadius: 10,
    overflow: "hidden",
  },
  reservarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  reservarBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});

export default function IdPartPart({ c, caracteristicas, colorAzulAccion, colorBorde, colorIconoHeader, colorTextoPrimario, colorTextoSecundario, colorTituloCard, comentariosMostrar, descuentoNum, direccionCompleta, handleOpenPicoYPlaca, horarioAtencion, monedaActual, nombreSucursal, opacidad, precioConDescuento, precioOriginal, seguros, setModalComoLlegarVisible, t, tarifas, tasaUSD, tieneDescuento, vehiculo }: { c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; caracteristicas: { id: string; name: string; }[]; colorAzulAccion: '#93C5FD' | '#1E3A8A'; colorBorde: string; colorIconoHeader: '#93C5FD' | '#1E3A8A'; colorTextoPrimario: '#F8FAFC' | '#0F172A'; colorTextoSecundario: '#94A3B8' | '#64748B'; colorTituloCard: '#93C5FD' | '#1E3A8A'; comentariosMostrar: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Comentario[]; descuentoNum: number; direccionCompleta: string; handleOpenPicoYPlaca: () => void; horarioAtencion: string; monedaActual: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/utils/currencyUtils").Moneda; nombreSucursal: string; opacidad: Animated.Value; precioConDescuento: number; precioOriginal: number; seguros: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Seguro[]; setModalComoLlegarVisible: React.Dispatch<React.SetStateAction<boolean>>; t: any; tarifas: { kmLimitado?: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Tarifa; kmIlimitado?: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/catalog/types/catalog.types").Tarifa; }; tasaUSD: number; tieneDescuento: boolean; vehiculo: Vehiculo }) {
  return (
    <Animated.View style={{ opacity: opacidad }}>
              {/* 1. Galería de Imágenes */}
              <VehicleGallery
                nombre={vehiculo.nombre}
                imagenes={getSafeImages(vehiculo)}
                calificacion={vehiculo.calificacion}
                borderColor={colorBorde}
              />
    
              {/* 2. Descripción */}
              {!!vehiculo.descripcion && (
                <View style={[s.card, { backgroundColor: c.bgCard, borderColor: colorBorde }]}>
                  <View style={s.cardHeaderRow}>
                    <Ionicons name="reorder-three" size={14} color={colorIconoHeader} />
                    <Text style={[s.cardHeaderTitulo, { color: colorTituloCard }]}>
                      {t("vehiculo.descripcion", { defaultValue: "Descripción" })}
                    </Text>
                  </View>
                  <Text style={[s.parrafoTexto, { color: colorTextoSecundario }]}>
                    {t(`vehiculo.descripciones.desc_${vehiculo.id}`, {
                      defaultValue: t(`auth.invitado.desc_${vehiculo.id}`, {
                        defaultValue: vehiculo.descripcion,
                      }),
                    })}
                  </Text>
                </View>
              )}
    
              {/* 3. Sucursal (después de la descripción) */}
              <IdPartPartPart c={c} colorAzulAccion={colorAzulAccion} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoPrimario={colorTextoPrimario} colorTextoSecundario={colorTextoSecundario} colorTituloCard={colorTituloCard} direccionCompleta={direccionCompleta} horarioAtencion={horarioAtencion} nombreSucursal={nombreSucursal} setModalComoLlegarVisible={setModalComoLlegarVisible} t={t} />
    
              {/* 4. Consultar Pico y Placa (después de Sucursal) */}
              <IdPartPartPart2 c={c} colorAzulAccion={colorAzulAccion} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoSecundario={colorTextoSecundario} colorTituloCard={colorTituloCard} handleOpenPicoYPlaca={handleOpenPicoYPlaca} t={t} />
    
              {/* 5. Equipamiento y Tecnología (después de Consultar Pico y Placa) */}
              <IdPartPartPart3 c={c} caracteristicas={caracteristicas} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoPrimario={colorTextoPrimario} colorTextoSecundario={colorTextoSecundario} colorTituloCard={colorTituloCard} t={t} />
    
              {/* 6. Seguros (después de Equipamiento) */}
              <IdPartPartPart4 c={c} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoPrimario={colorTextoPrimario} colorTituloCard={colorTituloCard} monedaActual={monedaActual} seguros={seguros} t={t} tasaUSD={tasaUSD} />
    
              {/* 7. Tarifas por kilometraje (después de Seguros) */}
              <IdPartPartPart5 c={c} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoPrimario={colorTextoPrimario} colorTituloCard={colorTituloCard} monedaActual={monedaActual} t={t} tarifas={tarifas} tasaUSD={tasaUSD} />
    
              {/* 8. Características Técnicas */}
              <IdPartPartPart6 c={c} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoPrimario={colorTextoPrimario} colorTextoSecundario={colorTextoSecundario} colorTituloCard={colorTituloCard} t={t} vehiculo={vehiculo} />
    
              {/* 9. Requisitos para rentar */}
              <IdPartPartPart7 c={c} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoPrimario={colorTextoPrimario} colorTextoSecundario={colorTextoSecundario} colorTituloCard={colorTituloCard} t={t} />
    
              {/* 10. Precio por día ($COP) */}
              {tieneDescuento ? (
                <TieneDescuento c={c} colorAzulAccion={colorAzulAccion} colorBorde={colorBorde} colorIconoHeader={colorIconoHeader} colorTextoSecundario={colorTextoSecundario} colorTituloCard={colorTituloCard} descuentoNum={descuentoNum} monedaActual={monedaActual} precioConDescuento={precioConDescuento} precioOriginal={precioOriginal} t={t} tasaUSD={tasaUSD} />
              ) : (
                <View style={[s.card, { backgroundColor: c.bgCard, borderColor: colorBorde }]}>
                  <View style={s.precioCardHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="pricetag" size={14} color={colorIconoHeader} />
                      <Text style={[s.cardHeaderTitulo, { color: colorTituloCard }]}>
                        {`${t("vehiculo.precioPorDia", { defaultValue: "Precio por día" }).replace(/\(\$?[A-Z]+\)/g, "").trim()} (${monedaActual})`}
                      </Text>
                    </View>
                  </View>
    
                  <View style={[s.subCardInner, { borderColor: colorBorde, backgroundColor: c.oscuro ? c.bgInput : "#FFFFFF", marginTop: 4 }]}>
                    <View style={s.filaTarifa}>
                      <Text style={[s.filaTarifaLabel, { color: colorTextoPrimario, fontWeight: "600", fontSize: 13 }]}>
                        {t("vehiculo.tarifaEstandar", { defaultValue: "Tarifa estándar" })}
                      </Text>
                      <Text style={[s.filaTarifaPrecio, { color: colorAzulAccion, fontSize: 13.5, fontWeight: "800" }]}>
                        {formatCurrency(precioOriginal, monedaActual, tasaUSD)}
                        {t("vehiculo.porDia", { defaultValue: "/día" }).startsWith("/")
                          ? t("vehiculo.porDia", { defaultValue: "/día" })
                          : ` /${t("vehiculo.porDia", { defaultValue: "día" })}`}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
    
              {/* Divisor entre Precio por día y Reseñas */}
              <View style={[s.divisorSeccion, { backgroundColor: colorBorde }]} />
    
              {/* 11. Reseñas de clientes */}
              <VehicleReviews
                comentarios={comentariosMostrar}
                calificacionPromedio={vehiculo.calificacion}
                vehiculoId={String((vehiculo as { uuid?: string }).uuid ?? vehiculo.id)}
                vehiculoNombre={vehiculo.nombre}
              />
            </Animated.View>
  )
}
