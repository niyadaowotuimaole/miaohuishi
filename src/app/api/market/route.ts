import { NextResponse } from 'next/server'

// 演示数据 - 确保页面能正常显示
const demoData = {
  updateTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  stockData: [
    { code: '000001', name: '上证指数', price: 3047.32, change: 15.67, changePercent: 0.52 },
    { code: '399001', name: '深证成指', price: 9845.21, change: -23.45, changePercent: -0.24 },
    { code: '399006', name: '创业板指', price: 1856.78, change: 32.11, changePercent: 1.76 },
    { code: '000300', name: '沪深300', price: 3521.45, change: 8.92, changePercent: 0.25 },
  ],
  metalData: {
    gold: { name: '黄金ETF', price: 2345.67, change: 12.34, changePercent: 0.53 },
    silver: { name: '白银ETF', price: 27.45, change: -0.23, changePercent: -0.83 },
    note: '演示数据',
  },
  hotSectors: [
    { name: 'AI概念', heat: 85, change: 2.3 },
    { name: '新能源汽车', heat: 78, change: 1.8 },
    { name: '半导体', heat: 72, change: 1.2 },
    { name: '医疗健康', heat: 65, change: -0.5 },
    { name: '银行', heat: 55, change: 0.3 },
  ],
  limitUpStocks: [
    { code: '000001', name: '平安银行', price: 12.5, change: 1.14, changePercent: 10.0, reason: '银行板块利好' },
  ],
  news: [
    { title: '央行降准释放长期资金约5000亿', type: '政策', time: '2小时前', source: '财经' },
    { title: '工信部发布AI产业发展规划', type: '行业', time: '4小时前', source: '财经' },
  ],
  sectorRankings: [
    { name: 'AI概念', change: 2.5 },
    { name: '半导体', change: 1.8 },
    { name: '新能源', change: -0.5 },
  ],
  moneyFlow: [
    { code: '600519', name: '贵州茅台', price: 1650.0, change: 1.2, mainInflow: 520000000 },
    { code: '000858', name: '五粮液', price: 145.5, change: 0.8, mainInflow: 320000000 },
  ],
  topTraders: [
    { code: '600519', name: '贵州茅台', price: 1650.0, change: 1.2, instBuy: 250000000, instSell: 180000000, instNet: 70000000 },
    { code: '300750', name: '宁德时代', price: 185.6, change: 2.5, instBuy: 180000000, instSell: 120000000, instNet: 60000000 },
  ],
}

export async function GET() {
  // 直接返回演示数据，避免外部API调用失败
  return NextResponse.json(demoData)
}