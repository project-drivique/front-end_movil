import { obtenerTasaActual } from '@/services/exchangeRateService'
import type { IntentContext, IntentResult } from './types';

// 1. PUBLICAR / REGISTRAR / ALQUILAR MI CARRO (Dueños)
export function intent01({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 2. MONEDAS Y CONVERSIÓN DE DIVISAS
export function intent02({ q, lang, opts }: IntentContext): IntentResult | null {
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
      const tasaUSD = Math.round(obtenerTasaActual() || 4000);
      const tasaUsdFmt = tasaUSD.toLocaleString("es-CO");
      if (lang === "en") {
        return {
          sender: "bot",
          text: `💱 **Currencies & Exchange Rates in Drivique:**\n\n• Base prices are displayed in **COP** or converted to **USD** based on your currency preference.\n• We accept international credit/debit cards (Visa, Mastercard, Amex) processed via Wompi.\n• **Real-time API exchange rate:**\n  - 🇺🇸 1 USD ≈ $${tasaUsdFmt} COP\n\nYour bank will perform the automatic currency conversion at checkout.`,
          options: opts.slice(1, 4),
        };
      } else if (lang === "fr") {
        return {
          sender: "bot",
          text: `💱 **Devises acceptées et conversion sur Drivique :**\n\n• Le tarif de base des véhicules est affiché en **Pesos Colombiens (COP)** ou converti en **USD** selon votre préférence.\n• Vous pouvez payer avec des cartes de crédit/débit internationales, PSE ou Wompi.\n• **Taux de change de référence API en temps réel :**\n  - 🇺🇸 1 USD ≈ $${tasaUsdFmt} COP\n\nVotre banque effectuera la conversion automatique au moment du paiement sécurisé.`,
          options: opts.slice(1, 4),
        };
      } else if (lang === "pt" || lang === "br") {
        return {
          sender: "bot",
          text: `💱 **Moedas Aceitas e Conversão no Drivique:**\n\n• A tarifa base dos veículos é exibida em **Pesos Colombianos (COP)** ou convertida para **USD** conforme sua preferência.\n• Você pode pagar com cartões de crédito/débito internacionais, PSE ou Wompi.\n• **Taxa de câmbio API em tempo real:**\n  - 🇺🇸 1 USD ≈ $${tasaUsdFmt} COP\n\nSeu banco fará a conversão automática ao efetuar o pagamento digital seguro.`,
          options: opts.slice(1, 4),
        };
      }
      return {
        sender: "bot",
        text: `💱 **Monedas Aceptadas y Conversión en Drivique:**\n\n• La tarifa base de los vehículos se muestra en **Pesos Colombianos (COP)** o convertida a **USD** según tu preferencia.\n• Puedes pagar con tarjetas de crédito/débito internacionales, PSE o Wompi.\n• **Tasa de cambio API en tiempo real:**\n  - 🇺🇸 1 USD ≈ $${tasaUsdFmt} COP\n\nTu banco realizará la conversión automática al momento de efectuar el pago digital seguro.`,
        options: [
          { label: "💳 Ver métodos de pago", actionValue: "pagos" },
          { label: "🚗 Ver tarifas de alquiler", actionValue: "como_alquilar" },
        ],
      };
    }
  return null;
}

// 3. PROCESO DE ALQUILER / CÓMO RESERVAR
export function intent03({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 4. REQUISITOS Y DOCUMENTOS
export function intent04({ q, lang, opts }: IntentContext): IntentResult | null {
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
          text: "📋 **Requirements to rent a vehicle:**\n\n• **Age:** Must be at least 18 years old.\n• **Driver's License:** Valid driver's license (national or international, at least 1 year old).\n• **Identification:** Valid national ID card or original Passport.\n• **Guarantee:** A credit or debit card under the main driver's name for the security deposit.",
          options: [opts[2], opts[7]],
        };
      } else if (lang === "fr") {
        return {
          sender: "bot",
          text: "📋 **Exigences pour louer un véhicule :**\n\n• **Âge :** Avoir au moins 18 ans.\n• **Permis de conduire :** Permis de conduire valide (national ou international, depuis au moins 1 an).\n• **Pièce d'identité :** Carte nationale d'identité ou Passeport original en cours de validité.\n• **Garantie :** Carte de crédit ou débit au nom du titulaire pour le dépôt de garantie.",
          options: [opts[2], opts[7]],
        };
      } else if (lang === "pt" || lang === "br") {
        return {
          sender: "bot",
          text: "📋 **Requisitos para alugar um veículo:**\n\n• **Idade:** Ter pelo menos 18 anos.\n• **Carteira de Habilitação:** CNH válida (nacional ou internacional com no mínimo 1 ano de emissão).\n• **Documento de Identidade:** Cédula de identidade (RG) ou Passaporte original válido.\n• **Garantia:** Cartão de crédito ou débito no nome do titular para o depósito de garantia.",
          options: [opts[2], opts[7]],
        };
      }
      return {
        sender: "bot",
        text: "📋 **Requisitos para alquilar un vehículo:**\n\n• **Edad:** Ser mayor de 18 años.\n• **Licencia de conducción:** Licencia de conducción vigente (nacional o internacional con mínimo 1 año de antigüedad).\n• **Documento de identidad:** Cédula de ciudadanía o Pasaporte vigente.\n• **Garantía:** Tarjeta de crédito o débito a nombre del titular para el depósito de garantía.",
        options: [
          { label: "💳 Ver depósito de garantía", actionValue: "pagos" },
          { label: "💱 Ver tasas y monedas", actionValue: "monedas_pagos" },
        ],
      };
    }
  return null;
}

