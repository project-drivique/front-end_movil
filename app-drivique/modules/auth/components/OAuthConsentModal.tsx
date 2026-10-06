// modules/auth/components/OAuthConsentModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage';

interface Props {
  visible: boolean;
  provider: 'GOOGLE' | 'FACEBOOK';
  onConfirm: (datos: { email: string; firstName: string; lastName: string; provider: string }) => void;
  onClose: () => void;
}

export function OAuthConsentModal({ visible, provider, onConfirm, onClose }: Props) {
  const c = useTemaColores();
  const isGoogle = provider === 'GOOGLE';

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  const handleConfirm = () => {
    if (!correo.trim() || !correo.includes('@')) {
      setErrorValidacion('Ingresa un correo electrónico válido');
      return;
    }
    if (!nombre.trim()) {
      setErrorValidacion('Ingresa tu nombre');
      return;
    }

    onConfirm({
      email: correo.trim().toLowerCase(),
      firstName: nombre.trim(),
      lastName: apellido.trim() || (isGoogle ? 'Google' : 'Facebook'),
      provider,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.providerRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: isGoogle ? '#FFFFFF' : '#1877F2' },
                ]}
              >
                <Ionicons
                  name={isGoogle ? 'logo-google' : 'logo-facebook'}
                  size={20}
                  color={isGoogle ? '#EA4335' : '#FFFFFF'}
                />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.titulo, { color: c.textPrimary }]}>
                  {isGoogle ? 'Acceso con Google' : 'Acceso con Facebook'}
                </Text>
                <Text style={[styles.subtitulo, { color: c.textSecondary }]}>
                  OAuth 2.0 / OpenID Connect
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={[styles.desc, { color: c.textSecondary }]}>
              Confirma tu cuenta real de {isGoogle ? 'Google' : 'Facebook'} para continuar a Drivique:
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 6 }}>
                <Text style={[styles.label, { color: c.textPrimary }]}>Nombre *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.border }]}
                  placeholder="Ej. Carlos"
                  placeholderTextColor="#9CA3AF"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={[styles.label, { color: c.textPrimary }]}>Apellido</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.border }]}
                  placeholder="Ej. Gómez"
                  placeholderTextColor="#9CA3AF"
                  value={apellido}
                  onChangeText={setApellido}
                />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.label, { color: c.textPrimary }]}>
                Correo {isGoogle ? 'Google (@gmail.com)' : 'Facebook'} *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.bgInput, color: c.textPrimary, borderColor: c.border }]}
                placeholder={isGoogle ? 'tu_correo@gmail.com' : 'tu_correo@facebook.com'}
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
              />
            </View>

            {/* Permisos */}
            <View style={[styles.permisosBox, { backgroundColor: c.oscuro ? '#1F2937' : '#F3F4F6' }]}>
              <View style={styles.permisoHeader}>
                <Ionicons name="shield-checkmark" size={14} color={isGoogle ? '#4285F4' : '#1877F2'} />
                <Text style={[styles.permisoTitulo, { color: c.textPrimary }]}> Permisos solicitados:</Text>
              </View>
              <Text style={[styles.permisoItem, { color: c.textSecondary }]}>• Tu nombre completo y foto de perfil</Text>
              <Text style={[styles.permisoItem, { color: c.textSecondary }]}>• Tu dirección de correo electrónico</Text>
            </View>

            {errorValidacion ? (
              <Text style={styles.errorText}>{errorValidacion}</Text>
            ) : null}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btnCancel, { borderColor: c.border }]} onPress={onClose}>
                <Text style={{ color: c.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btnConfirm,
                  { backgroundColor: isGoogle ? '#4285F4' : '#1877F2' },
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.btnConfirmText}>Autorizar y Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitulo: {
    fontSize: 11,
  },
  closeBtn: {
    padding: 6,
  },
  body: {
    padding: 16,
  },
  desc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  permisosBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
  },
  permisoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permisoTitulo: {
    fontSize: 12,
    fontWeight: '700',
  },
  permisoItem: {
    fontSize: 11,
    lineHeight: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
    gap: 10,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  btnConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
