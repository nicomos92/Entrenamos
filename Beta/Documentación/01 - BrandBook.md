# EntrenaMOS — Brand Book

## Identidad visual

Marca de software fitness orientada a entrenadores personales y sus alumnos.
Comunicación directa, profesional y cercana.

---

## Paleta de colores

### Colores de marca

| Variable | HEX | RGB | Uso |
|----------|-----|-----|-----|
| **Primary** | `#1A365D` | `26 54 93` | Botones principales, enlaces, acentos fuertes, `::selection` |
| **Secondary** | `#8B1A2B` | `139 26 43` | Botones secundarios, bordes de focus, fondos de acento |
| **Soft** | `#DEE2EC` | `222 226 236` | Fondos de tarjetas, badges, contenedores suaves |

### Neutros

| Variable | HEX | Uso |
|----------|-----|-----|
| **Background** | `#F8FAFC` | Fondo general de la app |
| **Surface** | `#DEE2EC` | Fondos de componentes, listas |
| **Surface container high** | `#C8CFDE` | Versión intensificada para contraste |
| **Text primary** | `#0F172A` | Títulos y cuerpo principal |
| **Text muted** | `#64748B` | Subtítulos, etiquetas, meta |

### Semánticos (no dependen de la marca)

| Variable | HEX | Uso |
|----------|-----|-----|
| **Status active** | `#16A34A` | Activo, completado, ok |
| **Status urgent** | `#DC2626` | Error, alerta crítica |
| **Status attention** | `#F59E0B` | Advertencia, pendiente |
| **Status info** | `#0EA5E9` | Informativo |

---

## Tipografía

- **Familia:** Inter (variable)
- **Pesos:** 400 (regular), 700 (bold), 900 (black)
- **Estilo:** Mayúscula espaciada para etiquetas (`tracking-[0.18em]` o `[0.2em]`)

---

## Componentes clave

| Componente | Estilo |
|-----------|--------|
| **Botón principal** | Fondo `secondary` (marino), texto blanco, sombra `glow` (vino), bordes `rounded-2xl` |
| **Botón secundario** | Borde `secondary/20`, fondo blanco traslúcido |
| **Campo de input** | Borde blanco, fondo `white/40`, focus con borde `secondary` |
| **Tarjeta (glass)** | Borde `white/50`, fondo `white/40`, blur, sombra `lift` |
| **Badge de estado** | Fondo semántico con opacidad 10%, texto semántico |

---

## Sombras

| Sombra | Valor |
|--------|-------|
| `glow` | `0 18px 48px rgba(26, 54, 93, 0.22)` |
| `lift` | `0 18px 45px rgba(15, 23, 42, 0.08)` |
| `soft` | `0 8px 24px rgba(15, 23, 42, 0.06)` |

---

## Personalización por entrenador

Cada entrenador puede sobreescribir `--brand-primary-rgb` (marino) y `--brand-secondary-rgb` (vino)
(vía `BrandColorPicker` en `/trainer/settings`). Los valores por defecto son los de
este Brand Book.
