import "server-only";
import QRCode from "qrcode";

export async function generateQrSvg(text: string): Promise<string> {
  const svg = await QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 160,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}