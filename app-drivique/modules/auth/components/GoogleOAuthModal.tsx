// modules/auth/components/GoogleOAuthModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CUENTAS_DEFAULT = [
  {
    id: '1',
    name: 'Emily Sharith Amezquita Saavedra',
    firstName: 'Emily Sharith',
    lastName: 'Amezquita Saavedra',
    email: 'sharithamezquita81@gmail.com',
    avatarBg: '#D97706',
    initial: 'E',
  },
  {
    id: '2',
    name: 'Norma Constanza Saavedra',
    firstName: 'Norma Constanza',
    lastName: 'Saavedra',
    email: 'saavedranrma@gmail.com',
    avatarBg: '#15803D',
    initial: 'N',
    status: 'Saliste de la cuenta',
  },
  {
    id: '3',
    name: 'sharith',
    firstName: 'Sharith',
    lastName: '',
    email: 'mimisaavedra09@gmail.com',
    avatarBg: '#4ADE80',
    initial: 's',
  },
  {
    id: '4',
    name: 'emily',
    firstName: 'Emily',
    lastName: '',
    email: 'larrysharith1830@gmail.com',
    avatarBg: '#64748B',
    initial: 'e',
  },
  {
    id: '5',
    name: 'Martha Saavedra',
    firstName: 'Martha',
    lastName: 'Saavedra',
    email: 'marthasaavedra592@gmail.com',
    avatarBg: '#7C3AED',
    initial: 'M',
    status: 'Saliste de la cuenta',
  },
  {
    id: '6',
    name: 'Marlon Urrea',
    firstName: 'Marlon',
    lastName: 'Urrea',
    email: 'hola34893@gmail.com',
    avatarBg: '#1E293B',
    initial: 'M',
  },
  {
    id: '7',
    name: 'Luciana Sanabria',
    firstName: 'Luciana',
    lastName: 'Sanabria',
    email: 'sanabrialuciana505@gmail.com',
    avatarBg: '#94A3B8',
    initial: 'L',
    status: 'Saliste de la cuenta',
  },
];

interface Props {
  visible: boolean;
  onConfirm: (datos: { email: string; firstName: string; lastName: string; provider: string }) => void;
  onClose: () => void;
}

