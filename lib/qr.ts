import QRCode from "qrcode";

/**
 * Generates a QR code as a base64 data URL for the given verification URL.
 */
export async function generateQRCode(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 256,
    margin: 2,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });
}
