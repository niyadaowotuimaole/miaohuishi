#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
每日数据爬虫脚本
用于获取：涨停股、贵金属、大盘指数等数据
"""

import json
import requests
from datetime import datetime

# 演示数据 - 实际使用时替换为真实爬虫逻辑
def fetch_data():
    """
    从东方财富、同花顺等平台获取数据
    这里先用演示数据
    """
    data = {
        "updateTime": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "metals": {
            "gold": { "price": 2345.67, "change": 12.34, "changePercent": 0.53 },
            "silver": { "price": 27.45, "change": -0.23, "changePercent": -0.83 },
            "usdIndex": { "price": 104.32, "change": -0.15, "changePercent": -0.14 }
        },
        "indices": [
            { "name": "上证指数", "code": "000001", "price": 3047.32, "change": 15.67, "changePercent": 0.52 },
            { "name": "深证成指", "code": "399001", "price": 9845.21, "change": -23.45, "changePercent": -0.24 },
            { "name": "创业板", "code": "399006", "price": 1856.78, "change": 32.11, "changePercent": 1.76 },
            { "name": "沪深300", "code": "000300", "price": 3521.45, "change": 8.92, "changePercent": 0.25 }
        ],
        "limitUpStocks": [
            { "code": "000001", "name": "平安银行", "reason": "银行板块利好", "sector": "银行", "time": "09:30" },
            { "code": "600519", "name": "贵州茅台", "reason": "业绩超预期", "sector": "白酒", "time": "09:45" },
            { "code": "002594", "name": "比亚迪", "reason": "销量大增", "sector": "新能源汽车", "time": "10:15" },
            { "code": "300750", "name": "宁德时代", "reason": "电池技术突破", "sector": "锂电池", "time": "10:30" },
            { "code": "688981", "name": "中芯国际", "reason": "国产替代加速", "sector": "半导体", "time": "11:00" }
        ],
        "hotSectors": [
            { "name": "AI概念", "stocks": 45, "heat": 98 },
            { "name": "新能源汽车", "stocks": 32, "heat": 85 },
            { "name": "半导体", "stocks": 28, "heat": 82 },
            { "name": "医疗健康", "stocks": 22, "heat": 75 },
            { "name": "银行", "stocks": 18, "heat": 70 }
        ],
        "news": [
            { "title": "央行降准0.25个百分点，释放长期资金约5000亿", "type": "政策", "time": "2小时前", "related": ["银行", "券商"] },
            { "title": "工信部发布AI产业发展规划，这些板块迎利好", "type": "行业", "time": "4小时前", "related": ["AI", "科技"] },
            { "title": "宁德时代发布神行PLUS电池，续航超1000公里", "type": "公司", "time": "5小时前", "related": ["宁德时代", "新能源"] }
        ]
    }
    return data

def main():
    print("开始获取数据...")
    data = fetch_data()
    
    with open('public/data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"数据已更新: {data['updateTime']}")

if __name__ == '__main__':
    main()
