export const TAWK_CONFIG = {
  // Direct Chat Link o IDs de la propiedad Drivique en Tawk.to
  directChatLink: "",

  propertyId: "6a7e126a561ef61d48515d98",
  widgetId: "default",

  get chatUrl() {
    if (this.directChatLink && this.directChatLink.trim().length > 0) {
      return this.directChatLink.trim();
    }
    return `https://tawk.to/chat/${this.propertyId}/${this.widgetId}`;
  }
};
