import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import useAuthStore from '../stores/authStore'
import type { Aviso, Asignacion } from '../types'

const SIGNALR_URL = '/hubs/notifications'

interface SignalRHandlers {
  onNuevoAviso?: (aviso: Aviso) => void
  onNuevaAsignacion?: (asignacion: Asignacion) => void
}

export const useSignalR = ({ onNuevoAviso, onNuevaAsignacion }: SignalRHandlers = {}) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const { usuario, token } = useAuthStore()

  useEffect(() => {
    if (!usuario || !token) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    if (onNuevoAviso) {
      connection.on('NuevoAviso', onNuevoAviso)
    }

    if (onNuevaAsignacion) {
      connection.on('NuevaAsignacion', onNuevaAsignacion)
    }

    const start = async () => {
      try {
        await connection.start()
        await connection.invoke('UnirseGrupo', usuario.id)
      } catch (err) {
        console.warn('SignalR: no se pudo conectar', err)
      }
    }

    start()
    connectionRef.current = connection

    return () => {
      connection.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id, token])

  return connectionRef.current
}

export default useSignalR
