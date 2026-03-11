import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, message, Typography } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import useAuth from '../../hooks/useAuth'
import type { LoginDto } from '../../types'
import './LoginPage.css'

const { Title, Text } = Typography

const LoginPage = () => {
  const [cargando, setCargando] = useState(false)
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values: LoginDto) => {
    setCargando(true)
    try {
      await login(values)
      // Redirigir según rol (isAdmin se actualiza en el store)
      const raw = localStorage.getItem('auth')
      const rol = raw ? JSON.parse(raw).usuario.rol : null
      if (rol === 'Admin') navigate('/admin/dashboard')
      else navigate('/alumno/mi-locker')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: string[] } } })
        ?.response?.data?.errors?.[0] ?? 'Credenciales incorrectas'
      message.error(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-logo">
          <LockOutlined style={{ fontSize: 48, color: '#003087' }} />
          <Title level={3} style={{ color: '#003087', margin: '8px 0 0' }}>
            UTEQ Lockers
          </Title>
          <Text type="secondary">Universidad Tecnológica de Querétaro</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Ingresa tu email' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Correo electrónico"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={cargando}
              style={{ background: '#003087' }}
            >
              Iniciar sesión
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
