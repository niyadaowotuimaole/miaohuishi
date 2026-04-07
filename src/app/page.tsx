'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import MetalPrices from '@/components/MetalPrices'
import LimitUpStocks from '@/components/LimitUpStocks'
import HotSectors from '@/components/HotSectors'
import NewsList from '@/components/NewsList'
import StockData from '@/components/StockData'

const demoMetal = {
  gold: { name: '黄金', price: 2345.67, change: 12.34, changePercent: 0.53, source: '演示', note: '演示数据' },
  silver: { name: '白银', price: 27.45, change: -0.23, changePercent: -0.83, source: '演示', note: '演示数据' },
  note: '演示数据',
}
const demoSectors = [
  { name: 'AI概念', heat: 85, change: 2.3 },
  { name: '新能源汽车', heat: 78, change: 1.8 },
  { name: '半导体', heat: 72, change: 1.2 },
  { name: '医疗健康', heat: 65, change: -0.5 },
  { name: '银行', heat: 55, change: 0.3 },
]
const demoNews = [
  { title: '央行降准释放长期资金约5000亿', type: '政策', time: '2小时前', related: ['银行', '券商'] },
  { title: '工信部发布AI产业发展规划，这些板块迎利好', type: '行业', time: '4小时前', related: ['AI', '科技'] },
  { title: '宁德时代发布神行PLUS电池，续航超1000公里', type: '公司', time: '5小时前', related: ['宁德时代', '新能源'] },
]
const demoLimitUp = [
  { code: '000001', name: '平安银行', reason: '银行板块利好', change: 9.95, changePercent: 9.95, source: '演示' },
]

export default function Home() {
  const [status, setStatus] = useState<'loading'|'demo'|'live'>('loading')
  const [lastUpdate, setLastUpdate] = useState('')
  const [data, setData] = useState<any>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const r = await fetch('/api/market')
      if (!r.ok) throw new Error()
      const d = await r.json()
      setData(d)
      setLastUpdate(d.updateTime || '')
      setStatus('live')
    } catch {
      setData(null)
      setStatus('demo')
    }
  }, [])

  useEffect(() => { load() }, [load])

  const metal = data?.metalData || demoMetal
  const indices = data?.stockData || null
  const limitUp = data?.limitUpStocks || demoLimitUp
  const sectors = data?.hotSectors || demoSectors
  const news = data?.news || demoNews

  return (
    <main className="min-h-screen">
      <Header status={status} lastUpdate={lastUpdate} onRefresh={load} />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="glass rounded-lg px-4 py-2 text-amber-400 text-sm">
          &#9888; 本页仅供学习参考，不构成投资建议。投资有风险，入市需谨慎。
        </div>
      </div>
      <section className="max-w-7xl mx-auto px-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetalPrices data={metal} />
          <StockData indices={indices} />
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 mb-6">
        <LimitUpStocks stocks={limitUp} />
      </section>
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HotSectors sectors={sectors} />
          <NewsList news={news} />
        </div>
      </section>
      <footer className="glass mt-8 py-6 text-center text-gray-400 text-sm">
        <p>每日投资参考路  数据仅供引用，不构成投资建议</p>
        <p className="mt-1">市场有风险，投资需谨慎</p>
        <p className="mt-1 text-xs text-gray-600">数据来源：东方财富 | 仅供学习参考</p>
      </footer>
    </main>
  )
}
