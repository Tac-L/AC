import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageActivity() {
  const { goBack, showToast, activityTab } = useApp();

  // Active top tab: 'task' | 'rebate' | 'vip' | 'tournament'
  const [activeTab, setActiveTab] = useState(activityTab || 'task');

  // ===== 任务 (Tasks) =====
  const taskCategories = [
    '每日累存', '电子任务', '每周电子', '棋牌任务', '捕鱼任务',
    '救援任务', '真人救援', 'PP电子', 'PG电子', 'JDB电子'
  ];
  const [activeTaskCat, setActiveTaskCat] = useState('每日累存');

  const taskList = [
    { title: '每日存款第一关', reward: '+10', desc: '完成累计存款100元+', cur: 0, total: '100' },
    { title: '每日存款第二关', reward: '+20', desc: '完成累计存款1千元+', cur: 0, total: '1000' },
    { title: '每日存款第三关', reward: '+30', desc: '完成累计存款5千元+', cur: 0, total: '5000' },
    { title: '每日存款第四关', reward: '+60', desc: '完成累计存款1万元+', cur: 0, total: '1万' },
    { title: '每日存款第五关', reward: '+128', desc: '完成累计存款5万元+', cur: 0, total: '5万' }
  ];

  // ===== 返水 (Rebate) =====
  const rebateCategories = ['视讯', '电子', '捕鱼', '棋牌'];
  const [activeRebateCat, setActiveRebateCat] = useState('视讯');

  const rebatePlatforms = [
    { name: 'CHOICE视讯', short: 'CH', color: '#16a34a' },
    { name: 'OG视讯', short: 'OG', color: '#f97316' },
    { name: 'BBIN视讯', short: 'BB', color: '#ef4444' },
    { name: 'DG视讯', short: 'DG', color: '#a16207' },
    { name: 'BG视讯', short: 'BG', color: '#2563eb' },
    { name: 'EV视讯', short: 'EV', color: '#1e293b' },
    { name: 'DB视讯', short: 'DB', color: '#db2777' }
  ];

  // ===== VIP =====
  const vipLevels = ['VIP0', 'VIP1', 'VIP2', 'VIP3', 'VIP4'];
  const [activeVipLevel, setActiveVipLevel] = useState('VIP0');

  // ===== 锦标赛 (Tournament) =====
  const tournaments = [
    { title: 'PG电子锦标赛', prize: '19,900.00', accent: '#ede9fe' },
    { title: 'MG电子锦标赛', prize: '19,900.00', accent: '#fef3c7' },
    { title: '捕鱼锦标赛', prize: '19,900.00', accent: '#cffafe' },
    { title: '棋牌锦标赛', prize: '19,900.00', accent: '#f3e8ff' },
    { title: '真人视讯锦标赛', prize: '32,400.00', accent: '#fef9c3' }
  ];

  const tabs = [
    { key: 'task', label: '任务' },
    { key: 'rebate', label: '返水' },
    { key: 'vip', label: 'VIP' },
    { key: 'tournament', label: '锦标赛' }
  ];

  return (
    <div className="app-page active" id="page-activity">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-activity-back" onClick={() => goBack('page-profile')}></i>
        <span className="activity-header-title">活动中心</span>
        <div></div>
      </div>

      {/* Top Tab Pills */}
      <div className="activity-tabs">
        <div className="activity-tabs-inner">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              className={`activity-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* ===== 任务 ===== */}
      {activeTab === 'task' && (
        <div className="activity-task-layout">
          <div className="activity-task-sidebar">
            {taskCategories.map((cat) => (
              <div
                key={cat}
                className={`activity-task-cat ${activeTaskCat === cat ? 'active' : ''}`}
                onClick={() => setActiveTaskCat(cat)}
              >
                {cat}
              </div>
            ))}
          </div>
          <div className="activity-task-list scroll-content">
            {taskList.map((task, idx) => (
              <div key={idx} className="activity-task-card">
                <div className="activity-task-main">
                  <div className="activity-task-title">
                    {task.title}
                    <span className="activity-task-help" onClick={() => showToast(`提示：${task.title} 完成累计存款即可领取奖励！`)}>?</span>
                  </div>
                  <div className="activity-task-reward">
                    <i className="fa-solid fa-sack-dollar"></i> {task.reward}
                  </div>
                  <div className="activity-task-progress">
                    {task.desc} <strong>{task.cur} / {task.total}</strong>
                  </div>
                </div>
                <div className="activity-task-status">
                  <div className="activity-task-circle">0%</div>
                  <button className="activity-task-btn" onClick={() => showToast('提示：任务尚未完成，无法领取奖励！')}>未完成</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 返水 ===== */}
      {activeTab === 'rebate' && (
        <div className="activity-rebate-wrap">
          <div className="activity-rebate-topbar">
            <div className="activity-rebate-amount">
              可领取返水金额：<strong>0.00</strong>
              <i className="fa-solid fa-arrows-rotate" onClick={() => showToast('刷新成功：暂无可领取返水！')}></i>
            </div>
            <button className="activity-rebate-claim-btn" onClick={() => showToast('提示：暂无可领取的返水金额！')}>一键领取</button>
          </div>
          <div className="activity-rebate-layout">
            <div className="activity-rebate-sidebar">
              {rebateCategories.map((cat) => (
                <div
                  key={cat}
                  className={`activity-rebate-cat ${activeRebateCat === cat ? 'active' : ''}`}
                  onClick={() => setActiveRebateCat(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
            <div className="activity-rebate-list scroll-content">
              {rebatePlatforms.map((plat, idx) => (
                <div key={idx} className="activity-rebate-card" onClick={() => showToast(`提示：${plat.name} 暂无可领取返水！`)}>
                  <div className="activity-rebate-logo" style={{ backgroundColor: plat.color }}>{plat.short}</div>
                  <div className="activity-rebate-info">
                    <div className="activity-rebate-name">{plat.name}</div>
                    <div className="activity-rebate-ratio">返水比例 0%</div>
                  </div>
                  <div className="activity-rebate-stats">
                    <div>有效投注 <span>0</span></div>
                    <div>可领取 <span>0</span></div>
                  </div>
                  <i className="fa-solid fa-chevron-right activity-rebate-arrow"></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== VIP ===== */}
      {activeTab === 'vip' && (
        <div className="scroll-content activity-vip-wrap">
          <div className="activity-vip-current-card">
            <span className="activity-vip-current-label">当前等级</span>
            <h2 className="activity-vip-current-level">VIP 0</h2>
            <div className="activity-vip-progress-row">
              <span className="activity-vip-progress-text">V0 累计打码：0/50000</span>
              <span className="activity-vip-next">V1</span>
            </div>
            <div className="activity-vip-progress-bar">
              <div className="activity-vip-progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>

          <div className="activity-vip-level-tabs">
            {vipLevels.map((lvl) => (
              <div
                key={lvl}
                className={`activity-vip-level-tab ${activeVipLevel === lvl ? 'active' : ''}`}
                onClick={() => setActiveVipLevel(lvl)}
              >
                {lvl}
              </div>
            ))}
          </div>

          <div className="activity-vip-banner">
            <span>👑 至尊VIP特权 👑</span>
            <small>奢华特权已就位 · 解锁您的非凡礼遇</small>
          </div>

          <div className="activity-vip-perks-card">
            <h4 className="activity-vip-perks-title">{activeVipLevel}可领权益</h4>
            <div className="activity-vip-perks-grid">
              <div className="activity-vip-perk-item">
                <strong>¥0</strong>
                <span>晋级礼金</span>
              </div>
              <div className="activity-vip-perk-item">
                <strong>¥0</strong>
                <span>周俸禄</span>
              </div>
              <div className="activity-vip-perk-item">
                <strong>¥0</strong>
                <span>月俸禄</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 锦标赛 ===== */}
      {activeTab === 'tournament' && (
        <div className="scroll-content activity-tournament-wrap">
          <div className="activity-tournament-header">
            <span className="activity-tournament-title">🏆 活动锦标赛</span>
            <span className="activity-tournament-past" onClick={() => showToast('提示：往期锦标赛记录正在加载中！')}>往期锦标赛 ›</span>
          </div>
          <div className="activity-tournament-grid">
            {tournaments.map((t, idx) => (
              <div
                key={idx}
                className="activity-tournament-card"
                style={{ background: `linear-gradient(135deg, ${t.accent} 0%, #ffffff 70%)` }}
                onClick={() => showToast(`提示：${t.title} 详情即将开启！`)}
              >
                <div className="activity-tournament-card-top">
                  <span className="activity-tournament-card-title">{t.title}</span>
                  <span className="activity-tournament-card-arrow"><i className="fa-solid fa-chevron-right"></i></span>
                </div>
                <div className="activity-tournament-prize">{t.prize} <small>元</small></div>
                <div className="activity-tournament-countdown">
                  <span className="cd-label">倒计时：</span>
                  <span className="cd-num">73</span>:<span className="cd-num">09</span>:<span className="cd-num">32</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
