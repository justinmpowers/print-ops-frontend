/**
 * Spool label codes. Each spool's QR label holds the address of its page in PrintOps
 * (https://<your PrintOps>/spool/42), so any phone camera opens it; the printed code
 * (F-0042) is for reading by eye or typing in.
 */

/** The spool id in whatever a scan or a person typed: a label URL, a code like F-0042, or a bare id. */
export function spoolIdFromScan(text: string | null | undefined): number | null {
  const value = (text || '').trim();
  const fromUrl = /\/spool\/(\d+)(?:[/?#]|$)/i.exec(value);
  const fromCode = /^F-?(\d+)$/i.exec(value);
  const digits = fromUrl?.[1] ?? fromCode?.[1] ?? (/^\d+$/.test(value) ? value : null);
  if (digits === null) return null;
  const id = Number(digits);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** Address of a spool's page, as printed in its QR code. Follows the app's own address and base href. */
export function spoolPageUrl(id: number): string {
  return new URL(`spool/${id}`, document.baseURI).href;
}
