import axios, { type AxiosError, type CancelTokenSource } from 'axios'
import type {
  LoginDto, ServiceResponse,
  Usuario, CrearUsuarioDto, ActualizarUsuarioDto,
  Edificio, Piso, Locker, LockerMapaPiso, AccesoLog,
  Asignacion, CrearAsignacionDto,
  TarjetaRfid, EnrolarTarjetaDto,
  GenerarCodigoDto, Dispositivo,
  Aviso, CrearAvisoDto,
  SolicitarCodigoLoginDto, SolicitarCodigoLoginResponseDto, VerificarCodigoLoginDto,
  TicketMantenimiento, CrearTicketMantenimientoDto, ActualizarTicketMantenimientoDto,
} from '../types'
import useAuthStore from '../stores/authStore'

// ── Instancia Axios ───────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
})

// ── Interceptor request: adjunta JWT ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Interceptor response: manejo centralizado de errores ──────────────
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ServiceResponse<unknown>>) => {
    // Solicitud cancelada — no tratar como error
    if (axios.isCancel(err)) return Promise.reject(err)

    const status = err.response?.status

    if (status === 401) {
      useAuthStore.getState().logout?.()
      localStorage.removeItem('auth')
      window.location.href = '/login'
      return Promise.reject(err)
    }

    if (status === 429) {
      err.message = 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.'
      return Promise.reject(err)
    }

    // Extraer mensaje de error de la API si está disponible
    const apiMessage = err.response?.data?.message
    if (apiMessage) {
      err.message = apiMessage
    }

    return Promise.reject(err)
  }
)

