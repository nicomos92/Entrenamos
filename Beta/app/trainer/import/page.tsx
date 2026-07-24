"use client";

import { useActionState } from "react";
import { Upload, Download, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { IconBadge } from "@/app/components/shared/IconBadge";
import { importExcel } from "@/app/trainer/import/actions";
import type { ImportResult } from "@/app/trainer/import/actions";

export default function ImportPage() {
  const [state, formAction, pending] = useActionState<ImportResult, FormData>(importExcel, {});

  return (
    <section className="space-y-5">
      <div>
        <Link className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-text-primary" href="/trainer">
          <ArrowLeft size={16} strokeWidth={2.5} />
          Inicio
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <IconBadge icon={<Upload size={20} strokeWidth={2.25} />} />
          <h1 className="text-3xl font-bold text-text-primary">Importar desde Excel</h1>
        </div>
        <p className="mt-2 text-text-muted">
          Subí un archivo .xlsx con las hojas <strong>Ejercicios</strong> y/o <strong>Rutinas</strong> para importar
          todo de una sola vez.
        </p>
      </div>

      <div className="glass-card rounded-[2rem] p-6">
        <div className="mb-6 space-y-3">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-text-muted">Formato esperado</p>

          <div>
            <p className="mb-1 text-sm font-bold text-text-primary">Hoja &quot;Ejercicios&quot;</p>
            <div className="overflow-x-auto rounded-2xl bg-white/30 text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20 font-bold text-text-muted">
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Descripción</th>
                    <th className="px-3 py-2 text-left">Foco</th>
                    <th className="px-3 py-2 text-left">Imagen</th>
                    <th className="px-3 py-2 text-left">Video</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2">Press banca</td>
                    <td className="px-3 py-2">Empuje horizontal con barra</td>
                    <td className="px-3 py-2">Pecho</td>
                    <td className="px-3 py-2">https://...</td>
                    <td className="px-3 py-2">https://...</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Sentadilla</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">Piernas</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">-</td>
                  </tr>
                </tbody>
              </table>
            <p className="mt-1 text-xs text-text-muted/60">Series, reps, tiempo y descanso se configuran en cada rutina, no en el ejercicio.</p>
          </div>
          </div>

          <div>
            <p className="mb-1 text-sm font-bold text-text-primary">Hoja &quot;Rutinas&quot;</p>
            <div className="overflow-x-auto rounded-2xl bg-white/30 text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20 font-bold text-text-muted">
                    <th className="px-3 py-2 text-left">Rutina</th>
                    <th className="px-3 py-2 text-left">Objetivo</th>
                    <th className="px-3 py-2 text-left">Duracion</th>
                    <th className="px-3 py-2 text-left">Ejercicio</th>
                    <th className="px-3 py-2 text-left">Series</th>
                    <th className="px-3 py-2 text-left">Reps</th>
                    <th className="px-3 py-2 text-left">Tiempo</th>
                    <th className="px-3 py-2 text-left">Descanso</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="px-3 py-2">Push</td>
                    <td className="px-3 py-2">Hipertrofia</td>
                    <td className="px-3 py-2">45</td>
                    <td className="px-3 py-2">Press banca</td>
                    <td className="px-3 py-2">4</td>
                    <td className="px-3 py-2">10</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">90</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Push</td>
                    <td className="px-3 py-2">Hipertrofia</td>
                    <td className="px-3 py-2">45</td>
                    <td className="px-3 py-2">Press militar</td>
                    <td className="px-3 py-2">3</td>
                    <td className="px-3 py-2">12</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">60</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <form action={formAction} className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/20 bg-white/10 p-8 text-center transition hover:border-primary hover:bg-primary/5">
            <Upload size={32} strokeWidth={1.5} className="mb-2 text-text-muted" />
            <span className="text-sm font-bold text-text-muted">
              {pending ? "Procesando..." : "Hacé click para seleccionar el archivo"}
            </span>
            <span className="mt-1 text-xs text-text-muted/60">.xlsx o .xls</span>
            <input
              accept=".xlsx,.xls"
              className="hidden"
              disabled={pending}
              name="file"
              required
              type="file"
            />
          </label>

          {state.error && (
            <p className="flex items-center gap-2 rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">
              <AlertCircle size={16} strokeWidth={2.5} />
              {state.error}
            </p>
          )}

          {(state.exercisesCreated ?? 0) > 0 || (state.routinesCreated ?? 0) > 0 ? (
            <div className="rounded-2xl bg-status-ok/10 px-4 py-3 text-sm font-bold text-status-ok">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} strokeWidth={2.5} />
                Importación completada
              </div>
              <ul className="mt-1 list-inside list-disc text-xs font-normal text-text-muted">
                {state.exercisesCreated ? <li>{state.exercisesCreated} ejercicios creados</li> : null}
                {state.routinesCreated ? <li>{state.routinesCreated} rutinas creadas</li> : null}
              </ul>
            </div>
          ) : null}

          <button
            className="premium-button w-full"
            disabled={pending}
            type="submit"
          >
            {pending ? "Importando..." : "Importar"}
          </button>
        </form>
      </div>

      <a className="glass-card block rounded-[2rem] p-6 transition hover:shadow-soft" download href="/trainer/import/template">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-text-muted">
          <Download size={14} strokeWidth={2.5} />
          Descargar plantilla
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Archivo .xlsx de ejemplo con el formato exacto que espera la importación.
        </p>
      </a>
    </section>
  );
}
