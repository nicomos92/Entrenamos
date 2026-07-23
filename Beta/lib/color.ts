// Utilidades para theming dinámico por entrenador.
// Tailwind necesita los colores como "R G B" (canales separados por espacio)
// para poder generar variantes con opacidad (bg-secondary/20, etc). Por eso
// no basta con guardar el hex tal cual en la variable CSS: hay que convertirlo.

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function isValidHex(hex: string | null | undefined): hex is string {
  return typeof hex === "string" && HEX_PATTERN.test(hex);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

/** "22 163 74" listo para usar en rgb(var(--x) / <alpha-value>). */
export function rgbChannels(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

/** Versión clara del color (mezclado con blanco), como canales R G B. */
export function softTintChannels(hex: string, ratio = 0.14): string {
  const [r, g, b] = hexToRgb(hex);
  const mix = (channel: number) => Math.round(channel * ratio + 255 * (1 - ratio));
  return `${mix(r)} ${mix(g)} ${mix(b)}`;
}

/** Devuelve las variables CSS a inyectar en un contenedor para aplicar la marca del entrenador. */
export function brandCssVars(primaryHex: string | null | undefined, secondaryHex: string | null | undefined) {
  const vars: Record<string, string> = {};

  if (isValidHex(primaryHex)) {
    vars["--brand-primary-rgb"] = rgbChannels(primaryHex);
    vars["--brand-soft-rgb"] = softTintChannels(primaryHex);
  }
  if (isValidHex(secondaryHex)) {
    vars["--brand-secondary-rgb"] = rgbChannels(secondaryHex);
  }

  return vars;
}
