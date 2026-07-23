"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

export function LogoUploader({ userId, initialLogoUrl }: { userId: string; initialLogoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialLogoUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("El archivo tiene que ser una imagen (PNG, JPG, etc).");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("La imagen no puede pesar más de 3MB.");
      return;
    }

    setStatus("uploading");
    const supabase = createClient();
    const extension = file.name.split(".").pop() || "png";
    const path = `${userId}/logo.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) {
      setStatus("error");
      setError("No se pudo subir la imagen. Intentá de nuevo.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);

    // Cache-busting para que se vea el cambio al toque.
    const versionedUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ logo_url: versionedUrl })
      .eq("id", userId);

    if (updateError) {
      setStatus("error");
      setError("La imagen se subió pero no se pudo guardar. Intentá de nuevo.");
      return;
    }

    setPreview(versionedUrl);
    setStatus("done");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="grid size-20 place-items-center overflow-hidden rounded-2xl bg-soft">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Logo" className="size-full object-cover" src={preview} />
          ) : (
            <span className="text-xs font-bold text-primary">Sin logo</span>
          )}
        </div>
        <div className="flex-1">
          <button
            className="secondary-button w-full"
            disabled={status === "uploading"}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {status === "uploading" ? "Subiendo..." : "Subir logo"}
          </button>
          <input
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) handleFile(file);
            }}
            ref={inputRef}
            type="file"
          />
        </div>
      </div>

      {status === "done" && <p className="text-sm font-bold text-primary">Logo actualizado.</p>}
      {error && <p className="text-sm font-bold text-[#DC2626]">{error}</p>}
      <p className="text-sm text-text-muted">
        Este logo lo van a ver tus alumnos al iniciar sesión, para que sepan que están entrando a tu espacio.
      </p>
    </div>
  );
}
