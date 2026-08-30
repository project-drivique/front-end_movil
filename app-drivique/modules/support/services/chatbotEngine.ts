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
  langParam: any = "es"
): Omit<ChatMessage, "id" | "timestamp"> {
  // Normalizar el idioma de manera ultra robusta para evitar fallos por locale tags (ej. en-US, pt-BR)
  let langStr = String(langParam || "es").toLowerCase().trim();
  if (langStr.includes("en")) langStr = "en";
  else if (langStr.includes("fr")) langStr = "fr";
  else if (langStr.includes("br")) langStr = "br";
  else if (langStr.includes("pt")) langStr = "pt";
  else if (langStr.includes("es")) langStr = "es";
  else langStr = "es";

  const lang = langStr as IdiomaKey;
  console.log("[DRIVIBOT DEBUG] procesarMensajeChatbot called with:", { textoUsuario, langParam, resolvedLang: lang });
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
    q.includes("alquilar_mi_carro") ||
    q.includes("owner") ||
    q.includes("list my car") ||
    q.includes("proprietario") ||
    q.includes("cadastrar meu")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🚗 **List your car on Drivique & Earn Extra Income!**\n\n📌 **Steps:**\n1. Sign up as a vehicle owner in the app.\n2. Upload your vehicle details, insurance (SOAT), and mechanical inspection.\n3. Our team verifies the documentation and activates your vehicle for rentals.\n\n**Owner Requirements:** Model max 8 years old, valid SOAT & Technical Inspection.",
        options: opts.slice(0, 3),
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🚗 **Inscrivez votre voiture sur Drivique et gagnez des revenus !**\n\n📌 **Étapes :**\n1. Connectez-vous ou inscrivez-vous sur l'application.\n2. Accédez à la section profil ou contactez-nous pour enregistrer votre véhicule.\n3. Votre voiture passera par un contrôle technique et une vérification des documents (SOAT et contrôle technique valides, max 8 ans d'ancienneté).\n4. Une fois approuvé, vous recevrez des gains pour chaque location effectuée !",
        options: opts.slice(0, 3),
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🚗 **Cadastre seu carro no Drivique e ganhe uma renda extra!**\n\n📌 **Passos:**\n1. Faça login ou cadastre-se no aplicativo.\n2. Vá para a seção de perfil ou entre em contato conosco para registrar seu veículo.\n3. Seu carro passará por uma revisão técnica e verificação de documentos (SOAT e inspeção veicular válidos, idade máxima de 8 anos).\n4. Uma vez aprovado, você receberá ganhos por cada aluguel realizado!",
        options: opts.slice(0, 3),
      };
    }
    return {
      sender: "bot",
      text: "🚗 **¡Pon tu vehículo en alquiler y genera ingresos con Drivique!**\n\n📌 **Pasos:**\n1. Inicia sesión o regístrate en la aplicación.\n2. Dirígete a la sección de perfil o contáctanos para registrar tu vehículo.\n3. Tu auto pasará por una revisión técnica y verificación de documentos (SOAT y Tecnomecánica vigentes, antigüedad máx 8 años).\n4. ¡Una vez aprobado, recibirás ganancias por cada alquiler realizado!",
      options: [
        { label: "📋 Requisitos para vehículos", actionValue: "requisitos" },
        { label: "💬 Contactar asesor para registro", actionValue: "contacto_humano" },
      ],
    };
  }

  // 2. MONEDAS Y CONVERSIÓN DE DIVISAS
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
    q.includes("monedas_pagos") ||
    q.includes("currency") ||
    q.includes("currencies") ||
    q.includes("exchange") ||
    q.includes("devises") ||
    q.includes("taux") ||
    q.includes("moedas")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "💱 **Currencies & Exchange Rates in Drivique:**\n\n• Base prices are displayed in **COP** (Colombian Pesos).\n• We accept international credit/debit cards (Visa, Mastercard, Amex) processed via Wompi.\n• **Approximate conversion rates:**\n  - 🇺🇸 1 USD ≈ 4,000 COP\n  - 🇪🇺 1 EUR ≈ 4,300 COP\n  - 🇧🇷 1 BRL ≈ 780 COP\n\nYour bank will perform the automatic currency conversion at checkout.",
        options: opts.slice(1, 4),
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "💱 **Devises acceptées et conversion sur Drivique :**\n\n• Le tarif de base des véhicules est affiché en **Pesos Colombiens (COP)**.\n• Vous pouvez payer avec des cartes de crédit/débit internationales, PSE ou Wompi.\n• **Taux de change de référence estimé :**\n  - 🇺🇸 1 USD ≈ 4 000 COP\n  - 🇪🇺 1 EUR ≈ 4 300 COP\n  - 🇧🇷 1 BRL ≈ 780 COP\n\nVotre banque effectuera la conversion automatique au moment du paiement sécurisé.",
        options: opts.slice(1, 4),
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "💱 **Moedas Aceitas e Conversão no Drivique:**\n\n• A tarifa base dos veículos é exibida em **Pesos Colombianos (COP)**.\n• Você pode pagar com cartões de crédito/débito internacionais, PSE ou Wompi.\n• **Taxa de câmbio de referência estimada:**\n  - 🇺🇸 1 USD ≈ $4.000 COP\n  - 🇪🇺 1 EUR ≈ $4.300 COP\n  - 🇧🇷 1 BRL ≈ $780 COP\n\nSeu banco fará a conversão automática ao efetuar o pagamento digital seguro.",
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
    q.includes("reserva") ||
    q.includes("rent") ||
    q.includes("book") ||
    q.includes("how to") ||
    q.includes("louer") ||
    q.includes("alugar")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🚗 **How to rent a vehicle on Drivique:**\n\n1️⃣ Explore the **Catalog** and pick your favorite car (SUVs, Economic, Sedans, Premium).\n2️⃣ Select pick-up & return dates and location (Branch, Airport, or Home Delivery).\n3️⃣ Choose your protection plan (Mandatory or Total Coverage).\n4️⃣ Confirm and pay securely online (Wompi) or select Cash at Branch.\n\n✨ Your digital contract will be generated instantly!",
        options: [opts[1], opts[4]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🚗 **Processus facile en 4 étapes pour louer sur Drivique :**\n\n1️⃣ **Recherche :** Explorez le catalogue et filtrez par catégorie (SUV, Berline, Économique, Premium), transmission ou ville.\n2️⃣ **Dates :** Sélectionnez les dates et heures de départ et de retour.\n3️⃣ **Livraison :** Choisissez de retirer en succursale ou de recevoir la voiture à domicile/aéroport.\n4️⃣ **Paiement et Contrat :** Choisissez l'assurance et payez en toute sécurité (Wompi, cartes, PSE ou espèces en succursale). Votre contrat numérique est généré immédiatement !",
        options: [opts[1], opts[4]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🚗 **Processo fácil em 4 etapas para alugar no Drivique:**\n\n1️⃣ **Buscar:** Explore o catálogo de veículos e filtre por categoria (SUV, Sedã, Econômico, Premium), transmissão ou cidade.\n2️⃣ **Datas:** Selecione as datas e horários de retirada e devolução.\n3️⃣ **Entrega:** Escolha se deseja retirar na agência ou receber o carro em casa/aeroporto.\n4️⃣ **Pagamento e Contrato:** Escolha o seguro e pague com segurança (Wompi, cartões, PSE ou dinheiro na agência). Seu contrato digital é gerado imediatamente!",
        options: [opts[1], opts[4]],
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
    q.includes("cédula") ||
    q.includes("pasaporte") ||
    q.includes("edad") ||
    q.includes("requisitos") ||
    q.includes("requirement") ||
    q.includes("license") ||
    q.includes("passport") ||
    q.includes("age") ||
    q.includes("permis") ||
    q.includes("identité") ||
    q.includes("cnh") ||
    q.includes("identidade")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "📋 **Requirements to rent a vehicle:**\n\n• **Age:** Must be at least 16 years old.\n• **Driver's License:** Valid driver's license (national or international, at least 1 year old).\n• **Identification:** Valid national ID card or original Passport.\n• **Guarantee:** A credit or debit card under the main driver's name for the security deposit.",
        options: [opts[2], opts[7]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "📋 **Exigences pour louer un véhicule :**\n\n• **Âge :** Avoir au moins 16 ans.\n• **Permis de conduire :** Permis de conduire valide (national ou international, depuis au moins 1 an).\n• **Pièce d'identité :** Carte nationale d'identité ou Passeport original en cours de validité.\n• **Garantie :** Carte de crédit ou débit au nom du titulaire pour le dépôt de garantie.",
        options: [opts[2], opts[7]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "📋 **Requisitos para alugar um veículo:**\n\n• **Idade:** Ter pelo menos 16 anos.\n• **Carteira de Habilitação:** CNH válida (nacional ou internacional com no mínimo 1 ano de emissão).\n• **Documento de Identidade:** Cédula de identidade (RG) ou Passaporte original válido.\n• **Garantia:** Cartão de crédito ou débito no nome do titular para o depósito de garantia.",
        options: [opts[2], opts[7]],
      };
    }
    return {
      sender: "bot",
      text: "📋 **Requisitos para alquilar un vehículo:**\n\n• **Edad:** Ser mayor de 16 años.\n• **Licencia de conducción:** Licencia de conducción vigente (nacional o internacional con mínimo 1 año de antigüedad).\n• **Documento de identidad:** Cédula de ciudadanía o Pasaporte vigente.\n• **Garantía:** Tarjeta de crédito o débito a nombre del titular para el depósito de garantía.",
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
    q.includes("factura") ||
    q.includes("payment") ||
    q.includes("card") ||
    q.includes("cash") ||
    q.includes("deposit") ||
    q.includes("guarantee") ||
    q.includes("carte") ||
    q.includes("argent") ||
    q.includes("espèces") ||
    q.includes("cartão") ||
    q.includes("dinheiro")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "💳 **Payment Methods & Security Deposits:**\n\n• **Online Payment:** 100% secure processing through **Wompi** (accepts credit cards, debit cards, and PSE). Enables home, airport, and terminal delivery.\n• **Cash Payment:** You can choose to pay in cash and collect the vehicle directly at the Drivique branch.\n• **Security Deposit:** A temporary hold is placed on your card and automatically released upon returning the vehicle without damage.",
        options: [opts[2], opts[4]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "💳 **Modes de paiement et dépôts de garantie :**\n\n• **Paiement en ligne :** Traitement 100% sécurisé via la passerelle **Wompi** (cartes de crédit, débit et PSE). Permet la livraison à domicile, à l'aéroport et au terminal.\n• **Paiement en espèces :** Vous pouvez payer en espèces et retirer le véhicule directement dans la succursale Drivique.\n• **Dépôt de garantie :** Une retenue temporaire est effectuée sur votre carte et libérée automatiquement lors du retour du véhicule sans dommage.",
        options: [opts[2], opts[4]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "💳 **Métodos de Pagamento e Depósitos de Garantia:**\n\n• **Pagamento Online:** Processamento 100% seguro através do **Wompi** (aceita cartões de crédito, débito e PSE). Permite entrega em domicílio, aeroporto e terminal.\n• **Pagamento em Dinheiro:** Você pode optar por pagar em dinheiro e retirar o veículo diretamente na agência do Drivique.\n• **Depósito de Garantia:** Uma pré-autorização temporária é feita no seu cartão e liberada automaticamente após a devolução do veículo sem danos.",
        options: [opts[2], opts[4]],
      };
    }
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
    q.includes("soat") ||
    q.includes("insurance") ||
    q.includes("coverage") ||
    q.includes("protection") ||
    q.includes("deductible") ||
    q.includes("assurance") ||
    q.includes("proteção")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🛡️ **Drivique Protection Plans & Insurance:**\n\n1️⃣ **Standard Protection (Mandatory):** Includes Third-Party Liability (up to 840 million COP) and basic vehicle coverage with user deductible in case of an accident.\n2️⃣ **Total Protection:** Includes 100% coverage with zero deductible/user participation in case of accidents and full 24/7 roadside assistance.",
        options: [opts[5], opts[1]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🛡️ **Plans de protection et assurances Drivique :**\n\n1️⃣ **Protection standard (Obligatoire) :** Comprend la responsabilité civile (jusqu'à 840 millions de COP) et la couverture de base avec franchise à la charge de l'utilisateur.\n2️⃣ **Protection totale :** Comprend une couverture à 100% sans franchise en cas de sinistre et une assistance routière complète 24h/24 et 7j/7.",
        options: [opts[5], opts[1]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🛡️ **Planos de Proteção e Seguros Drivique:**\n\n1️⃣ **Proteção Padrão (Obrigatória):** Inclui Responsabilidade Civil (até 840 milhões de COP) e cobertura básica do veículo com coparticipação do usuário em caso de sinistro.\n2️⃣ **Proteção Total:** Inclui cobertura 100% sem franquia/coparticipação do usuário em caso de sinistro e assistência rodoviária completa 24/7.",
        options: [opts[5], opts[1]],
      };
    }
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
    q.includes("delivery") ||
    q.includes("home delivery") ||
    q.includes("airport") ||
    q.includes("branch") ||
    q.includes("livraison") ||
    q.includes("domicile") ||
    q.includes("aéroport")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "📍 **Vehicle Pick-up and Delivery Options:**\n\n• **Branch Pick-up:** No additional cost (e.g., Neiva Downtown Branch).\n• **Home Delivery:** When selecting online payment with Wompi, you can receive the vehicle at your specified address.\n• **Airport or Terminal:** We coordinate the delivery directly at the airport or transport terminal of your city.",
        options: [opts[0], opts[7]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "📍 **Options de retrait et de livraison de véhicules :**\n\n• **Retrait en succursale :** Sans frais supplémentaires (ex: Succursale Neiva Centre).\n• **Livraison à domicile :** En choisissant le paiement en ligne avec Wompi, vous pouvez recevoir le véhicule à votre adresse.\n• **Aéroport ou Terminal :** Nous coordonnons la livraison directement à l'aéroport ou au terminal de transport de votre ville.",
        options: [opts[0], opts[7]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "📍 **Opções de Retirada e Entrega de Veículos:**\n\n• **Retirada na Agência:** Sem custo adicional (ex: Agência Neiva Centro).\n• **Entrega em Domicílio:** Ao selecionar pagamento online com Wompi, você pode receber o veículo no seu endereço especificado.\n• **Aeroporto ou Terminal:** Coordenamos a entrega diretamente no aeroporto ou terminal de transporte de sua cidade.",
        options: [opts[0], opts[7]],
      };
    }
    return {
      sender: "bot",
      text: "📍 **Opciones de Retiro y Entrega de Vehículos:**\n\n• **Retiro en Sucursal:** Sin costo adicional. (Ej. Sucursal Neiva Centro).\n• **Entrega a Domicilio:** Al seleccionar pago virtual con Wompi, puedes recibir el vehículo en tu dirección, barrio o referencias indicadas.\n• **Aeropuerto o Terminal:** Coordinamos la entrega directamente en la terminal de transportes o aeropuerto de tu ciudad.",
      options: [
        { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
        { label: "💬 Preguntar a un asesor", actionValue: "contacto_humano" },
      ],
    };
  }

  // 8. IDIOMA Y TEMA DE COLOR
  if (
    q.includes("idioma") ||
    q.includes("idiomas") ||
    q.includes("lenguaje") ||
    q.includes("ingles") ||
    q.includes("inglés") ||
    q.includes("frances") ||
    q.includes("francés") ||
    q.includes("portugues") ||
    q.includes("portugués") ||
    q.includes("tema") ||
    q.includes("oscuro") ||
    q.includes("claro") ||
    q.includes("dark") ||
    q.includes("color") ||
    q.includes("idioma_tema") ||
    q.includes("language") ||
    q.includes("languages") ||
    q.includes("theme") ||
    q.includes("langue") ||
    q.includes("langues")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🌐 **Language Customization & Appearance (Dark Mode):**\n\n• **Available Languages:** Drivique supports 5 languages: **Spanish, English, French, Portuguese, and German**.\n• **Dark / Light Mode:** You can change the visual theme of the app at any time from your profile or settings menu.\n• **Adaptation:** The chatbot and the entire platform automatically adjust their colors and texts to your preferences.",
        options: [opts[2], { label: "🚗 Back to main menu", actionValue: "inicio" }],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🌐 **Personnalisation de la langue et apparence (Mode Sombre) :**\n\n• **Langues disponibles :** Drivique prend en charge 5 langues : **Espagnol, Anglais, Français, Portugais et Allemand**.\n• **Mode sombre / clair :** Vous pouvez changer le thème visuel à tout moment depuis votre profil ou le menu des paramètres.\n• **Adaptation :** Le chatbot et toute la plateforme adaptent automatiquement leurs couleurs et textes à vos préférences.",
        options: [opts[2], { label: "🚗 Retour au menu principal", actionValue: "inicio" }],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🌐 **Personalização de Idioma e Aparência (Modo Escuro):**\n\n• **Idiomas Disponíveis:** O Drivique suporta 5 idiomas: **Espanhol, Inglês, Francês, Português e Alemão**.\n• **Modo Escuro / Claro:** Você pode alterar o tema visual do aplicativo a qualquer momento no seu perfil ou menu de configurações.\n• **Adaptação:** O chatbot e toda a plataforma ajustam automaticamente suas cores e textos às suas preferências.",
        options: [opts[2], { label: "🚗 Voltar ao menu principal", actionValue: "inicio" }],
      };
    }
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
    q.includes("comprobante") ||
    q.includes("contract") ||
    q.includes("signature") ||
    q.includes("download") ||
    q.includes("sign")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "📄 **Digital Contracts on Drivique:**\n\n• Once your booking is confirmed, your digital rental contract is automatically generated.\n• You can access and download your PDF contract at any time from the **My Bookings** tab.\n• For security, contracts are protected with your national ID or passport number.",
        options: [opts[1], opts[0]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "📄 **Contrats numériques sur Drivique :**\n\n• Une fois votre réservation confirmée, votre contrat de location numérique est généré automatiquement.\n• Vous pouvez accéder et télécharger votre contrat PDF à tout moment depuis l'onglet **Mes Réservations**.\n• Pour votre sécurité, les contrats sont protégés par votre numéro de pièce d'identité.",
        options: [opts[1], opts[0]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "📄 **Contratos Digitais no Drivique:**\n\n• Assim que sua reserva for confirmada, seu contrato digital de aluguel será gerado automaticamente.\n• Você pode acessar e baixar seu contrato em PDF a qualquer momento na aba **Meus Aluguéis**.\n• Para sua segurança, los contratos são protegidos com o número do seu documento de identidade.",
        options: [opts[1], opts[0]],
      };
    }
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
    q.includes("beneficio") ||
    q.includes("guest") ||
    q.includes("account") ||
    q.includes("register") ||
    q.includes("sign up") ||
    q.includes("invité") ||
    q.includes("compte") ||
    q.includes("cadastro")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "👤 **Guest Mode vs. Registered User:**\n\n• **Guest Mode:** Allows you to freely explore the catalog, filter by category, and view prices.\n• **Registered User (Free):** Allows you to book vehicles, access digital payment, receive PDF contracts, save favorites, and receive notifications.",
        options: [opts[0], opts[7]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "👤 **Mode Invité vs. Utilisateur Enregistré :**\n\n• **Mode Invité :** Vous permet d'explorer librement le catalogue, de filtrer par catégorie et de consulter les prix.\n• **Utilisateur enregistré (Gratuit) :** Vous permet de réserver des véhicules, d'accéder au paiement en ligne, de recevoir des contrats PDF, de sauvegarder des favoris et de recevoir des notifications.",
        options: [opts[0], opts[7]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "👤 **Modo Convidado vs. Usuário Registrado:**\n\n• **Modo Convidado:** Permite explorar livremente o catálogo, filtrar por categoria e consultar preços.\n• **Usuário Registrado (Grátis):** Permite reservar veículos, acessar o pagamento digital, receber contratos em PDF, salvar favoritos e receber notificações.",
        options: [opts[0], opts[7]],
      };
    }
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
    q.includes("taller") ||
    q.includes("emergency") ||
    q.includes("accident") ||
    q.includes("tow") ||
    q.includes("breakdown") ||
    q.includes("panne") ||
    q.includes("remorque") ||
    q.includes("guincho") ||
    q.includes("quebrado")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🚨 **Roadside Assistance & Incidents 24/7:**\n\n1. In case of mechanical failure or accident, park in a safe place.\n2. Go to **Support > Report Incident** in the app to submit a description and up to 3 photos of evidence.\n3. Our technical team will validate the report and coordinate roadside assistance/towing.",
        options: [opts[7]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🚨 **Assistance routière et incidents 24h/24 et 7j/7 :**\n\n1. En cas de panne ou d'accident, garez-vous dans un endroit sûr.\n2. Allez dans **Support > Signaler un incident** pour envoyer la description et jusqu'à 3 photos de preuve.\n3. Notre équipe technique validera le rapport et coordonnera l'assistance ou la dépanneuse.",
        options: [opts[7]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🚨 **Assistência Rodoviária e Incidentes 24/7:**\n\n1. Em caso de falha ou acidente, estacione em local seguro.\n2. Acesse **Suporte > Reportar Incidente** no app para enviar a descrição e até 3 fotos de evidência.\n3. Nossa equipe técnica validará o relatório e coordenará a assistência ou guincho.",
        options: [opts[7]],
      };
    }
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
    q.includes("hablar") ||
    q.includes("human") ||
    q.includes("advisor") ||
    q.includes("chat with") ||
    q.includes("conseiller") ||
    q.includes("atendimento") ||
    q.includes("falar com")
  ) {
    Linking.openURL("https://wa.me/573144789702?text=Hola,%20necesito%20asistencia%20personalizada%20con%20Drivique").catch(() => {});

    if (lang === "en") {
      return {
        sender: "bot",
        text: "📱 We have redirected you to our direct WhatsApp line **(+57 314 478 9702)**.\n\nYou can also email us at: **soporte@drivique.com**",
        options: opts.slice(0, 4),
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "📱 Nous vous avons redirigé vers notre ligne WhatsApp directe **(+57 314 478 9702)**.\n\nVous pouvez également nous écrire à : **soporte@drivique.com**",
        options: opts.slice(0, 4),
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "📱 Redirecionamos você para nossa linha direta do WhatsApp **(+57 314 478 9702)**.\n\nVocê também pode nos escrever em: **soporte@drivique.com**",
        options: opts.slice(0, 4),
      };
    }
    return {
      sender: "bot",
      text: "📱 Te hemos redirigido a nuestra línea de atención directa de WhatsApp **(+57 314 478 9702)**.\n\nTambién puedes escribir a nuestro correo: **soporte@drivique.com**",
      options: opts.slice(0, 4),
    };
  }

  // 13. PRECIOS Y TARIFAS / DESCUENTOS / PROMOCIONES
  if (
    q.includes("precio") ||
    q.includes("costo") ||
    q.includes("tarifa") ||
    q.includes("barato") ||
    q.includes("descuento") ||
    q.includes("promocion") ||
    q.includes("promo") ||
    q.includes("cupón") ||
    q.includes("cupon") ||
    q.includes("gratis") ||
    q.includes("price") ||
    q.includes("cost") ||
    q.includes("rate") ||
    q.includes("cheap") ||
    q.includes("discount") ||
    q.includes("coupon") ||
    q.includes("free") ||
    q.includes("tarif") ||
    q.includes("cher") ||
    q.includes("bon marché") ||
    q.includes("réduction") ||
    q.includes("preço") ||
    q.includes("barato") ||
    q.includes("promoção")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🏷️ **Rates and Discounts at Drivique:**\n\n• **Dynamic Rates:** Prices vary depending on the season, car category, and rental duration. Longer rentals enjoy lower daily rates.\n• **Discounts:** We offer coupons for new users and special corporate rates. Check the **Notifications** section for active coupons.",
        options: [opts[2], opts[0]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🏷️ **Tarifs et réductions sur Drivique :**\n\n• **Tarifs dynamiques :** Varient selon la saison, la catégorie de voiture et la durée de location. Plus la durée est longue, plus le tarif journalier est bas.\n• **Réductions :** Nous offrons des coupons pour les nouveaux utilisateurs et des tarifs corporatifs spéciaux. Consultez l'onglet **Notifications** pour les coupons actifs.",
        options: [opts[2], opts[0]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🏷️ **Tarifas e Descontos no Drivique:**\n\n• **Tarifas Dinâmicas:** Variam de acordo com a temporada, categoria do carro e duração do aluguel. Quanto mais longo o aluguel, menor a diária.\n• **Descontos:** Oferecemos cupons para novos usuários e tarifas corporativas especiais. Verifique a seção de **Notificações** para cupons ativos.",
        options: [opts[2], opts[0]],
      };
    }
    return {
      sender: "bot",
      text: "🏷️ **Tarifas y Descuentos en Drivique:**\n\n• **Tarifas Dinámicas:** Varían según la temporada, la categoría del carro y la duración del alquiler. A mayor duración, menor tarifa diaria.\n• **Descontos:** Ofrecemos cupones para primeros usuarios y tarifas corporativas especiales. Revisa la sección de **Notificaciones** para cupones activos.",
      options: [
        { label: "💱 Ver divisas disponibles", actionValue: "monedas_pagos" },
        { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
      ],
    };
  }

  // 14. UBICACIONES DE LAS SUCURSALES / HORARIOS
  if (
    q.includes("sucursal") ||
    q.includes("ubicacion") ||
    q.includes("oficina") ||
    q.includes("donde estan") ||
    q.includes("dónde están") ||
    q.includes("horario") ||
    q.includes("abierto") ||
    q.includes("cerrado") ||
    q.includes("días") ||
    q.includes("dias") ||
    q.includes("branch") ||
    q.includes("location") ||
    q.includes("office") ||
    q.includes("where") ||
    q.includes("hours") ||
    q.includes("open") ||
    q.includes("close") ||
    q.includes("days") ||
    q.includes("adresse") ||
    q.includes("ouvert") ||
    q.includes("fermé") ||
    q.includes("agência") ||
    q.includes("localização") ||
    q.includes("escritório") ||
    q.includes("onde") ||
    q.includes("horário")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🏢 **Branches and Working Hours:**\n\n• **Main Branch:** Neiva Downtown. Open Monday to Saturday (7:00 AM - 7:00 PM), Sundays & Holidays (8:00 AM - 5:00 PM).\n• **Roadside Support:** Available 24 hours a day, 7 days a week for emergencies.",
        options: [opts[5], opts[7]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🏢 **Succursales et heures d'ouverture :**\n\n• **Succursale principale :** Neiva Centre. Ouverte du lundi au samedi (7h00 - 19h00), les dimanches et jours fériés (8h00 - 17h00).\n• **Support routier :** Disponible 24h/24 et 7j/7 pour les urgences.",
        options: [opts[5], opts[7]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🏢 **Agências e Horários de Atendimento:**\n\n• **Agência Principal:** Neiva Centro. Aberta de Segunda a Sábado (7h00 - 19h00), Domingos e Feriados (8h00 - 17h00).\n• **Suporte de Emergência:** Disponível 24 horas por dia, 7 dias por semana para emergências.",
        options: [opts[5], opts[7]],
      };
    }
    return {
      sender: "bot",
      text: "🏢 **Sucursales y Horarios de Atención:**\n\n• **Sucursal Principal:** Neiva Centro. Abierta de Lunes a Sábado (7:00 AM - 7:00 PM), Domingos y Festivos (8:00 AM - 5:00 PM).\n• **Soporte en Carretera:** Disponible 24 horas al día, 7 días a la semana para emergencias.",
      options: [
        { label: "📍 Ver ubicaciones de entrega", actionValue: "entregas" },
        { label: "💬 Hablar con asesor", actionValue: "contacto_humano" },
      ],
    };
  }

  // 15. MODIFICACIONES / CANCELACIONES
  if (
    q.includes("cancelar") ||
    q.includes("modificar") ||
    q.includes("cambiar fecha") ||
    q.includes("devolver antes") ||
    q.includes("reembolso") ||
    q.includes("devolucion de dinero") ||
    q.includes("cancel") ||
    q.includes("change") ||
    q.includes("refund") ||
    q.includes("modify") ||
    q.includes("annuler") ||
    q.includes("modifier") ||
    q.includes("remboursement") ||
    q.includes("alterar") ||
    q.includes("devolução")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🔄 **Reservation Changes and Cancellations:**\n\n• **Cancellation:** Free up to 24 hours before pick-up. Cancellations made later may incur a 1-day rental penalty fee.\n• **Modifications:** You can request changes to dates, times, or vehicle models by contacting support directly.",
        options: [opts[7], opts[0]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🔄 **Modifications et annulations de réservations :**\n\n• **Annulation :** Gratuite jusqu'à 24 heures avant le retrait. Les annulations tardives peuvent entraîner une pénalité d'un jour de location.\n• **Modifications :** Vous pouvez demander un changement de dates, d'heures ou de véhicule en contactant directement le support.",
        options: [opts[7], opts[0]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🔄 **Alterações e Cancelamentos de Reservas:**\n\n• **Cancelamento:** Gratuito até 24 horas antes da retirada. Cancelamentos posteriores podem incorrer em multa de 1 diária de aluguel.\n• **Alterações:** Você pode solicitar alteração de datas, horários ou veículo entrando em contato diretamente com o suporte.",
        options: [opts[7], opts[0]],
      };
    }
    return {
      sender: "bot",
      text: "🔄 **Modificaciones y Cancelaciones de Reservas:**\n\n• **Cancelación:** Gratis hasta 24 horas antes del retiro. Si cancelas después, puede aplicar una penalidad de 1 día de alquiler.\n• **Modificaciones:** Puedes solicitar un cambio de fechas, horas o vehículo contactando a soporte directo.",
      options: [
        { label: "💬 Hablar con asesor", actionValue: "contacto_humano" },
        { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
      ],
    };
  }

  // 16. MODELOS DE VEHICULOS
  if (
    q.includes("camioneta") ||
    q.includes("suv") ||
    q.includes("sedan") ||
    q.includes("moto") ||
    q.includes("automatico") ||
    q.includes("mecanico") ||
    q.includes("gasolina") ||
    q.includes("diesel") ||
    q.includes("eléctrico") ||
    q.includes("electrico") ||
    q.includes("carros") ||
    q.includes("modelo") ||
    q.includes("transmision") ||
    q.includes("car") ||
    q.includes("truck") ||
    q.includes("automatic") ||
    q.includes("manual") ||
    q.includes("gas") ||
    q.includes("hybrid") ||
    q.includes("electric") ||
    q.includes("voiture") ||
    q.includes("boite") ||
    q.includes("combustible") ||
    q.includes("carro") ||
    q.includes("veículo") ||
    q.includes("automático") ||
    q.includes("combustível")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "🚘 **Vehicle Types and Drivique Fleet:**\n\n• **Categories:** Family SUVs, spacious Sedans, Economic hatchbacks, and Premium cars.\n• **Transmission:** We have both automatic and manual transmission options.\n• **Fuel:** Gasoline, diesel, and hybrid/electric vehicles are available.",
        options: [opts[0], opts[4]],
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "🚘 **Types de véhicules et flotte Drivique :**\n\n• **Catégories :** SUV familiaux, berlines spacieuses, voitures économiques et premium.\n• **Transmission :** Nous proposons des options de transmission automatique et manuelle.\n• **Carburant :** Véhicules à essence, diesel et options hybrides/électriques.",
        options: [opts[0], opts[4]],
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "🚘 **Tipos de Veículos e Frota Drivique:**\n\n• **Categorias:** SUVs familiares, Sedãs espaçosos, Econômicos e Premium.\n• **Transmissão:** Temos opções com transmissão automática e manual.\n• **Combustível:** Veículos a gasolina, diesel e opções híbridas/elétricas.",
        options: [opts[0], opts[4]],
      };
    }
    return {
      sender: "bot",
      text: "🚘 **Tipos de Vehículos y Flota Drivique:**\n\n• **Categorías:** SUVs familiares, Sedanes espaciosos, Económicos y Premium.\n• **Transmisión:** Contamos con opciones de transmisión automática y manual.\n• **Combustible:** Vehículos a gasolina, diésel y opciones híbridas/eléctricas.",
      options: [
        { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
        { label: "🛡️ Ver cobertura de seguros", actionValue: "seguros" },
      ],
    };
  }

  // 17. SALUDOS
  if (
    q.includes("hola") ||
    q.includes("hello") ||
    q.includes("bonjour") ||
    q.includes("ola") ||
    q.includes("olá") ||
    q.includes("buenas") ||
    q.includes("inicio")
  ) {
    if (lang === "en") {
      return {
        sender: "bot",
        text: "Hello! 👋 Welcome to **Drivique** interactive support. How can I help you today?",
        options: opts,
      };
    } else if (lang === "fr") {
      return {
        sender: "bot",
        text: "Bonjour ! 👋 Bienvenue sur le support interactif de **Drivique**. Comment puis-je vous aider aujourd'hui ?",
        options: opts,
      };
    } else if (lang === "pt" || lang === "br") {
      return {
        sender: "bot",
        text: "Olá! 👋 Bem-vindo ao suporte interativo do **Drivique**. Como posso ajudar você hoje?",
        options: opts,
      };
    }
    return {
      sender: "bot",
      text: "¡Hola! 👋 Bienvenido al soporte interactivo de **Drivique**. ¿En qué puedo ayudarte hoy?",
      options: opts,
    };
  }

  // RESPUESTA INTELIGENTE POR DEFECTO PARA PREGUNTAS ABIERTAS NO RECONOCIDAS
  if (lang === "en") {
    return {
      sender: "bot",
      text: "I understand your query is related to: *" + textoUsuario + "*.\n\nAt **Drivique** we offer vehicle rentals with home/branch delivery, digital contracts, multiple currencies (COP/USD/EUR), and complete insurance coverage. Which of these topics would you like more details about?",
      options: opts,
    };
  } else if (lang === "fr") {
    return {
      sender: "bot",
      text: "Je comprends que votre demande concerne : *" + textoUsuario + "*.\n\nChez **Drivique**, nous proposons des locations de véhicules avec livraison à domicile/succursale, des contrats numériques, plusieurs devises (COP/USD/EUR) et une couverture complète. Sur quel sujet aimeriez-vous plus de détails ?",
      options: opts,
    };
  } else if (lang === "pt" || lang === "br") {
    return {
      sender: "bot",
      text: "Entendo que sua consulta está relacionada a: *" + textoUsuario + "*.\n\nNo **Drivique** oferecemos aluguel de veículos com entrega em domicílio/agência, contratos digitais, múltiplas moedas (COP/USD/EUR) e cobertura completa. Sobre qual destes temas você gostaria de mais detalhes?",
      options: opts,
    };
  }
  return {
    sender: "bot",
    text: "Entiendo que tu consulta está relacionada con: *" + textoUsuario + "*.\n\nEn **Drivique** ofrecemos alquiler de vehículos con entrega a domicilio/sucursal, contratos digitales, múltiples monedas (COP/USD/EUR) y cobertura completa. ¿Sobre cuál de estos temas deseas más detalles?",
    options: opts,
  };
}
