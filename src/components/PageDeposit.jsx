import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageDeposit() {
  const { balance, updateBalance, goBack, showToast, openActivityPage } = useApp();

  const [activeTab, setActiveTab] = useState('online'); // online, wallet
  const [activeChannel, setActiveChannel] = useState('alipay_scan'); // channel key
  const [selectedSubchannel, setSelectedSubchannel] = useState(null); // active subchannel details
  const [dialogOpen, setDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);

  const channels = [
    { id: 'alipay_scan', label: '支付宝扫码', icon: 'fa-brands fa-alipay', badge: '热', badgeClass: 'hot', iconColorClass: 'alipay-color' },
    { id: 'unionpay_scan', label: '银联扫码', icon: 'fa-solid fa-credit-card', iconColorClass: 'unionpay-color' },
    { id: 'digital_rmb', label: '数字人民币', icon: 'fa-solid fa-yen-sign', badge: '快', badgeClass: 'fast', iconColorClass: 'rmb-color' },
    { id: 'wechat_scan', label: '微信扫码', icon: 'fa-brands fa-weixin', iconColorClass: 'wechat-color' },
    { id: 'alipay_transfer', label: '支付宝转账', icon: 'fa-brands fa-alipay', iconColorClass: 'alipay-color' },
    { id: 'virtual_wallet', label: '虚拟钱包', icon: 'fa-solid fa-wallet', iconColorClass: 'crypto-color' },
    { id: 'usdt_deposit', label: 'USDT充值', icon: 'fa-solid fa-coins', badge: '热', badgeClass: 'hot', iconColorClass: 'usdt-color' },
    { id: 'cloud_pay', label: '云闪付', icon: 'fa-solid fa-credit-card', badge: '快', badgeClass: 'fast', iconColorClass: 'cloudpay-color' },
    { id: 'douyin_pay', label: '抖音', icon: 'fa-brands fa-tiktok', iconColorClass: 'douyin-color' },
    { id: 'qq_scan', label: 'QQ扫码', icon: 'fa-brands fa-qq', iconColorClass: 'qq-color' },
    { id: 'taobao_pay', label: '淘宝支付', icon: 'fa-solid fa-bag-shopping', iconColorClass: 'taobao-color' },
    { id: 'special_wechat', label: '空投专用微信', icon: 'fa-brands fa-weixin', iconColorClass: 'wechat-color' },
    { id: 'special_alipay', label: '空投专用支付宝', icon: 'fa-brands fa-alipay', iconColorClass: 'alipay-color' },
    { id: 'comprehensive_channel', label: '综合通道', icon: 'fa-solid fa-circle-nodes', iconColorClass: 'mix-color' }
  ];

  const subchannelsData = {
    alipay_scan: [
      { name: "支付宝", limit: "200-2000元", badge: "小额", badgeType: "cyan", min: 200, max: 2000 },
      { name: "支付宝 通道2", limit: "200-2000元", badge: "推荐", badgeType: "orange", min: 200, max: 2000 },
      { name: "支付宝 通道3", limit: "100-2000元", badge: "推荐", badgeType: "orange", min: 100, max: 2000 },
      { name: "支付宝 通道4", limit: "20-500元", badge: "小额", badgeType: "cyan", min: 20, max: 500 },
      { name: "支付宝 通道7", limit: "200-50000元", badge: "大额", badgeType: "yellow", min: 200, max: 50000 },
      { name: "支付宝 通道8", limit: "2000-50000元", badge: "大额", badgeType: "yellow", min: 2000, max: 50000 },
      { name: "支付宝 通道9", limit: "100-500元", badge: "推荐", badgeType: "orange", min: 100, max: 500 },
      { name: "支付宝 通道10", limit: "10-500元", badge: "小额", badgeType: "cyan", min: 10, max: 500 },
      { name: "支付宝 通道14", limit: "10-500元", badge: "小额", badgeType: "cyan", min: 10, max: 500 },
      { name: "支付宝 通道15", limit: "300-10000元", badge: "火热", badgeType: "red", min: 300, max: 10000 }
    ],
    unionpay_scan: [
      { name: "银联扫码1", limit: "500-5000元", badge: "小额", badgeType: "cyan", min: 500, max: 5000 },
      { name: "银联扫码 通道2", limit: "1000-10000元", badge: "推荐", badgeType: "orange", min: 1000, max: 10000 },
      { name: "银联扫码 通道3", limit: "500-20000元", badge: "大额", badgeType: "yellow", min: 500, max: 20000 }
    ],
    digital_rmb: [
      { name: "数币直通车", limit: "50-1000元", badge: "极速", badgeType: "red", min: 50, max: 1000 },
      { name: "数币 通道2", limit: "100-2000元", badge: "推荐", badgeType: "cyan", min: 100, max: 2000 }
    ],
    wechat_scan: [
      { name: "微信扫码1", limit: "100-1000元", badge: "限时", badgeType: "cyan", min: 100, max: 1000 },
      { name: "微信扫码 通道2", limit: "50-500元", badge: "推荐", badgeType: "orange", min: 50, max: 500 },
      { name: "微信 通道3", limit: "200-3000元", badge: "大额", badgeType: "yellow", min: 200, max: 3000 }
    ],
    alipay_transfer: [
      { name: "网银快捷转账", limit: "500-50000元", badge: "推荐", badgeType: "orange", min: 500, max: 50000 },
      { name: "支付宝大额转账", limit: "1000-100000元", badge: "大额", badgeType: "yellow", min: 1000, max: 100000 }
    ],
    virtual_wallet: [
      { name: "数字钱包充值", limit: "100-5000元", badge: "极速", badgeType: "red", min: 100, max: 5000 }
    ],
    usdt_deposit: [
      { name: "USDT-TRC20", limit: "10-50000元", badge: "汇率优惠", badgeType: "yellow", min: 10, max: 50000 },
      { name: "USDT-ERC20", limit: "100-100000元", badge: "安全", badgeType: "cyan", min: 100, max: 100000 }
    ],
    cloud_pay: [
      { name: "云闪付 通道1", limit: "200-2000元", badge: "小额", badgeType: "cyan", min: 20, max: 2000 },
      { name: "云闪付 通道2", limit: "500-5000元", badge: "推荐", badgeType: "orange", min: 500, max: 5000 }
    ],
    douyin_pay: [
      { name: "抖音支付1", limit: "10-1000元", badge: "推荐", badgeType: "orange", min: 10, max: 1000 }
    ],
    qq_scan: [
      { name: "QQ钱包扫码", limit: "20-500元", badge: "小额", badgeType: "cyan", min: 20, max: 500 }
    ],
    taobao_pay: [
      { name: "淘宝代付", limit: "100-5000元", badge: "推荐", badgeType: "orange", min: 100, max: 5000 }
    ],
    special_wechat: [
      { name: "特权微信号充值", limit: "100-2000元", badge: "送礼包", badgeType: "orange", min: 100, max: 2000 }
    ],
    special_alipay: [
      { name: "特权支付宝充值", limit: "200-5000元", badge: "返利", badgeType: "yellow", min: 200, max: 5000 }
    ],
    comprehensive_channel: [
      { name: "极速综合充值", limit: "50-10000元", badge: "推荐", badgeType: "orange", min: 50, max: 10000 }
    ]
  };

  const handleTabClick = (tabKey) => {
    if (tabKey === 'wallet') {
      showToast('【钱包直充】通道正在维护中，已为您默认选择【在线充值】！');
      setActiveTab('online');
    } else {
      setActiveTab('online');
    }
  };

  const handleChannelClick = (channelId) => {
    setActiveChannel(channelId);
  };

  const handleSubchannelClick = (sub) => {
    setSelectedSubchannel(sub);
    setDepositAmount(sub.min.toString());
    setDialogOpen(true);
  };

  const handleConfirmRecharge = () => {
    if (!selectedSubchannel) return;
    const val = parseFloat(depositAmount);

    if (isNaN(val) || val < selectedSubchannel.min || val > selectedSubchannel.max) {
      alert(`请输入在限额范围 ${selectedSubchannel.limit} 内的有效金额！`);
      return;
    }

    updateBalance(val);
    showToast(`🎉 充值成功！您的虚拟账户已存入 ¥${val.toFixed(2)}`);
    setDialogOpen(false);
  };

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast('余额已刷新为 ¥3000.00！');
  };

  const selectedChannelName = channels.find(c => c.id === activeChannel)?.label || '在线充值';
  const subchannels = subchannelsData[activeChannel] || [];

  return (
    <div className="app-page active" id="page-deposit">
      {/* Header Bar */}
      <div className="deposit-header-bar">
        <div className="deposit-header-left">
          <i className="fa-solid fa-chevron-left" id="btn-deposit-back" onClick={() => goBack('page-profile')}></i>
          <span className="deposit-header-title">充值中心</span>
          <span className="deposit-header-balance-val">¥<span id="deposit-header-balance-display">{balance.toFixed(2)}</span></span>
          <i className="fa-solid fa-rotate" id="btn-refresh-deposit-balance" onClick={handleRefreshBalance}></i>
        </div>
        <div className="deposit-header-right">
          <i className="fa-solid fa-file-invoice-dollar" id="btn-deposit-record" title="充值记录" onClick={() => setRecordDialogOpen(true)}></i>
          <i className="fa-solid fa-xmark" id="btn-deposit-close" onClick={() => goBack('page-profile')}></i>
        </div>
      </div>

      <div className="scroll-content" style={{ paddingBottom: '24px' }}>
        {/* User Card */}
        <div className="deposit-profile-card">
          <div className="profile-header-container" style={{ borderBottom: 'none' }}>
            <div className="profile-header-top-row">
              <div className="profile-user-info">
                <div className="profile-avatar-wrapper">
                  <img src="assets/chat_cover.png" alt="头像" />
                  <span className="profile-avatar-camera" onClick={() => showToast('提示：修改头像功能暂开放！')}><i className="fa-solid fa-camera"></i></span>
                </div>
                <div className="profile-meta">
                  <div className="profile-username-row">
                    <h3>伯人心贤oyo</h3>
                  </div>
                  <div className="profile-id-row" onClick={() => showToast('ID复制成功！ID: 301636280')}>
                    <span>ID:301636280</span>
                    <i className="fa-regular fa-copy" id="btn-deposit-copy-id"></i>
                  </div>
                </div>
              </div>
              <div className="profile-header-right-box">
                <div className="profile-header-balance-box">
                  <span className="balance-lbl">余额</span>
                  <strong className="balance-amount" id="deposit-card-balance-display">¥{balance.toFixed(2)}</strong>
                </div>
              </div>
            </div>
            
            <div className="vip-level-bar" onClick={() => openActivityPage && openActivityPage('vip')}>
              <div className="vip-level-gem">
                <i className="fa-solid fa-gem"></i>
              </div>
              <div className="vip-level-main">
                <div className="vip-level-top">
                  <span className="vip-level-progress-text">V0 累计打码：0/50000</span>
                  <span className="vip-level-next">V1</span>
                </div>
                <div className="vip-level-track">
                  <div className="vip-level-fill" style={{ width: '0%' }}></div>
                </div>
                <div className="vip-level-perks">
                  <span>升级礼金</span>
                  <span>每周俸禄</span>
                  <span>每月俸禄</span>
                </div>
              </div>
              <div className="vip-level-arrow">
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Recharge Category Tabs */}
        <div className="deposit-tabs-row">
          <div 
            className={`deposit-tab ${activeTab === 'online' ? 'active' : ''}`} 
            onClick={() => handleTabClick('online')}
          >
            <span className="deposit-tab-badge">豪送8888元</span>
            <i className="fa-solid fa-bolt" style={{ color: '#ff9f43', marginRight: '4px' }}></i>在线充值
          </div>
          <div 
            className={`deposit-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => handleTabClick('wallet')}
          >
            <span className="deposit-tab-badge nft-badge">NFT</span>
            <i className="fa-solid fa-wallet" style={{ color: '#54a0ff', marginRight: '4px' }}></i>钱包直充
          </div>
        </div>

        {/* Payment Channels Grid */}
        <div className="deposit-channels-grid">
          {channels.map(channel => (
            <div 
              key={channel.id}
              className={`channel-grid-item ${activeChannel === channel.id ? 'active' : ''}`}
              onClick={() => handleChannelClick(channel.id)}
            >
              {channel.badge && <span className={`channel-badge ${channel.badgeClass}`}>{channel.badge}</span>}
              <div className={`channel-icon-box ${channel.iconColorClass}`}>
                <i className={channel.icon}></i>
              </div>
              <span>{channel.label}</span>
            </div>
          ))}
        </div>

        {/* Channel Details Section */}
        <div className="deposit-details-section">
          <h4 className="deposit-details-title" id="selected-channel-name">{selectedChannelName}</h4>
          <div className="deposit-subchannels-grid" id="deposit-subchannels-container">
            {subchannels.map((sub, idx) => {
              let badgeClass = 'badge-cyan';
              if (sub.badgeType === 'orange') badgeClass = 'badge-orange';
              if (sub.badgeType === 'yellow') badgeClass = 'badge-yellow';
              if (sub.badgeType === 'red') badgeClass = 'badge-red';

              return (
                <div 
                  key={idx} 
                  className="subchannel-card"
                  onClick={() => handleSubchannelClick(sub)}
                >
                  <span className={`subchannel-card-badge ${badgeClass}`}>{sub.badge}</span>
                  <div className="subchannel-name-row">
                    <span className="subchannel-name">{sub.name}</span>
                  </div>
                  <span className="subchannel-limit">单笔限额：{sub.limit}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Mock Recharge Dialog */}
      {dialogOpen && selectedSubchannel && (
        <div className="deposit-dialog-overlay" id="deposit-mock-dialog" style={{ display: 'flex' }}>
          <div className="deposit-dialog-box">
            <div className="deposit-dialog-header">
              <h4 id="deposit-dialog-title">{selectedSubchannel.name} 充值</h4>
              <i className="fa-solid fa-xmark" id="btn-close-deposit-dialog" onClick={() => setDialogOpen(false)}></i>
            </div>
            <div className="deposit-dialog-body">
              <div className="deposit-dialog-limit-lbl">单笔限额：<span id="deposit-dialog-limit-text">{selectedSubchannel.limit}</span></div>
              <div className="deposit-input-row">
                <span className="deposit-currency-symbol">¥</span>
                <input 
                  type="number" 
                  id="deposit-input-amount" 
                  placeholder="输入充值金额" 
                  value={depositAmount} 
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <div className="deposit-dialog-quick-row">
                {[200, 500, 1000, 2000].map(val => (
                  <span 
                    key={val} 
                    className="deposit-dialog-quick-btn"
                    onClick={() => setDepositAmount(val.toString())}
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
            <div className="deposit-dialog-footer">
              <button className="deposit-dialog-cancel-btn" id="btn-cancel-deposit-dialog" onClick={() => setDialogOpen(false)}>取消</button>
              <button className="deposit-dialog-confirm-btn" id="btn-confirm-deposit-dialog" onClick={handleConfirmRecharge}>确认充值</button>
            </div>
          </div>
        </div>
      )}

      {/* Online Recharge Record Dialog */}
      {recordDialogOpen && (
        <div className="deposit-dialog-overlay" onClick={() => setRecordDialogOpen(false)} style={{ display: 'flex' }}>
          <div className="deposit-record-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="deposit-record-header">
              <span className="deposit-record-title">在线充值记录</span>
              <i className="fa-solid fa-xmark" id="btn-close-record-dialog" onClick={() => setRecordDialogOpen(false)}></i>
            </div>
            
            <div className="deposit-record-body">
              <div className="deposit-record-filter-row">
                <div className="deposit-record-dropdown" onClick={() => showToast('已刷新充值记录')}>
                  <span>今日</span>
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
              </div>
              
              <div className="deposit-record-empty-state">
                <svg viewBox="0 0 100 100" className="deposit-record-empty-icon">
                  <line x1="50" y1="22" x2="50" y2="12" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="32" y1="30" x2="22" y2="20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  <line x1="68" y1="30" x2="78" y2="20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  <path d="M15,45 C15,41 18,38 22,38 L78,38 C82,38 85,41 85,45 L81,73 C80,77 77,80 73,80 L27,80 C23,80 20,77 19,73 Z" fill="currentColor" opacity="0.35" />
                  <path d="M15,45 C15,41 18,38 22,38 L38,38 C39,38 41,39 42,41 L46,47 C48,49 52,49 54,47 L58,41 C59,39 61,38 62,38 L78,38 C82,38 85,41 85,45 L84,52 C84,56 81,59 77,59 L61,59 C59,59 57,61 56,63 L53,69 C51,72 49,72 47,69 L44,63 C43,61 41,59 39,59 L23,59 C19,59 16,56 16,52 Z" fill="currentColor" opacity="0.45" />
                </svg>
                <div className="deposit-record-empty-text">暂无充值记录</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
