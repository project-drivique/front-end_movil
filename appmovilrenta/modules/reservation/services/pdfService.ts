// modules/reserva/services/pdfService.ts
//
// Genera el PDF del contrato firmado a partir de los mismos datos que se
// muestran en FirmaContrato, usando expo-print (HTML -> PDF) porque React
// Native no tiene un renderer de PDF nativo. La firma dibujada se
// reconstruye como trazos SVG a partir de los puntos guardados por
// FirmaCanvas.
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { Vehiculo } from "@/modules/catalog/types/catalog.types";
import {
  DatosDocumentos,
  DatosFechasLugar,
  DatosPersonales,
  DatosPlanes,
} from "../types/reservation.types";
import { ContratoGuardado } from "./contractService";
import {
  getCiudadPorSucursal,
  getDireccionSucursal,
} from "@/modules/catalog/constants/catalog.constants";

interface Punto {
  x: number;
  y: number;
}

function trazosASvgPaths(firmaTrazosJson: string): string {
  try {
    const trazos: Punto[][] = JSON.parse(firmaTrazosJson);
    return trazos
      .filter((t) => t.length > 0)
      .map((trazo) => {
        const d = trazo
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(" ");
        return `<path d="${d}" stroke="#111827" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />`;
      })
      .join("");
  } catch {
    return "";
  }
}

function separarMarcaModelo(nombre = "") {
  const partes = nombre.trim().split(" ");
  return { marca: partes[0] || "", modelo: partes.slice(1).join(" ") || "" };
}

