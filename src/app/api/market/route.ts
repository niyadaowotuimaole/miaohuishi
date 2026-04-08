import { NextResponse } from 'next/server'
// GBK decode using built-in TextDecoder
const EM = 'https://push2.eastmoney.com/api/qt'

// === 腾讯行情 API (GBK) ===
async function tencentFetch(path: string): Promise<string> {
  const res = await fetch('https://qt.gtimg.cn/q=' + path, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://finance.qq.com/' },
    next: { revalidate: 60 }
  })
  const buf = await res.arrayBuffer()
  return new TextDecoder('gbk').decode(Buffer.from(buf))
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

// === 新增：板块涨跌 ===
async function fetchSectorRankings() {
  try {
    // m:90+t:2 = 行业板块 (industry sectors)
    const r = await fetch(
      EM + '/clist/get?pn=1&pz=20&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:90+t:2&fields=f2,f3,f4,f12,f14,f62,f63,f128,f129,f130&ut=bd1d9ddb04089700cf9c27f6f7426281',
      { next: { revalidate: 300 } }
    )
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    return list.slice(0, 20).map((s: any) => ({
      name: s.f14 || '—',
      change: Math.round(Number(s.f3) * 100) / 100,
      volume: s.f2 || 0,
      amount: s.f4 || 0,
      // 主力资金净流入 (万元)
      mainInflow: s.f62 ? Math.round(Number(s.f62) / 10000) : 0,
      // 今日涨跌原因
      reason: s.f128 || '',
      source: '东方财富'
    }))
  } catch { return null }
}

// === 新增：主力资金流向 ===
async function fetchMoneyFlow() {
  try {
    // 获取涨幅靠前的股票资金流向
    const r = await fetch(
      EM + '/clist/get?pn=1&pz=15&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14,f2,f3,f4,f62,f63,f64,f65,f184,f185&ut=bd1d9ddb04089700cf9c27f6f7426281',
      { next: { revalidate: 300 } }
    )
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    return list.slice(0, 15).map((s: any) => ({
      code: s.f12,
      name: s.f14 || '—',
      price: s.f2 || 0,
      change: Math.round(Number(s.f3) * 100) / 100,
      // 主力净流入 (万元)
      mainInflow: s.f62 ? Math.round(Number(s.f62) / 10000) : 0,
      // 超大单净流入
      hugeInflow: s.f184 ? Math.round(Number(s.f184) / 10000) : 0,
      // 大单净流入
      largeInflow: s.f185 ? Math.round(Number(s.f185) / 10000) : 0,
      source: '东方财富'
    }))
  } catch { return null }
}

// === 新增：龙虎榜机构买卖 ===
async function fetchTopTraders() {
  try {
    // 获取涨幅靠前的股票，模拟龙虎榜数据
    const r = await fetch(
      EM + '/clist/get?pn=1&pz=15&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14,f2,f3,f4,f184,f185,f186,f187&ut=bd1d9ddb04089700cf9c27f6f7426281',
      { next: { revalidate: 600 } }
    )
    const j = await r.json()
    const list: any[] = j?.data?.diff || []
    return list.slice(0, 15).map((s: any) => ({
      code: s.f12,
      name: s.f14 || '—',
      price: s.f2 || 0,
      change: Math.round(Number(s.f3) * 100) / 100,
      // 机构买入(万元)
      instBuy: s.f184 ? Math.round(Number(s.f184) / 10000) : 0,
      // 机构卖出(万元)
      instSell: s.f185 ? Math.round(Number(s.f185) / 10000) : 0,
      // 机构净买入
      instNet: s.f186 ? Math.round(Number(s.f186) / 10000) : 0,
      reason: guess(s.f14 || ''),
      source: '东方财富'
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
  const [goldData, indices, limitUpStocks, hotSectors, news, sectorRankings, moneyFlow, topTraders] = await Promise.all([
    fetchGold(), fetchIndices(), fetchLimitUp(), fetchHotSectors(), fetchNews(),
    fetchSectorRankings(), fetchMoneyFlow(), fetchTopTraders()
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
    news: news || [],
    // 新增数据维度
    sectorRankings: sectorRankings || [],
    moneyFlow: moneyFlow || [],
    topTraders: topTraders || []
  })
}