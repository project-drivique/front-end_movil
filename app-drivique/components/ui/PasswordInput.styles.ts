import { StyleSheet } from 'react-native';

export const passwordInputStyles = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
  },
  filaError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  botonOjo: {
    paddingLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
