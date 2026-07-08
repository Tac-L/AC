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
    openWithdrawPage,
    openOffersPage,
    openActivityPage,
    openGameDetailModal,
    setActivePage,
    immersiveMode,
    setImmersiveMode,
    setActiveRoomId,
    setActiveGameName
  } = useApp();

  const [rotate, setRotate] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  // Banner carousel slides
  const bannerSlides = [
    'assets/banner.png',
    'assets/sports_cover.png',
    'assets/bti_sports.png',
    'assets/fb_sports.png'
  ];

  // Left vertical category menu (icon + label)
  const categories = [
    { id: 'hot', label: '热门游戏', icon: 'fa-solid fa-fire' },
    { id: 'lottery', label: '彩票游戏', icon: 'fa-solid fa-ticket' },
    { id: 'egame', label: '电子游艺', icon: 'fa-solid fa-gamepad' },
    { id: 'chess', label: '棋牌对战', icon: 'fa-solid fa-chess' },
    { id: 'fish', label: '捕鱼达人', icon: 'fa-solid fa-fish' },
    { id: 'live', label: '真人视讯', icon: 'fa-solid fa-video' },
    { id: 'sport', label: '体育竞技', icon: 'fa-solid fa-futbol' }
  ];

  const gamesData = [
    { id: 'speed_race', name: '一分极速赛车', category: ['hot', 'lottery'], img: '游戏图标/1062010.png', isLive: true, roomid: '1062010' },
    { id: 'speed_race_5', name: '五分极速赛车', category: ['lottery'], img: '游戏图标/1062020.png', isLive: true, roomid: '1062020' },
    { id: 'speed_race_10', name: '十分极速赛车', category: ['lottery'], img: '游戏图标/1062030.png', isLive: true, roomid: '1062030' },
    { id: 'macau_mark_six_1', name: '一分澳门六合彩', category: ['hot', 'lottery'], img: '游戏图标/1070110.png', isLive: true, roomid: '1070110' },
    { id: 'macau_mark_six_5', name: '五分澳门六合彩', category: ['lottery'], img: '游戏图标/1070120.png', isLive: true, roomid: '1070120' },
    { id: 'macau_mark_six_10', name: '十分澳门六合彩', category: ['lottery'], img: '游戏图标/1070130.png', isLive: true, roomid: '1070130' },
    { id: 'ffc_1', name: '一分分分彩', category: ['hot', 'lottery'], img: '游戏图标/601010.png', isLive: true, roomid: '601010' },
    { id: 'ffc_5', name: '五分分分彩', category: ['lottery'], img: '游戏图标/601020.png', isLive: true, roomid: '601020' },
    { id: 'ffc_10', name: '十分分分彩', category: ['lottery'], img: '游戏图标/601030.png', isLive: true, roomid: '601030' },
    { id: 'fast_three', name: '一分快三', category: ['hot', 'lottery'], img: '游戏图标/701010.png', isLive: true, roomid: '701010' },
    { id: 'fast_three_5', name: '五分快三', category: ['lottery'], img: '游戏图标/701020.png', isLive: true, roomid: '701020' },
    { id: 'fast_three_10', name: '十分快三', category: ['lottery'], img: '游戏图标/701030.png', isLive: true, roomid: '701030' },
    { id: 'lucky_28_1', name: '一分幸运28', category: ['hot', 'lottery'], img: '游戏图标/1069010.png', isLive: true, roomid: '1069010' },
    { id: 'lucky_28_5', name: '五分幸运28', category: ['lottery'], img: '游戏图标/1069020.png', isLive: true, roomid: '1069020' },
    { id: 'lucky_28_10', name: '十分幸运28', category: ['lottery'], img: '游戏图标/1069030.png', isLive: true, roomid: '1069030' },
    { id: 'animal_sports_1', name: '一分动物运动会', category: ['hot', 'lottery'], img: '游戏图标/1001-D6CpfLEz.png', isLive: true, roomid: '1001010' },
    { id: 'animal_sports_5', name: '五分动物运动会', category: ['lottery'], img: '游戏图标/1001-D6CpfLEz.png', isLive: true, roomid: '1001020' },
    { id: 'animal_sports_10', name: '十分动物运动会', category: ['lottery'], img: '游戏图标/1001-D6CpfLEz.png', isLive: true, roomid: '1001030' },
    { id: 'mahjong', name: '麻将胡了', category: ['hot', 'egame'], img: 'assets/game_mahjong.png', isLive: false },
    { id: 'mahjong2', name: '麻将胡了2', category: ['hot', 'egame'], img: 'assets/game_mahjong.png', isLive: false },
    { id: 'gold_city', name: '寻宝黄金城', category: ['hot', 'egame'], img: 'assets/gold_dragon_bg.png', isLive: false },
    { id: 'qilin', name: '麒麟送宝', category: ['hot', 'egame'], img: 'assets/lego.png', isLive: false },
    { id: 'queen', name: '赏金女王', category: ['hot', 'egame'], img: 'assets/origami.png', isLive: false },
    { id: 'bounty', name: '赏金大对决', category: ['hot', 'egame'], img: 'assets/drawing.png', isLive: false },
    { id: 'lucky_cat', name: '招财喵', category: ['hot', 'egame'], img: 'assets/science.png', isLive: false },
    { id: 'undead', name: '亡灵大盗', category: ['hot', 'egame'], img: 'assets/chat_cover.png', isLive: false },
    { id: 'fortune', name: '福运象财神', category: ['hot', 'egame'], img: 'assets/game_fast3.png', isLive: false }
  ];

  // Auto-rotate banner carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % bannerSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (autoOpenGameId) {
      const targetId = autoOpenGameId === 'mark_six' ? 'macau_mark_six_1' : autoOpenGameId;
      const gameObj = gamesData.find(g => g.id === targetId);
      if (gameObj) {
        handleGameCardClick(gameObj);
      } else {
        showToast('游戏正在对接中，敬请期待！');
      }
      setAutoOpenGameId(null); // clear trigger
    }
  }, [autoOpenGameId]);

  const handleCategoryClick = (catId) => {
    setActiveGameCategory(catId);
  };

  const handleGameCardClick = (game) => {
    if (game.isLive) {
      if (game.roomid) {
        setActiveRoomId(game.roomid);
        setActiveGameName(game.name);
        setActiveSubGame('speed_race');
      } else {
        setActiveSubGame(game.id);
      }
    } else {
      openGameDetailModal({ name: game.name, img: game.img });
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

  // Wallet round-icon actions
  const walletActions = [
    { id: 'recharge', label: '充值', icon: 'fa-solid fa-sack-dollar', cls: 'recharge', onClick: openDepositPage },
    { id: 'vip', label: 'Vip钱包', icon: 'fa-brands fa-bitcoin', cls: 'vip', onClick: () => openActivityPage('vip') },
    { id: 'promo', label: '优惠', icon: 'fa-solid fa-gift', cls: 'promo', onClick: openOffersPage },
    { id: 'withdraw', label: '提款', icon: 'fa-solid fa-credit-card', cls: 'withdraw', onClick: openWithdrawPage }
  ];

  // Filter game data based on activeCategory
  const filteredGames = gamesData.filter(game => {
    return game.category.includes(activeGameCategory);
  });

  return (
    <div className="app-page active" id="page-games">
      {/* Header Bar with logo pill */}
      {!immersiveMode && (
        <div className="lobby-header-bar">
          <div className="lobby-logo-pill">
            <img src="assets/logo.svg" className="lobby-brand-logo" alt="LOGO" />
          </div>
          <div className="header-immersive-btn" onClick={() => setImmersiveMode(true)} title="进入沉浸模式">
            <i className="fa-solid fa-expand"></i>
          </div>
        </div>
      )}

      {/* Scroll Content Container */}
      <div className="scroll-content lobby-scroll-area">
        {/* Banner Carousel */}
        <div
          className="lobby-carousel"
          onClick={() => showToast('点击广告：今日存，明日送！首充红利狂欢中！')}
        >
          <img src={bannerSlides[bannerIndex]} alt="活动横幅" className="lobby-banner-img" />
          <div className="carousel-dots">
            {bannerSlides.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === bannerIndex ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setBannerIndex(i); }}
              ></span>
            ))}
          </div>
        </div>

        {/* Top Marquee Activity Announcement */}
        <div className="marquee-announcement">
          <i className="fa-solid fa-volume-high announcement-icon"></i>
          <div className="marquee-text-container">
            <div className="marquee-text">【BG】视讯将于北京时间 2025/11/04 凌晨04:00-凌晨05:00进行维护，给您带来不便敬请谅解！</div>
          </div>
          <i className="fa-regular fa-envelope marquee-mail-icon" onClick={() => setActivePage('page-mail')} title="站内信"></i>
        </div>

        {/* Wallet Panel: balance + round icon actions */}
        <div className="lobby-wallet-panel">
          <div className="wallet-info">
            <span className="wallet-balance-title">账户余额</span>
            <div className="wallet-balance-row">
              <strong className="wallet-balance-val" id="app-balance-display">¥{balance.toFixed(2)}</strong>
              <i
                className="fa-solid fa-rotate wallet-refresh-icon"
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
          <div className="wallet-actions-row">
            {walletActions.map(action => (
              <div key={action.id} className="wallet-action-item" onClick={action.onClick}>
                <div className={`wallet-action-circle ${action.cls}`}>
                  {action.badge && <span className="wallet-promo-badge">{action.badge}</span>}
                  <i className={action.icon}></i>
                </div>
                <span>{action.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Split Left Sidebar Categories & Right Game Grid */}
        <div className="lobby-main-split">
          {/* Left vertical category menu */}
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

          {/* Right column: game grid */}
          <div className="lobby-right-col">
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
    </div>
  );
}
