"use client";

import { useId } from "react";

const BRAND_PRIMARY = "#1A365D";
const BRAND_SECONDARY = "#8B1A2B";

interface BrandMarkProps {
  className?: string;
  rounded?: boolean;
}

export function BrandMark({ className, rounded = true }: BrandMarkProps) {
  const id = useId().replace(/[:\s]/g, "");
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 512 512">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND_PRIMARY} />
          <stop offset="1" stopColor={BRAND_SECONDARY} />
        </linearGradient>
      </defs>
      <rect height="512" width="512" rx={rounded ? 112 : 0} fill={`url(#${id})`} />
      <g fill="#ffffff">
        <rect height="92" rx="34" width="148" x="182" y="104" />
        <rect height="92" rx="34" width="148" x="182" y="316" />
        <rect height="212" rx="24" width="48" x="232" y="150" />
      </g>
    </svg>
  );
}
