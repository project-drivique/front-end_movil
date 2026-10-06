// modules/auth/components/FacebookOAuthModal.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onConfirm: (datos: { email: string; firstName: string; lastName: string; provider: string }) => void;
  onClose: () => void;
}

export function FacebookOAuthModal({ visible, onConfirm, onClose }: Props) {
  const [paso, setPaso] = useState<'dialog' | 'editar'>('dialog');
  const [nombre, setNombre] = useState('Emily Sharith Amezquita');
  const [correo, setCorreo] = useState('sharithamezquita81@gmail.com');

  if (!visible) return null;

  const handleConfirmar = () => {
    const partes = nombre.trim().split(' ');
    onConfirm({
      email: correo.trim().toLowerCase(),
      firstName: partes[0] || 'Emily',
      lastName: partes.slice(1).join(' ') || 'Amezquita',
      provider: 'FACEBOOK',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Facebook */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
              <Text style={styles.headerTitle}>Iniciar sesión con Facebook</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {paso === 'dialog' ? (
              <>
                <View style={styles.userRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{nombre.charAt(0)}</Text>
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.userName}>{nombre}</Text>
                    <Text style={styles.userEmail}>{correo}</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: 'bold' }}>drivique.com</Text> recibirá tu nombre, foto de perfil y dirección de correo electrónico.
                  </Text>
                </View>

                <TouchableOpacity style={styles.btnContinuar} onPress={handleConfirmar}>
                  <Text style={styles.btnContinuarText}>
                    Continuar como {nombre.split(' ')[0]}
                  </Text>
                </TouchableOpacity>

                <View style={styles.footerRow}>
                  <TouchableOpacity onPress={() => setPaso('editar')}>
                    <Text style={styles.linkEditar}>Editar datos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onClose} style={styles.btnCancelar}>
                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View>
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                />

                <Text style={[styles.label, { marginTop: 12 }]}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  value={correo}
                  onChangeText={setCorreo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                  <TouchableOpacity onPress={() => setPaso('dialog')} style={styles.btnCancelar}>
                    <Text style={styles.btnCancelarText}>Volver</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setPaso('dialog')} style={styles.btnGuardar}>
                    <Text style={styles.btnGuardarText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
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
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1877F2',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 10,
  },
  body: {
    padding: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1C1E21',
  },
  userEmail: {
    fontSize: 12,
    color: '#65676B',
    marginTop: 2,
  },
  infoBox: {
    backgroundColor: '#F0F2F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#4B4F56',
    lineHeight: 16,
  },
  btnContinuar: {
    backgroundColor: '#1877F2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnContinuarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  linkEditar: {
    color: '#1877F2',
    fontSize: 12,
    fontWeight: '600',
  },
  btnCancelar: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#F5F6F7',
    borderRadius: 6,
  },
  btnCancelarText: {
    color: '#4B4F56',
    fontWeight: '600',
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65676B',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#CCD0D5',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  btnGuardar: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: '#1877F2',
    borderRadius: 6,
  },
  btnGuardarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
