import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function PageGames() {
  const { 
    balance, 
    updateBalance, 
    setActiveSubGame, 
    activeGameCategory, 
    setActiveGameCategory,
    autoOpenGameId, 
    setAutoOpenGameId,
    showToast,
    openDepositPage,
    openWithdrawPage
  } = useApp();

  const [rotate, setRotate] = useState(false);

  // Main Tabs categories with icon classes
  const categories = [
    { id: 'hot', label: '热门', icon: 'fa-solid fa-fire' },
    { id: 'lottery', label: '彩票', icon: 'fa-solid fa-ticket' },
    { id: 'pg', label: 'PG', icon: 'fa-solid fa-gamepad' },
    { id: 'wali', label: '瓦力', icon: 'fa-solid fa-dice' }
  ];

  const gamesData = [
    { id: 'mark_six', name: '一分六合彩', category: ['hot', 'lottery'], img: 'assets/chat_cover.png', isLive: true },
    { id: 'fast_three', name: '一分快三', category: ['hot', 'lottery', 'wali'], img: 'assets/game_fast3.png', isLive: true },
    { id: 'baccarat', name: '极速百家乐', category: ['hot', 'pg', 'wali'], img: 'assets/lego.png', isLive: false },
    { id: 'canada28', name: '加拿大28', category: ['hot', 'lottery'], img: 'assets/sports_cover.png', isLive: false },
    { id: 'mahjong', name: '麻将胡了', category: ['hot', 'pg'], img: 'assets/game_mahjong.png', isLive: false }
  ];

  // Run auto open checks on mount/updates
  useEffect(() => {
    if (autoOpenGameId) {
      if (autoOpenGameId === 'fast_three' || autoOpenGameId === 'mark_six') {
        setActiveSubGame(autoOpenGameId);
      } else {
        showToast('加拿大28 正在对接中，请先体验一分快三和一分六合彩哦！');
      }
      setAutoOpenGameId(null); // clear trigger
    }
  }, [autoOpenGameId]);

  const handleCategoryClick = (catId) => {
    setActiveGameCategory(catId);
  };

  const handleGameCardClick = (game) => {
    if (game.isLive) {
      setActiveSubGame(game.id);
    } else {
      showToast(`提示：【${game.name}】正在对接中，目前请体验【一分六合彩】和【一分快三】哦！`);
    }
  };

  const handleRefreshBalance = () => {
    setRotate(true);
    setTimeout(() => {
      setRotate(false);
      updateBalance(3000, false);
      showToast("余额已刷新为 ¥3000.00！");
    }, 500);
  };

  const handleOnekeyRetrieve = () => {
    showToast("一键额度回收成功！所有子钱包额度已全部取回至系统主账户。");
  };

  // Filter game data based on activeCategory
  const filteredGames = gamesData.filter(game => {
    return game.category.includes(activeGameCategory);
  });

  return (
    <div className="app-page active" id="page-games">
      {/* Header Bar */}
      <div className="lobby-header-bar">
        <div className="lobby-logo-title">
          <img src="assets/black_panther_logo.png" className="lobby-logo-avatar" alt="LOGO" />
          <div>
            <h4>黑豹视频</h4>
            <span>1068.tv</span>
          </div>
        </div>
        <button className="lobby-customer-btn" onClick={() => showToast('提示：【在线客服】正在接入中！')}>
          <i className="fa-solid fa-headset"></i> 客服
        </button>
      </div>

      {/* Top Marquee Activity Announcement */}
      <div className="marquee-announcement">
        <i className="fa-solid fa-bullhorn announcement-icon"></i>
        <div className="marquee-text-container">
          <div className="marquee-text">欢迎光临黑豹视频！全球顶级观影app，无限看片，充值赠送300%，天天返水...</div>
        </div>
      </div>

      {/* Scroll Content Container */}
      <div className="scroll-content lobby-scroll-area">
        {/* Promotional Banner */}
        <div className="lobby-banner-wrapper" onClick={() => showToast('点击广告：今日存，明日送！首充红利狂欢中！')}>
          <img src="assets/banner.png" alt="首充福利" className="lobby-banner-img" />
          <div className="banner-overlay-text">
            <h2>新会员</h2>
            <h3>首充赠送<span>300%</span></h3>
            <p>限时活动 先到先得</p>
          </div>
        </div>

        {/* Account Status Panel */}
        <div className="account-status-panel">
          <div className="account-info">
            <span className="username">伯人心贤oyo</span>
            <div className="balance-row">
              <strong className="balance-val" id="app-balance-display">¥{balance.toFixed(2)}</strong>
              <i 
                className="fa-solid fa-rotate balance-refresh-icon" 
                id="btn-refresh-balance"
                onClick={handleRefreshBalance}
                style={{ 
                  transition: 'transform 0.5s ease', 
                  transform: rotate ? 'rotate(360deg)' : 'none',
                  cursor: 'pointer'
                }}
              ></i>
            </div>
          </div>
          <div className="account-actions">
            <button className="action-mini-btn" onClick={handleOnekeyRetrieve}>一键取回</button>
            <button className="action-mini-btn highlight" onClick={openDepositPage}>充值</button>
            <button className="action-mini-btn" onClick={openWithdrawPage}>提现</button>
            <button className="action-mini-btn" onClick={() => showToast('提示：【优惠活动】功能正在对接中，敬请期待！')}>活动</button>
            <button className="action-mini-btn" onClick={() => showToast('提示：【投注记录】功能正在对接中，敬请期待！')}>记录</button>
          </div>
        </div>

        {/* Split Left Sidebar Categories & Right Game Grid */}
        <div className="lobby-main-split">
          {/* Left category menu bar */}
          <div className="lobby-left-menu">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className={`menu-tab-item ${activeGameCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <i className={cat.icon}></i>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>

          {/* Right game grid list */}
          <div className="lobby-right-grid" id="lobby-games-list">
            {filteredGames.map(game => (
              <div 
                key={game.id} 
                className="lobby-game-card" 
                onClick={() => handleGameCardClick(game)}
              >
                <div className="game-icon-container">
                  <img src={game.img} alt={game.name} />
                </div>
                <span>{game.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
