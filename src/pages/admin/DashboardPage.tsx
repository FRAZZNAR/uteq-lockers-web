import { useEffect, useState, useCallback } from 'react'
import { Row, Col, Card, Statistic, Tabs, List, Tag, Spin, Alert, Modal,
  Select, Popconfirm, message } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../services/api'
import LockerGrid from '../../components/LockerGrid/LockerGrid'
import type { DashboardStats, AccesoLog, Edificio, LockerMapaItem, Locker } from '../../types'

const { TabPane } = Tabs
const { Option } = Select

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recientes, setRecientes] = useState<AccesoLog[]>([])
  const [fallidos, setFallidos] = useState<AccesoLog[]>([])
  const [_edificios, setEdificios] = useState<Edificio[]>([])
  const [mapaH, setMapaH] = useState<{ pisoNumero: number; lockers: LockerMapaItem[] }[]>([])
  const [mapaK, setMapaK] = useState<{ pisoNumero: number; lockers: LockerMapaItem[] }[]>([])
  const [cargando, setCargando] = useState(true)
  const [lockerSeleccionado, setLockerSeleccionado] = useState<LockerMapaItem | null>(null)
  const [detalleLocker, setDetalleLocker] = useState<Locker | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const cargarDatos = useCallback(async () => {
    try {
      const [statsData, recientesRes, fallidosRes, edificiosRes] = await Promise.all([
        api.dashboard.stats(),
        api.accesos.recientes(),
        api.accesos.fallidos(),
        api.edificios.listar(),
      ])
      setStats(statsData)
      setRecientes(recientesRes.data.data ?? [])
      setFallidos(fallidosRes.data.data ?? [])

      const edifs = edificiosRes.data.data ?? []
      setEdificios(edifs)

      // Cargar mapas de cada edificio
      const edificioH = edifs.find((e: Edificio) => e.nombre === 'H')
      const edificioK = edifs.find((e: Edificio) => e.nombre === 'K')
      if (edificioH) {
        const r = await api.lockers.mapa(edificioH.id)
        setMapaH(r.data.data ?? [])
      }
      if (edificioK) {
        const r = await api.lockers.mapa(edificioK.id)
        setMapaK(r.data.data ?? [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
    // Polling cada 15 segundos
    const interval = setInterval(cargarDatos, 15000)
    return () => clearInterval(interval)
  }, [cargarDatos])

  const abrirModalLocker = async (locker: LockerMapaItem) => {
    setLockerSeleccionado(locker)
    setModalVisible(true)
    try {
      const res = await api.lockers.obtener(locker.id)
      setDetalleLocker(res.data.data ?? null)
    } catch { /* no-op */ }
  }

  const cambiarEstado = async (estado: string) => {
    if (!lockerSeleccionado) return
    try {
      await api.lockers.cambiarEstado(lockerSeleccionado.id, estado)
      message.success('Estado actualizado')
      setModalVisible(false)
      cargarDatos()
    } catch {
      message.error('Error al cambiar estado')
    }
  }

  const liberarLocker = async () => {
    if (!detalleLocker?.asignadoAId) return
    try {
      const asigRes = await api.asignaciones.listar()
      const asig = (asigRes.data.data ?? []).find(
        (a) => a.lockerId === detalleLocker.id && a.activa
      )
      if (asig) {
        await api.asignaciones.liberar(asig.id)
        message.success('Locker liberado')
        setModalVisible(false)
        cargarDatos()
      }
    } catch {
      message.error('Error al liberar')
    }
  }

  if (cargando && !stats) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />

  return (
    <div>
      <h2 style={{ color: '#003087', marginTop: 0 }}>Dashboard</h2>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card><Statistic title="Total Lockers" value={stats?.totalLockers ?? 0} /></Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Disponibles" value={stats?.disponibles ?? 0}
              suffix={`/ ${stats?.totalLockers ?? 0}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Asignados" value={stats?.asignados ?? 0}
              suffix={`(${stats?.porcentajeOcupacion ?? 0}%)`}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Mantenimiento" value={stats?.mantenimiento ?? 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Mapas */}
        <Col xs={24} lg={14}>
          <Card title="Mapa de Lockers">
            <Tabs>
              <TabPane tab="Edificio H" key="H">
                <LockerGrid pisos={mapaH} onLockerClick={abrirModalLocker} />
              </TabPane>
              <TabPane tab="Edificio K" key="K">
                <LockerGrid pisos={mapaK} onLockerClick={abrirModalLocker} />
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Accesos recientes */}
        <Col xs={24} lg={10}>
          <Card title="Accesos Recientes" style={{ marginBottom: 16 }}>
            <List
              size="small"
              dataSource={recientes.slice(0, 10)}
              renderItem={(a) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      a.resultado === 'Exitoso'
                        ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                        : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                    }
                    title={`Edificio ${a.edificioNombre} — Locker #${a.lockerNumero}`}
                    description={`${a.estudianteNombre ?? '—'} · ${dayjs(a.timestamp).format('HH:mm')}`}
                  />
                  <Tag color={a.metodo === 'RFID' ? 'blue' : 'purple'}>{a.metodo}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Alertas */}
      {fallidos.length > 0 && (
        <Card title={`⚠️ Accesos Fallidos (últimas 24h): ${fallidos.length}`} style={{ marginTop: 16 }}>
          <Alert
            type="warning"
            message={`${fallidos.length} accesos fallidos detectados en las últimas 24 horas.`}
            showIcon
          />
        </Card>
      )}

      {/* Modal detalle locker */}
      <Modal
        title={`Locker #${lockerSeleccionado?.numero} — ${lockerSeleccionado?.numeroSerie}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {detalleLocker && (
          <div>
            <p><strong>Estado:</strong> {detalleLocker.estado}</p>
            <p><strong>Asignado a:</strong> {detalleLocker.asignadoA ?? 'Nadie'}</p>
            <p><strong>Dispositivo:</strong> {detalleLocker.dispositivoEstado ?? 'Sin dispositivo'}</p>
            <Row gutter={8} style={{ marginTop: 16 }}>
              <Col>
                <Select
                  placeholder="Cambiar estado"
                  style={{ width: 160 }}
                  onChange={cambiarEstado}
                >
                  <Option value="Disponible">Disponible</Option>
                  <Option value="Mantenimiento">Mantenimiento</Option>
                </Select>
              </Col>
              {detalleLocker.asignadoA && (
                <Col>
                  <Popconfirm
                    title="¿Liberar este locker?"
                    onConfirm={liberarLocker}
                    okText="Sí" cancelText="No"
                  >
                    <button style={{
                      background: '#ff4d4f', color: 'white', border: 'none',
                      borderRadius: 6, padding: '5px 16px', cursor: 'pointer'
                    }}>Liberar</button>
                  </Popconfirm>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DashboardPage
