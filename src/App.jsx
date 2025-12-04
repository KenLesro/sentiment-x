import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, TrendingUp, TrendingDown, Activity, Zap, 
  ShieldAlert, Cpu, X, Globe, BarChart3, Newspaper, Wifi, WifiOff
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

// -----------------------------------------------------------------------------
// 1. 模拟数据定义 (防止断网时页面空白)
// -----------------------------------------------------------------------------

const MOCK_HEADLINES = [
  { text: "BlackRock 比特币 ETF 交易量突破历史新高", sentiment: "positive" },
  { text: "美联储暗示将在下个季度维持利率不变", sentiment: "neutral" },
  { text: "某巨鲸刚刚向交易所转入 10,000 ETH", sentiment: "negative" },
  { text: "SEC 推迟了关于以太坊现货 ETF 的决议", sentiment: "negative" },
  { text: "MicroStrategy 再次购入 500 BTC", sentiment: "positive" },
  { text: "Ripple 赢得针对 SEC 的部分关键诉讼", sentiment: "positive" },
  { text: "通胀数据略高于预期，市场出现恐慌情绪", sentiment: "negative" },
  { text: "比特币哈希率创下历史新高", sentiment: "positive" },
];

const MOCK_HISTORY = [
  { timestamp: 1715472000, value: 65 },
  { timestamp: 1715385600, value: 58 },
  { timestamp: 1715299200, value: 45 },
  { timestamp: 1715212800, value: 42 },
  { timestamp: 1715126400, value: 50 },
  { timestamp: 1715040000, value: 55 },
  { timestamp: 1714953600, value: 72 },
];

