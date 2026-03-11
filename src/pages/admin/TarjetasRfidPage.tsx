import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Select, message,
  Popconfirm, Alert, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { TarjetaRfid, Usuario } from '../../types'

const { Option } = Select

const TarjetasRfidPage = () => {
  const [tarjetas, setTarjetas] = useState<TarjetaRfid[]>([])
  const [alumnos, setAlumnos] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [tRes, aRes] = await Promise.all([
        api.tarjetas.listar(),
        api.usuarios.listarAlumnos(),
      ])
      setTarjetas(tRes.data.data ?? [])
      setAlumnos(aRes.data.data ?? [])
    } finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const enrolar = async (values: { uid: string; estudianteId: string }) => {
    try {
      await api.tarjetas.enrolar(values)
      message.success('Tarjeta enrolada exitosamente')
      setModal(false)
      form.resetFields()
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0] ?? 'Error al enrolar tarjeta'
      message.error(msg)
    }
  }

  const eliminar = async (id: string) => {
    try {
      await api.tarjetas.eliminar(id)
      message.success('Tarjeta desactivada')
      cargar()
    } catch { message.error('Error') }
  }

  const columnas: ColumnsType<TarjetaRfid> = [
    { title: 'UID', dataIndex: 'uid', key: 'uid',
      render: (v: string) => <code>{v}</code> },
    {
      title: 'Alumno', key: 'alumno',
      render: (_, r) => `${r.estudianteNombre} (${r.estudianteMatricula})`,
    },
    {
      title: 'Estado', dataIndex: 'activa', key: 'activa',
      render: (v: boolean) => v ? <Tag color="green">Activa</Tag> : <Tag>Inactiva</Tag>,
    },
    {
      title: 'Creada', dataIndex: 'creadoEn', key: 'creada',
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones', key: 'acciones',
      render: (_, r) => (
        <Popconfirm title="¿Desactivar tarjeta?" onConfirm={() => eliminar(r.id)} okText="Sí">
          <Button size="small" danger>Desactivar</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}
        onClick={() => setModal(true)} style={{ marginBottom: 16 }}>
        Enrolar Tarjeta RFID
      </Button>

      <Table
        columns={columnas} dataSource={tarjetas} rowKey="id"
        loading={cargando} size="small" pagination={{ pageSize: 20 }}
      />

      <Modal title="Enrolar Tarjeta RFID" open={modal}
        onCancel={() => setModal(false)} footer={null}>
        <Alert
          type="info" showIcon style={{ marginBottom: 16 }}
          message="Cómo obtener el UID del ESP32"
          description="Conecta el ESP32 al monitor serial a 115200 baud. Acerca la tarjeta al lector RC522 y el UID hexadecimal se mostrará en formato AA:BB:CC:DD."
        />
        <Form form={form} layout="vertical" onFinish={enrolar}>
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
          <Form.Item name="uid" label="UID de la Tarjeta (hex)"
            rules={[{ required: true, message: 'Ingresa el UID' }]}>
            <Input placeholder="AA:BB:CC:DD" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Enrolar</Button>
        </Form>
      </Modal>
    </div>
  )
}

export default TarjetasRfidPage
