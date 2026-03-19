import { useEffect, useState, useCallback } from 'react'
import { Row, Col, List, Tag, Spin, Modal, Select, Popconfirm, message, Tabs } from 'antd'
import {
  CheckCircleOutlined, CloseCircleOutlined,
  LockOutlined, UnlockOutlined, ToolOutlined, DashboardOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../services/api'
import LockerGrid from '../../components/LockerGrid/LockerGrid'
import type { DashboardStats, AccesoLog, Edificio, LockerMapaItem, Locker } from '../../types'
import './DashboardPage.css'

const { Option } = Select
const { TabPane } = Tabs

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
        (a: any) => a.lockerId === detalleLocker.id && a.activa
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

  if (cargando && !stats) {
    return (
      <div className="dash-loading">
        <Spin size="large" />
      </div>
    )
  }

  const ocupacion = stats?.porcentajeOcupacion ?? 0

  return (
    <div className="dash-wrapper">

      {/* ── Page header ── */}
      <div className="dash-page-header">
        <div className="dash-page-header-left">
          <DashboardOutlined className="dash-page-icon" />
          <div>
            <h1 className="dash-page-title">Dashboard</h1>
            <p className="dash-page-subtitle">Resumen general del sistema de lockers UTEQ</p>
          </div>
        </div>
        <div className="dash-last-update">
          Actualización automática cada 15 s
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-stats-grid">

        <div className="dash-stat-card dash-stat-dark">
          <div className="dash-stat-icon-wrap"><LockOutlined /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Total Lockers</span>
            <span className="dash-stat-value">{stats?.totalLockers ?? 0}</span>
          </div>
          <div className="dash-stat-badge">UTEQ</div>
        </div>

        <div className="dash-stat-card dash-stat-available">
          <div className="dash-stat-icon-wrap"><UnlockOutlined /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Disponibles</span>
            <span className="dash-stat-value">{stats?.disponibles ?? 0}</span>
            <span className="dash-stat-sub">de {stats?.totalLockers ?? 0} lockers</span>
          </div>
          <div className="dash-stat-ring">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(122,174,224,0.2)" strokeWidth="3"/>
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="#7aaee0" strokeWidth="3"
                strokeDasharray={`${Math.round((1 - ocupacion / 100) * 94)} 94`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
          </div>
        </div>

        <div className="dash-stat-card dash-stat-assigned">
          <div className="dash-stat-icon-wrap"><LockOutlined /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Asignados</span>
            <span className="dash-stat-value">{stats?.asignados ?? 0}</span>
            <span className="dash-stat-sub">{ocupacion}% ocupación</span>
          </div>
          <div className="dash-stat-bar-wrap">
            <div className="dash-stat-bar" style={{ width: `${ocupacion}%` }} />
          </div>
        </div>

        <div className="dash-stat-card dash-stat-maintenance">
          <div className="dash-stat-icon-wrap"><ToolOutlined /></div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">Mantenimiento</span>
            <span className="dash-stat-value">{stats?.mantenimiento ?? 0}</span>
            <span className="dash-stat-sub">fuera de servicio</span>
          </div>
        </div>

      </div>

      {/* ── Alerta de fallidos ── */}
      {fallidos.length > 0 && (
        <div className="dash-alert">
          <WarningOutlined className="dash-alert-icon" />
          <span>
            <strong>{fallidos.length}</strong> accesos fallidos detectados en las últimas 24 horas
          </span>
        </div>
      )}

      {/* ── Main content: usa flex en lugar de Row/Col de Ant ── */}
      <div className="dash-main-row">

        {/* Mapa de lockers — crece para llenar espacio */}
        <div className="dash-col-mapa">
          <div className="dash-card dash-card-full">
            <div className="dash-card-header">
              <span className="dash-card-title">Mapa de Lockers</span>
              <span className="dash-card-live">
                <span className="dash-live-dot" />
                En vivo
              </span>
            </div>
            <div className="dash-card-body">
              <Tabs className="dash-tabs">
                <TabPane tab="Edificio H" key="H">
                  <LockerGrid pisos={mapaH} onLockerClick={abrirModalLocker} />
                </TabPane>
                <TabPane tab="Edificio K" key="K">
                  <LockerGrid pisos={mapaK} onLockerClick={abrirModalLocker} />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Accesos recientes — ancho fijo */}
        <div className="dash-col-accesos">
          <div className="dash-card dash-card-full">
            <div className="dash-card-header">
              <span className="dash-card-title">Accesos Recientes</span>
              <Tag className="dash-recent-count">{recientes.length}</Tag>
            </div>
            <div className="dash-card-body dash-card-scroll">
              {recientes.length === 0 ? (
                <div className="dash-empty">
                  <LockOutlined className="dash-empty-icon" />
                  <span>Sin accesos recientes</span>
                </div>
              ) : (
                <List
                  size="small"
                  dataSource={recientes.slice(0, 12)}
                  renderItem={(a) => (
                    <List.Item className="dash-acceso-item">
                      <div className="dash-acceso-icon-col">
                        {a.resultado === 'Exitoso'
                          ? <CheckCircleOutlined className="dash-acceso-ok" />
                          : <CloseCircleOutlined className="dash-acceso-fail" />
                        }
                      </div>
                      <div className="dash-acceso-info">
                        <span className="dash-acceso-loc">
                          Edificio {a.edificioNombre} · #{a.lockerNumero}
                        </span>
                        <span className="dash-acceso-name">
                          {a.estudianteNombre ?? '—'}
                        </span>
                      </div>
                      <div className="dash-acceso-right">
                        <span className="dash-acceso-time">
                          {dayjs(a.timestamp).format('HH:mm')}
                        </span>
                        <Tag
                          className="dash-acceso-method"
                          color={a.metodo === 'RFID' ? 'blue' : 'purple'}
                        >
                          {a.metodo}
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Modal detalle locker ── */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        className="dash-locker-modal"
        width={400}
      >
        {detalleLocker ? (
          <div className="dash-modal-body">
            <div className="dash-modal-header">
              <div className="dash-modal-locker-icon"><LockOutlined /></div>
              <div>
                <h3 className="dash-modal-title">Locker #{lockerSeleccionado?.numero}</h3>
                <span className="dash-modal-serie">{lockerSeleccionado?.numeroSerie}</span>
              </div>
            </div>
            <div className="dash-modal-fields">
              <div className="dash-modal-field">
                <span className="dash-modal-field-label">Estado</span>
                <span className={`dash-modal-estado dash-estado-${detalleLocker.estado?.toLowerCase()}`}>
                  {detalleLocker.estado}
                </span>
              </div>
              <div className="dash-modal-field">
                <span className="dash-modal-field-label">Asignado a</span>
                <span className="dash-modal-field-value">{detalleLocker.asignadoA ?? 'Sin asignar'}</span>
              </div>
              <div className="dash-modal-field">
                <span className="dash-modal-field-label">Dispositivo</span>
                <span className="dash-modal-field-value">{detalleLocker.dispositivoEstado ?? 'Sin dispositivo'}</span>
              </div>
            </div>
            <div className="dash-modal-actions">
              <Select placeholder="Cambiar estado" style={{ flex: 1 }} onChange={cambiarEstado}>
                <Option value="Disponible">Disponible</Option>
                <Option value="Mantenimiento">Mantenimiento</Option>
              </Select>
              {detalleLocker.asignadoA && (
                <Popconfirm title="¿Liberar este locker?" onConfirm={liberarLocker} okText="Sí" cancelText="No">
                  <button className="dash-modal-liberar">Liberar</button>
                </Popconfirm>
              )}
            </div>
          </div>
        ) : (
          <div className="dash-loading"><Spin /></div>
        )}
      </Modal>

    </div>
  )
}

export default DashboardPage