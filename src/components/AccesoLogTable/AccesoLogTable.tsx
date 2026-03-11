import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import StatusBadge from '../StatusBadge/StatusBadge'
import type { AccesoLog } from '../../types'

interface Props {
  accesos: AccesoLog[]
  cargando?: boolean
  paginacion?: boolean
}

const AccesoLogTable = ({ accesos, cargando = false, paginacion = true }: Props) => {
  const columnas: ColumnsType<AccesoLog> = [
    {
      title: 'Fecha/Hora',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (v: string) => dayjs(v).format('DD/MM HH:mm:ss'),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Edificio',
      dataIndex: 'edificioNombre',
      key: 'edificio',
      width: 80,
    },
    {
      title: 'Locker',
      key: 'locker',
      width: 80,
      render: (_, r) => `#${r.lockerNumero}`,
    },
    {
      title: 'Alumno',
      dataIndex: 'estudianteNombre',
      key: 'alumno',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Método',
      dataIndex: 'metodo',
      key: 'metodo',
      width: 80,
    },
    {
      title: 'Resultado',
      dataIndex: 'resultado',
      key: 'resultado',
      width: 100,
      render: (v: string) => <StatusBadge estado={v} />,
    },
    {
      title: 'Motivo fallo',
      dataIndex: 'motivoFallo',
      key: 'motivo',
      render: (v?: string) => v ?? '—',
    },
  ]

  return (
    <Table
      columns={columnas}
      dataSource={accesos}
      rowKey="id"
      loading={cargando}
      size="small"
      pagination={paginacion ? { pageSize: 20, showSizeChanger: true } : false}
      scroll={{ x: 700 }}
    />
  )
}

export default AccesoLogTable