// 生成新闻条目（修复了 ID 重复的 Bug）
const generateNewsItem = () => {
  const randomNews = MOCK_HEADLINES[Math.floor(Math.random() * MOCK_HEADLINES.length)];
  return {
    // 使用 时间戳 + 随机数 确保 ID 绝对唯一
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time: "Just now",
    text: randomNews.text,
    sentiment: randomNews.sentiment
  };
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// -----------------------------------------------------------------------------
// 2. UI 组件
// -----------------------------------------------------------------------------

// 组件 A: 资产详情弹窗 (Asset Modal)
const AssetModal = ({ asset, onClose }) => {
  if (!asset) return null;
  const isBtc = asset.symbol === "BTC";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X size={20} />
        </button>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-yellow-500 font-bold text-lg">
            {asset.symbol || '---'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{asset.name || 'Unknown'}</h3>
            <span className="text-slate-400 text-sm font-mono">Rank #{isBtc ? 1 : 2}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
             <div className="text-slate-500 text-xs uppercase mb-1">Current Price</div>
             <div className="text-2xl font-mono text-white font-bold">${asset.price?.toLocaleString() || '0.00'}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-xs uppercase mb-1">Market Cap</div>
                <div className="text-sm font-mono text-slate-300">{isBtc ? "$1.2T" : "$400B"}</div>
             </div>
             <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-xs uppercase mb-1">Volume (24h)</div>
                <div className="text-sm font-mono text-slate-300">{isBtc ? "$35B" : "$12B"}</div>
             </div>
          </div>
          
          <div className="p-3 bg-blue-900/20 border border-blue-900/30 rounded-lg text-xs text-blue-200 leading-relaxed">
              <strong>Analyst Note:</strong> {asset.symbol} shows strong support at current levels. {isBtc ? "Halving impact still playing out." : "Network activity remains high."}
          </div>
        </div>
        
        <button onClick={onClose} className="w-full mt-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors">
          Trade on Exchange
        </button>
      </div>
    </div>
  );
};

// 组件 B: 价格卡片 (Price Card)
const PriceCard = ({ symbol, name, price, change24h, loading, onClick }) => {
  const isPositive = (change24h || 0) >= 0;
  
  return (
    <div 
      onClick={onClick}
      className="relative group bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden transition-all duration-300 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] cursor-pointer active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full pointer-events-none" />
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-yellow-500 font-bold text-xs">
            {symbol || '---'}
          </div>
          <span className="text-slate-400 font-mono text-sm">{name || 'Loading...'}</span>
        </div>
        {loading ? (
          <div className="h-4 w-12 bg-slate-800 animate-pulse rounded" />
        ) : (
          <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {isPositive ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {change24h?.toFixed(2)}%
          </span>
        )}
      </div>
      
      <div className="mt-2 flex items-end justify-between">
        {loading ? (
          <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold text-white font-mono tracking-tighter">
            ${price?.toLocaleString()}
          </div>
        )}
        <div className="text-[10px] text-slate-600 font-mono group-hover:text-yellow-500/50 transition-colors">Tap for details</div>
      </div>
    </div>
  );
};

// 组件 C: 情绪仪表盘 (Sentiment Gauge)
const SentimentGauge = ({ value, text, classification, loading }) => {
  const safeValue = value || 50;
  // 计算旋转角度：0-100 映射到 -90deg 到 90deg
  const rotation = (safeValue / 100) * 180 - 90;

  const getColor = (val) => {
    if (val < 25) return 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'; // Extreme Fear
    if (val < 45) return 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]'; // Fear
    if (val < 55) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'; // Neutral
    if (val < 75) return 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]'; // Greed
    return 'text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,1)]'; // Extreme Greed
  };

  const colorClass = getColor(safeValue);

  return (
    <div className="flex flex-col items-center justify-center p-6 pb-0 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-t-2xl relative overflow-hidden">
        {/* 背景噪点特效 */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50"></div>

        <h3 className="text-slate-400 text-xs font-mono uppercase tracking-[0.2em] mb-6 flex items-center">
            <Activity size={14} className="mr-2 text-cyan-400" /> Market Sentiment
        </h3>

        <div className="relative w-64 h-32 mb-4 overflow-hidden">
            <div className="absolute bottom-0 w-64 h-32 rounded-t-full border-[16px] border-slate-800 box-border"></div>
            {/* 彩虹刻度环 */}
            <div className="absolute bottom-0 left-0 w-full h-full rounded-t-full opacity-30"
                 style={{
                     background: 'conic-gradient(from 180deg at 50% 100%, #ef4444 0deg, #f97316 45deg, #facc15 90deg, #4ade80 135deg, #10b981 180deg)'
                 }}
            >
               <div className="absolute bottom-0 left-[16px] right-[16px] top-[16px] bg-slate-900 rounded-t-full h-[calc(100%-16px)]"></div>
            </div>
            {/* 指针 */}
            <div 
                className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-transform duration-1000 ease-out z-10"
                style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            >
                <div className="w-4 h-4 bg-slate-200 rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-lg border-2 border-slate-900"></div>
            </div>
        </div>

        {/* 数值显示 */}
        <div className="text-center z-10 -mt-8 mb-4">
            {loading ? (
                 <div className="h-12 w-32 bg-slate-800 animate-pulse rounded mx-auto" />
            ) : (
                <>
                    <div className={`text-6xl font-black font-mono tracking-tighter transition-colors duration-500 ${colorClass}`}>
                        {safeValue}
                    </div>
                    <div className={`text-lg font-bold uppercase tracking-widest mt-1 ${colorClass.split(' ')[0]}`}>
                        {classification || 'NEUTRAL'}
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

// 组件 D: 趋势图表 (Trend Chart)
const TrendChart = ({ historyData }) => {
  const dataToRender = (historyData && historyData.length > 0) ? historyData : [];

  if (dataToRender.length === 0) return (
      <div className="bg-slate-900/80 h-32 flex items-center justify-center text-slate-600 text-xs border-x border-b border-slate-700/50 rounded-b-2xl">
        Waiting for data...
      </div>
  );

  // 反转数据以按时间顺序显示
  const chartData = [...dataToRender].reverse().map(item => ({
    date: formatTime(item.timestamp),
    value: parseInt(item.value)
  }));

  return (
    <div className="bg-slate-900/80 border-x border-b border-slate-700/50 rounded-b-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
           <BarChart3 size={12} className="mr-1" /> 7-Day Trend
        </h4>
      </div>
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#e2e8f0', fontSize: '12px' }}
              itemStyle={{ color: '#eab308' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#eab308" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 组件 E: 实时新闻流 (News Feed)
const NewsFeed = ({ news }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden">
       <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            <Newspaper size={14} className="mr-2 text-cyan-400" /> Live Feed
         </h3>
         <div className="flex items-center text-[10px] text-green-500">
           <span className="relative flex h-2 w-2 mr-1">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
           </span>
           Connected
         </div>
       </div>
       
       <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
         {news.map((item) => (
           <div key={item.id} className="flex items-start space-x-2 text-xs border-l-2 border-slate-800 pl-2 hover:border-slate-600 transition-colors">
             <span className="text-slate-500 font-mono whitespace-nowrap shrink-0">{item.time}</span>
             <div>
               <p className="text-slate-300 leading-snug">{item.text}</p>
               <span className={`text-[10px] px-1 rounded uppercase mt-1 inline-block ${
                 item.sentiment === 'positive' ? 'text-green-400 bg-green-900/20' : 
                 item.sentiment === 'negative' ? 'text-red-400 bg-red-900/20' : 'text-slate-400 bg-slate-800'
               }`}>
                 {item.sentiment}
               </span>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. 主应用程序 (Main App)
// -----------------------------------------------------------------------------

export default function App() {
  // 状态定义
  const [cryptoData, setCryptoData] = useState({ 
    btc: { symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0 }, 
    eth: { symbol: 'ETH', name: 'Ethereum', price: 0, change: 0 } 
  });
  
  const [sentiment, setSentiment] = useState({ value: 50, classification: 'Neutral', history: [] });
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // 弹窗状态
  const [selectedAsset, setSelectedAsset] = useState(null);

  // 1. 获取加密货币价格 (CoinGecko)
  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
      );
      if (!response.ok) throw new Error('Rate Limit/Network Error');
      const data = await response.json();
      setCryptoData({
        btc: { symbol: 'BTC', name: 'Bitcoin', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
        eth: { symbol: 'ETH', name: 'Ethereum', price: data.ethereum.usd, change: data.ethereum.usd_24h_change }
      });
    } catch (err) {
      console.warn("CoinGecko API failed, using fallback.");
      // 失败时使用兜底数据，开启离线模式
      setCryptoData({
        btc: { symbol: 'BTC', name: 'Bitcoin', price: 96450.20, change: 2.45 },
        eth: { symbol: 'ETH', name: 'Ethereum', price: 3450.12, change: -1.20 }
      });
      setIsOfflineMode(true);
    }
  }, []);

  // 2. 获取市场情绪 (Alternative.me)
  const fetchSentiment = useCallback(async () => {
    try {
      const response = await fetch('https://api.alternative.me/fng/?limit=7');
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        const today = data.data[0];
        setSentiment({
          value: parseInt(today.value),
          classification: today.value_classification,
          history: data.data
        });
      }
    } catch (err) {
      console.error("Sentiment API Error, using mock.");
      // 失败时使用模拟历史数据
      setSentiment({ 
          value: 78, 
          classification: 'Extreme Greed', 
          history: MOCK_HISTORY 
      });
      setIsOfflineMode(true);
    }
  }, []);

  // 3. 模拟新闻推送
  useEffect(() => {
    // 初始加载两条
    setNews([generateNewsItem(), generateNewsItem()]);
    
    const interval = setInterval(() => {
      setNews(prev => {
        const newItem = generateNewsItem();
        // 保持最多 10 条新闻，防止内存无限增长
        return [newItem, ...prev].slice(0, 10);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 刷新所有数据
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setIsOfflineMode(false); // 尝试重置为在线模式
    await Promise.all([fetchPrices(), fetchSentiment()]);
    setLastUpdated(new Date());
    setLoading(false);
  }, [fetchPrices, fetchSentiment]);

  // 初始加载 + 定时刷新
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 60000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-yellow-500/30 selection:text-yellow-200 pb-12 relative">
      
      {/* 弹窗层 */}
      {selectedAsset && <AssetModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}

      {/* 头部导航 */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    <Zap size={18} className="text-slate-900 fill-slate-900" />
                </div>
                <h1 className="font-bold text-xl tracking-tighter text-white">
                    SENTIMENT<span className="text-yellow-500">-X</span>
                </h1>
            </div>
            
            <button 
                onClick={refreshAll}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors active:scale-95"
                title="Refresh Data"
            >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        
        {/* 状态栏 */}
        <div className="flex justify-between items-center text-xs text-slate-500 font-mono bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
            <span className="flex items-center">
                <Globe size={12} className="mr-1.5 text-slate-400"/> 
                GLOBAL MARKETS
            </span>
            <span className={`flex items-center ${isOfflineMode ? 'text-yellow-500' : 'text-green-500'}`}>
                {isOfflineMode ? (
                   <><WifiOff size={12} className="mr-1.5"/> DEMO MODE</>
                ) : (
                   <><Wifi size={12} className="mr-1.5"/> LIVE DATA</>
                )}
            </span>
        </div>

        {/* 核心区域：仪表盘 + 趋势图 */}
        <section>
            <SentimentGauge 
                value={sentiment.value} 
                classification={sentiment.classification}
                loading={loading}
            />
            <TrendChart historyData={sentiment.history} />
        </section>

        {/* 新闻流 */}
        <section>
           <NewsFeed news={news} />
        </section>

        {/* 资产列表 (可点击) */}
        <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <ShieldAlert size={14} className="mr-2" /> Watchlist
            </h2>
            <div className="grid grid-cols-1 gap-3">
                <PriceCard 
                    {...cryptoData.btc}
                    loading={loading}
                    onClick={() => setSelectedAsset(cryptoData.btc)}
                />
                <PriceCard 
                    {...cryptoData.eth}
                    loading={loading}
                    onClick={() => setSelectedAsset(cryptoData.eth)}
                />
            </div>
        </section>

        {/* 离线提示 */}
        {isOfflineMode && (
            <div className="text-center p-2 text-[10px] text-yellow-500/50 font-mono">
                * Data is currently simulated due to network restrictions.
            </div>
        )}

        <footer className="pt-8 text-center opacity-30 pb-8">
            <div className="w-12 h-1 bg-slate-800 mx-auto rounded-full mb-4"></div>
            <p className="text-[10px] text-slate-500">
                SENTIMENT-X PHASE 2 <br/>
                PROTOTYPE BUILD
            </p>
        </footer>

      </main>
      
      {/* 自定义滚动条样式 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}