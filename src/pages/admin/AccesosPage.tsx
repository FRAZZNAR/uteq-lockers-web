import { useEffect, useState, useCallback } from 'react'
import { Button, Space, Select, DatePicker, message, Card, Row, Col } from 'antd'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import api from '../../services/api'
import AccesoLogTable from '../../components/AccesoLogTable/AccesoLogTable'
import type { AccesoLog, Edificio } from '../../types'

const { Option } = Select
const { RangePicker } = DatePicker

const AccesosPage = () => {
  const [accesos, setAccesos] = useState<AccesoLog[]>([])
  const [edificios, setEdificios] = useState<Edificio[]>([])
  const [cargando, setCargando] = useState(false)
  const [filtros, setFiltros] = useState({
    desde: dayjs().subtract(1, 'month').toISOString(),
    hasta: dayjs().toISOString(),
    edificioId: undefined as string | undefined,
    resultado: undefined as string | undefined,
    metodo: undefined as string | undefined,
  })

  const buscar = useCallback(async () => {
    setCargando(true)
    try {
      const res = await api.accesos.listar({
        desde: filtros.desde, hasta: filtros.hasta,
        edificioId: filtros.edificioId,
        resultado: filtros.resultado, metodo: filtros.metodo,
        page: 1, pageSize: 200,
      })
      setAccesos(res.data.data ?? [])
    } finally { setCargando(false) }
  }, [filtros])

  useEffect(() => {
    api.edificios.listar().then((r) => setEdificios(r.data.data ?? []))
    buscar()
  }, [])

  const exportarPdf = async () => {
    try {
      const res = await api.reportes.descargarAccesosPdf({
        desde: filtros.desde, hasta: filtros.hasta,
        edificioId: filtros.edificioId,
      })
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]))
      const a = document.createElement('a')
      a.href = url
      a.download = `accesos-${dayjs().format('YYYYMMDD')}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { message.error('Error al exportar PDF') }
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              defaultValue={[dayjs().subtract(1, 'month'), dayjs()]}
              onChange={(dates) => {
                if (dates?.[0] && dates?.[1]) {
                  setFiltros(f => ({
                    ...f,
                    desde: dates[0]!.toISOString(),
                    hasta: dates[1]!.toISOString(),
                  }))
                }
              }}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Edificio" allowClear style={{ width: '100%' }}
              onChange={(v) => setFiltros(f => ({ ...f, edificioId: v }))}
            >
              {edificios.map((e) => <Option key={e.id} value={e.id}>{e.nombre}</Option>)}
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Resultado" allowClear style={{ width: '100%' }}
              onChange={(v) => setFiltros(f => ({ ...f, resultado: v }))}
            >
              <Option value="Exitoso">Exitoso</Option>
              <Option value="Fallido">Fallido</Option>
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <Select
              placeholder="Método" allowClear style={{ width: '100%' }}
              onChange={(v) => setFiltros(f => ({ ...f, metodo: v }))}
            >
              <Option value="RFID">RFID</Option>
              <Option value="OTP">OTP</Option>
              <Option value="Admin">Admin</Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={buscar}>
                Buscar
              </Button>
              <Button icon={<DownloadOutlined />} onClick={exportarPdf}>
                Exportar PDF
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <AccesoLogTable accesos={accesos} cargando={cargando} paginacion />
    </div>
  )
}

export default AccesosPage
