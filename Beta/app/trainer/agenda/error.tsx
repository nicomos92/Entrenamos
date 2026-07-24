"use client";

import { ErrorFallback } from "@/app/components/shared/ErrorFallback";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorFallback error={error} reset={reset} />;
}
