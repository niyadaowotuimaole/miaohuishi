'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import MetalPrices from '@/components/MetalPrices'
import LimitUpStocks from '@/components/LimitUpStocks'
import HotSectors from '@/components/HotSectors'
import NewsList from '@/components/NewsList'
import StockData from '@/components/StockData'

// 演示数据 - 实际使用时会被爬虫数据替换
const demoMetalData = {
  gold: { price: 2345.67, change: 12.34, changePercent: 0.53 },
  silver: { price: 27.45, change: -0.23, changePercent: -0.83 },
  usdIndex: { price: 104.32, change: -0.15, changePercent: -0.14 },
  updateTime: new Date().toLocaleString('zh-CN')
}

const demoStocks = [
  { code: '000001', name: '平安银行', reason: '银行板块利好', sector: '银行', time: '09:30' },
  { code: '600519', name: '贵州茅台', reason: '业绩超预期', sector: '白酒', time: '09:45' },
  { code: '002594', name: '比亚迪', reason: '销量大增', sector: '新能源汽车', time: '10:15' },
  { code: '300750', name: '宁德时代', reason: '电池技术突破', sector: '锂电池', time: '10:30' },
  { code: '688981', name: '中芯国际', reason: '国产替代加速', sector: '半导体', time: '11:00' },
]

const demoHotSectors = [
  { name: 'AI概念', stocks: 45, heat: 98 },
  { name: '新能源汽车', stocks: 32, heat: 85 },
  { name: '半导体', stocks: 28, heat: 82 },
  { name: '医疗健康', stocks: 22, heat: 75 },
  { name: '银行', stocks: 18, heat: 70 },
]

const demoNews = [
  { title: '央行降准0.25个百分点，释放长期资金约5000亿', type: '政策', time: '2小时前', related: ['银行', '券商'] },
  { title: '工信部发布AI产业发展规划，这些板块迎利好', type: '行业', time: '4小时前', related: ['AI', '科技'] },
  { title: '宁德时代发布神行PLUS电池，续航超1000公里', type: '公司', time: '5小时前', related: ['宁德时代', '新能源'] },
]

export default function Home() {
  const [dataStatus, setDataStatus] = useState<'loading' | 'demo' | 'live'>('demo')
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    // 尝试加载真实数据
    fetch('/api/data.json')
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('No data')
      })
      .then(data => {
        setLastUpdate(data.updateTime || '')
        setDataStatus('live')
      })
      .catch(() => {
        setDataStatus('demo')
      })
  }, [])

  return (
    <main className="min-h-screen">
      <Header status={dataStatus} lastUpdate={lastUpdate} />
      
      {/* 重要提示 */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="glass rounded-lg px-4 py-2 text-amber-400 text-sm">
          ⚠️ 本页面仅供参考学习，不构成投资建议。投资有风险，入市需谨慎。
        </div>
      </div>

      {/* 行情概览 */}
      <section className="max-w-7xl mx-auto px-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetalPrices data={demoMetalData} />
          <StockData />
        </div>
      </section>

      {/* 涨停板块 */}
      <section className="max-w-7xl mx-auto px-4 mb-6">
        <LimitUpStocks stocks={demoStocks} />
      </section>

      {/* 热门题材和消息 */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HotSectors sectors={demoHotSectors} />
          <NewsList news={demoNews} />
        </div>
      </section>

      {/* 页脚 */}
      <footer className="glass mt-8 py-6 text-center text-gray-400 text-sm">
        <p>每日投资参考 · 数据仅供参考，不构成投资建议</p>
        <p className="mt-1">市场有风险，投资需谨慎</p>
      </footer>
    </main>
  )
}
