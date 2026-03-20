import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Select, InputNumber, Input,
  message, Tag, Space, Popconfirm } from 'antd'
import { BellOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { Aviso, Asignacion } from '../../types'

const { Option } = Select
const { TextArea } = Input

const AvisosPage = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [avisosRes, asigRes] = await Promise.all([
        api.avisos.listar(),
        api.asignaciones.listar(),
      ])
      setAvisos(avisosRes.data.data ?? [])
      setAsignaciones((asigRes.data.data ?? []).filter((a: Asignacion) => a.activa))
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = async (values: { asignacionId: string; diasLimite: number; mensaje?: string }) => {
    try {
      await api.avisos.crear({
        asignacionId: values.asignacionId,
        diasLimite: values.diasLimite,
        mensaje: values.mensaje,
      })
      message.success('Aviso enviado al alumno correctamente')
      setModal(false)
      form.resetFields()
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0] ?? 'Error al enviar aviso'
      message.error(msg)
    }
  }

  const marcarCumplido = async (id: string) => {
    try {
      await api.avisos.marcarCumplido(id)
      message.success('Aviso marcado como cumplido')
      cargar()
    } catch { message.error('Error') }
  }

  const columnas: ColumnsType<Aviso> = [
    {
      title: 'Alumno', key: 'alumno',
      render: (_, r) => `${r.estudianteNombre} (${r.estudianteMatricula})`,
    },
    {
      title: 'Locker', key: 'locker',
      render: (_, r) => `Edif. ${r.edificioNombre} · ${r.pisoDescripcion ?? ''} · #${r.lockerNumero}`,
    },
    {
      title: 'Fecha Límite', dataIndex: 'fechaLimite', key: 'limite',
      render: (v: string) => {
        const fecha = dayjs(v)
        const vencido = fecha.isBefore(dayjs())
        return <span style={{ color: vencido ? '#c0392b' : undefined }}>{fecha.format('DD/MM/YYYY')}</span>
      },
    },
    {
      title: 'Estado', dataIndex: 'estado', key: 'estado',
      render: (v: string) => (
        <Tag color={v === 'Cumplido' ? 'green' : 'orange'}>{v}</Tag>
      ),
    },
    { title: 'Mensaje', dataIndex: 'mensaje', key: 'mensaje', ellipsis: true },
    {
      title: 'Acciones', key: 'acciones',
      render: (_, r) => r.estado === 'Pendiente' ? (
        <Popconfirm title="¿Marcar como cumplido?" onConfirm={() => marcarCumplido(r.id)} okText="Sí">
          <Button size="small">Marcar cumplido</Button>
        </Popconfirm>
      ) : null,
    },
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModal(true)}>
          Nuevo Aviso
        </Button>
      </Space>

      <Table
        columns={columnas} dataSource={avisos} rowKey="id"
        loading={cargando} size="small" pagination={{ pageSize: 20 }}
      />

      <Modal title={<Space><BellOutlined />Enviar Aviso de Desocupación</Space>}
        open={modal} onCancel={() => setModal(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={crear}>
          <Form.Item name="asignacionId" label="Alumno / Locker" rules={[{ required: true }]}>
            <Select showSearch placeholder="Seleccionar asignación activa"
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }>
              {asignaciones.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.estudianteNombre} ({a.estudianteMatricula}) — Edif. {a.edificioNombre} #{a.lockerNumero}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="diasLimite" label="Días para desocupar (máx. 4)"
            rules={[{ required: true }]} initialValue={4}>
            <InputNumber min={1} max={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="mensaje" label="Mensaje adicional (opcional)">
            <TextArea rows={3} maxLength={500}
              placeholder="Se le solicita desocupar su casillero en el plazo indicado." />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Enviar Aviso por Correo</Button>
        </Form>
      </Modal>
    </div>
  )
}

export default AvisosPage
