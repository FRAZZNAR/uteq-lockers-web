import { Tooltip } from 'antd'
import { WifiOutlined } from '@ant-design/icons'
import type { LockerMapaItem } from '../../types'
import './LockerGrid.css'

interface Props {
  locker: LockerMapaItem
  onClick?: () => void
}

const estadoClass: Record<string, string> = {
  Disponible: 'disponible',
  Asignado: 'asignado',
  Mantenimiento: 'mantenimiento',
}

const LockerCard = ({ locker, onClick }: Props) => {
  const clase = estadoClass[locker.estado] ?? 'disponible'
  const wifiColor = locker.dispositivoEstado === 'Online' ? '#52c41a' : '#bfbfbf'

  return (
    <Tooltip
      title={`Serie: ${locker.numeroSerie} | ${locker.estado}`}
      placement="top"
    >
      <div
        className={`locker-card ${clase}${onClick ? ' clickable' : ''}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      >
        {locker.numero}
        {locker.tieneDispositivo && (
          <span className="locker-wifi-icon" style={{ color: wifiColor }}>
            <WifiOutlined />
          </span>
        )}
      </div>
    </Tooltip>
  )
}

export default LockerCard
