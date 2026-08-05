import { ImageResponse } from "next/og";
import { brandLogoSvg } from "@/lib/brandLogo";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawSize = Number(url.searchParams.get("size"));
  const size = Math.min(Math.max(Number.isFinite(rawSize) ? rawSize : 512, 64), 2048);
  const dataUri = `data:image/svg+xml;base64,${btoa(brandLogoSvg(false))}`;

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt="" height={size} src={dataUri} width={size} />
    ),
    { width: size, height: size }
  );
}
