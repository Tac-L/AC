import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageBetRecords() {
  const { goBack, showToast, betRecordsTab } = useApp();

  // Active tab: 'bets' | 'unsettled' | 'transactions'
  const [activeTab, setActiveTab] = useState(betRecordsTab || 'bets');

  const handleQuery = () => {
    showToast('查询完成：当前条件下暂无记录！');
  };

  const handleReset = () => {
    showToast('查询条件已重置！');
  };

  const handleSelect = (label) => {
    showToast(`提示：【${label}】选择功能正在开发中！`);
  };

  const handleMoreConditions = () => {
    showToast('提示：更多查询条件正在开发中！');
  };

  const tabs = [
    { key: 'bets', label: '投注记录' },
    { key: 'unsettled', label: '未结算注单' },
    { key: 'transactions', label: '交易记录' }
  ];

  return (
    <div className="app-page active" id="page-bet-records">
      {/* Header Bar */}
      <div className="bet-records-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-bet-records-back" onClick={() => goBack('page-profile')}></i>
        <span className="bet-records-header-title">详细记录</span>
        <div></div> {/* Spacer for flex-between alignment */}
      </div>

      {/* Tabs Row */}
      <div className="bet-records-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`bet-records-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {activeTab === 'transactions' ? (
        <div className="scroll-content" style={{ paddingBottom: '30px' }}>
          {/* Filter Card */}
          <div className="bet-records-filter-card">
            <div className="bet-records-filter-row" onClick={() => handleSelect('交易类型')}>
              <span className="filter-label">交易类型</span>
              <span className="filter-value">全部</span>
              <i className="fa-solid fa-chevron-right filter-arrow"></i>
            </div>
            <div className="bet-records-filter-row" onClick={() => handleSelect('交易日期')}>
              <span className="filter-label">交易日期</span>
              <span className="filter-value">2026/06/10 – 2026/06/12</span>
              <i className="fa-solid fa-chevron-right filter-arrow"></i>
            </div>
          </div>

          {/* Search Button */}
          <button className="bet-records-search-btn" onClick={handleQuery}>
            <i className="fa-solid fa-magnifying-glass"></i> 搜索
          </button>

          {/* Summary Bar */}
          <div className="bet-records-summary-bar">
            <div className="summary-item">
              <span className="summary-label">总交易额度：</span>
              <span className="summary-value blue">¥0.00</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">总优惠额度：</span>
              <span className="summary-value green">¥0.00</span>
            </div>
          </div>

          {/* Empty State Footer */}
          <div className="bet-records-empty-footer">没有更多了</div>
        </div>
      ) : (
        <div className="scroll-content" style={{ paddingBottom: '30px' }}>
          {/* Filter Card */}
          <div className="bet-records-filter-card">
            <div className="bet-records-filter-row" onClick={() => handleSelect('投注日期')}>
              <span className="filter-label">投注日期</span>
              <span className="filter-value">2026/06/10 – 2026/06/12</span>
              <i className="fa-solid fa-chevron-right filter-arrow"></i>
            </div>
            <div className="bet-records-filter-row" onClick={() => handleSelect('游戏厂商')}>
              <span className="filter-label">游戏厂商</span>
              <span className="filter-value placeholder">点击选择游戏厂商</span>
              <i className="fa-solid fa-chevron-right filter-arrow"></i>
            </div>
            <div className="bet-records-filter-row" onClick={() => handleSelect('游戏平台')}>
              <span className="filter-label">游戏平台</span>
              <span className="filter-value placeholder">点击选择游戏平台</span>
              <i className="fa-solid fa-chevron-right filter-arrow"></i>
            </div>
          </div>

          {/* Actions Row */}
          <div className="bet-records-actions-row">
            <span className="bet-records-more-conditions" onClick={handleMoreConditions}>更多查询条件</span>
            <div className="bet-records-action-buttons">
              <button className="bet-records-query-btn" onClick={handleQuery}>查询</button>
              <button className="bet-records-reset-btn" onClick={handleReset}>重置</button>
            </div>
          </div>

          {/* Summary Bar */}
          <div className="bet-records-summary-bar">
            <div className="summary-item">
              <span className="summary-label">有效投注额：</span>
              <span className="summary-value blue">¥0.00</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">损益：</span>
              <span className="summary-value green">¥0.00</span>
            </div>
          </div>

          {/* Empty State Footer */}
          <div className="bet-records-empty-footer">没有更多了</div>
        </div>
      )}
    </div>
  );
}
