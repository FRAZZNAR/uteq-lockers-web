import { useState } from 'react'
import { Card, Button, Space, DatePicker, Select, Table, message, Row, Col } from 'antd'
import { DownloadOutlined, BarChartOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../services/api'

const { RangePicker } = DatePicker
const { Option } = Select

const ReportesPage = () => {
  const [estadisticas, setEstadisticas] = useState<unknown[]>([])
  const [cargandoStats, setCargandoStats] = useState(false)
  const [rango, setRango] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'month'), dayjs()
  ])
  const [edificioId, setEdificioId] = useState<string | undefined>()
  const [edificios, setEdificios] = useState<{ id: string; nombre: string }[]>([])

  useState(() => {
    api.edificios.listar().then((r) => setEdificios(r.data.data ?? []))
  })

  const cargarEstadisticas = async () => {
    setCargandoStats(true)
    try {
      const res = await api.reportes.ocupacion()
      setEstadisticas(res.data as unknown[])
    } finally { setCargandoStats(false) }
  }

  const descargarOcupacion = async () => {
    try {
      const res = await api.reportes.descargarOcupacionPdf()
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]))
      const a = document.createElement('a')
      a.href = url
      a.download = `ocupacion-${dayjs().format('YYYYMMDD')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { message.error('Error al descargar PDF') }
  }

  const descargarAccesos = async () => {
    try {
      const res = await api.reportes.descargarAccesosPdf({
        desde: rango[0].toISOString(),
        hasta: rango[1].toISOString(),
        edificioId,
      })
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]))
      const a = document.createElement('a')
      a.href = url
      a.download = `accesos-${dayjs().format('YYYYMMDD')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { message.error('Error al descargar PDF') }
  }

  const columnas = [
    { title: 'Edificio', dataIndex: 'edificio', key: 'edificio' },
    { title: 'Total', dataIndex: 'total', key: 'total' },
    { title: 'Disponibles', dataIndex: 'disponibles', key: 'disponibles' },
    { title: 'Asignados', dataIndex: 'asignados', key: 'asignados' },
    { title: 'Mantenimiento', dataIndex: 'mantenimiento', key: 'mantenimiento' },
    { title: '% Ocupación', dataIndex: 'porcentajeOcupacion', key: 'pct',
      render: (v: number) => `${v}%` },
  ]

  return (
    <div>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="Reporte de Ocupación" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Button icon={<BarChartOutlined />} onClick={cargarEstadisticas} loading={cargandoStats}>
                  Ver estadísticas
                </Button>
                <Button type="primary" icon={<DownloadOutlined />} onClick={descargarOcupacion}>
                  Descargar PDF
                </Button>
              </Space>
              {estadisticas.length > 0 && (
                <Table
                  columns={columnas}
                  dataSource={estadisticas as Record<string, unknown>[]}
                  rowKey="edificio"
                  size="small"
                  pagination={false}
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Reporte de Historial de Accesos">
            <Space direction="vertical" style={{ width: '100%' }}>
              <RangePicker
                style={{ width: '100%' }}
                value={rango}
                onChange={(dates) => dates && setRango(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
              <Select
                placeholder="Edificio (opcional)" allowClear style={{ width: '100%' }}
                onChange={(v) => setEdificioId(v)}
              >
                {edificios.map((e) => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}
              </Select>
              <Button type="primary" icon={<DownloadOutlined />} onClick={descargarAccesos} block>
                Descargar PDF de Accesos
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReportesPage
