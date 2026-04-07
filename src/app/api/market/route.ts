import { NextResponse } from 'next/server'
import iconv from 'iconv-lite'

const EM = 'https://push2.eastmoney.com/api/qt'

// === 腾讯行情 API (GBK) ===
async function tencentFetch(path: string): Promise<string> {
  const res = await fetch('https://qt.gtimg.cn/q=' + path, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://finance.qq.com/' },
    next: { revalidate: 60 }
  })
  const buf = await res.arrayBuffer()
  return iconv.decode(Buffer.from(buf), 'gbk')
}

async function fetchIndices() {
  try {
    const txt = await tencentFetch('s_sh000001,s_sz399001,s_sz399006,s_sh000300,s_sz399905')
    const result: any[] = []
    txt.trim().split('\n').forEach((line: string) => {
      const p = line.split('~')
      if (p.length > 35 && p[1]) {
        const price = parseFloat(p[3]) || 0
        const prev = parseFloat(p[4]) || 0
        result.push({
          code: p[2],
          name: p[1].trim(),
          price: Math.round(price * 100) / 100,
          change: Math.round((price - prev) * 100) / 100,
          changePercent: Math.round((price - prev) / prev * 10000) / 100,
          source: '腾讯行情'
        })
      }
    })
    return result
  } catch { return null }
}

async function fetchGold() {
  try {
    const txt = await tencentFetch('sz159519,sh518800,sz159629,sz161725')
    const items: any[] = []
    txt.trim().split('\n').forEach((line: string) => {
      const p = line.split('~')
      if (p.length > 35 && p[1]) {
        const price = parseFloat(p[3]) || 0
        const prev = parseFloat(p[4]) || 0
        items.push({
          name: p[1].trim(),
          price: Math.round(price * 1000) / 1000,
          change: Math.round((price - prev) * 1000) / 1000,
          changePercent: Math.round((price - prev) / prev * 10000) / 100,
          source: '腾讯行情',
          note: '黄金ETF（非现货金）'
        })
      }
    })
    if (items.length === 0) return null
    return {
      gold: items[0] || null,
      silver: items[1] || items[2] || null,
      note: '以上为黄金ETF数据，非国际现货价格'
    }
  } catch { return null }
}

async function fetchHotSectors() {
  try {
    const r = await fetch(
      EM + '/clist/get?pn=1&pz=10&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:90+t:3&fields=f2,f3,f4,f12,f14&ut=bd1d9ddb04089700cf9c27f6f7426281',
      { next: { revalidate: 300 } }
    )
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    return list.slice(0, 10).map((s: any) => ({
      name: s.f14 || '—',
      heat: Math.min(100, Math.max(0, Math.round(50 + Number(s.f3 || 0)))),
      change: Math.round(Number(s.f3) * 100) / 100,
      source: '东方财富'
    }))
  } catch { return null }
}

async function fetchLimitUp() {
  try {
    const fs = 'm:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23'
    const r = await fetch(
      EM + '/clist/get?pn=1&pz=30&po=1&np=1&fltt=2&invt=2&fid=f3&fs=' + encodeURIComponent(fs) + '&fields=f2,f3,f4,f12,f14&ut=bd1d9ddb04089700cf9c27f6f7426281',
      { next: { revalidate: 600 } }
    )
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    return list.filter((s: any) => Number(s.f3) >= 9.5).slice(0, 15).map((s: any) => ({
      code: s.f12, name: s.f14, price: s.f2,
      change: Math.round(Number(s.f4) * 100) / 100,
      changePercent: Math.round(Number(s.f3) * 100) / 100,
      reason: guess(s.f14 || ''), source: '东方财富'
    }))
  } catch { return null }
}

async function fetchNews() {
  try {
    const r = await fetch(
      'https://newsapi.eastmoney.com/kuaixun/v1/getlist_101_ajaxResult_50_1_.html',
      { next: { revalidate: 300 } }
    )
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
      source: '东方财富'
    }))
  } catch { return [] }
}

function guess(name: string) {
  const m: Record<string, string> = {
    'AI':'AI概念','算力':'算力爆发','芯片':'半导体','汽车':'新能源车',
    '医药':'医疗反弹','军工':'军工订单','银行':'银行修复','白酒':'消费复苏',
    '光伏':'光伏增长','锂电':'锂电出口','券商':'券商异动','房地产':'地产松绑'
  }
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
  ;['AI','新能源','半导体','医药','银行','芯片','锂电','军工','光伏','券商'].forEach((k: string) => { if (t.includes(k)) tags.push(k) })
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
  const [goldData, indices, limitUpStocks, hotSectors, news] = await Promise.all([
    fetchGold(), fetchIndices(), fetchLimitUp(), fetchHotSectors(), fetchNews()
  ])
  const updateTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  return NextResponse.json({
    updateTime,
    metalData: goldData || {
      gold: { name: '黄金ETF', price: 0, change: 0, changePercent: 0, source: '演示', note: 'API暂不可用' },
      silver: { name: '白银ETF', price: 0, change: 0, changePercent: 0, source: '演示', note: 'API暂不可用' },
      note: 'API暂不可用'
    },
    stockData: indices || [],
    limitUpStocks: limitUpStocks || [],
    hotSectors: hotSectors || [],
    news: news || []
  })
}
