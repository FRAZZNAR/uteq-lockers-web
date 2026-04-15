import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Select, Input, message,
  Tag, Space, Popconfirm } from 'antd'
import { ToolOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { TicketMantenimiento, Locker, TipoTicket, EstadoTicket } from '../../types'

const { Option } = Select
const { TextArea } = Input

const colorEstado: Record<EstadoTicket, string> = {
  Abierto: 'orange',
  EnProceso: 'blue',
  Cerrado: 'green',
}

const colorTipo: Record<TipoTicket, string> = {
  Alta: 'cyan',
  Baja: 'red',
  Cambio: 'purple',
}

const TicketsMantenimientoPage = () => {
  const [tickets, setTickets] = useState<TicketMantenimiento[]>([])
  const [lockers, setLockers] = useState<Locker[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoLockers, setCargandoLockers] = useState(false)
  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState<TicketMantenimiento | null>(null)
  const [formCrear] = Form.useForm()
  const [formEditar] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await api.tickets.listar()
      setTickets(res.data.data ?? [])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirModalCrear = async () => {
    setModalCrear(true)
    if (lockers.length > 0) return
    setCargandoLockers(true)
    try {
      const res = await api.lockers.listar({ pageSize: 500 })
      setLockers(res.data.data ?? [])
    } finally {
      setCargandoLockers(false)
    }
  }

  const crear = async (values: {
    lockerId: string; tipo: TipoTicket; descripcion: string; personalAsignado?: string
  }) => {
    try {
      await api.tickets.crear({
        lockerId: values.lockerId,
        tipo: values.tipo,
        descripcion: values.descripcion,
        personalAsignado: values.personalAsignado,
      })
      message.success('Ticket de mantenimiento creado')
      setModalCrear(false)
      formCrear.resetFields()
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0] ?? 'Error al crear ticket'
      message.error(msg)
    }
  }

  const actualizar = async (values: {
    estado?: EstadoTicket; personalAsignado?: string; descripcion?: string
  }) => {
    if (!modalEditar) return
    try {
      await api.tickets.actualizar(modalEditar.id, values)
      message.success('Ticket actualizado')
      setModalEditar(null)
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0] ?? 'Error al actualizar ticket'
      message.error(msg)
    }
  }

  const cerrar = async (id: string) => {
    try {
      await api.tickets.actualizar(id, { estado: 'Cerrado' })
      message.success('Ticket cerrado')
      cargar()
    } catch { message.error('Error al cerrar ticket') }
  }

  const eliminar = async (id: string) => {
    try {
      await api.tickets.eliminar(id)
      message.success('Ticket eliminado')
      cargar()
    } catch { message.error('Error') }
  }

  const abrirEditar = (ticket: TicketMantenimiento) => {
    formEditar.setFieldsValue({
      estado: ticket.estado,
      personalAsignado: ticket.personalAsignado,
      descripcion: ticket.descripcion,
    })
    setModalEditar(ticket)
  }

  const columnas: ColumnsType<TicketMantenimiento> = [
    {
      title: 'Locker', key: 'locker',
      render: (_, r) =>
        `Edif. ${r.edificioNombre} · ${r.pisoDescripcion ?? `Piso ${r.pisoNumero}`} · #${r.lockerNumero}`,
    },
    {
      title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 90,
      render: (v: TipoTicket) => <Tag color={colorTipo[v]}>{v}</Tag>,
    },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion', ellipsis: true },
    {
      title: 'Personal', dataIndex: 'personalAsignado', key: 'personal',
      render: (v?: string) => v ?? '—', ellipsis: true,
    },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado', width: 110,
      render: (v: EstadoTicket) => <Tag color={colorEstado[v]}>{v}</Tag>,
    },
    {
      title: 'Creado', dataIndex: 'creadoEn', key: 'creado', width: 110,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones', key: 'acciones', width: 200,
      render: (_, r) => (
        <Space size="small">
          <Button size="small" onClick={() => abrirEditar(r)}>Editar</Button>
          {r.estado !== 'Cerrado' && (
            <Popconfirm title="¿Cerrar ticket?" onConfirm={() => cerrar(r.id)} okText="Sí">
              <Button size="small" type="primary">Cerrar</Button>
            </Popconfirm>
          )}
          <Popconfirm title="¿Eliminar ticket?" onConfirm={() => eliminar(r.id)} okText="Sí">
            <Button size="small" danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirModalCrear}>
          Nuevo Ticket
        </Button>
      </Space>

      <Table
        columns={columnas} dataSource={tickets} rowKey="id"
        loading={cargando} size="small" pagination={{ pageSize: 20 }}
        scroll={{ x: true }}
      />

      {/* Modal Crear */}
      <Modal
        title={<Space><ToolOutlined />Nuevo Ticket de Mantenimiento</Space>}
        open={modalCrear} onCancel={() => setModalCrear(false)} footer={null}
      >
        <Form form={formCrear} layout="vertical" onFinish={crear}>
          <Form.Item name="lockerId" label="Locker" rules={[{ required: true }]}>
            <Select showSearch placeholder="Seleccionar locker" loading={cargandoLockers}
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }>
              {lockers.map((l) => (
                <Option key={l.id} value={l.id}>
                  {l.numeroSerie} — Edif. {l.edificioNombre} {l.pisoDescripcion ?? `Piso ${l.pisoNumero}`} #{l.numero}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="tipo" label="Tipo de ticket" rules={[{ required: true }]}>
            <Select placeholder="Seleccionar tipo">
              <Option value="Alta">Alta (nuevo equipo/asignación de mantenimiento)</Option>
              <Option value="Baja">Baja (retirar de mantenimiento)</Option>
              <Option value="Cambio">Cambio (modificación o reasignación)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción" rules={[
            { required: true, message: 'La descripción es requerida' },
            { min: 10, message: 'Mínimo 10 caracteres' },
            { whitespace: true, message: 'No puede estar vacío' },
          ]}>
            <TextArea rows={3} maxLength={500} showCount
              placeholder="Describe el problema o acción de mantenimiento..." />
          </Form.Item>
          <Form.Item name="personalAsignado" label="Personal de mantenimiento asignado"
            rules={[
              { pattern: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/, message: 'Solo se permiten letras, sin números' },
            ]}>
            <Input placeholder="Nombre del técnico o encargado" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Crear Ticket</Button>
        </Form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        title={<Space><ToolOutlined />Editar Ticket de Mantenimiento</Space>}
        open={!!modalEditar} onCancel={() => setModalEditar(null)} footer={null}
      >
        <Form form={formEditar} layout="vertical" onFinish={actualizar}>
          <Form.Item name="estado" label="Estado" rules={[{ required: true }]}>
            <Select>
              <Option value="Abierto">Abierto</Option>
              <Option value="EnProceso">En Proceso</Option>
              <Option value="Cerrado">Cerrado</Option>
            </Select>
          </Form.Item>
          <Form.Item name="personalAsignado" label="Personal de mantenimiento asignado"
            rules={[
              { pattern: /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/, message: 'Solo se permiten letras, sin números' },
            ]}>
            <Input placeholder="Nombre del técnico o encargado" />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción" rules={[
            { required: true, message: 'La descripción es requerida' },
            { min: 10, message: 'Mínimo 10 caracteres' },
          ]}>
            <TextArea rows={3} maxLength={500} showCount />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Guardar Cambios</Button>
        </Form>
      </Modal>
    </div>
  )
}

export default TicketsMantenimientoPage
