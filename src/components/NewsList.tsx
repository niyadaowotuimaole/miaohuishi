'use client'

import { Newspaper, Tag } from 'lucide-react'

interface NewsListProps {
  news: Array<{
    title: string
    type: string
    time: string
    related: string[]
  }>
}

export default function NewsList({ news }: NewsListProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case '政策':
        return 'bg-blue-500/20 text-blue-400'
      case '行业':
        return 'bg-green-500/20 text-green-400'
      case '公司':
        return 'bg-purple-500/20 text-purple-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">利好消息</h2>
      </div>
      
      <div className="space-y-4">
        {news.map((item, index) => (
          <div 
            key={index}
            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-white text-sm leading-relaxed flex-1">
                {item.title}
              </h3>
              <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${getTypeColor(item.type)}`}>
                {item.type}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 flex-wrap">
                <Tag className="w-3 h-3 text-gray-500" />
                {item.related.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
