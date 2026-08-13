export const TAWK_CONFIG = {
  // Puedes pegar directamente tu enlace de chat directo de Tawk.to (Ejemplo: "https://tawk.to/chat/65xxxxxx/1xxxxxx")
  directChatLink: "",

  // O ingresar tus IDs individuales de Tawk.to
  propertyId: "PROPERTY_ID",
  widgetId: "WIDGET_ID",

  get chatUrl() {
    if (this.directChatLink && this.directChatLink.trim().length > 0) {
      return this.directChatLink.trim();
    }
    return `https://tawk.to/chat/${this.propertyId}/${this.widgetId}`;
  }
};
