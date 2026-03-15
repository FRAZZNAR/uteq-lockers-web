# UTEQ Lockers Web

Frontend del Sistema de Monitoreo de Lockers Universitarios — Universidad Tecnológica de Querétaro.

## Stack
- React 19 + TypeScript 5 | Vite 7 (puerto: 7130) | Bun
- Ant Design 6 | Zustand 5 | Axios | React Router 7 | dayjs

## Inicio rápido
```bash
bun install
bun dev        # http://localhost:7130
bun run build  # producción
```

## Portales

- **Admin** `/admin`: Dashboard (polling 15s), Lockers, Asignaciones, Usuarios, Tarjetas RFID, Accesos, Reportes PDF
- **Alumno** `/alumno`: Mi Locker, Solicitar Código OTP (countdown, sin mostrar código), Historial

## Credenciales de prueba
Email: `admin@uteq.edu.mx` | Password: `Admin1234!`

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `--uteq-navy` | `#242B57` | Navbar, panel oscuro, hover de botón |
| `--uteq-blue` | `#003B71` | Botones primarios, títulos, links, focus ring |
| `--uteq-accent` | `#7aaee0` | Acento sobre fondos oscuros, span del título |
| `--uteq-white` | `#ffffff` | Fondos de panel, texto sobre oscuro |
| `--uteq-surface` | `#f9fafb` | Fondo de inputs |
| `--uteq-border` | `#e5e7eb` | Bordes de inputs |
| `--uteq-text-muted` | `#888888` | Labels secundarios, subtítulos |
| `--uteq-text-hint` | `#aaaaaa` | Footer, placeholders |