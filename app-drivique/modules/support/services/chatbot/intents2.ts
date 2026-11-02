import { Linking } from 'react-native'
import type { IntentContext, IntentResult } from './types';

// 9. CONTRATOS, PDF Y FIRMA DIGITAL
export function intent09({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 10. MODO INVITADO VS USUARIO REGISTRADO
export function intent10({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 11. EMERGENCIAS / GRÚAS / INCIDENCIAS DE VEHÍCULO
export function intent11({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 12. AGENTE HUMANO (WhatsApp)
export function intent12({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 13. PRECIOS Y TARIFAS / DESCUENTOS / PROMOCIONES
export function intent13({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 14. UBICACIONES DE LAS SUCURSALES / HORARIOS
export function intent14({ q, lang, opts }: IntentContext): IntentResult | null {
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
          text: "🏢 **Branches and Working Hours:**\n\nCheck the address and opening hours of each branch on the vehicle detail screen. Roadside support is available through the support section.",
          options: [opts[5], opts[7]],
        };
      } else if (lang === "fr") {
        return {
          sender: "bot",
          text: "🏢 **Succursales et heures d'ouverture :**\n\nConsultez l'adresse et les horaires de chaque succursale dans le détail du véhicule.",
          options: [opts[5], opts[7]],
        };
      } else if (lang === "pt" || lang === "br") {
        return {
          sender: "bot",
          text: "🏢 **Agências e Horários de Atendimento:**\n\nConsulte o endereço e o horário de cada agência nos detalhes do veículo.",
          options: [opts[5], opts[7]],
        };
      }
      return {
        sender: "bot",
        text: "🏢 **Sucursales y Horarios de Atención:**\n\nConsulta la dirección y el horario de cada sucursal en el detalle del vehículo.",
        options: [
          { label: "📍 Ver ubicaciones de entrega", actionValue: "entregas" },
          { label: "💬 Hablar con asesor", actionValue: "contacto_humano" },
        ],
      };
    }
  return null;
}

// 15. MODIFICACIONES / CANCELACIONES
export function intent15({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}

// 16. MODELOS DE VEHICULOS
export function intent16({ q, lang, opts }: IntentContext): IntentResult | null {
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
  return null;
}
