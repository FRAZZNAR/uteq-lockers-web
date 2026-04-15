import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, Select, message,
  Space, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { Usuario, Grupo } from '../../types'

const { Option } = Select

// ── Patrones de validación reutilizables ───────────────────────────────
const SOLO_LETRAS = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/
const SOLO_ALFANUMERICO = /^[a-zA-Z0-9]+$/
const CONTRASENA_FUERTE = /^(?=.*[A-Z])(?=.*\d).{8,}$/

const reglasSoloLetras = [
  { required: true, message: 'Este campo es requerido' },
  { pattern: SOLO_LETRAS, message: 'Solo se permiten letras, sin números ni caracteres especiales' },
  { whitespace: true, message: 'No puede estar vacío' },
]

const reglasApellido = [
  { required: true, message: 'Este campo es requerido' },
  { pattern: SOLO_LETRAS, message: 'Solo se permiten letras, sin números ni caracteres especiales' },
]

const reglasMatricula = [
  { required: true, message: 'La matrícula es requerida' },
  { pattern: SOLO_ALFANUMERICO, message: 'Solo letras y números, sin espacios ni caracteres especiales' },
  { min: 4, message: 'Mínimo 4 caracteres' },
  { max: 20, message: 'Máximo 20 caracteres' },
]

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalCrear, setModalCrear] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null)
  const [formCrear] = Form.useForm()
  const [formEditar] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [usRes, grRes] = await Promise.all([
        api.usuarios.listar(1, 200),
        api.grupos.listar(),
      ])
      setUsuarios(usRes.data.data ?? [])
      setGrupos(grRes.data.data ?? [])
    } finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = async (values: {
    email: string; matricula: string; nombre: string;
    apellido: string; password: string; confirmar: string; rol: string;
    carrera?: string; grupoId?: string
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
        carrera: values.carrera, grupoId: values.grupoId,
      })
      message.success('Usuario creado')
      setModalCrear(false)
      formCrear.resetFields()
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[]; message?: string } } })
        ?.response?.data?.errors?.[0]
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al crear usuario'
      message.error(msg)
    }
  }

  const abrirEditar = (u: Usuario) => {
    formEditar.setFieldsValue({
      nombre: u.nombre, apellido: u.apellido,
      email: u.email, matricula: u.matricula,
      carrera: u.carrera ?? '',
      grupoId: u.grupoId ?? null,
    })
    setUsuarioEditar(u)
  }

  const editar = async (values: {
    nombre: string; apellido: string; email: string;
    matricula: string; carrera?: string; grupoId?: string; password?: string
  }) => {
    if (!usuarioEditar) return
    try {
      await api.usuarios.actualizar(usuarioEditar.id, {
        nombre: values.nombre, apellido: values.apellido,
        email: values.email, matricula: values.matricula,
        carrera: values.carrera || undefined,
        grupoId: values.grupoId || null,
        password: values.password || undefined,
      })
      message.success('Usuario actualizado')
      setUsuarioEditar(null)
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[]; message?: string } } })
        ?.response?.data?.errors?.[0]
        ?? (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Error al actualizar usuario'
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
    { title: 'Nombre', key: 'nombre', render: (_, r) => `${r.nombre} ${r.apellido}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Carrera', dataIndex: 'carrera', key: 'carrera', ellipsis: true,
      render: (v?: string) => v ?? '—' },
    { title: 'Grupo', dataIndex: 'grupoNombre', key: 'grupo', width: 100,
      render: (v?: string) => v ? <Tag color="blue">{v}</Tag> : '—' },
    { title: 'Tutor', key: 'tutor', ellipsis: true,
      render: (_, r) => r.tutorNombre
        ? <span title={r.tutorEmail}>{r.tutorNombre}</span>
        : '—' },
    { title: 'Rol', dataIndex: 'rol', key: 'rol', width: 80,
      render: (v: string) => <Tag color={v === 'Admin' ? 'blue' : 'green'}>{v}</Tag> },
    { title: 'Creado', dataIndex: 'creadoEn', key: 'creado', width: 110,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    {
      title: 'Acciones', key: 'acciones', width: 140,
      render: (_, r) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => abrirEditar(r)}>Editar</Button>
          <Popconfirm title="¿Eliminar usuario permanentemente?" onConfirm={() => eliminar(r.id)} okText="Sí" okButtonProps={{ danger: true }}>
            <Button size="small" danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const camposNombreEmail = (form: ReturnType<typeof Form.useForm>[0]) => (
    <>
      <Form.Item name="nombre" label="Nombre" rules={reglasSoloLetras}>
        <Input placeholder="Solo letras"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '')
            form.setFieldValue('nombre', e.target.value)
          }}
        />
      </Form.Item>
      <Form.Item name="apellido" label="Apellido" rules={reglasApellido}>
        <Input placeholder="Solo letras"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '')
            form.setFieldValue('apellido', e.target.value)
          }}
        />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[
        { required: true, type: 'email', message: 'Ingresa un email válido' },
        { pattern: /^[^@]+@uteq\.edu\.mx$/i, message: 'Solo se aceptan correos @uteq.edu.mx' },
      ]}>
        <Input placeholder="usuario@uteq.edu.mx" />
      </Form.Item>
      <Form.Item name="matricula" label="Matrícula" rules={reglasMatricula}>
        <Input placeholder="Ej. 2022371115"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '')
            form.setFieldValue('matricula', e.target.value)
          }}
        />
      </Form.Item>
      <Form.Item name="carrera" label="Carrera">
        <Input placeholder="Ej. Ingeniería en Tecnologías de la Información" />
      </Form.Item>
      <Form.Item name="grupoId" label="Grupo">
        <Select placeholder="Seleccionar grupo (opcional)" allowClear showSearch
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }>
          {grupos.map((g) => (
            <Option key={g.id} value={g.id}>
              {g.nombre} — {g.tutorNombre}
            </Option>
          ))}
        </Select>
      </Form.Item>
    </>
  )

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}
        onClick={() => setModalCrear(true)} style={{ marginBottom: 16 }}>
        Nuevo Usuario
      </Button>

      <Table
        columns={columnas} dataSource={usuarios} rowKey="id"
        loading={cargando} size="small" pagination={{ pageSize: 20 }}
        scroll={{ x: true }}
      />

      {/* Modal Crear */}
      <Modal title="Nuevo Usuario" open={modalCrear}
        onCancel={() => { setModalCrear(false); formCrear.resetFields() }} footer={null}>
        <Form form={formCrear} layout="vertical" onFinish={crear}>
          {camposNombreEmail(formCrear)}
          <Form.Item name="rol" label="Rol" rules={[{ required: true }]} initialValue="Alumno">
            <Select>
              <Option value="Admin">Admin</Option>
              <Option value="Alumno">Alumno</Option>
            </Select>
          </Form.Item>
          <Form.Item name="password" label="Contraseña" rules={[
            { required: true, message: 'La contraseña es requerida' },
            { min: 8, message: 'Mínimo 8 caracteres' },
            { pattern: CONTRASENA_FUERTE, message: 'Debe contener al menos una mayúscula y un número' },
          ]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmar" label="Confirmar contraseña"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Confirma la contraseña' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('Las contraseñas no coinciden'))
                },
              }),
            ]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Crear Usuario</Button>
        </Form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        title={`Editar — ${usuarioEditar?.nombre ?? ''} ${usuarioEditar?.apellido ?? ''}`}
        open={!!usuarioEditar} onCancel={() => setUsuarioEditar(null)} footer={null}>
        <Form form={formEditar} layout="vertical" onFinish={editar}>
          {camposNombreEmail(formEditar)}
          <Form.Item name="password" label="Nueva contraseña (vacío = sin cambio)"
            rules={[
              { min: 8, message: 'Mínimo 8 caracteres' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) return Promise.resolve()
                  if (CONTRASENA_FUERTE.test(value)) return Promise.resolve()
                  return Promise.reject(new Error('Debe contener al menos una mayúscula y un número'))
                },
              }),
            ]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Guardar Cambios</Button>
        </Form>
      </Modal>
    </div>
  )
}

export default UsuariosPage
