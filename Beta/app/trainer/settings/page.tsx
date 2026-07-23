import { Settings2, Image as ImageIcon, Palette } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { LogoUploader } from "@/app/components/trainer/LogoUploader";
import { BrandColorPicker } from "@/app/components/trainer/BrandColorPicker";
import { SectionHeader } from "@/app/components/shared/SectionHeader";

export default async function TrainerSettingsPage() {
  const { user, profile } = await requireProfile("trainer");

  return (
    <section className="space-y-5">
      <SectionHeader eyebrow="Tu marca" icon={Settings2} title="Configuración" />

      <article className="glass-card rounded-[2rem] p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <ImageIcon size={14} strokeWidth={2.5} />
          Logo
        </p>
        <LogoUploader initialLogoUrl={profile.logo_url} userId={user.id} />
      </article>

      <article className="glass-card rounded-[2rem] p-6">
        <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-text-muted">
          <Palette size={14} strokeWidth={2.5} />
          Colores
        </p>
        <BrandColorPicker
          initialPrimary={profile.brand_primary}
          initialSecondary={profile.brand_secondary}
          userId={user.id}
        />
      </article>
    </section>
  );
}