export function GoogleOAuthModal({ visible, onConfirm, onClose }: Props) {
  const [paso, setPaso] = useState<'seleccionar' | 'consentimiento' | 'otra'>('seleccionar');
  const [cuenta, setCuenta] = useState(CUENTAS_DEFAULT[0]);
  const [otraNombre, setOtraNombre] = useState('');
  const [otraApellido, setOtraApellido] = useState('');
  const [otraCorreo, setOtraCorreo] = useState('');

  if (!visible) return null;

  const handleElegirCuenta = (c: typeof CUENTAS_DEFAULT[0]) => {
    setCuenta(c);
    setPaso('consentimiento');
  };

  const handleConfirmar = () => {
    onConfirm({
      email: cuenta.email,
      firstName: cuenta.firstName,
      lastName: cuenta.lastName || 'Google',
      provider: 'GOOGLE',
    });
    setPaso('seleccionar');
  };

  const handleGuardarOtra = () => {
    if (!otraCorreo.trim()) return;
    const nueva = {
      id: `custom_${Date.now()}`,
      name: `${otraNombre.trim()} ${otraApellido.trim()}`.trim(),
      firstName: otraNombre.trim() || 'Usuario',
      lastName: otraApellido.trim(),
      email: otraCorreo.trim().toLowerCase(),
      avatarBg: '#2563EB',
      initial: (otraNombre.trim() || 'U').charAt(0).toUpperCase(),
    };
    setCuenta(nueva);
    setPaso('consentimiento');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top bar de Google */}
        <View style={styles.topBar}>
          <Ionicons name="logo-google" size={18} color="#EA4335" />
          <Text style={styles.topBarText}>Acceder con Google</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#5F6368" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {paso === 'seleccionar' && (
            <View>
              <Text style={styles.tituloGrande}>Elige una cuenta</Text>
              <Text style={styles.subtituloApp}>
                Ir a <Text style={styles.enlaceApp}>drivique.com</Text>
              </Text>

              <View style={styles.listaCuentas}>
                {CUENTAS_DEFAULT.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemCuenta}
                    onPress={() => handleElegirCuenta(item)}
                  >
                    <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}>
                      <Text style={styles.avatarTexto}>{item.initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nombreCuenta}>{item.name}</Text>
                      <Text style={styles.correoCuenta}>{item.email}</Text>
                    </View>
                    {item.status ? (
                      <Text style={styles.statusCuenta}>{item.status}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.itemCuenta}
                  onPress={() => setPaso('otra')}
                >
                  <View style={[styles.avatar, { backgroundColor: '#F1F3F4' }]}>
                    <Ionicons name="person-add" size={18} color="#5F6368" />
                  </View>
                  <Text style={[styles.nombreCuenta, { color: '#1F1F1F' }]}>
                    Usar otra cuenta
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnCancelarOutlined} onPress={onClose}>
                <Text style={styles.btnCancelarOutlinedTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}

          {paso === 'consentimiento' && (
            <View>
              <Text style={styles.tituloGrande}>Accede a drivique.com</Text>

              {/* Chip selector de cuenta */}
              <TouchableOpacity
                style={styles.chipCuenta}
                onPress={() => setPaso('seleccionar')}
              >
                <View style={[styles.avatarSmall, { backgroundColor: cuenta.avatarBg }]}>
                  <Text style={styles.avatarSmallTexto}>{cuenta.initial}</Text>
                </View>
                <Text style={styles.chipEmail}>{cuenta.email}</Text>
                <Ionicons name="chevron-down" size={16} color="#5F6368" />
              </TouchableOpacity>

              <Text style={styles.permisosAviso}>
                Google permitirá que <Text style={{ color: '#0B57D0', fontWeight: '700' }}>drivique.com</Text> acceda a la siguiente información sobre ti:
              </Text>

              <View style={styles.permisoFila}>
                <Ionicons name="person-circle-outline" size={24} color="#5F6368" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.permisoNombre}>{cuenta.name}</Text>
                  <Text style={styles.permisoDesc}>Nombre y foto de perfil</Text>
                </View>
              </View>

              <View style={styles.permisoFila}>
                <Ionicons name="mail-outline" size={24} color="#5F6368" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.permisoNombre}>{cuenta.email}</Text>
                  <Text style={styles.permisoDesc}>Dirección de correo electrónico</Text>
                </View>
              </View>

              <Text style={styles.legalTexto}>
                Revisa la Política de Privacidad y las Condiciones del Servicio de drivique.com para comprender de qué manera drivique.com procesará y protegerá tus datos.
              </Text>

              <View style={styles.botonesAccion}>
                <TouchableOpacity
                  style={styles.btnCancelarPill}
                  onPress={() => setPaso('seleccionar')}
                >
                  <Text style={styles.btnCancelarPillTexto}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnContinuarPill}
                  onPress={handleConfirmar}
                >
                  <Text style={styles.btnContinuarPillTexto}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {paso === 'otra' && (
            <View>
              <Text style={styles.tituloGrande}>Iniciar sesión</Text>
              <Text style={styles.subtituloApp}>
                Usa tu cuenta de Google para ir a <Text style={styles.enlaceApp}>drivique.com</Text>
              </Text>

              <View style={{ marginTop: 20 }}>
                <Text style={styles.labelForm}>Nombre(s) *</Text>
                <TextInput
                  style={styles.inputForm}
                  placeholder="Ej. Emily Sharith"
                  value={otraNombre}
                  onChangeText={setOtraNombre}
                />

                <Text style={[styles.labelForm, { marginTop: 14 }]}>Apellido(s)</Text>
                <TextInput
                  style={styles.inputForm}
                  placeholder="Ej. Amezquita Saavedra"
                  value={otraApellido}
                  onChangeText={setOtraApellido}
                />

                <Text style={[styles.labelForm, { marginTop: 14 }]}>Correo electrónico (@gmail.com) *</Text>
                <TextInput
                  style={styles.inputForm}
                  placeholder="tu_correo@gmail.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={otraCorreo}
                  onChangeText={setOtraCorreo}
                />
              </View>

              <View style={styles.botonesAccion}>
                <TouchableOpacity
                  style={styles.btnCancelarPill}
                  onPress={() => setPaso('seleccionar')}
                >
                  <Text style={styles.btnCancelarPillTexto}>Volver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnContinuarPill}
                  onPress={handleGuardarOtra}
                >
                  <Text style={styles.btnContinuarPillTexto}>Siguiente</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E2EC',
  },
  topBarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F1F1F',
    marginLeft: 8,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 24,
  },
  tituloGrande: {
    fontSize: 28,
    fontWeight: '400',
    color: '#1F1F1F',
    marginBottom: 6,
  },
  subtituloApp: {
    fontSize: 15,
    color: '#1F1F1F',
    marginBottom: 20,
  },
  enlaceApp: {
    color: '#0B57D0',
    fontWeight: '500',
  },
  listaCuentas: {
    borderTopWidth: 1,
    borderTopColor: '#DADCE0',
  },
  itemCuenta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#DADCE0',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nombreCuenta: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  correoCuenta: {
    fontSize: 12,
    color: '#444746',
    marginTop: 2,
  },
  statusCuenta: {
    fontSize: 11,
    color: '#747775',
  },
  btnCancelarOutlined: {
    marginTop: 24,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#747775',
  },
  btnCancelarOutlinedTexto: {
    color: '#0B57D0',
    fontWeight: '600',
    fontSize: 14,
  },
  chipCuenta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#747775',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarSmallTexto: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chipEmail: {
    fontSize: 13,
    color: '#1F1F1F',
    marginRight: 6,
  },
  permisosAviso: {
    fontSize: 14,
    color: '#1F1F1F',
    lineHeight: 20,
    marginBottom: 20,
  },
  permisoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  permisoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  permisoDesc: {
    fontSize: 12,
    color: '#444746',
    marginTop: 1,
  },
  legalTexto: {
    fontSize: 11,
    color: '#444746',
    lineHeight: 16,
    marginVertical: 18,
  },
  botonesAccion: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  btnCancelarPill: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#747775',
  },
  btnCancelarPillTexto: {
    color: '#0B57D0',
    fontWeight: '600',
    fontSize: 14,
  },
  btnContinuarPill: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 20,
    backgroundColor: '#0B57D0',
  },
  btnContinuarPillTexto: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  labelForm: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F1F1F',
    marginBottom: 6,
  },
  inputForm: {
    height: 44,
    borderWidth: 1,
    borderColor: '#747775',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});
