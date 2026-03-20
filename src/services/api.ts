import axios from 'axios'
import type {
  LoginDto, ServiceResponse, AuthState,
  Usuario, CrearUsuarioDto, ActualizarUsuarioDto,
  Edificio, Piso, Locker, LockerMapaPiso, AccesoLog,
  Asignacion, CrearAsignacionDto,
  TarjetaRfid, EnrolarTarjetaDto,
  GenerarCodigoDto, Dispositivo,
  Aviso, CrearAvisoDto,
} from '../types'
import useAuthStore from '../stores/authStore'

// ── Instancia Axios ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
})

// Interceptor request: adjunta JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor response: si 401 → logout y redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────
const auth = {
  login: (dto: LoginDto) =>
    api.post<ServiceResponse<{ token: string; usuario: Usuario }>>('/auth/login', dto),
}

// ── Usuarios ──────────────────────────────────────────────────────────
const usuarios = {
  listar: (page = 1, pageSize = 50) =>
    api.get<ServiceResponse<Usuario[]>>('/usuarios', { params: { page, pageSize } }),
  obtener: (id: string) =>
    api.get<ServiceResponse<Usuario>>(`/usuarios/${id}`),
  crear: (dto: CrearUsuarioDto) =>
    api.post<ServiceResponse<Usuario>>('/usuarios', dto),
  actualizar: (id: string, dto: ActualizarUsuarioDto) =>
    api.put<ServiceResponse<Usuario>>(`/usuarios/${id}`, dto),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/usuarios/${id}`),
  listarAlumnos: () =>
    api.get<ServiceResponse<Usuario[]>>('/usuarios/alumnos'),
}

// ── Edificios ─────────────────────────────────────────────────────────
const edificios = {
  listar: () =>
    api.get<ServiceResponse<Edificio[]>>('/edificios'),
  obtener: (id: string) =>
    api.get<ServiceResponse<Edificio>>(`/edificios/${id}`),
}

// ── Pisos ─────────────────────────────────────────────────────────────
const pisos = {
  listarPorEdificio: (edificioId: string) =>
    api.get<ServiceResponse<Piso[]>>(`/pisos/edificio/${edificioId}`),
}

// ── Lockers ───────────────────────────────────────────────────────────
const lockers = {
  listar: (params?: { page?: number; pageSize?: number }) =>
    api.get<ServiceResponse<Locker[]>>('/lockers', { params }),
  obtener: (id: string) =>
    api.get<ServiceResponse<Locker>>(`/lockers/${id}`),
  mapa: (edificioId: string) =>
    api.get<ServiceResponse<LockerMapaPiso[]>>(`/lockers/mapa/${edificioId}`),
  historial: (id: string) =>
    api.get<ServiceResponse<AccesoLog[]>>(`/lockers/${id}/historial`),
  crear: (dto: { pisoId: string; numero: number; numeroSerie: string }) =>
    api.post<ServiceResponse<Locker>>('/lockers', dto),
  actualizar: (id: string, dto: { numeroSerie?: string; estado?: string }) =>
    api.put<ServiceResponse<Locker>>(`/lockers/${id}`, dto),
  cambiarEstado: (id: string, estado: string) =>
    api.patch<ServiceResponse<Locker>>(`/lockers/${id}/estado`, { estado }),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/lockers/${id}`),
}

// ── Asignaciones ──────────────────────────────────────────────────────
const asignaciones = {
  listar: () =>
    api.get<ServiceResponse<Asignacion[]>>('/asignaciones'),
  obtener: (id: string) =>
    api.get<ServiceResponse<Asignacion>>(`/asignaciones/${id}`),
  miLocker: () =>
    api.get<ServiceResponse<Asignacion>>('/asignaciones/mi-locker'),
  crear: (dto: CrearAsignacionDto) =>
    api.post<ServiceResponse<Asignacion>>('/asignaciones', dto),
  liberar: (id: string) =>
    api.post<ServiceResponse<boolean>>(`/asignaciones/${id}/liberar`),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/asignaciones/${id}`),
}

// ── Tarjetas RFID ─────────────────────────────────────────────────────
const tarjetas = {
  listar: () =>
    api.get<ServiceResponse<TarjetaRfid[]>>('/tarjetas'),
  listarPorAlumno: (alumnoId: string) =>
    api.get<ServiceResponse<TarjetaRfid[]>>(`/tarjetas/alumno/${alumnoId}`),
  enrolar: (dto: EnrolarTarjetaDto) =>
    api.post<ServiceResponse<TarjetaRfid>>('/tarjetas/enrolar', dto),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/tarjetas/${id}`),
}

