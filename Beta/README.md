# EntrenaMos MVP

Plataforma digital para gestión de rutinas de entrenamiento y seguimiento de alumnos.

## 🏗️ Estructura del Proyecto

```
app/
├── components/
│   ├── shared/           # Componentes reutilizables
│   │   ├── Metric.tsx
│   │   ├── SmallStat.tsx
│   │   └── StatusBadge.tsx
│   ├── student/          # Vistas de alumno
│   │   ├── StudentHomeView.tsx
│   │   ├── WorkoutView.tsx
│   │   └── SummaryView.tsx
│   ├── trainer/          # Vistas de entrenador
│   │   ├── TrainerDashboardView.tsx
│   │   ├── TrainerStudentsView.tsx
│   │   └── TrainerRoutinesView.tsx
│   ├── Header.tsx
│   └── BottomNav.tsx
├── data/                 # Datos mock
│   ├── workouts.ts
│   └── users.ts
├── hooks/                # Hooks personalizados
│   └── useAppState.ts
├── types/                # Tipos TypeScript
│   └── index.ts
├── utils/                # Funciones utilitarias
│   └── string.ts
├── globals.css
├── layout.tsx
└── page.tsx              # Punto de entrada principal
```

## 🚀 Stack Tecnológico

- **Framework:** Next.js 14+ con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **UI System:** Custom glass-morphism design

## 🎯 Características

### Vista Alumno
- Dashboard con rutina del día
- Visualización de ejercicios detallada
- Registro de esfuerzo (RPE 1-5)
- Seguimiento del progreso semanal
- Resumen de sesión con feedback

### Vista Entrenador
- Panel de control diario
- Gestión de alumnos con búsqueda
- Monitoreo de adherencia y RPE
- Biblioteca de rutinas
- Alertas de seguimiento

## 🎨 Paleta de Colores

- **Primary:** `#006591` (Azul oscuro)
- **Secondary:** `#006398` (Azul entrenador)
- **Text Primary:** `#0B1C30`
- **Text Muted:** `#3E4850`
- **Status Active:** `#22C55E` (Verde)
- **Status Urgent:** `#EF4444` (Rojo)

## 💻 Comandos

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run start    # Ejecutar build
npm run lint     # Linting
```

## 📝 Notas de Desarrollo

- Componentes separados por dominio (student, trainer, shared)
- Hook centralizado `useAppState` para lógica de estado
- Tipos compartidos en `types/`
- Datos mock separados por entidad
- Funciones utilitarias en `utils/`

## 🔄 Próximos Pasos

- [ ] Integración con backend (Firebase/API)
- [ ] Autenticación
- [ ] Persistencia de datos
- [ ] Notificaciones push
- [ ] Responsividad mejorada
- [ ] Modo oscuro
- [ ] Tests unitarios