function esc(v: unknown): string {
  return String(v ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface GenerarPdfParams {
  contrato: ContratoGuardado;
  vehiculo: Vehiculo;
  datosPersonales: DatosPersonales;
  datosDocumentos: DatosDocumentos;
  fechasLugar: DatosFechasLugar;
  planes: DatosPlanes;
  total: number;
  referencia: string;
  formatPrecio: (n: number) => string;
  formatearFecha: (iso: string | null) => string;
  /** Etiqueta ya traducida del tipo de documento (Cédula/Tarjeta de identidad/etc.), no el código crudo. */
  tipoDocumentoTexto: string;
  /** Textos ya traducidos (t("reserva.contrato.xxx")) para no depender de i18next dentro del HTML. */
  textos: Record<string, string>;
}

export async function generarContratoPdf(params: GenerarPdfParams): Promise<string> {
  const {
    contrato,
    vehiculo,
    datosPersonales,
    datosDocumentos,
    fechasLugar,
    planes,
    total,
    referencia,
    formatPrecio,
    formatearFecha,
    tipoDocumentoTexto,
    textos: tx,
  } = params;

  const { marca, modelo } = separarMarcaModelo(vehiculo?.nombre);
  const esDomicilioRetiro = fechasLugar.lugarRetiro === "domicilio";
  const sucursalRetiroNombre = esDomicilioRetiro ? vehiculo?.sucursal ?? "" : fechasLugar.lugarRetiro;
  const ciudadSucursal = sucursalRetiroNombre ? getCiudadPorSucursal(sucursalRetiroNombre) ?? "" : "";
  const direccionSucursal = sucursalRetiroNombre ? getDireccionSucursal(sucursalRetiroNombre) ?? "" : "";

  const svgFirma = trazosASvgPaths(contrato.firmaTrazos);
  const metodoPagoTexto = fechasLugar.metodoPago === "efectivo" ? tx.paymentMethodCash : tx.paymentMethodWompi;
  const serviciosTexto = (vehiculo?.servicios || [])
    .filter((servicio) => planes.serviciosSeleccionados.includes(servicio.nombre))
    .map((servicio) => servicio.nombre)
    .join(", ") || tx.noneAdded;
  const direccionCompleta = esDomicilioRetiro
    ? `${fechasLugar.direccionRetiro || ""}, ${fechasLugar.barrioRetiro || ""}, ${ciudadSucursal}`
    : tx.notProvided;

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #111827; padding: 28px; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        .sub { font-size: 11px; color: #6b7280; margin: 2px 0; }
        .franja { height: 5px; background: linear-gradient(90deg,#1e3a8a,#2563eb,#93c5fd); border-radius: 4px; margin-bottom: 16px; }
        .badge { display:inline-block; background:#dbeafe; color:#1e3a8a; font-size:10px; font-weight:700; padding:4px 10px; border-radius:999px; text-transform:uppercase; margin-bottom:8px; }
        .meta { font-size: 11.5px; margin: 3px 0; }
        .meta b { font-weight: 700; }
        .intro { font-size: 12.5px; line-height: 1.6; margin: 16px 0; }
        h2 { font-size: 14px; margin: 22px 0 10px; }
        .grid { display: flex; flex-wrap: wrap; gap: 8px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
        .campo { width: 47%; background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:9px 10px; }
        .campo-label { font-size: 9px; text-transform: uppercase; letter-spacing:.4px; font-weight:700; color:#6b7280; margin-bottom:4px; }
        .campo-valor { font-size: 12px; font-weight: 700; }
        .clausulas { background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:14px; font-size:11.8px; line-height:1.55; }
        .clausulas p { margin: 0 0 10px; }
        .clausulas ul { margin: 0 0 10px; padding-left: 18px; }
        .firmas { display:flex; gap:14px; margin-top: 14px; }
        .firma-card { flex:1; background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:14px; }
        .firma-titulo { font-size:12.5px; font-weight:700; margin-bottom:10px; }
        .firma-caja { height:140px; border:1px dashed #cbd5e1; border-radius:10px; background:#fff; }
        .sello { height:140px; border:2px dashed #93c5fd; border-radius:10px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; }
        .sello-texto { font-size:26px; font-weight:800; font-style:italic; color:#1e3a8a; }
        .sello-badge { font-size:10.5px; font-weight:700; color:#1e3a8a; }
        .footer { margin-top: 20px; padding-top: 12px; border-top:1px solid #e5e7eb; font-size:10px; color:#6b7280; line-height:1.5; }
      </style>
    </head>
    <body>
      <div class="franja"></div>
      <h1>${esc(tx.title)}</h1>
      <div class="sub">${esc(tx.subtitle)}</div>
      <div class="sub">${esc(tx.autoGenNote)}</div>

      <div class="badge">${esc(tx.badgeLabel)}</div>
      <div class="meta"><b>${esc(tx.contractCode)}:</b> ${esc(contrato.codigo)}</div>
      <div class="meta"><b>${esc(tx.status)}:</b> ${esc(tx.statusSigned)}</div>
      <div class="meta"><b>${esc(tx.generationDate)}:</b> ${esc(formatearFecha(contrato.fecha.slice(0, 10)))}</div>
      <div class="meta"><b>${esc(tx.reservationCode)}:</b> ${esc(referencia)}</div>

      <div class="intro">
        ${esc(
          tx.intro
            .replace("{{nombre}}", datosPersonales.nombreCompleto)
            .replace("{{tipoDoc}}", tipoDocumentoTexto)
            .replace("{{numDoc}}", datosPersonales.numeroDocumento)
        )}
      </div>

      <h2>${esc(tx.userDataTitle)}</h2>
      <div class="grid">
        <div class="campo"><div class="campo-label">${esc(tx.fullName)}</div><div class="campo-valor">${esc(datosPersonales.nombreCompleto)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.document)}</div><div class="campo-valor">${esc(tipoDocumentoTexto)} ${esc(datosPersonales.numeroDocumento)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.email)}</div><div class="campo-valor">${esc(datosPersonales.correo)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.phone)}</div><div class="campo-valor">${esc(datosPersonales.celular)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.address)}</div><div class="campo-valor">${esc(direccionCompleta)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.license)}</div><div class="campo-valor">${esc(datosDocumentos.licenciaConduccion?.nombre || tx.notProvided)}</div></div>
      </div>

      <h2>${esc(tx.reservationTitle)}</h2>
      <div class="grid">
        <div class="campo"><div class="campo-label">${esc(tx.vehicle)}</div><div class="campo-valor">${esc(marca)} ${esc(modelo)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.plate)}</div><div class="campo-valor">${esc(vehiculo?.placa)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.color)}</div><div class="campo-valor">${esc(vehiculo?.color)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.year)}</div><div class="campo-valor">${esc(vehiculo?.año)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.branch)}</div><div class="campo-valor">${esc(esDomicilioRetiro ? tx.domicileDelivery : fechasLugar.lugarRetiro)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.branchCity)}</div><div class="campo-valor">${esc(ciudadSucursal)}</div></div>
        ${!esDomicilioRetiro ? `<div class="campo"><div class="campo-label">${esc(tx.branchAddress)}</div><div class="campo-valor">${esc(direccionSucursal)}</div></div>` : ""}
        <div class="campo"><div class="campo-label">${esc(tx.startDate)}</div><div class="campo-valor">${esc(formatearFecha(fechasLugar.fechaRetiro))}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.endDate)}</div><div class="campo-valor">${esc(formatearFecha(fechasLugar.fechaDevolucion))}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.paymentMethod)}</div><div class="campo-valor">${esc(metodoPagoTexto)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.totalValue)}</div><div class="campo-valor">${esc(formatPrecio(total))}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.additionalServices)}</div><div class="campo-valor">${esc(serviciosTexto)}</div></div>
        <div class="campo"><div class="campo-label">${esc(tx.protectionPlan)}</div><div class="campo-valor">${esc(planes.proteccion)}</div></div>
        ${esDomicilioRetiro ? `
          <div class="campo"><div class="campo-label">${esc(tx.deliveryAddress)}</div><div class="campo-valor">${esc(fechasLugar.direccionRetiro)}</div></div>
          <div class="campo"><div class="campo-label">${esc(tx.deliveryNeighborhood)}</div><div class="campo-valor">${esc(fechasLugar.barrioRetiro)}</div></div>
          <div class="campo"><div class="campo-label">${esc(tx.deliveryReferences)}</div><div class="campo-valor">${esc(fechasLugar.referenciasRetiro)}</div></div>
        ` : ""}
      </div>

      <h2>${esc(tx.clausesTitle)}</h2>
      <div class="clausulas">
        <p><b>${esc(tx.clause1Title)}</b> ${esc(tx.clause1Text
          .replace("{{marca}}", marca)
          .replace("{{modelo}}", modelo)
          .replace("{{placa}}", vehiculo?.placa || "")
          .replace("{{inicio}}", formatearFecha(fechasLugar.fechaRetiro))
          .replace("{{fin}}", formatearFecha(fechasLugar.fechaDevolucion)))}</p>
        <p><b>${esc(tx.clause2Title)}</b> ${esc(tx.clause2Text)}</p>
        <p><b>${esc(tx.clause3Title)}</b></p>
        <ul>
          <li>${esc(tx.clause3Item1)}</li><li>${esc(tx.clause3Item2)}</li>
          <li>${esc(tx.clause3Item3)}</li><li>${esc(tx.clause3Item4)}</li>
        </ul>
        <p><b>${esc(tx.clause4Title)}</b> ${esc(tx.clause4Text)}</p>
        <p><b>${esc(tx.clause5Title)}</b> ${esc(tx.clause5Text)}</p>
        <p><b>${esc(tx.clause6Title)}</b> ${esc(tx.clause6Text)}</p>
      </div>

      <h2>${esc(tx.signaturesTitle)}</h2>
      <div class="meta"><b>${esc(tx.signCity)}:</b> ${esc(ciudadSucursal)}</div>
      <div class="meta"><b>${esc(tx.signDate)}:</b> ${esc(formatearFecha(contrato.fecha.slice(0, 10)))}</div>
      <div class="firmas">
        <div class="firma-card">
          <div class="firma-titulo">${esc(tx.userSignature)}</div>
          <div class="firma-caja">
            <svg viewBox="0 0 400 160" width="100%" height="140">${svgFirma}</svg>
          </div>
          <div class="meta" style="margin-top:10px;"><b>${esc(tx.fullName)}:</b> ${esc(datosPersonales.nombreCompleto)}</div>
          <div class="meta"><b>${esc(tx.document)}:</b> ${esc(tipoDocumentoTexto)} ${esc(datosPersonales.numeroDocumento)}</div>
        </div>
        <div class="firma-card">
          <div class="firma-titulo">${esc(tx.platformSignature)}</div>
          <div class="sello">
            <div class="sello-texto">Drivique</div>
            <div class="sello-badge">✓ ${esc(tx.digitallySigned)}</div>
          </div>
          <div class="meta" style="margin-top:10px;"><b>${esc(tx.responsible)}:</b> ${esc(tx.platformResponsible)}</div>
          <div class="meta"><b>${esc(tx.role)}:</b> ${esc(tx.platformRole)}</div>
        </div>
      </div>

      <div class="footer">
        <div>${esc(tx.footerNote1)}</div>
        <div>${esc(tx.footerNote2)}</div>
        <div style="margin-top:8px;"><b>${esc(tx.contractCode)}:</b> ${esc(contrato.codigo)} &nbsp;·&nbsp; <b>${esc(tx.reservationCode)}:</b> ${esc(referencia)}</div>
      </div>
    </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

