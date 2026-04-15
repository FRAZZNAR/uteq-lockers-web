import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Alert, Spin, Typography, Space } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import api from '../../services/api'
import type { Asignacion } from '../../types'

const { Title, Text } = Typography

const OTP_DURACION_SEG = 300 // 5 minutos

const SolicitarCodigoPage = () => {
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [solicitando, setSolicitando] = useState(false)
  const [codigoEnviado, setCodigoEnviado] = useState(false)
  const [segundosRestantes, setSegundosRestantes] = useState(0)
  const [emailDestino, setEmailDestino] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.asignaciones.miLocker()
        if (res.data.success && res.data.data) {
          setAsignacion(res.data.data)
          // Ocultar parcialmente el email: r***@uteq.edu.mx
          const email = res.data.data.estudianteEmail
          const [local, dominio] = email.split('@')
          const oculto = local[0] + '***@' + dominio
          setEmailDestino(oculto)
        } else {
          navigate('/alumno/mi-locker')
        }
      } catch {
        navigate('/alumno/mi-locker')
      } finally {
        setCargando(false)
      }
    }
    cargar()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [navigate])

  const iniciarCountdown = useCallback(() => {
    setSegundosRestantes(OTP_DURACION_SEG)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const solicitarCodigo = async () => {
    if (!asignacion) return
    setSolicitando(true)
    try {
      await api.codigos.generar({ asignacionId: asignacion.id })
      setCodigoEnviado(true)
      iniciarCountdown()
    } catch {
      // El mensaje de error real no debe revelar información del código
    } finally {
      setSolicitando(false)
    }
  }

  const formatTime = (seg: number) => {
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (cargando) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />

  return (
    <div style={{ maxWidth: 500 }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ textAlign: 'center' }}>
            <LockOutlined style={{ fontSize: 48, color: '#003087' }} />
            <Title level={3} style={{ margin: '12px 0 4px' }}>Código de Acceso</Title>
            <Text type="secondary">
              Edificio {asignacion?.edificioNombre} — {asignacion?.pisoDescripcion ?? `Piso ${asignacion?.pisoNumero}`} —
              Locker #{asignacion?.lockerNumero}
            </Text>
          </div>

          {!codigoEnviado ? (
            <Button
              type="primary" size="large" block
              icon={<MailOutlined />}
              loading={solicitando}
              onClick={solicitarCodigo}
              style={{ background: '#003087', height: 50, fontSize: 16 }}
            >
              {solicitando ? 'Generando código...' : 'Solicitar código de acceso'}
            </Button>
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Alert
                type="success"
                showIcon
                message="¡Código enviado a tu correo!"
                description={
                  <div>
                    <p>Se envió a: <strong>{emailDestino}</strong></p>
                    <p>El código es de <strong>un solo uso</strong>. Ingrésalo en el teclado del locker físico.</p>
                  </div>
                }
              />

              {/* Countdown visual */}
              <div style={{
                textAlign: 'center', padding: 24,
                background: segundosRestantes > 60 ? '#f6ffed' : '#fff1f0',
                border: `1px solid ${segundosRestantes > 60 ? '#b7eb8f' : '#ffa39e'}`,
                borderRadius: 8
              }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', fontFamily: 'monospace',
                  color: segundosRestantes > 60 ? '#52c41a' : '#ff4d4f' }}>
                  {formatTime(segundosRestantes)}
                </div>
                <Text type="secondary">
                  {segundosRestantes > 0 ? 'El código expira en' : '⚠️ El código ha expirado'}
                </Text>
              </div>

              <Button
                block
                disabled={segundosRestantes > 0}
                onClick={() => { setCodigoEnviado(false); setSegundosRestantes(0) }}
              >
                {segundosRestantes > 0
                  ? `Nuevo código disponible en ${formatTime(segundosRestantes)}`
                  : 'Solicitar nuevo código'}
              </Button>

              {/* NUNCA mostrar el código en pantalla */}
            </Space>
          )}
        </Space>
      </Card>
    </div>
  )
}

export default SolicitarCodigoPage
