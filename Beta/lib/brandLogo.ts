const BRAND_PRIMARY = "#1A365D";
const BRAND_SECONDARY = "#8B1A2B";

export function brandLogoSvg(rounded = false): string {
  const radius = rounded ? 112 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="emg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND_PRIMARY}"/>
      <stop offset="1" stop-color="${BRAND_SECONDARY}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#emg)"/>
  <g fill="#ffffff">
    <rect x="182" y="104" width="148" height="92" rx="34"/>
    <rect x="182" y="316" width="148" height="92" rx="34"/>
    <rect x="232" y="150" width="48" height="212" rx="24"/>
  </g>
</svg>`;
}