// ── Helper: extraer mensaje de error legible ──────────────────────────
export function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(err)) {
    if (axios.isCancel(err)) return 'Solicitud cancelada'
    return err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

// ── Helper: crear token de cancelación ───────────────────────────────
export function crearCancelToken(): CancelTokenSource {
  return axios.CancelToken.source()
}

// ── Auth ──────────────────────────────────────────────────────────────
const auth = {
  login: (dto: LoginDto) =>
    api.post<ServiceResponse<{ token: string; usuario: Usuario }>>('/auth/login', dto),
  solicitarCodigo: (dto: SolicitarCodigoLoginDto) =>
    api.post<ServiceResponse<SolicitarCodigoLoginResponseDto>>('/auth/solicitar-codigo', dto),
  verificarCodigo: (dto: VerificarCodigoLoginDto) =>
    api.post<ServiceResponse<{ token: string; usuario: Usuario }>>('/auth/verificar-codigo', dto),
}

// ── Usuarios ──────────────────────────────────────────────────────────
const usuarios = {
  listar: (page = 1, pageSize = 50, cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Usuario[]>>('/usuarios', {
      params: { page, pageSize },
      cancelToken: cancelToken?.token,
    }),
  obtener: (id: string, cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Usuario>>(`/usuarios/${id}`, {
      cancelToken: cancelToken?.token,
    }),
  crear: (dto: CrearUsuarioDto) =>
    api.post<ServiceResponse<Usuario>>('/usuarios', dto),
  actualizar: (id: string, dto: ActualizarUsuarioDto) =>
    api.put<ServiceResponse<Usuario>>(`/usuarios/${id}`, dto),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/usuarios/${id}`),
  listarAlumnos: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Usuario[]>>('/usuarios/alumnos', {
      cancelToken: cancelToken?.token,
    }),
}

// ── Edificios ─────────────────────────────────────────────────────────
const edificios = {
  listar: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Edificio[]>>('/edificios', {
      cancelToken: cancelToken?.token,
    }),
  obtener: (id: string) =>
    api.get<ServiceResponse<Edificio>>(`/edificios/${id}`),
}

// ── Pisos ─────────────────────────────────────────────────────────────
const pisos = {
  listarPorEdificio: (edificioId: string, cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Piso[]>>(`/pisos/edificio/${edificioId}`, {
      cancelToken: cancelToken?.token,
    }),
}

// ── Lockers ───────────────────────────────────────────────────────────
const lockers = {
  listar: (params?: { page?: number; pageSize?: number }, cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Locker[]>>('/lockers', {
      params,
      cancelToken: cancelToken?.token,
    }),
  disponibles: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Locker[]>>('/lockers/disponibles', {
      cancelToken: cancelToken?.token,
    }),
  obtener: (id: string) =>
    api.get<ServiceResponse<Locker>>(`/lockers/${id}`),
  mapa: (edificioId: string, cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<LockerMapaPiso[]>>(`/lockers/mapa/${edificioId}`, {
      cancelToken: cancelToken?.token,
    }),
  historial: (id: string, cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<AccesoLog[]>>(`/lockers/${id}/historial`, {
      cancelToken: cancelToken?.token,
    }),
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
  listar: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Asignacion[]>>('/asignaciones', {
      cancelToken: cancelToken?.token,
    }),
  obtener: (id: string) =>
    api.get<ServiceResponse<Asignacion>>(`/asignaciones/${id}`),
  miLocker: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Asignacion>>('/asignaciones/mi-locker', {
      cancelToken: cancelToken?.token,
    }),
  crear: (dto: CrearAsignacionDto) =>
    api.post<ServiceResponse<Asignacion>>('/asignaciones', dto),
  liberar: (id: string) =>
    api.post<ServiceResponse<boolean>>(`/asignaciones/${id}/liberar`),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/asignaciones/${id}`),
}

// ── Tarjetas RFID ─────────────────────────────────────────────────────
const tarjetas = {
  listar: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<TarjetaRfid[]>>('/tarjetas', {
      cancelToken: cancelToken?.token,
    }),
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
  listar: (
    filtros?: {
      lockerId?: string
      alumnoId?: string
      edificioId?: string
      resultado?: string
      metodo?: string
      desde?: string
      hasta?: string
      page?: number
      pageSize?: number
    },
    cancelToken?: CancelTokenSource
  ) =>
    api.get<ServiceResponse<AccesoLog[]>>('/accesos', {
      params: filtros,
      cancelToken: cancelToken?.token,
    }),
  recientes: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<AccesoLog[]>>('/accesos/recientes', {
      cancelToken: cancelToken?.token,
    }),
  fallidos: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<AccesoLog[]>>('/accesos/fallidos', {
      cancelToken: cancelToken?.token,
    }),
}

// ── Dispositivos ──────────────────────────────────────────────────────
const dispositivos = {
  listar: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Dispositivo[]>>('/dispositivos', {
      cancelToken: cancelToken?.token,
    }),
  registrar: (lockerId: string) =>
    api.post<ServiceResponse<{ deviceKey: string }>>('/dispositivos/registrar', { lockerId }),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/dispositivos/${id}`),
}

// ── Avisos ────────────────────────────────────────────────────────────
const avisos = {
  listar: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Aviso[]>>('/avisos', {
      cancelToken: cancelToken?.token,
    }),
  misAvisos: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<Aviso[]>>('/avisos/mis-avisos', {
      cancelToken: cancelToken?.token,
    }),
  crear: (dto: CrearAvisoDto) =>
    api.post<ServiceResponse<Aviso>>('/avisos', dto),
  marcarCumplido: (id: string) =>
    api.patch<ServiceResponse<boolean>>(`/avisos/${id}/cumplido`),
}

// ── Tickets Mantenimiento ─────────────────────────────────────────────
const tickets = {
  listar: (cancelToken?: CancelTokenSource) =>
    api.get<ServiceResponse<TicketMantenimiento[]>>('/tickets-mantenimiento', {
      cancelToken: cancelToken?.token,
    }),
  crear: (dto: CrearTicketMantenimientoDto) =>
    api.post<ServiceResponse<TicketMantenimiento>>('/tickets-mantenimiento', dto),
  actualizar: (id: string, dto: ActualizarTicketMantenimientoDto) =>
    api.put<ServiceResponse<TicketMantenimiento>>(`/tickets-mantenimiento/${id}`, dto),
  eliminar: (id: string) =>
    api.delete<ServiceResponse<boolean>>(`/tickets-mantenimiento/${id}`),
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
  stats: async (cancelToken?: CancelTokenSource) => {
    const [lockersRes, accesosFallidosRes] = await Promise.all([
      lockers.listar({ pageSize: 500 }, cancelToken),
      accesos.fallidos(cancelToken),
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
  tickets,
  dashboard,
}
