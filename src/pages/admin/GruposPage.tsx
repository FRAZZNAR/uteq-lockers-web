import { useEffect, useState, useCallback } from 'react'
import { Table, Button, Modal, Form, Input, message, Space, Popconfirm, Tag } from 'antd'
import { PlusOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import api from '../../services/api'
import type { Grupo } from '../../types'

const SOLO_LETRAS_ESPACIOS = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/

const GruposPage = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalCrear, setModalCrear] = useState(false)
  const [grupoEditar, setGrupoEditar] = useState<Grupo | null>(null)
  const [formCrear] = Form.useForm()
  const [formEditar] = Form.useForm()

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await api.grupos.listar()
      setGrupos(res.data.data ?? [])
    } finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const crear = async (values: { nombre: string; tutorNombre: string; tutorEmail: string }) => {
    try {
      await api.grupos.crear(values)
      message.success('Grupo creado')
      setModalCrear(false)
      formCrear.resetFields()
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Error al crear grupo'
      message.error(msg)
    }
  }

  const abrirEditar = (g: Grupo) => {
    formEditar.setFieldsValue({
      nombre: g.nombre,
      tutorNombre: g.tutorNombre,
      tutorEmail: g.tutorEmail,
    })
    setGrupoEditar(g)
  }

  const editar = async (values: { nombre: string; tutorNombre: string; tutorEmail: string }) => {
    if (!grupoEditar) return
    try {
      await api.grupos.actualizar(grupoEditar.id, values)
      message.success('Grupo actualizado')
      setGrupoEditar(null)
      cargar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Error al actualizar grupo'
      message.error(msg)
    }
  }

  const eliminar = async (id: string) => {
    try {
      await api.grupos.eliminar(id)
      message.success('Grupo eliminado')
      cargar()
    } catch { message.error('Error al eliminar grupo') }
  }

  const columnas: ColumnsType<Grupo> = [
    { title: 'Grupo', dataIndex: 'nombre', key: 'nombre', width: 120,
      render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: 'Tutor', dataIndex: 'tutorNombre', key: 'tutorNombre' },
    { title: 'Email del Tutor', dataIndex: 'tutorEmail', key: 'tutorEmail' },
    { title: 'Alumnos', dataIndex: 'totalEstudiantes', key: 'total', width: 90,
      render: (v: number) => <Tag icon={<TeamOutlined />}>{v}</Tag> },
    { title: 'Creado', dataIndex: 'creadoEn', key: 'creado', width: 110,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY') },
    {
      title: 'Acciones', key: 'acciones', width: 150,
      render: (_, r) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => abrirEditar(r)}>Editar</Button>
          <Popconfirm
            title="¿Eliminar grupo? Los alumnos perderán su asignación de grupo."
            onConfirm={() => eliminar(r.id)} okText="Sí" okButtonProps={{ danger: true }}>
            <Button size="small" danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const camposGrupo = (form: ReturnType<typeof Form.useForm>[0]) => (
    <>
      <Form.Item name="nombre" label="Clave del Grupo" rules={[
        { required: true, message: 'La clave es requerida' },
        { pattern: /^[A-Za-z0-9\-]+$/, message: 'Solo letras, números y guiones (sin espacios)' },
        { min: 2, message: 'Mínimo 2 caracteres' },
      ]}>
        <Input placeholder="Ej. ITIS-4A"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z0-9\-]/g, '').toUpperCase()
            form.setFieldValue('nombre', e.target.value)
          }}
        />
      </Form.Item>
      <Form.Item name="tutorNombre" label="Nombre del Tutor" rules={[
        { required: true, message: 'El nombre del tutor es requerido' },
        { pattern: SOLO_LETRAS_ESPACIOS, message: 'Solo letras, sin números' },
      ]}>
        <Input placeholder="Ej. Juan Pérez García"
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '')
            form.setFieldValue('tutorNombre', e.target.value)
          }}
        />
      </Form.Item>
      <Form.Item name="tutorEmail" label="Correo del Tutor" rules={[
        { required: true, message: 'El correo del tutor es requerido' },
        { type: 'email', message: 'Ingresa un correo válido' },
      ]}>
        <Input placeholder="tutor@uteq.edu.mx" />
      </Form.Item>
    </>
  )

  return (
    <div>
      <Button type="primary" icon={<PlusOutlined />}
        onClick={() => setModalCrear(true)} style={{ marginBottom: 16 }}>
        Nuevo Grupo
      </Button>

      <Table
        columns={columnas} dataSource={grupos} rowKey="id"
        loading={cargando} size="small" pagination={{ pageSize: 20 }}
      />

      {/* Modal Crear */}
      <Modal title="Nuevo Grupo" open={modalCrear}
        onCancel={() => { setModalCrear(false); formCrear.resetFields() }} footer={null}>
        <Form form={formCrear} layout="vertical" onFinish={crear}>
          {camposGrupo(formCrear)}
          <Button type="primary" htmlType="submit" block>Crear Grupo</Button>
        </Form>
      </Modal>

      {/* Modal Editar */}
      <Modal
        title={`Editar — ${grupoEditar?.nombre ?? ''}`}
        open={!!grupoEditar} onCancel={() => setGrupoEditar(null)} footer={null}>
        <Form form={formEditar} layout="vertical" onFinish={editar}>
          {camposGrupo(formEditar)}
          <Button type="primary" htmlType="submit" block>Guardar Cambios</Button>
        </Form>
      </Modal>
    </div>
  )
}

export default GruposPage
