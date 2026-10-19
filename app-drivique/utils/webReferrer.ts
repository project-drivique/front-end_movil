// En la versión web, algunos CDN de fotos devuelven 403 si la imagen se pide con el sitio de origen
// (hotlink). Con esta política solo se envía el origen a nuestro propio sitio, y las fotos de los
// vehículos (URL de cualquier página) cargan siempre. En el celular no se envía referer, no aplica.
import { Platform } from "react-native";

if (Platform.OS === "web" && typeof document !== "undefined") {
  const existente = document.head.querySelector('meta[name="referrer"]');
  if (!existente) {
    const meta = document.createElement("meta");
    meta.name = "referrer";
    meta.content = "same-origin";
    document.head.appendChild(meta);
  }
}

export {};
