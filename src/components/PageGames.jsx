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
    openGameDetailModal
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
    { id: 'egame', label: '电子游艺', icon: 'fa-solid fa-gamepad' },
    { id: 'chess', label: '棋牌对战', icon: 'fa-solid fa-chess' },
    { id: 'fish', label: '捕鱼达人', icon: 'fa-solid fa-fish' },
    { id: 'live', label: '真人视讯', icon: 'fa-solid fa-video' },
    { id: 'lottery', label: '彩票游戏', icon: 'fa-solid fa-ticket' },
    { id: 'sport', label: '体育竞技', icon: 'fa-solid fa-futbol' }
  ];

  const gamesData = [
    { id: 'mark_six', name: '一分六合彩', category: ['hot', 'lottery'], img: 'assets/mo_mark_six.png', isLive: true },
    { id: 'fast_three', name: '一分快三', category: ['hot', 'lottery'], img: 'assets/fast_three.png', isLive: true },
    { id: 'speed_race', name: '一分极速赛车', category: ['hot', 'lottery'], img: 'assets/fast_three.png', isLive: true },
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

  // Run auto open checks on mount/updates
  useEffect(() => {
    if (autoOpenGameId) {
      if (autoOpenGameId === 'fast_three' || autoOpenGameId === 'mark_six' || autoOpenGameId === 'speed_race') {
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
    { id: 'promo', label: '优惠', icon: 'fa-solid fa-gift', cls: 'promo', badge: '送1.5%', onClick: openOffersPage },
    { id: 'withdraw', label: '提款', icon: 'fa-solid fa-credit-card', cls: 'withdraw', onClick: openWithdrawPage }
  ];

  // Filter game data based on activeCategory
  const filteredGames = gamesData.filter(game => {
    return game.category.includes(activeGameCategory);
  });

  return (
    <div className="app-page active" id="page-games">
      {/* Header Bar with logo pill */}
      <div className="lobby-header-bar">
        <div className="lobby-logo-pill">
          <img src="assets/logo.png" className="lobby-brand-logo" alt="LOGO" />
        </div>
      </div>

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
        </div>

        {/* Wallet Panel: balance + round icon actions */}
        <div className="lobby-wallet-panel">
          <div className="wallet-info">
            <span className="wallet-username">伯人心贤oyo</span>
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

          {/* Right column: sub-promo banner + game grid */}
          <div className="lobby-right-col">
            <div
              className="lobby-sub-promo"
              onClick={() => showToast('点击进入：疯狂台球 斯诺克 中式黑八 正在对接中！')}
            >
              <img src="assets/sports_cover.png" alt="疯狂台球" />
            </div>

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
