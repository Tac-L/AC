import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const CATEGORIES = [
  { key: 'live', name: '视讯', icon: '🎲' },
  { key: 'slots', name: '电子', icon: '🎰' },
  { key: 'fish', name: '捕鱼', icon: '🐬' },
  { key: 'cards', name: '棋牌', icon: '🃏' },
];

const PLATFORMS = {
  live: [
    { name: 'CHOICE视讯', logo: 'CHOICE', color: '#16a34a' },
    { name: 'OG视讯', logo: 'OG', color: '#f97316' },
    { name: 'BBIN视讯', logo: 'bbin', color: '#dc2626' },
    { name: 'DG视讯', logo: 'DG', color: '#a16207' },
    { name: 'BG视讯', logo: 'BG', color: '#2563eb' },
    { name: 'EV视讯', logo: 'EV', color: '#1e293b' },
    { name: 'DB视讯', logo: 'DB', color: '#db2777' },
    { name: 'NAI视讯', logo: 'NAI', color: '#3b82f6' },
  ],
  slots: [
    { name: 'PG电子', logo: 'PG', color: '#7c3aed' },
    { name: 'PP电子', logo: 'PP', color: '#f59e0b' },
    { name: 'MG电子', logo: 'MG', color: '#dc2626' },
    { name: 'JDB电子', logo: 'JDB', color: '#2563eb' },
    { name: 'CQ9电子', logo: 'CQ9', color: '#16a34a' },
    { name: 'FC电子', logo: 'FC', color: '#0ea5e9' },
  ],
  fish: [
    { name: 'JDB捕鱼', logo: 'JDB', color: '#2563eb' },
    { name: 'CQ9捕鱼', logo: 'CQ9', color: '#16a34a' },
    { name: 'BG捕鱼', logo: 'BG', color: '#0891b2' },
    { name: 'MG捕鱼', logo: 'MG', color: '#dc2626' },
  ],
  cards: [
    { name: '开元棋牌', logo: 'KY', color: '#dc2626' },
    { name: 'AG棋牌', logo: 'AG', color: '#a16207' },
    { name: 'leg棋牌', logo: 'leg', color: '#16a34a' },
    { name: 'VG棋牌', logo: 'VG', color: '#2563eb' },
  ],
};

export default function PageRebate() {
  const { goBack, showToast } = useApp();
  const [activeCat, setActiveCat] = useState('live');

  const handleRefresh = () => {
    showToast('返水金额已刷新：当前无可领取返水！');
  };

  const handleClaimAll = () => {
    showToast('提示：暂无可领取的返水金额！');
  };

  const handlePlatformClick = (name) => {
    showToast(`【${name}】暂无有效投注，无返水可领取！`);
  };

  return (
    <div className="app-page active" id="page-rebate">
      {/* Header Bar */}
      <div className="rebate-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-rebate-back" onClick={() => goBack('page-profile')}></i>
        <span className="rebate-header-title">自助返水</span>
        <div></div>
      </div>

      {/* Claimable Summary Card */}
      <div className="rebate-summary-card">
        <div className="rebate-summary-left">
          <span className="rebate-summary-label">可领取返水金额：</span>
          <span className="rebate-summary-amount">0.00</span>
          <i className="fa-solid fa-rotate rebate-refresh-icon" onClick={handleRefresh}></i>
        </div>
        <button className="rebate-claim-all-btn" disabled onClick={handleClaimAll}>一键领取</button>
      </div>

      {/* Body: category tabs + platform list */}
      <div className="rebate-body">
        <div className="rebate-cat-tabs">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className={`rebate-cat-tab ${activeCat === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCat(cat.key)}
            >
              <span className="rebate-cat-icon">{cat.icon}</span>
              <span className="rebate-cat-name">{cat.name}</span>
            </div>
          ))}
        </div>

        <div className="rebate-platform-list">
          {PLATFORMS[activeCat].map((p, idx) => (
            <div key={idx} className="rebate-platform-card" onClick={() => handlePlatformClick(p.name)}>
              <div className="rebate-platform-logo" style={{ backgroundColor: p.color }}>
                {p.logo}
              </div>
              <div className="rebate-platform-meta">
                <span className="rebate-platform-name">{p.name}</span>
                <span className="rebate-platform-ratio">返水比例 0%</span>
              </div>
              <div className="rebate-platform-stats">
                <span className="rebate-stat-line">有效投注 <b>0</b></span>
                <span className="rebate-stat-line">可领取 <b className="rebate-claimable">0</b></span>
              </div>
              <i className="fa-solid fa-chevron-right rebate-platform-arrow"></i>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
