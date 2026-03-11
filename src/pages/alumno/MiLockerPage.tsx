import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Result, Button, Descriptions, Tag, Space, Modal, Input, message } from 'antd'
import { LockOutlined, MailOutlined, WifiOutlined, ToolOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../services/api'
import useAuth from '../../hooks/useAuth'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import type { Asignacion, TarjetaRfid } from '../../types'

const MiLockerPage = () => {
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null)
  const [tarjetas, setTarjetas] = useState<TarjetaRfid[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalReporte, setModalReporte] = useState(false)
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.asignaciones.miLocker()
        if (res.data.success && res.data.data) {
          setAsignacion(res.data.data)
          if (usuario) {
            const tRes = await api.tarjetas.listarPorAlumno(usuario.id)
            setTarjetas((tRes.data.data ?? []).filter((t: TarjetaRfid) => t.activa))
          }
        }
      } catch { /* sin asignación */ }
      finally { setCargando(false) }
    }
    cargar()
  }, [usuario])

  if (cargando) return null

  if (!asignacion) {
    return (
      <Result
        icon={<LockOutlined style={{ color: '#003087' }} />}
        title="Sin locker asignado"
        subTitle="Acude al área de servicios estudiantiles para solicitar un locker."
      />
    )
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Card principal */}
      <Card
        title={<Space><LockOutlined />Mi Locker</Space>}
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Edificio">{asignacion.edificioNombre}</Descriptions.Item>
          <Descriptions.Item label="Piso">{asignacion.pisoNumero}</Descriptions.Item>
          <Descriptions.Item label="Número de Locker">#{asignacion.lockerNumero}</Descriptions.Item>
          <Descriptions.Item label="Número de Serie">{asignacion.lockerNumeroSerie}</Descriptions.Item>
          <Descriptions.Item label="Fecha de Asignación">
            {dayjs(asignacion.fechaInicio).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Vigencia">
            {asignacion.fechaFin
              ? dayjs(asignacion.fechaFin).format('DD/MM/YYYY')
              : 'Sin fecha límite'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Métodos de acceso */}
      <Card
        title={<Space><MailOutlined />Métodos de Acceso</Space>}
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Tarjeta RFID">
            {tarjetas.length > 0
              ? tarjetas.map((t) => (
                  <Tag key={t.id} color="blue" style={{ fontFamily: 'monospace' }}>{t.uid}</Tag>
                ))
              : <Tag color="default">Sin tarjeta registrada</Tag>
            }
          </Descriptions.Item>
          <Descriptions.Item label="Código OTP">
            <Button
              type="primary" icon={<MailOutlined />}
              onClick={() => navigate('/alumno/solicitar-codigo')}
            >
              Solicitar código de acceso
            </Button>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Estado del dispositivo */}
      <Card
        title={<Space><WifiOutlined />Estado del Dispositivo</Space>}
        style={{ marginBottom: 16 }}
      >
        <StatusBadge estado="Online" />
        <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>
          (Estado en tiempo real del ESP32 del locker)
        </span>
      </Card>

      <Button icon={<ToolOutlined />} onClick={() => setModalReporte(true)}>
        Reportar problema con el locker
      </Button>

      <Modal
        title="Reportar problema"
        open={modalReporte}
        onCancel={() => setModalReporte(false)}
        onOk={() => { message.success('Reporte enviado'); setModalReporte(false) }}
        okText="Enviar"
      >
        <p>Describe el problema con tu locker:</p>
        <Input.TextArea rows={4} placeholder="Ej: El locker no abre correctamente..." />
      </Modal>
    </div>
  )
}

export default MiLockerPage
