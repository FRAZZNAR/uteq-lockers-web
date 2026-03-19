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
