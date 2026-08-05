import type { ReactNode } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Dumbbell,
  LifeBuoy,
  ListChecks,
  LogOut,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import { requireAnyProfile } from "@/lib/auth";
import { BrandMark } from "@/app/components/BrandMark";

function FaqItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-white/50 bg-white/40 p-5 shadow-soft transition-colors open:bg-white/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-text-primary">
        {title}
        <ChevronDown className="shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180" size={18} strokeWidth={2.5} />
      </summary>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-text-muted">{children}</div>
    </details>
  );
}

function Group({ title, icon, items }: { title: string; icon: ReactNode; items: ReactNode }) {
  return (
    <article className="glass-card rounded-[2rem] p-6">
      <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.24em] text-text-primary">
        {icon}
        {title}
      </p>
      <div className="space-y-3">{items}</div>
    </article>
  );
}

export default async function AyudaPage() {
  const { profile } = await requireAnyProfile();
  const firstName = profile.full_name.split(" ")[0];

  const commonInstall = (
    <Group
      icon={<Smartphone size={14} strokeWidth={2.5} />}
      items={
        <>
          <FaqItem title="Android (Chrome)">
            <p>
              Abrí EntrenaMos en Chrome, tocá el menú (⋮) arriba a la derecha y elegí{" "}
              <span className="font-bold text-text-primary">Instalar app</span> (o{" "}
              <span className="font-bold text-text-primary">Agregar a pantalla de inicio</span>). Se crea
              un ícono en tu home y la app se abre en ventana propia.
            </p>
          </FaqItem>
          <FaqItem title="iPhone / iPad (Safari)">
            <p>
              Abrí EntrenaMos en Safari, tocá el botón <span className="font-bold text-text-primary">Compartir</span>{" "}
              (cuadrado con flecha hacia arriba) y elegí{" "}
              <span className="font-bold text-text-primary">Agregar a pantalla de inicio</span>. Después abrila
              desde ese ícono.
            </p>
          </FaqItem>
          <FaqItem title="¿Qué pasa si la abro desde el navegador?">
            <p>Funciona exactamente igual. La versión instalada es la misma página, con una ventana más limpia.</p>
          </FaqItem>
        </>
      }
      title="Cómo instalar la app"
    />
  );

  const commonFaq = (
    <Group
      icon={<LifeBuoy size={14} strokeWidth={2.5} />}
      items={
        <>
          <FaqItem title="¿Cómo cierro sesión?">
            <p>
              Tocá el ícono de salida que está al lado de tu nombre (arriba en el celular, abajo en la
              barra lateral de la computadora).
            </p>
          </FaqItem>
          <FaqItem title="¿Mis datos se guardan automáticamente?">
            <p>Sí. Todo lo que cargás (entrenamientos, mediciones, mensajes) se guarda al instante en la nube.</p>
          </FaqItem>
          <FaqItem title="¿Necesito internet para usar la app?">
            <p>En la versión actual sí. Podés instalarla para tener un acceso rápido, pero los datos se sincronizan online.</p>
          </FaqItem>
        </>
      }
      title="Preguntas frecuentes"
    />
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <BrandMark className="size-14 shrink-0 rounded-2xl shadow-soft" />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-text-muted">Centro de ayuda</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text-primary">Hola, {firstName}</h1>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-text-muted">
        Acá vas a encontrar guías paso a paso para sacarle el máximo provecho a EntrenaMos. Elegí el tema
        que necesites para desplegar los pasos.
      </p>

      {profile.role === "student" && (
        <Group
          icon={<ListChecks size={14} strokeWidth={2.5} />}
          items={
            <>
              <FaqItem title="Primeros pasos">
                <p>
                  Al entrar vas a ver tu pantalla <span className="font-bold text-text-primary">Hoy</span> con la
                  rutina que te asignó tu entrenador. Desde la barra inferior podés ir a Rutina, Agenda,
                  Resumen, Mensajes y Perfil.
                </p>
              </FaqItem>
              <FaqItem title="Hacer mi rutina diaria">
                <p>
                  Entrá a <span className="font-bold text-text-primary">Rutina</span> y tocá{" "}
                  <span className="font-bold text-text-primary">Iniciar entrenamiento</span>. Marcá cada serie
                  cuando la completes; si el ejercicio es con peso, cargá el peso usado. Al terminar, indicá
                  el esfuerzo percibido (RPE) y guardá la sesión.
                </p>
              </FaqItem>
              <FaqItem title="Mi agenda">
                <p>
                  En <span className="font-bold text-text-primary">Agenda</span> vas a ver el horario semanal que
                  tu entrenador cargó para vos. Si tenés dudas o necesitás cambiarlo, escribile por Mensajes.
                </p>
              </FaqItem>
              <FaqItem title="Registrar mi peso">
                <p>
                  En <span className="font-bold text-text-primary">Perfil</span> podés registrar tu peso y altura.
                  EntrenaMos calcula tu IMC y en <span className="font-bold text-text-primary">Resumen</span>{" "}
                  vas a ver la evolución de tus mediciones.
                </p>
              </FaqItem>
              <FaqItem title="Cuota">
                <p>
                  El estado de tu cuota (monto y día de vencimiento) aparece en tu pantalla{" "}
                  <span className="font-bold text-text-primary">Hoy</span>. Cuando la pagues, tu entrenador la
                  registra y queda marcada como al día.
                </p>
              </FaqItem>
              <FaqItem title="Mensajes">
                <p>
                  En <span className="font-bold text-text-primary">Mensajes</span> podés escribirle a tu entrenador
                  para consultas sobre rutinas, horarios o cuota.
                </p>
              </FaqItem>
            </>
          }
          title="Para alumnos"
        />
      )}

      {profile.role === "trainer" && (
        <Group
          icon={<Users size={14} strokeWidth={2.5} />}
          items={
            <>
              <FaqItem title="Primeros pasos">
                <p>
                  Tu <span className="font-bold text-text-primary">Panel</span> muestra el resumen de tu negocio:
                  alumnos, próximos horarios y estado de la semana. Desde la barra lateral accedés a Alumnos,
                  Ejercicios, Rutinas, Agenda, Importar, Mensajes y Config.
                </p>
              </FaqItem>
              <FaqItem title="Armar la agenda semanal">
                <p>
                  Entrá a <span className="font-bold text-text-primary">Agenda</span>. Tocá una celda (día y hora)
                  para crear un horario; para moverlo, arrastrá el bloque a otro día u hora; para editarlo o
                  eliminarlo, tocá el bloque. Los alumnos lo ven al instante en su app.
                </p>
              </FaqItem>
              <FaqItem title="Mis alumnos">
                <p>
                  En <span className="font-bold text-text-primary">Alumnos</span> ves la lista con su próximo
                  horario. Tocá un alumno para ver su detalle: asignarle rutina, ver su progreso semanal,
                  historial de sesiones, mediciones (peso e IMC) y registrar pagos de cuota.
                </p>
              </FaqItem>
              <FaqItem title="Ejercicios y rutinas">
                <p>
                  Cargá primero tus <span className="font-bold text-text-primary">Ejercicios</span> y después armá{" "}
                  <span className="font-bold text-text-primary">Rutinas</span> combinándolos con series, tiempo y
                  descansos. Asígnale una rutina a cada alumno desde su detalle.
                </p>
              </FaqItem>
              <FaqItem title="Importar ejercicios">
                <p>
                  En <span className="font-bold text-text-primary">Importar</span> podés subir una planilla (XLSX)
                  con ejercicios para cargarlos en lote y no escribirlos uno por uno.
                </p>
              </FaqItem>
              <FaqItem title="Personalizar mi marca">
                <p>
                  En <span className="font-bold text-text-primary">Config</span> podés subir tu logo y elegir los
                  colores que ven tus alumnos. También configura el recordatorio de cuota que se les envía.
                </p>
              </FaqItem>
              <FaqItem title="Mensajes">
                <p>
                  En <span className="font-bold text-text-primary">Mensajes</span> conversás con cada alumno.
                  También es el canal para avisarle cambios de horario o pedidos de cuota.
                </p>
              </FaqItem>
            </>
          }
          title="Para entrenadores"
        />
      )}

      {profile.role === "admin" && (
        <Group
          icon={<ShieldCheck size={14} strokeWidth={2.5} />}
          items={
            <>
              <FaqItem title="Crear un entrenador">
                <p>
                  En <span className="font-bold text-text-primary">Entrenadores</span> usá el formulario{" "}
                  <span className="font-bold text-text-primary">Nuevo entrenador</span> con nombre, email y una
                  contraseña inicial. Cada entrenador administra sus propios alumnos y rutinas.
                </p>
              </FaqItem>
              <FaqItem title="Ver los entrenadores">
                <p>
                  La lista muestra todos los entrenadores creados con su fecha de alta. El acceso está limitado
                  al rol de administración.
                </p>
              </FaqItem>
              <FaqItem title="Restablecer la base de datos">
                <p>
                  Si necesitás empezar de cero en un entorno de pruebas, la opción de restablecer borra los datos
                  de demostración. Usala con cuidado porque no se puede deshacer.
                </p>
              </FaqItem>
            </>
          }
          title="Para administradores"
        />
      )}

      {commonInstall}

      <Group
        icon={<Dumbbell size={14} strokeWidth={2.5} />}
        items={
          <>
            <FaqItem title="¿Cómo recupero mi acceso?">
              <p>
                Pedile a tu entrenador (si sos alumno) o al administrador (si sos entrenador) que verifique tu
                usuario. No hay recuperación automática de contraseña: los accesos se crean desde la app.
              </p>
            </FaqItem>
            <FaqItem title="¿Quién puede ver mis datos?">
              <p>
                Tu entrenador y vos. Los alumnos solo ven su propia información; los entrenadores solo la de
                sus propios alumnos.
              </p>
            </FaqItem>
          </>
        }
        title="Cuenta y privacidad"
      />

      {commonFaq}

      <div className="glass-card flex flex-col items-center gap-3 rounded-[2rem] p-6 text-center">
        <LogOut size={20} className="text-text-muted" strokeWidth={2.25} />
        <p className="text-sm leading-relaxed text-text-muted">
          ¿Necesitás más ayuda? Escribí a través de <span className="font-bold text-text-primary">Mensajes</span>{" "}
          o comunicate con el equipo de EntrenaMos.
        </p>
        <Link className="text-sm font-bold text-primary" href="/">
          Volver a la app
        </Link>
      </div>
    </section>
  );
}
