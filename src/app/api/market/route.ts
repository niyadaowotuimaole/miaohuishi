import { NextResponse } from 'next/server'
const EM = 'https://push2.eastmoney.com/api/qt'

async function fetchIndices() {
  try {
    const r = await fetch(EM + '/ulist.np/get?fltt=2&invt=2&fields=f12,f14,f2,f3,f4&secids=1.000001,0.399001,0.399006,1.000300,0.399905', { next: { revalidate: 60 } })
    const j = await r.json()
    const diff: any[] = j?.data?.diff || []
    return diff.slice(0, 5).map((item: any) => {
      const prevClose = Number(item.f2)
      const change = Number(item.f4)
      return { code: item.f12, name: item.f14, price: Math.round((prevClose + change) * 100) / 100, change: Math.round(change * 100) / 100, changePercent: Math.round(Number(item.f3) * 100) / 100, source: '东方财富' }
    })
  } catch { return null }
}

async function fetchMetals() {
  try {
    const r = await fetch(EM + '/clist/get?pn=1&pz=50&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:90+t:3&fields=f2,f3,f4,f12,f14&ut=bd1d9ddb04089700cf9c27f6f7426281', { next: { revalidate: 300 } })
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    const gold = list.find((s: any) => (s.f14 || '').includes('黄金'))
    const silver = list.find((s: any) => (s.f14 || '').includes('白银'))
    return {
      gold: gold ? { name: gold.f14, price: gold.f2, change: Math.round(Number(gold.f4)*100)/100, changePercent: Math.round(Number(gold.f3)*100)/100, source: '东方财富概念板块', note: '概念涨跌，非现货' } : null,
      silver: silver ? { name: silver.f14, price: silver.f2, change: Math.round(Number(silver.f4)*100)/100, changePercent: Math.round(Number(silver.f3)*100)/100, source: '东方财富概念板块', note: '概念涨跌，非现货' } : null,
      note: '以上为概念板块涨跌，非国际现货价',
    }
  } catch { return null }
}

async function fetchLimitUp() {
  try {
    const fs = 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23'
    const r = await fetch(EM + '/clist/get?pn=1&pz=30&po=1&np=1&fltt=2&invt=2&fid=f3&fs=' + encodeURIComponent(fs) + '&fields=f2,f3,f4,f12,f14&ut=bd1d9ddb04089700cf9c27f6f7426281', { next: { revalidate: 600 } })
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    return list.filter((s: any) => Number(s.f3) >= 9.5).slice(0, 15).map((s: any) => ({
      code: s.f12, name: s.f14, price: s.f2, change: Math.round(Number(s.f4)*100)/100, changePercent: Math.round(Number(s.f3)*100)/100, reason: guess(s.f14 || ''), source: '东方财富',
    }))
  } catch { return null }
}

async function fetchHotSectors() {
  try {
    const r = await fetch(EM + '/clist/get?pn=1&pz=10&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:90+t:3&fields=f2,f3,f4,f12,f14&ut=bd1d9ddb04089700cf9c27f6f7426281', { next: { revalidate: 300 } })
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    return list.slice(0, 10).map((s: any) => ({
      name: s.f14 || '—',
      heat: Math.min(100, Math.max(0, Math.round(50 + Number(s.f3 || 0)))),
      change: Math.round(Number(s.f3)*100)/100,
      source: '东方财富概念板块',
    }))
  } catch { return null }
}

async function fetchNews() {
  try {
    const r = await fetch('https://newsapi.eastmoney.com/kuaixun/v1/getlist_101_ajaxResult_50_1_.html', { next: { revalidate: 300 } })
    const text = await r.text()
    const st = text.indexOf('{'), ed = text.lastIndexOf('}')
    if (st === -1 || ed === -1) return []
    let json: any
    try { json = JSON.parse(text.slice(st, ed + 1)) } catch { return [] }
    const list: any[] = json?.LivesList || []
    return list.slice(0, 10).map((item: any) => ({
      title: item.title || item.CONTENT || '',
      type: classify(item.title || item.CONTENT || ''),
      time: relTime(item.showtime || item.NOTIME || ''),
      related: extract(item.title || item.CONTENT || ''),
      source: '东方财富财经',
    }))
  } catch { return [] }
}

function guess(name: string) {
  const m: Record<string, string> = {'AI':'AI概念','算力':'算力爆发','芯片':'半导体','汽车':'新能源车','医药':'医疗反弹','军工':'军工订单','银行':'银行修复','白酒':'消费复苏','光伏':'光伏增长','锂电':'锂电出口','券商':'券商异动','房地产':'地产松绑'}
  for (const [k, v] of Object.entries(m)) { if (name.includes(k)) return v }
  return '板块轮动'
}

function classify(t: string) {
  if (t.includes('央行') || t.includes('证监会') || t.includes('财政部')) return '政策'
  if (t.includes('业绩') || t.includes('营收')) return '财报'
  return '行业'
}

function extract(t: string) {
  const tags: string[] = []
  ;['AI','新能源','半导体','医药','银行','芯片','锂电','军工','光伏','券商'].forEach(k => { if (t.includes(k)) tags.push(k) })
  return tags.slice(0, 3)
}

function relTime(ts: string) {
  if (!ts) return ''
  const d = new Date(ts)
  const h = Math.floor((Date.now() - d.getTime()) / 3600000)
  if (h < 1) return '刚刚'
  if (h < 24) return h + '小时前'
  return Math.floor(h / 24) + '天前'
}

export async function GET() {
  const [metalData, indices, limitUpStocks, hotSectors, news] = await Promise.all([
    fetchMetals(), fetchIndices(), fetchLimitUp(), fetchHotSectors(), fetchNews(),
  ])
  const updateTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  return NextResponse.json({
    updateTime,
    metalData: metalData || { gold: { name: '黄金', price: 0, change: 0, changePercent: 0, source: '演示数据' }, silver: null, note: 'API暂不可用' },
    stockData: indices || [{ name: '上证指数', code: '000001', price: 0, change: 0, changePercent: 0, source: '演示数据' }],
    limitUpStocks: limitUpStocks || [],
    hotSectors: hotSectors || [],
    news: news || [],
  })
}
