import { Linking } from "react-native";
import { IdiomaKey } from "@/modules/i18n";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  options?: { label: string; actionValue: string }[];
}

export function obtenerHoraActual(): string {
  const ahora = new Date();
  return ahora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Opciones iniciales multilenguaje
export function obtenerOpcionesIniciales(lang: IdiomaKey = "es") {
  switch (lang) {
    case "en":
      return [
        { label: "🚗 How to rent a vehicle?", actionValue: "como_alquilar" },
        { label: "📋 Requirements & Documents", actionValue: "requisitos" },
        { label: "💱 Currency & Payment Methods", actionValue: "monedas_pagos" },
        { label: "🤝 List my car for rent", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Insurance & Coverage", actionValue: "seguros" },
        { label: "🚨 Emergency & Roadside Help", actionValue: "emergencia" },
        { label: "🌐 Change Language / Theme", actionValue: "idioma_tema" },
        { label: "💬 Contact Support (WhatsApp)", actionValue: "contacto_humano" },
      ];
    case "fr":
      return [
        { label: "🚗 Comment louer un véhicule ?", actionValue: "como_alquilar" },
        { label: "📋 Exigences et Documents", actionValue: "requisitos" },
        { label: "💱 Devises et Paiements", actionValue: "monedas_pagos" },
        { label: "🤝 Inscrire ma voiture", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Assurances & Couverture", actionValue: "seguros" },
        { label: "🚨 Urgence et Dépanneuse", actionValue: "emergencia" },
        { label: "🌐 Langue / Thème Sombre", actionValue: "idioma_tema" },
        { label: "💬 Contact Support (WhatsApp)", actionValue: "contacto_humano" },
      ];
    case "pt":
    case "br":
      return [
        { label: "🚗 Como alugar um veículo?", actionValue: "como_alquilar" },
        { label: "📋 Requisitos e Documentos", actionValue: "requisitos" },
        { label: "💱 Moedas e Pagamentos", actionValue: "monedas_pagos" },
        { label: "🤝 Cadastrar meu carro", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Seguros e Cobertura", actionValue: "seguros" },
        { label: "🚨 Emergência e Guinchos", actionValue: "emergencia" },
        { label: "🌐 Idioma / Modo Escuro", actionValue: "idioma_tema" },
        { label: "💬 Falar com Suporte (WhatsApp)", actionValue: "contacto_humano" },
      ];
    case "es":
    default:
      return [
        { label: "🚗 ¿Cómo alquilar un vehículo?", actionValue: "como_alquilar" },
        { label: "📋 Requisitos y documentos", actionValue: "requisitos" },
        { label: "💱 Monedas y Métodos de pago", actionValue: "monedas_pagos" },
        { label: "🤝 Poner mi vehículo en alquiler", actionValue: "alquilar_mi_carro" },
        { label: "🛡️ Seguros y Coberturas", actionValue: "seguros" },
        { label: "📍 Entregas a domicilio / Aeropuerto", actionValue: "entregas" },
        { label: "🚨 Reportar daño o emergencia", actionValue: "emergencia" },
        { label: "🌐 Idioma y Modo Oscuro", actionValue: "idioma_tema" },
        { label: "💬 Hablar con un asesor (WhatsApp)", actionValue: "contacto_humano" },
      ];
  }
}

// Mensaje de bienvenida según el idioma
export function obtenerMensajeBienvenida(lang: IdiomaKey = "es"): ChatMessage {
  const options = obtenerOpcionesIniciales(lang);
  let text = "¡Hola! 👋 Soy **Drivibot**, tu asistente virtual de **Drivique**.\n\n¿En qué puedo ayudarte hoy sobre nuestros alquileres de vehículos?";
  
  if (lang === "en") {
    text = "Hello! 👋 I'm **Drivibot**, your **Drivique** virtual assistant.\n\nHow can I help you today regarding vehicle rentals, currencies, or policies?";
  } else if (lang === "fr") {
    text = "Bonjour ! 👋 Je suis **Drivibot**, votre assistant virtuel **Drivique**.\n\nComment puis-je vous aider aujourd'hui concernant les locations de véhicules ?";
  } else if (lang === "pt" || lang === "br") {
    text = "Olá! 👋 Sou o **Drivibot**, seu assistente virtual do **Drivique**.\n\nComo posso ajudar você hoje com relação ao aluguel de veículos?";
  }

  return {
    id: `welcome-${Date.now()}`,
    sender: "bot",
    text,
    timestamp: obtenerHoraActual(),
    options,
  };
}

// MOTOR DE RESPUESTAS INTELIGENTE Y ABIERTO
export function procesarMensajeChatbot(
  textoUsuario: string,
  lang: IdiomaKey = "es"
): Omit<ChatMessage, "id" | "timestamp"> {
  const q = textoUsuario.toLowerCase().trim();
  const opts = obtenerOpcionesIniciales(lang);

  // 1. PUBLICAR / REGISTRAR / ALQUILAR MI CARRO (Dueños)
  if (
    q.includes("mi carro") ||
    q.includes("mi vehiculo") ||
    q.includes("mi auto") ||
    q.includes("publicar") ||
    q.includes("alquilar mi") ||
    q.includes("ganar dinero") ||
    q.includes("socio") ||
    q.includes("propietario") ||
    q.includes("monetizar") ||
    q.includes("alquilar_mi_carro")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🚗 **List your car on Drivique & Earn Extra Income!**\n\n1. Sign up as a vehicle owner in the app.\n2. Upload your vehicle details, insurance (SOAT), and mechanical inspection.\n3. Our team verifies the documentation and activates your vehicle for rentals.\n\n**Owner Requirements:** Model max 8 years old, valid SOAT & Technical Inspection.",
        options: opts.slice(0, 3),
      };
    }
    return {
      sender: "bot",
      text: "🚗 **¡Pon tu vehículo en alquiler y genera ingresos con Drivique!**\n\n📌 **Pasos:**\n1. Inicia sesión o regístrate en la aplicación.\n2. Dirígete a la sección de perfil o contáctanos para registrar tu vehículo.\n3. Tu auto pasará por una revisión técnica y verificación de documentos (SOAT y Tecnomecánica vigentes, antigüedad máx 8 años).\n4. ¡Una vez aprobado, recibirás ganancias por cada alquiler realizado!",
      options: [
        { label: "📋 Requisitos para vehículos", actionValue: "requisitos_vehiculo" },
        { label: "💬 Contactar asesor para registro", actionValue: "contacto_humano" },
      ],
    };
  }

  // 2. MONEDAS Y CONVERSIÓN DE DIVISAS (COP, USD, EUR, BRL)
  if (
    q.includes("moneda") ||
    q.includes("divisa") ||
    q.includes("dolar") ||
    q.includes("dólar") ||
    q.includes("usd") ||
    q.includes("euro") ||
    q.includes("eur") ||
    q.includes("cop") ||
    q.includes("peso") ||
    q.includes("real") ||
    q.includes("brl") ||
    q.includes("cambio") ||
    q.includes("conversion") ||
    q.includes("monedas_pagos")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "💱 **Currencies & Exchange Rates in Drivique:**\n\n• Base prices are displayed in **COP** (Colombian Pesos).\n• We accept international credit/debit cards (Visa, Mastercard, Amex) processed via Wompi.\n• **Approximate conversion rates:**\n  - 1 USD ≈ 4,000 COP\n  - 1 EUR ≈ 4,300 COP\n  - 1 BRL ≈ 780 COP\n\nYour bank will perform the automatic currency conversion at checkout.",
        options: opts.slice(1, 4),
      };
    }
    return {
      sender: "bot",
      text: "💱 **Monedas Aceptadas y Conversión en Drivique:**\n\n• La tarifa base de los vehículos se muestra en **Pesos Colombianos (COP)**.\n• Puedes pagar con tarjetas de crédito/débito internacionales, PSE o Wompi.\n• **Tasa de cambio de referencia estimada:**\n  - 🇺🇸 1 USD ≈ $4.000 COP\n  - 🇪🇺 1 EUR ≈ $4.300 COP\n  - 🇧🇷 1 BRL ≈ $780 COP\n\nTu banco realizará la conversión automática al momento de efectuar el pago digital seguro.",
      options: [
        { label: "💳 Ver métodos de pago", actionValue: "pagos" },
        { label: "🚗 Ver tarifas de alquiler", actionValue: "como_alquilar" },
      ],
    };
  }

  // 3. PROCESO DE ALQUILER / CÓMO RESERVAR
  if (
    q.includes("como_alquilar") ||
    q.includes("alquilar") ||
    q.includes("rentar") ||
    q.includes("reservar") ||
    q.includes("proceso") ||
    q.includes("pasos") ||
    q.includes("reserva")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🚗 **How to rent a vehicle on Drivique:**\n\n1️⃣ Explore the **Catalog** and pick your favorite car (SUVs, Economic, Sedans, Premium).\n2️⃣ Select pick-up & return dates and location (Branch, Airport, or Home Delivery).\n3️⃣ Choose your protection plan (Mandatory or Total Coverage).\n4️⃣ Confirm and pay securely online (Wompi) or select Cash at Branch.\n\n✨ Your digital contract will be generated instantly!",
        options: opts.slice(1, 4),
      };
    }
    return {
      sender: "bot",
      text: "🚗 **Proceso fácil en 4 pasos para alquilar en Drivique:**\n\n1️⃣ **Busca:** Explora el catálogo de vehículos y filtra por categoría (SUV, Sedán, Económico, Premium), transmisión o ciudad.\n2️⃣ **Fechas:** Selecciona las fechas y la hora de recogida y devolución.\n3️⃣ **Entrega:** Elige si deseas retirar en sucursal o recibir el auto a domicilio/aeropuerto.\n4️⃣ **Pago y Contrato:** Elige el seguro y paga de forma segura (Wompi, Tarjetas, PSE o Efectivo en sucursal). ¡Tu contrato digital se generará de inmediato!",
      options: [
        { label: "📋 Ver requisitos", actionValue: "requisitos" },
        { label: "🛡️ Ver opciones de seguro", actionValue: "seguros" },
      ],
    };
  }

  // 4. REQUISITOS Y DOCUMENTOS
  if (
    q.includes("requisito") ||
    q.includes("documento") ||
    q.includes("licencia") ||
    q.includes("cedula") ||
    q.includes("pasaporte") ||
    q.includes("edad") ||
    q.includes("requisitos")
  ) {
    return {
      sender: "bot",
      text: "📋 **Requisitos para alquilar un vehículo:**\n\n• **Edad:** Ser mayor de 21 años (o desde 18 años con autorización).\n• **Licencia de conducción:** Licencia vigente (mínimo 1 año de expedición nacional o internacional).\n• **Documento de identidad:** Cédula de ciudadanía o Pasaporte original vigente.\n• **Garantía:** Tarjeta de crédito o débito a nombre del titular para el depósito de garantía.",
      options: [
        { label: "💳 Ver depósito de garantía", actionValue: "pagos" },
        { label: "💱 Ver tasas y monedas", actionValue: "monedas_pagos" },
      ],
    };
  }

  // 5. MÉTODOS DE PAGO / EFECTIVO / WOMPI / DEPOSITOS
  if (
    q.includes("pagos") ||
    q.includes("pago") ||
    q.includes("tarjeta") ||
    q.includes("wompi") ||
    q.includes("pse") ||
    q.includes("efectivo") ||
    q.includes("deposito") ||
    q.includes("garantia") ||
    q.includes("precio") ||
    q.includes("costo") ||
    q.includes("factura")
  ) {
    return {
      sender: "bot",
      text: "💳 **Métodos de Pago y Depósitos de Garantía:**\n\n• **Pago Virtual:** Procesado 100% seguro por la pasarela **Wompi** (ACEPTA Tarjetas de Crédito, Débito y PSE). Habilita entregas a domicilio, aeropuerto y terminal.\n• **Pago en Efectivo:** Puedes seleccionar pago en efectivo y retirar directamente en la sucursal de Drivique.\n• **Depósito de Garantía:** Se realiza una retención temporal en la tarjeta que se libera automáticamente al devolver el vehículo sin daños.",
      options: [
        { label: "💱 Ver equivalencias en dólares/euros", actionValue: "monedas_pagos" },
        { label: "🛡️ Ver cobertura de seguros", actionValue: "seguros" },
      ],
    };
  }

  // 6. SEGUROS Y COBERTURAS
  if (
    q.includes("seguro") ||
    q.includes("seguros") ||
    q.includes("cobertura") ||
    q.includes("proteccion") ||
    q.includes("deducible") ||
    q.includes("todo riesgo") ||
    q.includes("soat")
  ) {
    return {
      sender: "bot",
      text: "🛡️ **Planes de Protección y Seguros Drivique:**\n\n1️⃣ **Protección Obligatoria:** Incluye Responsabilidad Civil extracontractual (hasta $840 millones) y cobertura básica del auto con participación del usuario en caso de siniestro.\n2️⃣ **Protección Total:** Incluye cobertura 100% sin pago de participación obligatoria en caso de siniestro y asistencia vial completa 24/7.",
      options: [
        { label: "🚨 ¿Qué hacer en caso de accidente?", actionValue: "emergencia" },
        { label: "📋 Requisitos para alquilar", actionValue: "requisitos" },
      ],
    };
  }

  // 7. ENTREGAS, DOMICILIOS, AEROPUERTOS Y SUCURSALES
  if (
    q.includes("entrega") ||
    q.includes("entregas") ||
    q.includes("domicilio") ||
    q.includes("aeropuerto") ||
    q.includes("terminal") ||
    q.includes("sucursal") ||
    q.includes("direccion") ||
    q.includes("ciudad") ||
    q.includes("neiva")
  ) {
    return {
      sender: "bot",
      text: "📍 **Opciones de Retiro y Entrega de Vehículos:**\n\n• **Retiro en Sucursal:** Sin costo adicional. (Ej. Sucursal Neiva Centro).\n• **Entrega a Domicilio:** Al seleccionar pago virtual con Wompi, puedes recibir el vehículo en tu dirección, barrio o referencias indicadas.\n• **Aeropuerto o Terminal:** Coordinamos la entrega directamente en la terminal de transportes o aeropuerto de tu ciudad.",
      options: [
        { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
        { label: "💬 Preguntar a un asesor", actionValue: "contacto_humano" },
      ],
    };
  }

  // 8. IDIOMA Y TEMA DE COLOR (MODO OSCURO / CLARO)
  if (
    q.includes("idioma") ||
    q.includes("idiomas") ||
    q.includes("lenguaje") ||
    q.includes("ingles") ||
    q.includes("ingles") ||
    q.includes("frances") ||
    q.includes("portugues") ||
    q.includes("tema") ||
    q.includes("oscuro") ||
    q.includes("claro") ||
    q.includes("dark") ||
    q.includes("color") ||
    q.includes("idioma_tema")
  ) {
    return {
      sender: "bot",
      text: "🌐 **Personalización de Idioma y Apariencia (Modo Oscuro):**\n\n• **Idiomas Disponibles:** Drivique soporta 5 idiomas: **Español, Inglés, Francés, Portugués y Alemán**.\n• **Modo Oscuro / Claro:** Puedes cambiar el tema visual de la app en cualquier momento desde el menú de perfil o configuración.\n• **Adaptación:** El chatbot y toda la plataforma ajustan automáticamente sus colores y textos a tus preferencias.",
      options: [
        { label: "💱 Ver divisas disponibles", actionValue: "monedas_pagos" },
        { label: "🚗 Volver al menú principal", actionValue: "inicio" },
      ],
    };
  }

  // 9. CONTRATOS, PDF Y FIRMA DIGITAL
  if (
    q.includes("contrato") ||
    q.includes("pdf") ||
    q.includes("firma") ||
    q.includes("descargar") ||
    q.includes("comprobante")
  ) {
    return {
      sender: "bot",
      text: "📄 **Contratos Digitales en Drivique:**\n\n• Al confirmar tu reserva se genera automáticamente tu contrato digital de alquiler.\n• Puedes acceder y descargar tu contrato en PDF en cualquier momento desde la pestaña **Mis Reservas**.\n• Para tu seguridad, los contratos están protegidos con tu número de documento de identidad.",
      options: [
        { label: "📋 Requisitos para el contrato", actionValue: "requisitos" },
        { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
      ],
    };
  }

  // 10. MODO INVITADO VS USUARIO REGISTRADO
  if (
    q.includes("invitado") ||
    q.includes("cuenta") ||
    q.includes("registro") ||
    q.includes("registrarse") ||
    q.includes("login") ||
    q.includes("beneficio")
  ) {
    return {
      sender: "bot",
      text: "👤 **Modo Invitado vs. Usuario Registrado:**\n\n• **Modo Invitado:** Te permite explorar libremente el catálogo, filtrar por categoría y consultar precios.\n• **Usuario Registrado (Gratis):** Te permite reservar vehículos, acceder al pago digital, recibir contratos en PDF, guardar favoritos y acumular notificaciones.",
      options: [
        { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
        { label: "💬 Hablar con asesor", actionValue: "contacto_humano" },
      ],
    };
  }

  // 11. EMERGENCIAS / GRÚAS / INCIDENCIAS DE VEHÍCULO
  if (
    q.includes("emergencia") ||
    q.includes("daño") ||
    q.includes("varado") ||
    q.includes("accidente") ||
    q.includes("grua") ||
    q.includes("incidencia") ||
    q.includes("taller")
  ) {
    return {
      sender: "bot",
      text: "🚨 **Asistencia en Carretera e Incidencias 24/7:**\n\n1. En caso de falla o accidente, estaciona en un lugar seguro.\n2. Ingresa a la app en **Soporte > Reportar Incidencia** para enviar la descripción y hasta 3 fotos de evidencia.\n3. Nuestro equipo técnico validará el reporte y coordinará la grúa de asistencia.",
      options: [
        { label: "💬 Contactar asistencia inmediata (WhatsApp)", actionValue: "contacto_humano" },
      ],
    };
  }

  // 12. AGENTE HUMANO (WhatsApp)
  if (
    q.includes("contacto_humano") ||
    q.includes("asesor") ||
    q.includes("humano") ||
    q.includes("persona") ||
    q.includes("whatsapp") ||
    q.includes("telefono") ||
    q.includes("hablar")
  ) {
    Linking.openURL("https://wa.me/573144789702?text=Hola,%20necesito%20asistencia%20personalizada%20con%20Drivique").catch(() => {});

    return {
      sender: "bot",
      text: "📱 Te hemos redirigido a nuestra línea de atención directa de WhatsApp **(+57 314 478 9702)**.\n\nTambién puedes escribir a nuestro correo: **soporte@drivique.com**",
      options: opts.slice(0, 4),
    };
  }

  // 13. SALUDOS
  if (
    q.includes("hola") ||
    q.includes("hello") ||
    q.includes("bonjour") ||
    q.includes("ola") ||
    q.includes("buenas") ||
    q.includes("inicio")
  ) {
    return {
      sender: "bot",
      text: "¡Hola! 👋 Bienvenido al soporte interactivo de **Drivique**. ¿En qué puedo ayudarte hoy?",
      options: opts,
    };
  }

  // RESPUESTA INTELIGENTE POR DEFECTO PARA PREGUNTAS ABIERTAS NO RECONOCIDAS
  return {
    sender: "bot",
    text: "Entiendo que tu consulta está relacionada con: *" + textoUsuario + "*.\n\nEn **Drivique** ofrecemos alquiler de vehículos con entrega a domicilio/sucursal, contratos digitales, múltiples monedas (COP/USD/EUR) y cobertura completa. ¿Sobre cuál de estos temas deseas más detalles?",
    options: opts,
  };
}
