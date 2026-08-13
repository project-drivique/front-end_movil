import { Linking } from "react-native";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: { label: string; actionValue: string }[];
}

export const OpcionesIniciales = [
  { label: "🚗 ¿Cómo alquilar un vehículo?", actionValue: "como_alquilar" },
  { label: "📋 Requisitos y documentos", actionValue: "requisitos" },
  { label: "💰 Métodos de pago y depósitos", actionValue: "pagos" },
  { label: "🤝 Poner mi vehículo en alquiler", actionValue: "alquilar_mi_carro" },
  { label: "🚨 Reportar daño o emergencia", actionValue: "emergencia" },
  { label: "💬 Hablar con un asesor (WhatsApp)", actionValue: "contacto_humano" },
];

export function obtenerHoraActual(): string {
  const ahora = new Date();
  return ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function procesarMensajeChatbot(textoUsuario: string): Omit<ChatMessage, "id" | "timestamp"> {
  const query = textoUsuario.toLowerCase().trim();

  // 1. Alquilar mi carro / Poner vehículo en la plataforma
  if (
    query.includes("mi carro") ||
    query.includes("mi vehiculo") ||
    query.includes("mi auto") ||
    query.includes("alquilar mi") ||
    query.includes("publicar") ||
    query.includes("ganar dinero") ||
    query.includes("socio") ||
    query.includes("propietario")
  ) {
    return {
      sender: "bot",
      text: "¡Excelente iniciativa! En Drivique puedes registrar tu vehículo para generar ingresos cuando no lo uses.\n\n📌 **Pasos:**\n1. Inicia sesión o regístrate en la app.\n2. Ve a la sección 'Mi Perfil' o contáctanos para validar tu vehículo.\n3. Tu auto pasará por inspección técnica y revisión de documentos antes de ser activado.",
      options: [
        { label: "📋 Requisitos para vehículos", actionValue: "requisitos_vehiculo" },
        { label: "💬 Contactar asesor para registro", actionValue: "contacto_humano" },
      ],
    };
  }

  // 2. Cómo alquilar / Proceso de alquiler
  if (
    query.includes("como_alquilar") ||
    query.includes("alquilar") ||
    query.includes("rentar") ||
    query.includes("reservar") ||
    query.includes("proceso") ||
    query.includes("pasos")
  ) {
    return {
      sender: "bot",
      text: "Para alquilar un vehículo en Drivique sigue estos sencillos pasos:\n\n1️⃣ Explora nuestro **Catálogo** y elige el auto de tu preferencia.\n2️⃣ Selecciona las fechas de recogida y devolución.\n3️⃣ Completa tus datos de conductor.\n4️⃣ Realiza el pago seguro o reserva.\n\n¡Recibirás la confirmación de tu contrato y el pase de recogida inmediatamente!",
      options: [
        { label: "📋 Ver requisitos", actionValue: "requisitos" },
        { label: "💳 Ver métodos de pago", actionValue: "pagos" },
      ],
    };
  }

  // 3. Requisitos y documentos
  if (
    query.includes("requisitos") ||
    query.includes("documento") ||
    query.includes("licencia") ||
    query.includes("cedula") ||
    query.includes("pasaporte") ||
    query.includes("edad")
  ) {
    return {
      sender: "bot",
      text: "📌 **Requisitos para alquilar en Drivique:**\n\n• Ser mayor de 21 años.\n• Licencia de conducción vigente (mínimo 1 año de expedición).\n• Documento de identidad (Cédula o Pasaporte vigente).\n• Tarjeta de crédito o débito a nombre del titular de la reserva para el depósito de garantía.",
      options: [
        { label: "💰 Ver depósito de garantía", actionValue: "pagos" },
        { label: "🚗 Ver proceso de alquiler", actionValue: "como_alquilar" },
      ],
    };
  }

  // 4. Requisitos para dueños de vehículo
  if (query.includes("requisitos_vehiculo")) {
    return {
      sender: "bot",
      text: "🚗 **Requisitos para registrar tu auto:**\n\n• Modelo no superior a 8 años de antigüedad.\n• SOAT y Tecnomecánica al día.\n• Tarjeta de propiedad original a tu nombre.\n• Inspección física aprobada por nuestro equipo técnico.",
      options: [
        { label: "💬 Hablar con un asesor", actionValue: "contacto_humano" },
      ],
    };
  }

  // 5. Pagos y depósitos
  if (
    query.includes("pagos") ||
    query.includes("pago") ||
    query.includes("tarjeta") ||
    query.includes("deposito") ||
    query.includes("garantia") ||
    query.includes("precio") ||
    query.includes("costo") ||
    query.includes("efectivo")
  ) {
    return {
      sender: "bot",
      text: "💳 **Información de Pagos y Garantías:**\n\n• Aceptamos Tarjetas de Crédito, Débito y pagos digitales procesados de forma 100% segura.\n• Al iniciar el alquiler se realiza un bloqueo temporal (depósito de garantía) que se libera automáticamente al devolver el vehículo en buen estado.",
      options: [
        { label: "🚨 ¿Qué pasa en caso de daño?", actionValue: "emergencia" },
        { label: "💬 Contactar soporte", actionValue: "contacto_humano" },
      ],
    };
  }

  // 6. Emergencias / Daños / Incidencias
  if (
    query.includes("emergencia") ||
    query.includes("daño") ||
    query.includes("dano") ||
    query.includes("varado") ||
    query.includes("accidente") ||
    query.includes("taller") ||
    query.includes("grua") ||
    query.includes("incidencia")
  ) {
    return {
      sender: "bot",
      text: "🚨 **Asistencia en Carretera 24/7:**\n\nSi experimentas una falla mecánica o incidente:\n1. Mantén la calma y estaciona en un lugar seguro.\n2. Ve a la pestaña **Soporte > Reportar Incidencia** en la app para registrar el reporte.\n3. Todos nuestros vehículos cuentan con cobertura y grúa de asistencia inmediata.",
      options: [
        { label: "💬 Contactar línea de emergencia (WhatsApp)", actionValue: "contacto_humano" },
      ],
    };
  }

  // 7. Contacto humano
  if (
    query.includes("contacto_humano") ||
    query.includes("asesor") ||
    query.includes("humano") ||
    query.includes("persona") ||
    query.includes("whatsapp") ||
    query.includes("telefono") ||
    query.includes("soporte")
  ) {
    // Abrir WhatsApp directamente si presiona la acción
    Linking.openURL("https://wa.me/573144789702?text=Hola,%20necesito%20asistencia%20con%20mi%20alquiler%20en%20Drivique").catch(() => {});

    return {
      sender: "bot",
      text: "📱 Te hemos redirigido a nuestra línea directa de WhatsApp **(+57 314 478 9702)** donde un asesor te atenderá personalmente.\n\nTambién puedes escribirnos a nuestro correo: **soporte@drivique.com**",
      options: OpcionesIniciales.slice(0, 4),
    };
  }

  // 8. Saludos
  if (
    query.includes("hola") ||
    query.includes("buenas") ||
    query.includes("buenos dias") ||
    query.includes("buenas tardes") ||
    query.includes("buenas noches") ||
    query.includes("inicio")
  ) {
    return {
      sender: "bot",
      text: "¡Hola! 👋 Bienvenido al soporte virtual de **Drivique**. ¿En qué puedo ayudarte hoy?",
      options: OpcionesIniciales,
    };
  }

  // Respuesta por defecto si no reconoce la intención exacta
  return {
    sender: "bot",
    text: "Entiendo tu consulta sobre *" + textoUsuario + "*. Para ofrecerte la mejor orientación sobre el servicio de Drivique, elige una de las siguientes opciones o contáctanos directamente:",
    options: OpcionesIniciales,
  };
}
