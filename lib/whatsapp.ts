/** Datos de contacto WhatsApp de MEPROIND y constructor de enlaces. */
export const WA_PHONE = "51960577642";
export const WA_PHONE_DISPLAY = "+51 960 577 642";
export const WA_PHONE_ALT_DISPLAY = "+51 936 702 242";

const DEFAULT_MSG =
  "Hola, deseo más información sobre las mesas gravimétricas Meproind.";

/** Construye un enlace de WhatsApp con un mensaje pre-cargado. */
export function wa(message: string = DEFAULT_MSG): string {
  return `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(
    message,
  )}`;
}
