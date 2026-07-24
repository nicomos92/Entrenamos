"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_PRIMARY = "#1A365D";
const DEFAULT_SECONDARY = "#8B1A2B";
const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function BrandColorPicker({
  userId,
  initialPrimary,
  initialSecondary,
}: {
  userId: string;
  initialPrimary: string | null;
  initialSecondary: string | null;
}) {
  const router = useRouter();
  const [primary, setPrimary] = useState(initialPrimary && HEX_PATTERN.test(initialPrimary) ? initialPrimary : DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(
    initialSecondary && HEX_PATTERN.test(initialSecondary) ? initialSecondary : DEFAULT_SECONDARY
  );
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const savedOnce = useRef(false);

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ brand_primary: primary, brand_secondary: secondary })
      .eq("id", userId);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    savedOnce.current = true;
    setStatus("done");
    router.refresh();
  }

  function handleReset() {
    setPrimary(DEFAULT_PRIMARY);
    setSecondary(DEFAULT_SECONDARY);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Color principal</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 px-3 py-2">
            <input
              className="size-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              onChange={(event) => setPrimary(event.target.value)}
              type="color"
              value={primary}
            />
            <span className="text-sm font-bold text-text-primary">{primary}</span>
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Color secundario</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 px-3 py-2">
            <input
              className="size-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              onChange={(event) => setSecondary(event.target.value)}
              type="color"
              value={secondary}
            />
            <span className="text-sm font-bold text-text-primary">{secondary}</span>
          </div>
        </label>
      </div>

      <div
        className="rounded-3xl p-4"
        style={{ background: `color-mix(in srgb, ${primary} 14%, white)` }}
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: primary }}>
          Vista previa
        </p>
        <button
          className="w-full rounded-2xl px-5 py-4 font-bold text-white shadow-glow transition active:scale-[0.98]"
          style={{ background: secondary }}
          type="button"
        >
          Botón de ejemplo
        </button>
      </div>

      <div className="flex gap-3">
        <button className="premium-button flex-1" disabled={status === "saving"} onClick={handleSave} type="button">
          {status === "saving" ? "Guardando..." : "Guardar colores"}
        </button>
        <button className="secondary-button" onClick={handleReset} type="button">
          Restaurar
        </button>
      </div>

      {status === "done" && <p className="text-sm font-bold text-primary">Colores actualizados.</p>}
      {status === "error" && (
        <p className="text-sm font-bold text-status-urgent">
          No se pudieron guardar los colores{errorMessage ? `: ${errorMessage}` : ". Intentá de nuevo."}
        </p>
      )}
      <p className="text-sm text-text-muted">
        Estos colores reemplazan la paleta verde por defecto en la app de tus alumnos.
      </p>
    </div>
  );
}
