import { useState } from 'react'
import { Button, Typography } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, LockOutlined, UserSwitchOutlined,
  TeamOutlined, CreditCardOutlined, HistoryOutlined,
  FilePdfOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  DownOutlined as ChevronDownOutlined, BellOutlined,
} from '@ant-design/icons'
import useAuth from '../../hooks/useAuth'
import './AdminLayout.css'

const { Text } = Typography

interface MenuItem {
  key: string
  icon: React.ReactNode
  label: string
  children?: { key: string; label: string }[]
}

const menuItems: MenuItem[] = [
  { key: '/admin/dashboard',    icon: <DashboardOutlined />,  label: 'Dashboard' },
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
  { key: '/admin/avisos', icon: <BellOutlined />, label: 'Avisos' },
  { key: '/admin/usuarios',     icon: <TeamOutlined />,       label: 'Usuarios' },
  { key: '/admin/tarjetas',     icon: <CreditCardOutlined />, label: 'Tarjetas RFID' },
  { key: '/admin/accesos',      icon: <HistoryOutlined />,    label: 'Historial Accesos' },
  { key: '/admin/reportes',     icon: <FilePdfOutlined />,    label: 'Reportes' },
]

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [lockersOpen, setLockersOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()

  const handleNav = (key: string) => {
    if (!key.startsWith('lockers')) navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (key: string) =>
    location.pathname + location.search === key ||
    location.pathname === key

  const isGroupActive = (children: { key: string }[]) =>
    children.some(c => isActive(c.key))

  // Nombre de la página actual para el header breadcrumb
  const currentPage = (() => {
    for (const item of menuItems) {
      if (item.children) {
        const child = item.children.find(c => isActive(c.key))
        if (child) return `${item.label} / ${child.label}`
      }
      if (isActive(item.key)) return item.label
    }
    return 'Dashboard'
  })()

  return (
    <div className="al-layout">

      {/* ── Sidebar ── */}
      <aside className={`al-sider ${collapsed ? 'al-sider-collapsed' : ''}`}>

        {/* Logo */}
        <div className="al-logo">
          <div className="al-logo-icon">
            <LockOutlined />
          </div>
          {!collapsed && (
            <div className="al-logo-text">
              <span className="al-logo-main">UTEQ</span>
              <span className="al-logo-sub">Lockers</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="al-nav">
          {menuItems.map((item) => {
            if (item.children) {
              const groupActive = isGroupActive(item.children)
              return (
                <div key={item.key} className="al-nav-group">
                  <button
                    className={`al-nav-item al-nav-group-btn ${groupActive ? 'al-nav-active' : ''}`}
                    onClick={() => !collapsed && setLockersOpen(o => !o)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="al-nav-icon">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="al-nav-label">{item.label}</span>
                        <span className={`al-nav-chevron ${lockersOpen ? 'al-chevron-open' : ''}`}>
                          <ChevronDownOutlined />
                        </span>
                      </>
                    )}
                  </button>
                  {!collapsed && lockersOpen && (
                    <div className="al-nav-children">
                      {item.children.map(child => (
                        <button
                          key={child.key}
                          className={`al-nav-child ${isActive(child.key) ? 'al-nav-child-active' : ''}`}
                          onClick={() => handleNav(child.key)}
                        >
                          <span className="al-child-dot" />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <button
                key={item.key}
                className={`al-nav-item ${isActive(item.key) ? 'al-nav-active' : ''}`}
                onClick={() => handleNav(item.key)}
                title={collapsed ? item.label : undefined}
              >
                <span className="al-nav-icon">{item.icon}</span>
                {!collapsed && <span className="al-nav-label">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User card */}
        <div className="al-user">
          <div className="al-user-avatar">
            {usuario?.nombre?.[0] ?? 'A'}{usuario?.apellido?.[0] ?? ''}
          </div>
          {!collapsed && (
            <div className="al-user-info">
              <span className="al-user-name">{usuario?.nombre} {usuario?.apellido}</span>
              <span className="al-user-role">Administrador</span>
            </div>
          )}
        </div>

      </aside>

      {/* ── Main ── */}
      <div className="al-main">

        {/* Header */}
        <header className="al-header">
          <div className="al-header-left">
            <button
              className="al-collapse-btn"
              onClick={() => setCollapsed(c => !c)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <div className="al-breadcrumb">
              <span className="al-breadcrumb-root">Admin</span>
              <span className="al-breadcrumb-sep">/</span>
              <span className="al-breadcrumb-current">{currentPage}</span>
            </div>
          </div>

          <button className="al-logout-btn" onClick={handleLogout}>
            <LogoutOutlined />
            <span>Salir</span>
          </button>
        </header>

        {/* Content */}
        <main className="al-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="al-footer">
          UTEQ Lockers © 2026 — Universidad Tecnológica de Querétaro
        </footer>

      </div>
    </div>
  )
}

export default AdminLayout