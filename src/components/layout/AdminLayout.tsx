import { useState } from 'react'
import { Layout, Menu, Button, Typography, Space, theme } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, LockOutlined, UserSwitchOutlined,
  TeamOutlined, CreditCardOutlined, HistoryOutlined,
  FilePdfOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons'
import useAuth from '../../hooks/useAuth'

const { Header, Sider, Content, Footer } = Layout
const { Text } = Typography

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()
  const { token: { colorBgContainer } } = theme.useToken()

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    {
      key: 'lockers',
      icon: <LockOutlined />,
      label: 'Lockers',
      children: [
        { key: '/admin/lockers?edificio=H', label: 'Edificio H' },
        { key: '/admin/lockers?edificio=K', label: 'Edificio K' },
      ],
    },
    { key: '/admin/asignaciones', icon: <UserSwitchOutlined />, label: 'Asignaciones' },
    { key: '/admin/usuarios', icon: <TeamOutlined />, label: 'Usuarios' },
    { key: '/admin/tarjetas', icon: <CreditCardOutlined />, label: 'Tarjetas RFID' },
    { key: '/admin/accesos', icon: <HistoryOutlined />, label: 'Historial Accesos' },
    { key: '/admin/reportes', icon: <FilePdfOutlined />, label: 'Reportes' },
  ]

  const selectedKey = location.pathname

  const handleMenuClick = ({ key }: { key: string }) => {
    if (!key.startsWith('lockers')) navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={220}>
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <LockOutlined style={{ color: '#1890ff', fontSize: 22 }} />
          {!collapsed && (
            <Text strong style={{ color: 'white', marginLeft: 10, fontSize: 15 }}>
              UTEQ Lockers
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['lockers']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
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

export default AdminLayout