// ── Códigos OTP ───────────────────────────────────────────────────────
const codigos = {
  generar: (dto: GenerarCodigoDto) =>
    api.post<ServiceResponse<{ mensaje: string; expiraEn: string }>>('/codigos/generar', dto),
}

// ── Accesos ───────────────────────────────────────────────────────────
const accesos = {
  listar: (filtros?: {
    lockerId?: string
    alumnoId?: string
    edificioId?: string
    resultado?: string
    metodo?: string
    desde?: string
    hasta?: string
    page?: number
    pageSize?: number
  }) => api.get<ServiceResponse<AccesoLog[]>>('/accesos', { params: filtros }),
  recientes: () =>
    api.get<ServiceResponse<AccesoLog[]>>('/accesos/recientes'),
  fallidos: () =>
    api.get<ServiceResponse<AccesoLog[]>>('/accesos/fallidos'),
}

// ── Dispositivos ──────────────────────────────────────────────────────
const dispositivos = {
  listar: () =>
    api.get<ServiceResponse<Dispositivo[]>>('/dispositivos'),
  registrar: (lockerId: string) =>
    api.post<ServiceResponse<{ deviceKey: string }>>('/dispositivos/registrar', { lockerId }),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/dispositivos/${id}`),
}

// ── Avisos ────────────────────────────────────────────────────────────
const avisos = {
  listar: () =>
    api.get<ServiceResponse<Aviso[]>>('/avisos'),
  misAvisos: () =>
    api.get<ServiceResponse<Aviso[]>>('/avisos/mis-avisos'),
  crear: (dto: CrearAvisoDto) =>
    api.post<ServiceResponse<Aviso>>('/avisos', dto),
  marcarCumplido: (id: string) =>
    api.patch<ServiceResponse<boolean>>(`/avisos/${id}/cumplido`),
}

// ── Reportes ──────────────────────────────────────────────────────────
const reportes = {
  ocupacion: () =>
    api.get('/reportes/ocupacion'),
  descargarOcupacionPdf: () =>
    api.get('/reportes/ocupacion/pdf', { responseType: 'blob' }),
  descargarAccesosPdf: (params?: { desde?: string; hasta?: string; edificioId?: string }) =>
    api.get('/reportes/accesos/pdf', { params, responseType: 'blob' }),
}

// ── Dashboard ─────────────────────────────────────────────────────────
const dashboard = {
  stats: async () => {
    const [lockersRes, accesosFallidosRes] = await Promise.all([
      lockers.listar(),
      accesos.fallidos(),
    ])
    const ls = lockersRes.data.data ?? []
    const total = ls.length
    const disponibles = ls.filter((l) => l.estado === 'Disponible').length
    const asignados = ls.filter((l) => l.estado === 'Asignado').length
    const mantenimiento = ls.filter((l) => l.estado === 'Mantenimiento').length
    const accesosFallidosHoy = accesosFallidosRes.data.data?.length ?? 0
    return {
      totalLockers: total,
      disponibles,
      asignados,
      mantenimiento,
      porcentajeOcupacion: total > 0 ? Math.round((asignados / total) * 100 * 10) / 10 : 0,
      accesosFallidosHoy,
    }
  },
}

export default {
  auth,
  usuarios,
  edificios,
  pisos,
  lockers,
  asignaciones,
  tarjetas,
  codigos,
  accesos,
  dispositivos,
  reportes,
  avisos,
  dashboard,
}
