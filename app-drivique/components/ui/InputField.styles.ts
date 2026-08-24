import { StyleSheet } from 'react-native';

export const inputFieldStyles = StyleSheet.create({
  contenedor: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
  },
  pillWrapper: {
    borderRadius: 24,
  },
  iconContainer: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  inputErrorWrapper: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  textoError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
