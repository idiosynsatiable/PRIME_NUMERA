import QRCode from "qrcode";
import { assertPublicSharePayloadSafe, type PublicSharePayload } from "@prime-numera/numerology-core";
import { buildShareUrl, SHARE_CANVAS_SIZES, type OpaqueShareId } from "./index.js";

const escapeXml = (value: string): string => value.replace(/[&<>"']/gu, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);

/** The QR encodes only a configured HTTPS origin and a 192-bit opaque share ID. */
export async function renderShareQrSvg(origin: string, id: OpaqueShareId): Promise<string> {
  return QRCode.toString(buildShareUrl(origin, id), { type: "svg", errorCorrectionLevel: "M", margin: 4 });
}

export async function renderShareQrPng(origin: string, id: OpaqueShareId): Promise<Uint8Array> {
  return QRCode.toBuffer(buildShareUrl(origin, id), { type: "png", errorCorrectionLevel: "M", margin: 4, scale: 8 });
}

/** Technical renderer; final visual styling remains subject to the accepted design direction. */
export function renderShareCardSvg(payload: PublicSharePayload): string {
  assertPublicSharePayloadSafe(payload);
  const { width, height } = SHARE_CANVAS_SIZES[payload.aspectRatio];
  const columns = width > height ? 2 : 1;
  const rows = Math.ceil(payload.values.length / columns);
  const top = 300;
  const rowHeight = Math.min(130, (height - top - 160) / rows);
  const columnWidth = (width - 128) / columns;
  const values = payload.values.map((item, index) => {
    const x = 64 + (index % columns) * columnWidth;
    const y = top + Math.floor(index / columns) * rowHeight;
    const displayedValue = item.compoundValue === undefined ? String(item.value) : `${item.compoundValue} → ${item.value}`;
    return `<g><text x="${x}" y="${y}" font-size="22" fill="#aebdd3">${escapeXml(item.label)}</text><text x="${x}" y="${y + 36}" font-size="32" fill="#f6f7fb">${escapeXml(displayedValue)}</text></g>`;
  }).join("");
  const label = payload.displayLabel === null ? "Selected numbers" : payload.displayLabel;
  const characters = Array.from(label);
  const labelLines: string[] = [];
  for (let start = 0; start < characters.length; start += 32) labelLines.push(characters.slice(start, start + 32).join(""));
  const labelText = labelLines.map((line, index) => `<text x="64" y="${150 + index * 30}" font-size="24" fill="#f6f7fb">${escapeXml(line)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description"><title id="title">PRIME NUMERA · selected numbers</title><desc id="description">Pythagorean calculation results selected for sharing. Numerology is an interpretive tradition, not a scientific prediction.</desc><rect width="${width}" height="${height}" fill="#080e1b"/><g font-family="sans-serif"><text x="64" y="84" font-size="26" fill="#beef74">PRIME NUMERA</text>${labelText}<text x="64" y="250" font-size="20" fill="#aebdd3">Pythagorean · Selected calculation results</text>${values}<text x="64" y="${height - 82}" font-size="18" fill="#aebdd3">For reflection. Not a scientific prediction.</text></g></svg>`;
}