export async function compartirContratoPdf(uri: string, nombre = "contrato-firmado.pdf") {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const enlace = document.createElement("a");
    enlace.href = uri;
    enlace.download = nombre;
    enlace.rel = "noopener";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    return uri;
  }

  const disponible = await Sharing.isAvailableAsync();
  if (disponible) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
    });
  }
  return uri;
}

/** Lee el PDF seleccionado sin modificarlo para conservar el contrato original. */
export async function leerPdfOriginalBase64(uri: string): Promise<string> {
  if (uri.startsWith("data:")) return uri.split(",", 2)[1] || "";

  if (Platform.OS === "web") {
    const respuesta = await fetch(uri);
    if (!respuesta.ok) throw new Error("No fue posible leer el PDF original");
    const blob = await respuesta.blob();
    return await new Promise<string>((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(String(lector.result).split(",", 2)[1] || "");
      lector.onerror = () => reject(lector.error ?? new Error("No fue posible leer el PDF original"));
      lector.readAsDataURL(blob);
    });
  }

  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

/** Descarga/abre exactamente el PDF adjuntado al firmar, sin regenerarlo. */
export async function compartirPdfOriginal(base64: string, nombre = "contrato-firmado.pdf") {
  if (!base64) throw new Error("El contrato original no tiene contenido guardado");
  const dataUri = `data:application/pdf;base64,${base64}`;
  if (Platform.OS === "web") return compartirContratoPdf(dataUri, nombre);

  const directorio = FileSystem.cacheDirectory;
  if (!directorio) throw new Error("No hay un directorio disponible para descargar el contrato");
  const nombreSeguro = nombre.replace(/[^a-zA-Z0-9._-]/g, "-");
  const uriTemporal = `${directorio}${nombreSeguro}`;
  await FileSystem.writeAsStringAsync(uriTemporal, base64, { encoding: FileSystem.EncodingType.Base64 });
  return compartirContratoPdf(uriTemporal, nombreSeguro);
}