// 5. MÉTODOS DE PAGO / EFECTIVO / WOMPI / DEPOSITOS
export function intent05({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 6. SEGUROS Y COBERTURAS
export function intent06({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 7. ENTREGAS, DOMICILIOS, AEROPUERTOS Y SUCURSALES
export function intent07({ q, lang, opts }: IntentContext): IntentResult | null {
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
          text: "📍 **Vehicle Pick-up and Delivery Options:**\n\n• **Branch Pick-up:** No additional cost.\n• **Home Delivery:** When selecting online payment with Wompi, you can receive the vehicle at your specified address.\n• **Airport or Terminal:** We coordinate the delivery directly at the airport or transport terminal of your city.",
          options: [opts[0], opts[7]],
        };
      } else if (lang === "fr") {
        return {
          sender: "bot",
          text: "📍 **Options de retrait et de livraison de véhicules :**\n\n• **Retrait en succursale :** Sans frais supplémentaires.\n• **Livraison à domicile :** En choisissant le paiement en ligne avec Wompi, vous pouvez recevoir le véhicule à votre adresse.\n• **Aéroport ou Terminal :** Nous coordonnons la livraison directement à l'aéroport ou au terminal de transport de votre ville.",
          options: [opts[0], opts[7]],
        };
      } else if (lang === "pt" || lang === "br") {
        return {
          sender: "bot",
          text: "📍 **Opções de Retirada e Entrega de Veículos:**\n\n• **Retirada na Agência:** Sem custo adicional.\n• **Entrega em Domicílio:** Ao selecionar pagamento online com Wompi, você pode receber o veículo no seu endereço especificado.\n• **Aeroporto ou Terminal:** Coordenamos a entrega diretamente no aeroporto ou terminal de transporte de sua cidade.",
          options: [opts[0], opts[7]],
        };
      }
      return {
        sender: "bot",
        text: "📍 **Opciones de Retiro y Entrega de Vehículos:**\n\n• **Retiro en Sucursal:** Sin costo adicional..\n• **Entrega a Domicilio:** Al seleccionar pago virtual con Wompi, puedes recibir el vehículo en tu dirección, barrio o referencias indicadas.\n• **Aeropuerto o Terminal:** Coordinamos la entrega directamente en la terminal de transportes o aeropuerto de tu ciudad.",
        options: [
          { label: "🚗 Ver proceso de reserva", actionValue: "como_alquilar" },
          { label: "💬 Preguntar a un asesor", actionValue: "contacto_humano" },
        ],
      };
    }
  return null;
}

// 8. IDIOMA Y TEMA DE COLOR
export function intent08({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}
