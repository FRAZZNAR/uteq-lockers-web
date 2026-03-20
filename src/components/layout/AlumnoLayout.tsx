import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  LockOutlined, MailOutlined, HistoryOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined,
} from '@ant-design/icons'
import useAuth from '../../hooks/useAuth'
import './AdminLayout.css'   // ← reutiliza el mismo CSS

const menuItems = [
  { key: '/alumno/mi-locker',        icon: <LockOutlined />,    label: 'Mi Locker' },
  { key: '/alumno/solicitar-codigo', icon: <MailOutlined />,    label: 'Solicitar Código' },
  { key: '/alumno/historial',        icon: <HistoryOutlined />, label: 'Historial' },
  { key: '/alumno/avisos',           icon: <BellOutlined />,    label: 'Avisos' },
]

const AlumnoLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentPage =
    menuItems.find(i => i.key === location.pathname)?.label ?? 'Mi Locker'

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
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`al-nav-item ${location.pathname === item.key ? 'al-nav-active' : ''}`}
              onClick={() => navigate(item.key)}
              title={collapsed ? item.label : undefined}
            >
              <span className="al-nav-icon">{item.icon}</span>
              {!collapsed && <span className="al-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User card */}
        <div className="al-user">
          <div className="al-user-avatar">
            {usuario?.nombre?.[0] ?? 'A'}{usuario?.apellido?.[0] ?? ''}
          </div>
          {!collapsed && (
            <div className="al-user-info">
              <span className="al-user-name">{usuario?.nombre} {usuario?.apellido}</span>
              <span className="al-user-role">Alumno</span>
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
              <span className="al-breadcrumb-root">Alumno</span>
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

export default AlumnoLayout