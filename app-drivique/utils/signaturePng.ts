export interface PuntoFirma {
  x: number;
  y: number;
}

const ESCALA = 2;
const RADIO = 1.6;

let tablaCrc: Uint32Array | null = null;

function crc32(bytes: Uint8Array): number {
  if (!tablaCrc) {
    tablaCrc = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      tablaCrc[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = tablaCrc[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function u32(n: number): number[] {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
}

function chunk(tipo: string, datos: Uint8Array): Uint8Array {
  const tipoBytes = new Uint8Array([...tipo].map((ch) => ch.charCodeAt(0)));
  const cuerpo = new Uint8Array(tipoBytes.length + datos.length);
  cuerpo.set(tipoBytes, 0);
  cuerpo.set(datos, tipoBytes.length);
  const out = new Uint8Array(12 + datos.length);
  out.set(u32(datos.length), 0);
  out.set(cuerpo, 4);
  out.set(u32(crc32(cuerpo)), 8 + datos.length);
  return out;
}

function zlibSinCompresion(datos: Uint8Array): Uint8Array {
  const bloques = Math.max(1, Math.ceil(datos.length / 65535));
  const out = new Uint8Array(2 + datos.length + bloques * 5 + 4);
  let pos = 0;
  out[pos++] = 0x78;
  out[pos++] = 0x01;
  for (let i = 0; i < bloques; i += 1) {
    const inicio = i * 65535;
    const fin = Math.min(datos.length, inicio + 65535);
    const largo = fin - inicio;
    out[pos++] = i === bloques - 1 ? 1 : 0;
    out[pos++] = largo & 255;
    out[pos++] = (largo >>> 8) & 255;
    out[pos++] = ~largo & 255;
    out[pos++] = (~largo >>> 8) & 255;
    out.set(datos.subarray(inicio, fin), pos);
    pos += largo;
  }
  out.set(u32(adler32(datos)), pos);
  return out;
}

export function aBase64(bytes: Uint8Array): string {
  let binario = "";
  const paso = 0x8000;
  for (let i = 0; i < bytes.length; i += paso) {
    binario += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + paso)));
  }
  return btoa(binario);
}

export function firmaAPngBytes(trazos: PuntoFirma[][], ancho: number, alto: number): Uint8Array {
  const w = Math.max(1, Math.round(ancho * ESCALA));
  const h = Math.max(1, Math.round(alto * ESCALA));
  const alfa = new Uint8Array(w * h);
  const r = RADIO * ESCALA;

  const pintar = (x0: number, y0: number, x1: number, y1: number) => {
    const minX = Math.max(0, Math.floor(Math.min(x0, x1) - r));
    const maxX = Math.min(w - 1, Math.ceil(Math.max(x0, x1) + r));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1) - r));
    const maxY = Math.min(h - 1, Math.ceil(Math.max(y0, y1) + r));
    const dx = x1 - x0;
    const dy = y1 - y0;
    const largo2 = dx * dx + dy * dy;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        let t = largo2 === 0 ? 0 : ((x - x0) * dx + (y - y0) * dy) / largo2;
        t = Math.max(0, Math.min(1, t));
        const px = x0 + t * dx;
        const py = y0 + t * dy;
        const d = Math.sqrt((x - px) * (x - px) + (y - py) * (y - py));
        if (d <= r) alfa[y * w + x] = 255;
        else if (d <= r + 1) alfa[y * w + x] = Math.max(alfa[y * w + x], Math.round(255 * (r + 1 - d)));
      }
    }
  };

  for (const trazo of trazos) {
    if (trazo.length === 1) pintar(trazo[0].x * ESCALA, trazo[0].y * ESCALA, trazo[0].x * ESCALA, trazo[0].y * ESCALA);
    for (let i = 1; i < trazo.length; i += 1) {
      pintar(trazo[i - 1].x * ESCALA, trazo[i - 1].y * ESCALA, trazo[i].x * ESCALA, trazo[i].y * ESCALA);
    }
  }

  const crudo = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y += 1) {
    const fila = y * (w * 4 + 1);
    crudo[fila] = 0;
    for (let x = 0; x < w; x += 1) {
      const o = fila + 1 + x * 4;
      crudo[o] = 15;
      crudo[o + 1] = 23;
      crudo[o + 2] = 42;
      crudo[o + 3] = alfa[y * w + x];
    }
  }

  const ihdr = new Uint8Array([...u32(w), ...u32(h), 8, 6, 0, 0, 0]);
  const firma = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const partes = [firma, chunk("IHDR", ihdr), chunk("IDAT", zlibSinCompresion(crudo)), chunk("IEND", new Uint8Array(0))];
  const total = partes.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

export function firmaAPngBase64(trazos: PuntoFirma[][], ancho: number, alto: number): string {
  return aBase64(firmaAPngBytes(trazos, ancho, alto));
}
