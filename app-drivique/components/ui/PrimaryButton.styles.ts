import { StyleSheet } from 'react-native';

export const primaryButtonStyles = StyleSheet.create({
  botonSombra: {
    borderRadius: 12,
    marginVertical: 6,
  },
  boton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  botonSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1D4ED8',
  },
  botonTexto: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    marginVertical: 2,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textoSecundario: {
    color: '#1D4ED8',
  },
  textoEnlace: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '600',
  },
});
