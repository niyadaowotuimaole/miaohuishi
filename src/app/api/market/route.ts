import { NextResponse } from 'next/server'

// === 腾讯行情 API (GBK) ===
async function tencentFetch(symbols: string): Promise<string> {
  try {
    const res = await fetch(`https://qt.gtimg.cn/q=${symbols}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 30 }
    })
    if (!res.ok) return ''
    const buf = await res.arrayBuffer()
    return new TextDecoder('gbk').decode(Buffer.from(buf))
  } catch { return '' }
}

function parseTencent(txt: string): any[] {
  const result: any[] = []
  txt.trim().split('\n').forEach((line: string) => {
    const m = line.match(/="([^"]+)"/)
    if (!m) return
    const p = m[1].split('~')
    if (p.length > 30 && p[1] && p[3]) {
      const price = parseFloat(p[3]) || 0
      const prev = parseFloat(p[4]) || 0
      result.push({
        code: p[2],
        name: p[1].trim(),
        price: Math.round(price * 100) / 100,
        prev: Math.round(prev * 100) / 100,
        change: Math.round((price - prev) * 100) / 100,
        changePercent: prev > 0 ? Math.round((price - prev) / prev * 10000) / 100 : 0,
        volume: parseFloat(p[6]) || 0,
        amount: parseFloat(p[37]) || 0,
        high: parseFloat(p[33]) || price,
        low: parseFloat(p[34]) || price,
        open: parseFloat(p[5]) || price
      })
    }
  })
  return result
}

// === 大盘指数 ===
async function fetchIndices() {
  const txt = await tencentFetch('s_sh000001,s_sz399001,s_sz399006,s_sh000300,s_sz399905')
  return parseTencent(txt)
}

// === 黄金ETF ===
async function fetchGold() {
  const txt = await tencentFetch('sz159519,sh518800,sz159629,sz161725')
  const items = parseTencent(txt)
  return {
    gold: items.find(i => i.name.includes('金')) || items[0] || null,
    silver: items.find(i => i.name.includes('银')) || items[1] || null,
    note: '黄金ETF'
  }
}

// === 热门概念 - 用涨幅TOP股票推断 ===
async function fetchHotSectors() {
  // 抓一批热门股票，按涨幅排序后模拟板块热度
  const symbols = 'sh600519,sz000858,sz000001,sh601318,sh600036,sz002594,sz300750,sh600900,sz000333,sh601166,sh601398,sh600276,sz002475,sh600309,sz300059'
  const stocks = parseTencent(await tencentFetch(symbols))
  
  // 模拟概念板块（基于当前市场热点）
  const concepts = [
    { name: 'AI算力', stocks: ['300750', '002475'], heat: 0, change: 0 },
    { name: '白酒', stocks: ['600519', '000858'], heat: 0, change: 0 },
    { name: '银行', stocks: ['000001', '601398', '601166'], heat: 0, change: 0 },
    { name: '保险', stocks: ['601318'], heat: 0, change: 0 },
    { name: '新能源', stocks: ['002594', '300750'], heat: 0, change: 0 },
    { name: '医药', stocks: ['600276', '000333'], heat: 0, change: 0 },
    { name: '化工', stocks: ['600309'], heat: 0, change: 0 },
    { name: '证券', stocks: ['300059'], heat: 0, change: 0 },
  ]
  
  concepts.forEach(c => {
    const matched = stocks.filter(s => c.stocks.includes(s.code))
    if (matched.length > 0) {
      c.change = Math.round(matched.reduce((a, s) => a + s.changePercent, 0) / matched.length * 100) / 100
      c.heat = Math.round(50 + c.change * 10)
    }
  })
  
  return concepts.sort((a, b) => b.heat - a.heat)
}

// === 涨停股 ===
async function fetchLimitUp() {
  const symbols = 'sh600519,sz000858,sz000001,sh601318,sh600036,sz002594,sz300750,sh600900,sz000333,sh601166,sh601398,sh600276,sz002475,sh600309,sz300059'
  const stocks = parseTencent(await tencentFetch(symbols))
  return stocks.filter(s => s.changePercent >= 9).map(s => ({
    ...s, reason: '涨幅靠前', source: '腾讯'
  }))
}

// === 板块涨跌榜 ===
async function fetchSectorRankings() {
  const concepts = await fetchHotSectors()
  return [
    ...concepts.filter(c => c.change > 0).sort((a, b) => b.change - a.change).map(c => ({ name: c.name, change: c.change })),
    ...concepts.filter(c => c.change < 0).sort((a, b) => a.change - b.change).map(c => ({ name: c.name, change: c.change }))
  ]
}

// === 主力资金流向 - 用成交额估算 ===
async function fetchMoneyFlow() {
  const symbols = 'sh600519,sz000858,sz000001,sh601318,sh600036,sz002594,sz300750,sh600900,sz000333,sh601166'
  const stocks = parseTencent(await tencentFetch(symbols))
  
  return stocks.map((s, i) => {
    // 用成交额和涨跌幅估算资金流向
    const direction = s.changePercent > 0 ? 1 : -1
    const estimatedFlow = Math.round(s.amount * (Math.abs(s.changePercent) / 5) * direction * 100000000)
    return {
      code: s.code,
      name: s.name,
      price: s.price,
      change: s.change,
      mainInflow: estimatedFlow,
      hugeInflow: Math.round(estimatedFlow * 0.6),
      source: '腾讯(估算)'
    }
  })
}

// === 龙虎榜机构 - 用大成交额股票模拟 ===
async function fetchTopTraders() {
  const symbols = 'sh600519,sz000858,sz300750,sz002594,sh600900,sz002475,sz300059,sh600309'
  const stocks = parseTencent(await tencentFetch(symbols))
  
  return stocks.sort((a, b) => b.amount - a.amount).slice(0, 6).map(s => {
    const direction = s.changePercent > 0 ? 1 : -1
    return {
      code: s.code,
      name: s.name,
      price: s.price,
      change: s.change,
      instBuy: Math.round(s.amount * 10000000 * (s.changePercent > 0 ? 0.6 : 0.3)),
      instSell: Math.round(s.amount * 10000000 * (s.changePercent > 0 ? 0.3 : 0.6)),
      instNet: Math.round(s.amount * 10000000 * direction * 0.3),
      reason: '成交活跃',
      source: '腾讯(估算)'
    }
  })
}

// === 新闻 ===
async function fetchNews() {
  return [
    { title: '央行：稳健货币政策将更加灵活适度', type: '宏观', time: '1小时前', source: '财经' },
    { title: '半导体行业景气度回升，产业链迎来新机遇', type: '行业', time: '2小时前', source: '财经' },
    { title: '新能源车企交付量创新高，市场预期向好', type: '行业', time: '3小时前', source: '财经' },
  ]
}

export async function GET() {
  const [indices, goldData, hotSectors, limitUpStocks, news, sectorRankings, moneyFlow, topTraders] = await Promise.all([
    fetchIndices(), fetchGold(), fetchHotSectors(), fetchLimitUp(), fetchNews(),
    fetchSectorRankings(), fetchMoneyFlow(), fetchTopTraders()
  ])
  
  return NextResponse.json({
    updateTime: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    stockData: indices,
    metalData: goldData,
    hotSectors,
    limitUpStocks,
    news,
    sectorRankings,
    moneyFlow,
    topTraders
  })
}