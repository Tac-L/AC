import React from 'react';
import { useApp } from '../context/AppContext';

export default function PageProfile() {
  const { balance, openDepositPage, openWithdrawPage, openRebatePage, showToast, setActivePage, openActivityPage, openBetRecordsPage } = useApp();

  const handleEditUsername = () => {
    showToast('提示：修改昵称功能暂未开放！');
  };

  const handleCopyId = () => {
    showToast('复制成功：用户ID已复制到剪贴板！');
  };

  const handleNotifications = () => {
    showToast('提示：暂无新系统通知！');
  };

  const handleBuyVip = () => {
    openActivityPage('vip');
  };

  const handleOnekeyRetrieve = () => {
    showToast('一键额度回收成功！所有子钱包额度已全部取回至系统主账户。');
  };

  const handleFeatureClick = (name) => {
    showToast(`提示：【${name}】功能正在开发中，敬请期待！`);
  };

  const features = [
    {
      name: '提款账户',
      action: openWithdrawPage,
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <line x1="6" y1="15" x2="10" y2="15" />
        </svg>
      )
    },
    {
      name: '交易明细',
      action: () => openBetRecordsPage('transactions'),
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="13" y2="17" />
        </svg>
      )
    },
    {
      name: '投注记录',
      action: () => openBetRecordsPage('bets'),
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="13" y2="13" />
          <path d="M14 17.5l5.5-5.5a1 1 0 0 1 1.4 1.4L15.4 19H14v-1.5z" fill="currentColor" stroke="none" />
          <path d="M14 17.5l5.5-5.5a1 1 0 0 1 1.4 1.4L15.4 19H14v-1.5z" />
        </svg>
      )
    },
    {
      name: '活动中心',
      action: () => setActivePage('page-activity'),
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 2 12 2 21 22 21 22 12" />
          <rect x="1" y="7" width="22" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      )
    },
    {
      name: '个人资料',
      action: () => setActivePage('page-settings'),
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M16 19.5l5.5-5.5a1 1 0 0 0-1.4-1.4L14.6 18H14v1.5z" fill="currentColor" stroke="none" />
          <path d="M16 19.5l5.5-5.5a1 1 0 0 0-1.4-1.4L14.6 18H14v1.5z" />
        </svg>
      )
    },
    {
      name: '消息公告',
      action: () => setActivePage('page-mail'),
      badge: 'dot',
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#3b82f6" fill="#3b82f6" />
        </svg>
      )
    },
    /*
    {
      name: '我的背包',
      action: () => handleFeatureClick('我的背包'),
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6a3 3 0 0 1 6 0" />
          <rect x="5" y="6" width="14" height="15" rx="3" />
          <rect x="8" y="13" width="8" height="8" rx="2" />
          <line x1="10" y1="17.5" x2="14" y2="17.5" stroke="#3b82f6" strokeWidth="1.8" />
        </svg>
      )
    },
    {
      name: '客服中心',
      action: () => showToast('正在为您连接在线客服，请稍候...'),
      icon: (
        <svg viewBox="0 0 24 24" className="feature-svg-icon" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
          <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
          <path d="M3 18v-3a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
      )
    }
    */
  ];

  return (
    <div className="app-page active" id="page-profile">
      {/* Top Header Section */}
      <div className="profile-header-container">
        <div className="profile-header-top-row">
          <div className="profile-user-info">
            <div className="profile-avatar-wrapper" onClick={() => showToast('提示：修改头像功能暂开放！')}>
              <img src="assets/chat_cover.png" alt="头像" />
              <span className="profile-avatar-camera"><i className="fa-solid fa-camera"></i></span>
            </div>
            <div className="profile-meta">
              <div className="profile-username-row">
                <h3 id="profile-username-lbl">伯人心贤oyo</h3>
                <i className="fa-regular fa-pen-to-square" id="btn-edit-username" onClick={handleEditUsername}></i>
              </div>
              <div className="profile-id-row">
                <span>ID:301636280</span>
                <i className="fa-regular fa-copy" id="btn-copy-id" onClick={handleCopyId}></i>
              </div>
            </div>
          </div>
          <div className="profile-header-right-box">
            <div className="profile-header-right" id="btn-profile-notifications" onClick={handleNotifications}>
              <i className="fa-regular fa-bell"></i>
              <span className="profile-bell-badge">3</span>
            </div>
            <div className="profile-header-balance-box">
              <span className="balance-lbl">余额</span>
              <strong className="balance-amount" id="profile-header-balance-display">¥{balance.toFixed(2)}</strong>
            </div>
          </div>
        </div>
        
        {/* VIP Progress Row */}
        <div className="profile-vip-progress-row">
          <span className="vip-label">V5 · 普通</span>
          <div className="vip-progress-container">
            <div className="vip-progress-bar" style={{ width: '60%' }}></div>
          </div>
          <span className="vip-upgrade-hint">升级还差 ¥880</span>
        </div>
      </div>

      <div className="scroll-content">
        {/* Marquee Announcement Bar */}
        <div className="profile-marquee-bar">
          <i className="fa-solid fa-bullhorn text-orange announcement-icon"></i>
          <div className="marquee-text-container">
            <div className="marquee-text">全部免费。新会员首充送300%，一倍流水提款！充值1元即送体验VIP，快来体验吧！</div>
          </div>
        </div>

        {/* VIP Card */}
        <div className="profile-vip-card">
          <div className="profile-vip-left">
            <div className="profile-vip-title">
              <i className="fa-solid fa-crown"></i> 普通会员
            </div>
            <div className="profile-vip-desc">
              开通VIP，海量影片，专属线路，全场畅看<br />
              充值1元起送季度卡，彩票打码1000元再送永久卡！
            </div>
          </div>
          <div className="profile-vip-right">
            <span className="profile-vip-badge">限时特惠</span>
            <button className="profile-vip-btn" id="btn-buy-vip" onClick={handleBuyVip}>特惠开通</button>
          </div>
        </div>

        {/* Grid Perks Row */}
        <div className="profile-perks-row">
          <div className="profile-perk-card" id="btn-daily-task" onClick={() => openActivityPage('task')}>
            <div className="profile-perk-info">
              <h4>每日任务</h4>
              <p>7天连续签到 轻松赚大奖</p>
            </div>
            <img src="assets/game_fast3.png" alt="每日任务" className="profile-perk-icon-img" />
          </div>
          <div className="profile-perk-card" id="btn-premium-vip" onClick={() => openActivityPage('vip')}>
            <div className="profile-perk-info">
              <h4>尊享VIP</h4>
              <p>晋级礼金+周俸禄<br />+月俸禄 终身收益</p>
            </div>
            <img src="assets/game_mahjong.png" alt="尊享VIP" className="profile-perk-icon-img" />
          </div>
        </div>

        {/* Promotional Slider/Banner */}
        <div className="profile-banner-slider" onClick={() => showToast('精品活动：充值返点！')}>
          <img src="assets/banner.png" alt="新会员专享" />
          <div className="profile-slider-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* Wallet / Balance Box */}
        <div className="profile-wallet-section">
          <div className="profile-wallet-top">
            <div className="profile-wallet-info">
              <h2 id="profile-balance-val">¥{balance.toFixed(2)}</h2>
              <span>我的余额</span>
            </div>
            <button className="profile-retrieve-btn" id="btn-profile-onekey-retrieve" onClick={handleOnekeyRetrieve}>
              <i className="fa-solid fa-hand-holding-dollar"></i> 一键取回
            </button>
          </div>
          <div className="profile-wallet-actions">
            <button className="profile-action-btn deposit" id="btn-profile-deposit" onClick={openDepositPage}>
              <i className="fa-solid fa-wallet"></i> 充值
            </button>
            <button className="profile-action-btn withdraw" id="btn-profile-withdraw" onClick={openWithdrawPage}>
              <i className="fa-solid fa-money-bill-transfer"></i> 提现
            </button>
            <button className="profile-action-btn rebate" id="btn-profile-rebate" onClick={openRebatePage}>
              <i className="fa-solid fa-rotate-left"></i> 返水
            </button>
          </div>
        </div>

        {/* "常用功能" Features list */}
        <div className="profile-features-section">
          <h4>常用功能</h4>
          <div className="profile-features-grid">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="profile-feature-item"
                onClick={feat.action}
              >
                <div className={`profile-feature-icon-box ${feat.isRobot ? 'robot-box' : 'outline-box'}`}>
                  {feat.icon}
                  {feat.badge === 'dot' && <span className="profile-feature-badge-dot" />}
                </div>
                <span>{feat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
