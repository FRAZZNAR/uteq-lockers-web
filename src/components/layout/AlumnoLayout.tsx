import { useState } from 'react'
import { Layout, Menu, Button, Typography, Space, theme } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LockOutlined, MailOutlined, HistoryOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons'
import useAuth from '../../hooks/useAuth'

const { Header, Sider, Content, Footer } = Layout
const { Text } = Typography

const AlumnoLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()
  const { token: { colorBgContainer } } = theme.useToken()

  const menuItems = [
    { key: '/alumno/mi-locker', icon: <LockOutlined />, label: 'Mi Locker' },
    { key: '/alumno/solicitar-codigo', icon: <MailOutlined />, label: 'Solicitar Código' },
    { key: '/alumno/historial', icon: <HistoryOutlined />, label: 'Historial' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={200}>
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <LockOutlined style={{ color: '#1890ff', fontSize: 22 }} />
          {!collapsed && (
            <Text strong style={{ color: 'white', marginLeft: 10 }}>
              UTEQ Lockers
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header style={{
          padding: '0 24px', background: colorBgContainer,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Space>
            <Text>{usuario?.nombre} {usuario?.apellido}</Text>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
              Salir
            </Button>
          </Space>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: colorBgContainer, minHeight: 280 }}>
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center', color: '#999' }}>
          UTEQ Lockers © 2026 — Universidad Tecnológica del Estado de Querétaro
        </Footer>
      </Layout>
    </Layout>
  )
}

export default AlumnoLayout
