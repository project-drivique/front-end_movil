import { View, Text, TextInput } from 'react-native'
import { styles } from './PersonalDataForm.styles'
import { Ionicons } from '@expo/vector-icons'
import CampoSelectorLista from '../ListSelectorField'
import { esNacionalidadColombiana, getSiglaDocumento } from '../../constants/reservation.constants'
import { TipoDocumento } from '../../types/reservation.types'

function separarNombreCompleto(nombreCompleto: string): {
  nombres: string;
  apellidos: string;
} {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return { nombres: "", apellidos: "" };
  if (partes.length === 1) return { nombres: partes[0], apellidos: "" };
  const mitad = Math.ceil(partes.length / 2);
  return {
    nombres: partes.slice(0, mitad).join(" "),
    apellidos: partes.slice(mitad).join(" "),
  };
}

export default function PersonalDataFormPart({ OPCIONES_NACIONALIDAD, actualizarDatosPersonales, actualizarUsuarioGlobal, c, datosPersonales, hayPrefijo, opcionesTipoDocumentoFiltradas, prefijoTelefono, primaryAccent, t }: { OPCIONES_NACIONALIDAD: { id: string; label: string; }[]; actualizarDatosPersonales: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPersonales>) => void; actualizarUsuarioGlobal: (data: Partial<import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/profile/types/profile.types").UsuarioPerfil>) => void; c: { bg: string; bgCard: string; bgInput: string; bgHeader: string; textPrimary: string; textSecondary: string; textMuted: string; border: string; borderLight: string; primary: string; primaryBg: string; success: string; error: string; warning: string; oscuro: boolean; }; datosPersonales: import("C:/Users/danna/Downloads/front-end_movil/app-drivique/modules/reservation/types/reservation.types").DatosPersonales; hayPrefijo: boolean; opcionesTipoDocumentoFiltradas: { id: TipoDocumento; label: string; }[]; prefijoTelefono: string; primaryAccent: string; t: any }) {
  return (
    <View style={[styles.cardPadre, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          {/* Tarjeta de Formulario de Datos Personales */}
          <View style={[styles.cardForm, { backgroundColor: c.oscuro ? "#111827" : "#FFFFFF", borderColor: c.oscuro ? "#334155" : "#E2E8F0" }]}>
            <View style={styles.cardHeaderFila}>
              <Ionicons name="person" size={15} color={primaryAccent} />
              <Text style={[styles.cardHeaderTitulo, { color: primaryAccent }]}>
                {t("reserva.datosPersonales.titulo", { defaultValue: "Datos personales" })}
              </Text>
            </View>
  
            <Text style={[styles.cardSubtitulo, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
              {t("reserva.datosPersonales.subtitulo", {
                defaultValue: "Completa tus datos de contacto para la reserva y el contrato digital",
              })}
            </Text>
  
            <View style={[styles.divider, { backgroundColor: c.oscuro ? c.border : "#E2E8F0" }]} />
  
            <View style={styles.campo}>
              <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                {t("reserva.datosPersonales.nombreCompleto", { defaultValue: "Nombre completo *" })}
              </Text>
              <TextInput accessibilityLabel={t("perfil.placeholders.nombreCompleto", { defaultValue: "Ej. Juan Pérez" })}
                style={[
                  styles.input,
                  { backgroundColor: c.oscuro ? c.bgInput : "#F8FAFC", borderColor: c.oscuro ? c.border : "#E2E8F0", color: c.oscuro ? "#F8FAFC" : "#0F172A" },
                ]}
                value={datosPersonales.nombreCompleto}
                onChangeText={(v) => {
                  actualizarDatosPersonales({ nombreCompleto: v });
                  const { nombres, apellidos } = separarNombreCompleto(v);
                  actualizarUsuarioGlobal({ nombres, apellidos });
                }}
                placeholder={t("perfil.placeholders.nombreCompleto", { defaultValue: "Ej. Juan Pérez" })}
                placeholderTextColor={c.textMuted}
                autoCapitalize="words"
              />
            </View>
  
            <View style={styles.campo}>
              <CampoSelectorLista
                etiqueta={t("reserva.datosPersonales.nacionalidad", { defaultValue: "Nacionalidad *" })}
                valorSeleccionado={datosPersonales.nacionalidad || null}
                opciones={OPCIONES_NACIONALIDAD}
                placeholder={t("perfil.seleccionar", { defaultValue: "Seleccionar" })}
                onSeleccionar={(id) => {
                  actualizarDatosPersonales({ nacionalidad: id });
                  actualizarUsuarioGlobal({ nacionalidad: id });
                  if (esNacionalidadColombiana(id)) {
                    if (
                      datosPersonales.tipoDocumento &&
                      !["CC", "CE", "Pasaporte"].includes(datosPersonales.tipoDocumento)
                    ) {
                      actualizarDatosPersonales({ tipoDocumento: null });
                      actualizarUsuarioGlobal({ tipoDocumento: "" });
                    }
                  } else {
                    if (
                      datosPersonales.tipoDocumento &&
                      !["Pasaporte", "CE"].includes(datosPersonales.tipoDocumento)
                    ) {
                      actualizarDatosPersonales({ tipoDocumento: null });
                      actualizarUsuarioGlobal({ tipoDocumento: "" });
                    }
                  }
                }}
              />
            </View>
  
            <View style={styles.campo}>
              <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                {t("reserva.datosPersonales.correoElectronico", { defaultValue: "Correo electrónico *" })}
              </Text>
              <TextInput accessibilityLabel={t("perfil.placeholders.correo", { defaultValue: "cliente@drivique.com" })}
                style={[
                  styles.input,
                  { backgroundColor: c.oscuro ? c.bgInput : "#F8FAFC", borderColor: c.oscuro ? c.border : "#E2E8F0", color: c.oscuro ? "#F8FAFC" : "#0F172A" },
                ]}
                value={datosPersonales.correo}
                onChangeText={(v) => {
                  actualizarDatosPersonales({ correo: v });
                  actualizarUsuarioGlobal({ correo: v });
                }}
                placeholder={t("perfil.placeholders.correo", { defaultValue: "cliente@drivique.com" })}
                placeholderTextColor={c.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
  
            <View style={styles.campo}>
              <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                {t("reserva.datosPersonales.numeroCelular", { defaultValue: "Teléfono celular *" })}
              </Text>
              <View style={styles.filaCelular}>
                {prefijoTelefono ? (
                  <View
                    style={[
                      styles.prefijoBox,
                      {
                        backgroundColor: c.oscuro ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                        borderColor: c.oscuro ? c.border : "#E2E8F0",
                      },
                    ]}
                  >
                    <Text style={[styles.prefijoText, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                      {prefijoTelefono}
                    </Text>
                  </View>
                ) : null}
                <TextInput accessibilityLabel={!hayPrefijo
                      ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                      : t("perfil.placeholders.telefono", { defaultValue: "Ej. 3144214909" })}
                  style={[
                    styles.input,
                    styles.inputCelular,
                    {
                      backgroundColor: c.oscuro ? c.bgInput : (hayPrefijo ? "#F8FAFC" : "#F3F4F6"),
                      borderColor: c.oscuro ? c.border : "#E2E8F0",
                      color: c.oscuro ? "#F8FAFC" : "#0F172A",
                      opacity: !hayPrefijo ? 0.6 : 1,
                    },
                  ]}
                  editable={hayPrefijo}
                  value={datosPersonales.celular}
                  onChangeText={(v) => {
                    const digits = v.replace(/\D/g, "").slice(0, 12);
                    actualizarDatosPersonales({ celular: digits });
                    actualizarUsuarioGlobal({ telefono: digits });
                  }}
                  keyboardType="phone-pad"
                  placeholder={
                    !hayPrefijo
                      ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                      : t("perfil.placeholders.telefono", { defaultValue: "Ej. 3144214909" })
                  }
                  placeholderTextColor={c.textMuted}
                />
              </View>
            </View>
  
            <View style={styles.campo}>
              <CampoSelectorLista
                etiqueta={t("reserva.datosPersonales.tipoDeDocumento", { defaultValue: "Tipo de documento *" })}
                valorSeleccionado={datosPersonales.tipoDocumento}
                opciones={opcionesTipoDocumentoFiltradas}
                deshabilitado={!hayPrefijo}
                placeholder={
                  !hayPrefijo
                    ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                    : t("perfil.seleccionar", { defaultValue: "Seleccionar" })
                }
                onSeleccionar={(id) => {
                  actualizarDatosPersonales({
                    tipoDocumento: id as typeof datosPersonales.tipoDocumento,
                  });
                  actualizarUsuarioGlobal({
                    tipoDocumento: id as TipoDocumento,
                  });
                }}
              />
            </View>
  
            <View style={[styles.campo, { marginBottom: 0 }]}>
              <Text style={[styles.inputLabel, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                {t("reserva.datosPersonales.numeroDeDocumento", { defaultValue: "Número de documento *" })}
              </Text>
              <View style={styles.filaCelular}>
                {datosPersonales.tipoDocumento ? (
                  <View
                    style={[
                      styles.prefijoBox,
                      {
                        backgroundColor: c.oscuro ? "rgba(255,255,255,0.05)" : "#F8FAFC",
                        borderColor: c.oscuro ? c.border : "#E2E8F0",
                      },
                    ]}
                  >
                    <Text style={[styles.prefijoText, { color: c.oscuro ? "#94A3B8" : "#64748B" }]}>
                      {getSiglaDocumento(datosPersonales.tipoDocumento)}
                    </Text>
                  </View>
                ) : null}
                <TextInput accessibilityLabel={!hayPrefijo
                      ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                      : !datosPersonales.tipoDocumento
                        ? t("vehiculo.selectDocTypeFirst", { defaultValue: "Primero selecciona tu tipo de documento" })
                        : datosPersonales.tipoDocumento === "Pasaporte"
                          ? "Ej. P12345678"
                          : "Ej. 1075228306"}
                  style={[
                    styles.input,
                    styles.inputCelular,
                    {
                      backgroundColor: c.oscuro ? c.bgInput : (datosPersonales.tipoDocumento ? "#F8FAFC" : "#F3F4F6"),
                      borderColor: c.oscuro ? c.border : "#E2E8F0",
                      color: c.oscuro ? "#F8FAFC" : "#0F172A",
                      opacity: !datosPersonales.tipoDocumento ? 0.6 : 1,
                    },
                  ]}
                  editable={!!datosPersonales.tipoDocumento}
                  value={datosPersonales.numeroDocumento}
                  onChangeText={(v) => {
                    const upper = v.toUpperCase();
                    actualizarDatosPersonales({ numeroDocumento: upper });
                    actualizarUsuarioGlobal({ numeroDocumento: upper });
                  }}
                  placeholder={
                    !hayPrefijo
                      ? t("vehiculo.selectNationalityFirst", { defaultValue: "Primero selecciona tu nacionalidad" })
                      : !datosPersonales.tipoDocumento
                        ? t("vehiculo.selectDocTypeFirst", { defaultValue: "Primero selecciona tu tipo de documento" })
                        : datosPersonales.tipoDocumento === "Pasaporte"
                          ? "Ej. P12345678"
                          : "Ej. 1075228306"
                  }
                  placeholderTextColor={c.textMuted}
                  keyboardType={
                    datosPersonales.tipoDocumento === "CC"
                      ? "numeric"
                      : "default"
                  }
                />
              </View>
            </View>
          </View>
        </View>
  )
}
