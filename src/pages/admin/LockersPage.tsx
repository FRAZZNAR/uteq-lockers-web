import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Tabs, Space, Select, Input, Tag, Modal, Form,
  message, Popconfirm, Card, Alert } from 'antd'
import { PlusOutlined, WifiOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import api from '../../services/api'
import LockerGrid from '../../components/LockerGrid/LockerGrid'
import StatusBadge from '../../components/StatusBadge/StatusBadge'
import type { Locker, Piso, Edificio, LockerMapaItem } from '../../types'

const { TabPane } = Tabs
const { Option } = Select

const LockersPage = () => {
  const [lockers, setLockers] = useState<Locker[]>([])
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [pisos, setPisos] = useState<Piso[]>([])
  const [mapaH, setMapaH] = useState<{ pisoNumero: number; lockers: LockerMapaItem[] }[]>([])
  const [mapaK, setMapaK] = useState<{ pisoNumero: number; lockers: LockerMapaItem[] }[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalDispositivo, setModalDispositivo] = useState(false)
  const [deviceKey, setDeviceKey] = useState('')
  const [formNuevo] = Form.useForm()
  const [formDisp] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [lockRes, edifRes] = await Promise.all([
        api.lockers.listar({ pageSize: 200 }),
        api.edificios.listar(),
      ])
      const ls = lockRes.data.data ?? []
      const edifs = edifRes.data.data ?? []
      setLockers(ls)
      setEdificios(edifs)

      const pisosAll: Piso[] = []
      for (const e of edifs) {
        const r = await api.pisos.listarPorEdificio(e.id)
        pisosAll.push(...(r.data.data ?? []))
      }
      setPisos(pisosAll)

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
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crearLocker = async (values: { pisoId: string; numero: number; numeroSerie: string }) => {
    try {
      await api.lockers.crear(values)
      message.success('Locker creado')
      setModalNuevo(false)
      formNuevo.resetFields()
      cargar()
    } catch {
      message.error('Error al crear locker')
    }
  }

  const registrarDispositivo = async (values: { lockerId: string }) => {
    try {
      const res = await api.dispositivos.registrar(values.lockerId)
      setDeviceKey(res.data.data?.deviceKey ?? '')
      formDisp.resetFields()
    } catch {
      message.error('Error al registrar dispositivo')
    }
  }

  const eliminar = async (id: string) => {
    try {
      await api.lockers.eliminar(id)
      message.success('Locker eliminado')
      cargar()
    } catch {
      message.error('Error al eliminar')
    }
  }

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      await api.lockers.cambiarEstado(id, estado)
      message.success('Estado actualizado')
      cargar()
    } catch {
      message.error('Error al cambiar estado')
    }
  }

  const columnas: ColumnsType<Locker> = [
    { title: 'N°', dataIndex: 'numero', key: 'numero', width: 60 },
    { title: 'Serie', dataIndex: 'numeroSerie', key: 'serie' },
    { title: 'Edificio', dataIndex: 'edificioNombre', key: 'edificio', width: 80 },
    { title: 'Piso', dataIndex: 'pisoNumero', key: 'piso', width: 60,
      render: (v: number) => `Piso ${v}` },
    { title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: (v: string) => <StatusBadge estado={v} /> },
    { title: 'Dispositivo', key: 'dispositivo',
      render: (_, r) => r.tieneDispositivo
        ? <Tag color={r.dispositivoEstado === 'Online' ? 'green' : 'default'} icon={<WifiOutlined />}>
            {r.dispositivoEstado}
          </Tag>
        : <Tag>Sin dispositivo</Tag>
    },
    { title: 'Asignado a', dataIndex: 'asignadoA', key: 'asignado',
      render: (v?: string) => v ?? '—' },
    {
      title: 'Acciones', key: 'acciones',
      render: (_, r) => (
        <Space size="small">
          <Select
            size="small" value={r.estado} style={{ width: 130 }}
            onChange={(v) => cambiarEstado(r.id, v)}
          >
            <Option value="Disponible">Disponible</Option>
            <Option value="Mantenimiento">Mantenimiento</Option>
          </Select>
          <Popconfirm title="¿Eliminar?" onConfirm={() => eliminar(r.id)} okText="Sí">
            <Button size="small" danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const lockersH = lockers.filter((l) => l.edificioNombre === 'H')
  const lockersK = lockers.filter((l) => l.edificioNombre === 'K')

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalNuevo(true)}>
          Nuevo Locker
        </Button>
        <Button icon={<WifiOutlined />} onClick={() => setModalDispositivo(true)}>
          Registrar Dispositivo IoT
        </Button>
      </Space>

      <Tabs>
        <TabPane tab="Edificio H" key="H">
          <Card title="Mapa visual" style={{ marginBottom: 16 }}>
            <LockerGrid pisos={mapaH} />
          </Card>
          <Table
            columns={columnas} dataSource={lockersH}
            rowKey="id" loading={cargando} size="small"
            pagination={{ pageSize: 20 }}
          />
        </TabPane>
        <TabPane tab="Edificio K" key="K">
          <Card title="Mapa visual" style={{ marginBottom: 16 }}>
            <LockerGrid pisos={mapaK} />
          </Card>
          <Table
            columns={columnas} dataSource={lockersK}
            rowKey="id" loading={cargando} size="small"
            pagination={{ pageSize: 20 }}
          />
        </TabPane>
      </Tabs>

      {/* Modal Nuevo Locker */}
      <Modal title="Nuevo Locker" open={modalNuevo}
        onCancel={() => setModalNuevo(false)} footer={null}>
        <Form form={formNuevo} layout="vertical" onFinish={crearLocker}>
          <Form.Item name="pisoId" label="Piso" rules={[{ required: true }]}>
            <Select placeholder="Seleccionar piso">
              {pisos.map((p) => (
                <Option key={p.id} value={p.id}>
                  Edificio {p.edificioNombre} — Piso {p.numero}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="numero" label="Número" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="numeroSerie" label="Número de Serie" rules={[{ required: true }]}>
            <Input placeholder="EDI-H-P1-L01" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Crear</Button>
        </Form>
      </Modal>

      {/* Modal Registrar Dispositivo */}
      <Modal title="Registrar Dispositivo IoT"
        open={modalDispositivo}
        onCancel={() => { setModalDispositivo(false); setDeviceKey(''); formDisp.resetFields() }}
        footer={null}>
        {!deviceKey ? (
          <Form form={formDisp} layout="vertical" onFinish={registrarDispositivo}>
            <Form.Item name="lockerId" label="Locker" rules={[{ required: true }]}>
              <Select placeholder="Seleccionar locker" showSearch>
                {lockers.map((l) => (
                  <Option key={l.id} value={l.id}>
                    {l.numeroSerie} (Edificio {l.edificioNombre} · Piso {l.pisoNumero})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit" block>Generar Device Key</Button>
          </Form>
        ) : (
          <Alert
            type="warning"
            message="¡Copia esta clave ahora! No se mostrará de nuevo."
            description={
              <div>
                <strong>Device Key:</strong>
                <Input value={deviceKey} readOnly style={{ marginTop: 8, fontFamily: 'monospace' }} />
              </div>
            }
            showIcon
          />
        )}
      </Modal>
    </div>
  )
}

export default LockersPage
