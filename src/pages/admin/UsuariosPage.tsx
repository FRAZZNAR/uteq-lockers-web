import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Select, message,
  Space, Popconfirm, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { Usuario } from '../../types'

const { Option } = Select

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [form] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await api.usuarios.listar(1, 200)
      setUsuarios(res.data.data ?? [])
    } finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = async (values: {
    email: string; matricula: string; nombre: string;
    apellido: string; password: string; confirmar: string; rol: string
  }) => {
    if (values.password !== values.confirmar) {
      message.error('Las contraseñas no coinciden')
      return
    }
    try {
      await api.usuarios.crear({
        email: values.email, matricula: values.matricula,
        nombre: values.nombre, apellido: values.apellido,
        password: values.password, rol: values.rol as 'Admin' | 'Alumno',
      })
      message.success('Usuario creado')
      setModal(false)
      form.resetFields()
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0] ?? 'Error al crear usuario'
      message.error(msg)
    }
  }

  const eliminar = async (id: string) => {
    try {
      await api.usuarios.eliminar(id)
      message.success('Usuario eliminado')
      cargar()
    } catch { message.error('Error') }
  }

  const columnas: ColumnsType<Usuario> = [
    { title: 'Matrícula', dataIndex: 'matricula', key: 'matricula', width: 120 },
    {
      title: 'Nombre', key: 'nombre',
      render: (_, r) => `${r.nombre} ${r.apellido}`,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Rol', dataIndex: 'rol', key: 'rol', width: 80,
      render: (v: string) => <Tag color={v === 'Admin' ? 'blue' : 'green'}>{v}</Tag>,
    },
    {
      title: 'Creado', dataIndex: 'creadoEn', key: 'creado', width: 110,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Acciones', key: 'acciones', width: 100,
      render: (_, r) => (
        <Popconfirm title="¿Eliminar usuario?" onConfirm={() => eliminar(r.id)} okText="Sí">
          <Button size="small" danger>Eliminar</Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}
        onClick={() => setModal(true)} style={{ marginBottom: 16 }}>
        Nuevo Usuario
      </Button>

      <Table
        columns={columnas} dataSource={usuarios} rowKey="id"
        loading={cargando} size="small" pagination={{ pageSize: 20 }}
      />

      <Modal title="Nuevo Usuario" open={modal}
        onCancel={() => setModal(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={crear}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[
            { required: true, type: 'email' },
            { pattern: /^[^@]+@uteq\.edu\.mx$/i, message: 'Solo se aceptan correos @uteq.edu.mx' },
          ]}>
            <Input />
          </Form.Item>
          <Form.Item name="matricula" label="Matrícula" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rol" label="Rol" rules={[{ required: true }]} initialValue="Alumno">
            <Select>
              <Option value="Admin">Admin</Option>
              <Option value="Alumno">Alumno</Option>
            </Select>
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmar" label="Confirmar contraseña" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Crear Usuario</Button>
        </Form>
      </Modal>
    </div>
  )
}

export default UsuariosPage
