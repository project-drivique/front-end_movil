import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const registroStyles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contenedor: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 48,
  },

  // ── Encabezado ──────────────────────────────────────────────
  encabezado: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
  },
  marca: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 4,
    textAlign: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },

  // ── Secciones ───────────────────────────────────────────────
  seccionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
    marginTop: 8,
  },
  seccionHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
    marginTop: -8,
    lineHeight: 18,
  },

  // ── Términos y condiciones ───────────────────────────────────
  filaTerminos: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 4,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActivo: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 16,
  },
  textoTerminos: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  enlaceTerminos: {
    color: '#1D4ED8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  errorTerminos: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },

  // ── Pie del formulario ───────────────────────────────────────
  pieFormulario: {
    marginTop: 20,
  },
  botonVolver: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  textoVolver: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Pantalla de éxito ────────────────────────────────────────
  contenedorExito: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconoExito: {
    fontSize: 72,
    marginBottom: 20,
  },
  tituloExito: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  mensajeExito: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Modal de términos ────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContenedor: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  modalBotonCerrar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  modalBotonCerrarTexto: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  modalSeccionTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 16,
    marginBottom: 6,
  },
  modalTexto: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 8,
  },
  modalBotonAceptarWrap: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
  },
  modalBotonAceptar: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBotonAceptarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});