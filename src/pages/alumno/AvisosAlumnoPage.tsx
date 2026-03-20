import { useEffect, useState } from 'react'
import { Card, Tag, Empty, Spin, Alert } from 'antd'
import { BellOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { Aviso } from '../../types'

const AvisosAlumnoPage = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.avisos.misAvisos()
        setAvisos(res.data.data ?? [])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  if (cargando) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />

  const pendientes = avisos.filter(a => a.estado === 'Pendiente')
  const cumplidos = avisos.filter(a => a.estado === 'Cumplido')

  return (
    <div style={{ maxWidth: 700 }}>
      {pendientes.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={`Tienes ${pendientes.length} aviso${pendientes.length > 1 ? 's' : ''} pendiente${pendientes.length > 1 ? 's' : ''}`}
          description="Por favor atiende los avisos antes de la fecha límite."
          style={{ marginBottom: 16 }}
        />
      )}

      {avisos.length === 0 ? (
        <Empty description="No tienes avisos" />
      ) : (
        <>
          {pendientes.map(aviso => {
            const vencido = dayjs(aviso.fechaLimite).isBefore(dayjs())
            return (
              <Card
                key={aviso.id}
                style={{ marginBottom: 12, borderLeft: `4px solid ${vencido ? '#c0392b' : '#e67e22'}` }}
                size="small"
                title={
                  <span>
                    <BellOutlined style={{ marginRight: 8, color: vencido ? '#c0392b' : '#e67e22' }} />
                    Aviso de desocupación
                    <Tag color={vencido ? 'red' : 'orange'} style={{ marginLeft: 8 }}>Pendiente</Tag>
                  </span>
                }
              >
                <p><strong>Locker:</strong> Edificio {aviso.edificioNombre} · {aviso.pisoDescripcion ?? ''} · #{aviso.lockerNumero} ({aviso.lockerNumeroSerie})</p>
                <p><strong>Fecha límite:</strong>{' '}
                  <span style={{ color: vencido ? '#c0392b' : '#e67e22', fontWeight: 'bold' }}>
                    {dayjs(aviso.fechaLimite).format('DD/MM/YYYY')}
                    {vencido && ' — VENCIDO'}
                  </span>
                </p>
                <p><strong>Mensaje:</strong> {aviso.mensaje}</p>
              </Card>
            )
          })}

          {cumplidos.length > 0 && (
            <>
              <p style={{ color: '#888', marginTop: 24, marginBottom: 8 }}>Avisos anteriores</p>
              {cumplidos.map(aviso => (
                <Card
                  key={aviso.id}
                  style={{ marginBottom: 12, opacity: 0.6 }}
                  size="small"
                  title={
                    <span>
                      <BellOutlined style={{ marginRight: 8 }} />
                      Aviso de desocupación
                      <Tag color="green" style={{ marginLeft: 8 }}>Cumplido</Tag>
                    </span>
                  }
                >
                  <p><strong>Locker:</strong> Edificio {aviso.edificioNombre} · #{aviso.lockerNumero}</p>
                  <p><strong>Fecha límite:</strong> {dayjs(aviso.fechaLimite).format('DD/MM/YYYY')}</p>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default AvisosAlumnoPage
