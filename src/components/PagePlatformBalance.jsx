import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { key: 'all', name: '全部', icon: 'fa-solid fa-clover' },
  { key: 'slots', name: '电子', icon: 'fa-solid fa-dice-five' },
  { key: 'live', name: '真人', icon: 'fa-solid fa-dice' },
  { key: 'sports', name: '体育', icon: 'fa-solid fa-futbol' },
  { key: 'fish', name: '捕鱼', icon: 'fa-solid fa-fish' },
  { key: 'cards', name: '棋牌', icon: 'fa-solid fa-chess' },
  { key: 'lottery', name: '彩票', icon: 'fa-solid fa-ticket' },
];

const PLATFORMS = [
  { name: 'PG电子', logo: 'PG', color: '#7c3aed', cat: 'slots' },
  { name: 'CHOICE娱乐城', logo: 'C', color: '#16a34a', cat: 'live' },
  { name: 'MG娱乐城', logo: 'MG', color: '#2563eb', cat: 'slots' },
  { name: 'KY娱乐城', logo: 'KY', color: '#dc2626', cat: 'cards' },
  { name: 'BBIN娱乐城', logo: 'bbin', color: '#dc2626', cat: 'live' },
  { name: 'BG视讯', logo: 'BG', color: '#2563eb', cat: 'live' },
  { name: 'BTI体育', logo: 'BTI', color: '#ec4899', cat: 'sports' },
  { name: 'CQ9娱乐城', logo: 'cq9', color: '#f59e0b', cat: 'slots' },
  { name: 'DS电子', logo: 'DS', color: '#0891b2', cat: 'slots' },
  { name: 'EV视讯', logo: 'EV', color: '#1e293b', cat: 'live' },
  { name: 'FC娱乐城', logo: 'FC', color: '#7c3aed', cat: 'slots' },
  { name: 'FG娱乐城', logo: 'FG', color: '#16a34a', cat: 'slots' },
  { name: 'FT体育', logo: 'FT', color: '#2563eb', cat: 'sports' },
  { name: 'HB电子', logo: 'HB', color: '#ea580c', cat: 'slots' },
  { name: 'JDB捕鱼', logo: 'JDB', color: '#2563eb', cat: 'fish' },
  { name: 'CQ9捕鱼', logo: 'cq9', color: '#16a34a', cat: 'fish' },
  { name: 'AG棋牌', logo: 'AG', color: '#a16207', cat: 'cards' },
  { name: '彩票投注', logo: '彩', color: '#dc2626', cat: 'lottery' },
];

export default function PagePlatformBalance() {
  const { goBack, showToast } = useApp();
  const [activeCat, setActiveCat] = useState('all');

  const handleRefresh = () => {
    showToast('系统余额已刷新：当前余额 0.00！');
  };

  const handleCollect = () => {
    showToast('一键归集成功！所有游戏厂商额度已全部归集至系统主账户。');
  };

  const handlePlatformClick = (name) => {
    showToast(`【${name}】当前余额为 0.00，无需归集！`);
  };

  const visiblePlatforms =
    activeCat === 'all' ? PLATFORMS : PLATFORMS.filter((p) => p.cat === activeCat);

  return (
    <div className="app-page active" id="page-platform-balance">
      {/* Header Bar */}
      <div className="pbal-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-pbal-back" onClick={() => goBack('page-profile')}></i>
        <span className="pbal-header-title">平台余额</span>
        <div></div>
      </div>

      <div className="scroll-content" style={{ padding: '12px', paddingBottom: '30px' }}>
        {/* System balance + collect card */}
        <div className="pbal-summary-card">
          <div className="pbal-summary-left">
            <div className="pbal-summary-row">
              <span className="pbal-summary-label">系统余额：</span>
              <span className="pbal-summary-amount">0.00</span>
              <i className="fa-solid fa-rotate pbal-refresh-icon" onClick={handleRefresh}></i>
            </div>
            <span className="pbal-summary-hint">部分游戏厂商只能取整数部分(即不含小数点)</span>
          </div>
          <button className="pbal-collect-btn" id="btn-pbal-collect" onClick={handleCollect}>一键归集</button>
        </div>

        {/* Body: left category rail + vendor grid */}
        <div className="pbal-body">
          <div className="pbal-cat-rail">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                className={`pbal-cat-tab ${activeCat === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCat(cat.key)}
              >
                <i className={`${cat.icon} pbal-cat-icon`}></i>
                <span className="pbal-cat-name">{cat.name}</span>
              </div>
            ))}
          </div>

          <div className="pbal-vendor-grid">
            {visiblePlatforms.map((p, idx) => (
              <div key={idx} className="pbal-vendor-card" onClick={() => handlePlatformClick(p.name)}>
                <div className="pbal-vendor-head">
                  <div className="pbal-vendor-logo" style={{ backgroundColor: p.color }}>
                    {p.logo}
                  </div>
                  <span className="pbal-vendor-name">{p.name}</span>
                </div>
                <span className="pbal-vendor-amount">0.00</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
