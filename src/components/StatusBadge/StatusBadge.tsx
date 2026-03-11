import { Tag } from 'antd'
import type { EstadoLocker, EstadoDispositivo, ResultadoAcceso } from '../../types'

interface Props {
  estado: EstadoLocker | EstadoDispositivo | ResultadoAcceso | string
}

const colorMap: Record<string, string> = {
  Disponible: 'green',
  Asignado: 'red',
  Mantenimiento: 'orange',
  Online: 'green',
  Offline: 'default',
  Exitoso: 'green',
  Fallido: 'red',
}

const StatusBadge = ({ estado }: Props) => {
  return <Tag color={colorMap[estado] ?? 'default'}>{estado}</Tag>
}

export default StatusBadge
