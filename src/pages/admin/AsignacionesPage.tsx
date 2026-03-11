import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Select, DatePicker, message,
  Space, Popconfirm, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { Asignacion, Locker, Usuario } from '../../types'

const { Option } = Select

const AsignacionesPage = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [alumnos, setAlumnos] = useState<Usuario[]>([])
  const [lockersDisp, setLockersDisp] = useState<Locker[]>([])
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [asigRes, alumnosRes, lockRes] = await Promise.all([
        api.asignaciones.listar(),
        api.usuarios.listarAlumnos(),
        api.lockers.listar({ pageSize: 200 }),
      ])
      setAsignaciones(asigRes.data.data ?? [])
      setAlumnos(alumnosRes.data.data ?? [])
      setLockersDisp((lockRes.data.data ?? []).filter((l: Locker) => l.estado === 'Disponible'))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = async (values: {
    lockerId: string; estudianteId: string;
    fechaInicio: dayjs.Dayjs; fechaFin?: dayjs.Dayjs
  }) => {
    try {
      await api.asignaciones.crear({
        lockerId: values.lockerId,
        estudianteId: values.estudianteId,
        fechaInicio: values.fechaInicio.toISOString(),
        fechaFin: values.fechaFin?.toISOString(),
      })
      message.success('Asignación creada y email enviado al alumno')
      setModal(false)
      form.resetFields()
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0] ?? 'Error al crear asignación'
      message.error(msg)
    }
  }

  const liberar = async (id: string) => {
    try {
      await api.asignaciones.liberar(id)
      message.success('Locker liberado')
      cargar()
    } catch { message.error('Error al liberar') }
  }

  const eliminar = async (id: string) => {
    try {
      await api.asignaciones.eliminar(id)
      message.success('Asignación eliminada')
      cargar()
    } catch { message.error('Error') }
  }

  const columnas: ColumnsType<Asignacion> = [
    {
      title: 'Locker', key: 'locker',
      render: (_, r) => `Edif. ${r.edificioNombre} · Piso ${r.pisoNumero} · #${r.lockerNumero}`,
    },
    {
      title: 'Alumno', key: 'alumno',
      render: (_, r) => `${r.estudianteNombre} (${r.estudianteMatricula})`,
    },
    {
      title: 'Fecha Inicio', dataIndex: 'fechaInicio', key: 'inicio',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Fecha Fin', dataIndex: 'fechaFin', key: 'fin',
      render: (v?: string) => v ? dayjs(v).format('DD/MM/YYYY') : 'Sin límite',
    },
    {
      title: 'Estado', dataIndex: 'activa', key: 'estado',
      render: (v: boolean) => v ? <Tag color="green">Activa</Tag> : <Tag>Inactiva</Tag>,
    },
    {
      title: 'Acciones', key: 'acciones',
      render: (_, r) => (
        <Space size="small">
          {r.activa && (
            <Popconfirm title="¿Liberar este locker?" onConfirm={() => liberar(r.id)} okText="Sí">
              <Button size="small" danger>Liberar</Button>
            </Popconfirm>
          )}
          <Popconfirm title="¿Eliminar?" onConfirm={() => eliminar(r.id)} okText="Sí">
            <Button size="small">Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}
        onClick={() => setModal(true)} style={{ marginBottom: 16 }}>
        Nueva Asignación
      </Button>

      <Table
        columns={columnas} dataSource={asignaciones}
        rowKey="id" loading={cargando} size="small"
        pagination={{ pageSize: 20 }}
      />

      <Modal title="Nueva Asignación" open={modal}
        onCancel={() => setModal(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={crear}>
          <Form.Item name="estudianteId" label="Alumno" rules={[{ required: true }]}>
            <Select showSearch placeholder="Buscar alumno"
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }>
              {alumnos.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.nombre} {a.apellido} — {a.matricula}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="lockerId" label="Locker disponible" rules={[{ required: true }]}>
            <Select showSearch placeholder="Seleccionar locker"
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }>
              {lockersDisp.map((l) => (
                <Option key={l.id} value={l.id}>
                  {l.numeroSerie} — Edif. {l.edificioNombre} Piso {l.pisoNumero}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fechaInicio" label="Fecha Inicio"
            initialValue={dayjs()} rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="fechaFin" label="Fecha Fin (opcional)">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Crear Asignación</Button>
        </Form>
      </Modal>
    </div>
  )
}

export default AsignacionesPage
