export function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
