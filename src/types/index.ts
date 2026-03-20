// Tipos globales del sistema UTEQ Lockers

export type Rol = 'Admin' | 'Alumno'
export type EstadoLocker = 'Disponible' | 'Asignado' | 'Mantenimiento'
export type MetodoAcceso = 'RFID' | 'OTP' | 'Admin'
export type ResultadoAcceso = 'Exitoso' | 'Fallido'
export type EstadoDispositivo = 'Online' | 'Offline'

export interface Usuario {
  id: string
  email: string
  matricula: string
  nombre: string
  apellido: string
  rol: Rol
  creadoEn: string
}

export interface AuthState {
  token: string
  usuario: Usuario
}

export interface Edificio {
  id: string
  nombre: string
  descripcion?: string
  totalLockers: number
  totalPisos: number
}

export interface Piso {
  id: string
  edificioId: string
  edificioNombre: string
  numero: number
  descripcion?: string
  totalLockers: number
}

export interface DispositivoIot {
  id: string
  lockerId: string
  ultimaConexion?: string
  estado: EstadoDispositivo
}

export interface Asignacion {
  id: string
  lockerId: string
  lockerNumeroSerie: string
  lockerNumero: number
  edificioNombre: string
  pisoNumero: number
  pisoDescripcion?: string
  estudianteId: string
  estudianteNombre: string
  estudianteMatricula: string
  estudianteEmail: string
  fechaInicio: string
  fechaFin?: string
  activa: boolean
}

export interface Locker {
  id: string
  pisoId: string
  pisoNumero: number
  pisoDescripcion?: string
  edificioId: string
  edificioNombre: string
  numero: number
  numeroSerie: string
  estado: EstadoLocker
  asignadoA?: string
  asignadoAId?: string
  tieneDispositivo: boolean
  dispositivoEstado?: EstadoDispositivo
}

export interface LockerMapaItem {
  id: string
  numero: number
  numeroSerie: string
  estado: EstadoLocker
  tieneDispositivo: boolean
  dispositivoEstado?: EstadoDispositivo
}

export interface LockerMapaPiso {
  pisoNumero: number
  pisoId: string
  lockers: LockerMapaItem[]
}

export interface TarjetaRfid {
  id: string
  uid: string
  estudianteId: string
  estudianteNombre: string
  estudianteMatricula: string
  activa: boolean
  creadoEn: string
}

export interface AccesoLog {
  id: string
  lockerId: string
  lockerNumero: number
  numeroSerie: string
  edificioNombre: string
  pisoNumero: number
  estudianteId?: string
  estudianteNombre?: string
  estudianteMatricula?: string
  tarjetaUid?: string
  metodo: MetodoAcceso
  resultado: ResultadoAcceso
  motivoFallo?: string
  timestamp: string
}

export interface DashboardStats {
  totalLockers: number
  disponibles: number
  asignados: number
  mantenimiento: number
  porcentajeOcupacion: number
  accesosFallidosHoy: number
}

export interface Dispositivo {
  id: string
  lockerId: string
  lockerNumeroSerie: string
  lockerNumero: number
  edificioNombre: string
  pisoNumero: number
  ultimaConexion?: string
  estado: EstadoDispositivo
}

export interface Aviso {
  id: string
  asignacionId: string
  lockerNumeroSerie: string
  lockerNumero: number
  edificioNombre: string
  pisoDescripcion?: string
  estudianteNombre: string
  estudianteMatricula: string
  estudianteEmail: string
  mensaje: string
  fechaLimite: string
  estado: 'Pendiente' | 'Cumplido'
  creadoEn: string
}

export interface CrearAvisoDto {
  asignacionId: string
  mensaje?: string
  diasLimite: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

// DTOs de entrada
export interface LoginDto {
  email: string
  password: string
}

export interface CrearUsuarioDto {
  email: string
  matricula: string
  nombre: string
  apellido: string
  password: string
  rol: Rol
}

export interface ActualizarUsuarioDto {
  nombre?: string
  apellido?: string
  email?: string
  matricula?: string
  password?: string
}

export interface CrearAsignacionDto {
  lockerId: string
  estudianteId: string
  fechaInicio: string
  fechaFin?: string
}

export interface EnrolarTarjetaDto {
  uid: string
  estudianteId: string
}

export interface GenerarCodigoDto {
  asignacionId: string
}
