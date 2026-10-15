/**
 * support.dummy.ts
 *
 * Fuente de datos JSON / constantes dummy para la sección de Soporte.
 * Incluye canales de atención con números reales, tipos de incidencia con tiempos de atención y FAQs.
 */

export interface CanalContacto {
  id: string;
  nombreKey: string;
  nombreDefault: string;
  descripcionKey: string;
  descripcionDefault: string;
  valorContacto: string;
  urlAction: string;
  icono: string;
  colorIcono: string;
  colorBg: string;
}

export interface TipoIncidenciaDummy {
  id: string;
  nombre: string;
  icono: string;
  tiempoEstimado: string;
  descripcion: string;
}

export interface FaqItem {
  id: string;
  pregunta: string;
  respuesta: string;
}

// ─── Canales de Contacto Directo ──────────────────────────────────────────────

export const CANALES_CONTACTO_DUMMY: CanalContacto[] = [
  {
    id: "whatsapp",
    nombreKey: "tabs.whatsappTitle",
    nombreDefault: "Chat de WhatsApp Directo",
    descripcionKey: "tabs.whatsappDesc",
    descripcionDefault: "Atención inmediata 24/7 · +57 314 478 9702",
    valorContacto: "3144789702",
    urlAction: "https://wa.me/573144789702?text=Hola,%20necesito%20asistencia%20con%20mi%20reserva%20en%20Drivique",
    icono: "logo-whatsapp",
    colorIcono: "#25D366",
    colorBg: "#25D3661A",
  },
  {
    id: "phone",
    nombreKey: "tabs.phoneTitle",
    nombreDefault: "Línea Telefónica de Atención",
    descripcionKey: "tabs.phoneDesc",
    descripcionDefault: "+57 322 3163531 · Soporte en carretera",
    valorContacto: "3223163531",
    urlAction: "tel:+573223163531",
    icono: "call-outline",
    colorIcono: "#3B82F6",
    colorBg: "#3B82F61A",
  },
  {
    id: "email",
    nombreKey: "tabs.emailTitle",
    nombreDefault: "Correo Electrónico de Soporte",
    descripcionKey: "tabs.emailDesc",
    descripcionDefault: "soporte@drivique.com · Respuesta en menos de 2 horas",
    valorContacto: "soporte@drivique.com",
    urlAction: "mailto:soporte@drivique.com?subject=Soporte%20Drivique%20-%20Incidencia",
    icono: "mail-outline",
    colorIcono: "#1D4ED8",
    colorBg: "#1D4ED81A",
  },
];

// ─── Tipos de Incidencia ──────────────────────────────────────────────────────

export const TIPOS_INCIDENCIA_DUMMY: TipoIncidenciaDummy[] = [
  {
    id: "mecanica",
    nombre: "Avería mecánica",
    icono: "car-sport-outline",
    tiempoEstimado: "2 a 4 horas",
    descripcion: "Falla de motor, caja de cambios, frenos o transmisión.",
  },
  {
    id: "electrica",
    nombre: "Falla eléctrica / Batería",
    icono: "flash-outline",
    tiempoEstimado: "1 a 3 horas",
    descripcion: "Batería descargada, luces o sistema eléctrico.",
  },
  {
    id: "neumatico",
    nombre: "Pinchazo / Neumático",
    icono: "disc-outline",
    tiempoEstimado: "1 a 2 horas",
    descripcion: "Llanta desinflada, pinchada o problemas de neumático.",
  },
  {
    id: "limpieza",
    nombre: "Limpieza / Estética",
    icono: "sparkles-outline",
    tiempoEstimado: "12 horas",
    descripcion: "Higiene del interior, olores o detalles de pintura.",
  },
  {
    id: "documentacion",
    nombre: "Documentación / Licencia",
    icono: "document-text-outline",
    tiempoEstimado: "24 horas",
    descripcion: "SOAT, tecno-mecánica o documentos del vehículo.",
  },
  {
    id: "otro",
    nombre: "Otro problema",
    icono: "help-circle-outline",
    tiempoEstimado: "12 a 24 horas",
    descripcion: "Cualquier otra novedad durante tu periodo de reserva.",
  },
];

// ─── Preguntas Frecuentes (FAQs) ─────────────────────────────────────────────

export const FAQS_DUMMY: FaqItem[] = [
  {
    id: "faq-1",
    pregunta: "¿Qué debo hacer si el vehículo sufre una avería en carretera?",
    respuesta:
      "Usa la pestaña 'Reportar Incidencia' en esta sección para notificar al equipo técnico. Si requieres auxilio mecánico urgente o grúa en el sitio, comunícate directo al WhatsApp oficial (+57 314 478 9702) o a nuestra línea telefónica (+57 322 3163531).",
  },
  {
    id: "faq-2",
    pregunta: "¿Cómo se gestiona el cambio de estado del reporte?",
    respuesta:
      "El estado del reporte es actualizado exclusivamente por el equipo administrador técnico (Recibido, En revisión, En atención o Resuelto). Recibirás notificaciones por correo y en la app cada vez que el administrador actualice tu caso.",
  },
  {
    id: "faq-3",
    pregunta: "¿Puedo modificar los datos de contacto del reporte?",
    respuesta:
      "Sí. Por defecto se precargan los datos de tu perfil registrado, pero puedes cambiarlos en el formulario si deseas que la atención en campo sea coordinada con otra persona o número telefónico.",
  },
  {
    id: "faq-4",
    pregunta: "¿Cómo se calcula el tiempo estimado de solución?",
    respuesta:
      "El tiempo se calcula automáticamente según la categoría de la incidencia seleccionada y la disponibilidad de unidades móviles de taller autorizados en tu zona.",
  },
  {
    id: "faq-5",
    pregunta: "¿Dónde puedo consultar el historial de contratos y reservas?",
    respuesta:
      "Dirígete a la sección 'Mis Reservas' en la barra inferior para ver el detalle de tus vehículos, descargar contratos firmados en PDF o reportar incidencias específicas.",
  },
];
