import React from 'react';
import { useApp } from '../context/AppContext';

export default function PageProfile() {
  const { balance, openDepositPage, openWithdrawPage, showToast } = useApp();

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
    showToast('提示：VIP通道正在对接中，敬请期待！');
  };

  const handlePerkClick = (perkName) => {
    showToast(`提示：【${perkName}】项目即将开启！`);
  };

  const handleOnekeyRetrieve = () => {
    showToast('一键额度回收成功！所有子钱包额度已全部取回至系统主账户。');
  };

  const handleFeatureClick = (name) => {
    showToast(`提示：【${name}】功能正在开发中，敬请期待！`);
  };

  const features = [
    { name: '推广赚钱', icon: 'fa-coins' },
    { name: '交易记录', icon: 'fa-file-invoice-dollar' },
    { name: '观看历史', icon: 'fa-clock' },
    { name: '收藏记录', icon: 'fa-star' },
    { name: '收款方式', icon: 'fa-credit-card' },
    { name: '分享好友', icon: 'fa-gift' },
    { name: '客服中心', icon: 'fa-headset' },
    { name: '设置', icon: 'fa-gear' }
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
          <div className="profile-perk-card" id="btn-daily-task" onClick={() => handlePerkClick('每日任务')}>
            <div className="profile-perk-info">
              <h4>每日任务</h4>
              <p>7天连续签到 轻松赚大奖</p>
            </div>
            <img src="assets/game_fast3.png" alt="每日任务" className="profile-perk-icon-img" />
          </div>
          <div className="profile-perk-card" id="btn-premium-vip" onClick={() => handlePerkClick('尊享VIP')}>
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
                onClick={() => handleFeatureClick(feat.name)}
              >
                <div className="profile-feature-icon-box" style={{ color: feat.color }}>
                  <i className={`fa-solid ${feat.icon}`}></i>
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
