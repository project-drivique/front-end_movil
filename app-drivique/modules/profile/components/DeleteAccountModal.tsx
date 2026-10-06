import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { authService } from '@/modules/auth/services/authService'
import { useTemaColores } from '@/modules/i18n/hooks/useLanguage'

interface Props {
  visible: boolean
  onCerrar: () => void
  onEliminada: () => Promise<void> | void
}

export function DeleteAccountModal({ visible, onCerrar, onEliminada }: Props) {
  const { t } = useTranslation()
  const c = useTemaColores()
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    if (!visible) {
      setContrasena('')
      setError('')
      setEliminando(false)
    }
  }, [visible])

  const confirmar = async () => {
    if (!contrasena.trim()) {
      setError(t('perfil.validacion.contrasenaActualObligatoria', { defaultValue: 'Ingresa tu contraseña actual.' }))
      return
    }
    setEliminando(true)
    setError('')
    try {
      await authService.eliminarCuenta(contrasena)
      await onEliminada()
    } catch (err: any) {
      const data = err?.response?.data
      setError(err?.response?.status === 401
        ? t('perfil.cambiarContrasena.actualIncorrecta', { defaultValue: 'La contraseña actual es incorrecta.' })
        : data?.detail || data?.message || t('perfil.errorMsg', { defaultValue: 'No fue posible eliminar la cuenta.' }))
    } finally {
      setEliminando(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={s.overlay}>
        <View style={[s.card, { backgroundColor: c.bgCard, borderColor: c.border }]}>
          <Text style={[s.title, { color: c.textPrimary }]}>{t('perfil.eliminarTitulo')}</Text>
          <Text style={[s.message, { color: c.textSecondary }]}>{t('perfil.eliminarMsg')}</Text>
          <TextInput
            value={contrasena}
            onChangeText={(value) => { setContrasena(value); setError('') }}
            placeholder={t('perfil.cambiarContrasena.actual', { defaultValue: 'Contraseña actual' })}
            placeholderTextColor={c.textMuted}
            secureTextEntry
            autoCapitalize="none"
            editable={!eliminando}
            style={[s.input, { color: c.textPrimary, borderColor: error ? '#DC2626' : c.border, backgroundColor: c.bgInput }]}
          />
          {error ? <Text style={s.error}>{error}</Text> : null}
          <View style={s.actions}>
            <TouchableOpacity style={[s.button, s.cancel, { borderColor: c.border }]} onPress={onCerrar} disabled={eliminando}>
              <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{t('perfil.cancelar')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.button, s.delete]} onPress={confirmar} disabled={eliminando}>
              {eliminando
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.deleteText}>{t('perfil.confirmarEliminar')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, borderRadius: 18, borderWidth: 1, padding: 22 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  error: { color: '#DC2626', fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  button: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cancel: { borderWidth: 1 },
  delete: { backgroundColor: '#DC2626' },
  deleteText: { color: '#fff', fontWeight: '800' },
})
