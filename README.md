# 每日投资参考

一个简洁美观的每日投资资讯网站，展示涨停股、贵金属行情、热门题材和利好消息。

## 功能

- 📊 贵金属行情（黄金、白银、美元指数）
- 📈 大盘指数（上证、深证、创业板、沪深300）
- 🔥 今日涨停股列表及涨停原因
- 💬 热门题材板块
- 📰 利好消息汇总

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build
```

## 数据更新

网站使用 `public/data.json` 作为数据源。

可以通过以下方式更新数据：
1. 手动更新 `public/data.json`
2. 配置 GitHub Actions 定时运行爬虫更新数据
3. 接入后端 API

## 部署

项目配置为静态导出 (Static Export)，可部署到：
- Vercel
- GitHub Pages
- 任意静态托管服务

## 免责声明

本项目仅供学习参考，不构成任何投资建议。投资有风险，入市需谨慎。
