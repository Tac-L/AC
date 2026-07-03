import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// Helper component for slideshow cards
function HomeCard({ images, badge, title, action, onClick }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const initialDelay = Math.floor(Math.random() * 2000);
    let timer;

    const scheduleNext = () => {
      const delay = 2000 + Math.floor(Math.random() * 2000);
      timer = setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % images.length);
        scheduleNext();
      }, delay);
    };

    const startTimer = setTimeout(scheduleNext, initialDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [images]);

  return (
    <div className="home-map-card" onClick={onClick}>
      <div className="home-card-slideshow">
        {images.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            className={`slide ${idx === activeIdx ? 'active' : ''}`} 
            alt={title} 
          />
        ))}
        {badge && <div className="home-card-badge">{badge}</div>}
      </div>
      <div className="home-card-bottom-bar">
        <span className="home-card-bottom-title">{title}</span>
        <span className="home-card-bottom-action">{action}</span>
      </div>
    </div>
  );
}

// Live card component
function HomeLiveCard({ images, badge, title, action, onClick }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const initialDelay = Math.floor(Math.random() * 2000);
    let timer;

    const scheduleNext = () => {
      const delay = 2000 + Math.floor(Math.random() * 2000);
      timer = setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % images.length);
        scheduleNext();
      }, delay);
    };

    const startTimer = setTimeout(scheduleNext, initialDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [images]);

  return (
    <div className="home-live-card" onClick={onClick}>
      <div className="home-card-slideshow">
        {images.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            className={`slide ${idx === activeIdx ? 'active' : ''}`} 
            alt={title} 
          />
        ))}
        {badge && <div className="home-card-badge">{badge}</div>}
      </div>
      <div className="home-card-bottom-bar">
        <span className="home-card-bottom-title">{title}</span>
        <span className="home-card-bottom-action">{action}</span>
      </div>
    </div>
  );
}

// Movie Card
function HomeMovieCard({ images, badge, title, action, onClick }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const initialDelay = Math.floor(Math.random() * 2000);
    let timer;

    const scheduleNext = () => {
      const delay = 2000 + Math.floor(Math.random() * 2000);
      timer = setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % images.length);
        scheduleNext();
      }, delay);
    };

    const startTimer = setTimeout(scheduleNext, initialDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [images]);

  return (
    <div className="home-movie-card" onClick={onClick}>
      <div className="home-card-slideshow">
        {images.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            className={`slide ${idx === activeIdx ? 'active' : ''}`} 
            alt={title} 
          />
        ))}
        {badge && <div className="home-card-badge">{badge}</div>}
      </div>
      <div className="home-card-bottom-bar">
        <span className="home-card-bottom-title">{title}</span>
        <span className="home-card-bottom-action">{action}</span>
      </div>
    </div>
  );
}

// Game Card
function HomeGameCard({ images, badge, title, action, onClick }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const initialDelay = Math.floor(Math.random() * 2000);
    let timer;

    const scheduleNext = () => {
      const delay = 2000 + Math.floor(Math.random() * 2000);
      timer = setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % images.length);
        scheduleNext();
      }, delay);
    };

    const startTimer = setTimeout(scheduleNext, initialDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [images]);

  return (
    <div className="home-game-card" onClick={onClick}>
      <div className="home-card-slideshow">
        {images.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            className={`slide ${idx === activeIdx ? 'active' : ''}`} 
            alt={title} 
          />
        ))}
        {badge && <div className="home-card-badge">{badge}</div>}
      </div>
      <div className="home-card-bottom-bar">
        <span className="home-card-bottom-title">{title}</span>
        <span className="home-card-bottom-action">{action}</span>
      </div>
    </div>
  );
}

export default function PageHome() {
  const { 
    updateBalance, 
    setActivePage, 
    setActiveChatroom, 
    setActiveGameCategory, 
    setAutoOpenGameId, 
    setActiveVideo, 
    setVideoPlayerActive,
    showToast 
  } = useApp();

  // 1. Top Carousel slide rotation
  const [carouselIndex, setCarouselIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => {
        let next;
        do {
          next = Math.floor(Math.random() * 5);
        } while (next === prev);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 2. One-Minute Fast Three (K3) Timer & Drawing
  const [k3TimeLeft, setK3TimeLeft] = useState(30);
  const [k3Period, setK3Period] = useState(20260609128);
  const [k3HistoryNum, setK3HistoryNum] = useState(127);
  const [k3Dice, setK3Dice] = useState([1, 3, 6]);
  const [k3Drawing, setK3Drawing] = useState(false);

  useEffect(() => {
    let timer;
    if (k3TimeLeft > 0) {
      timer = setTimeout(() => setK3TimeLeft(prev => prev - 1), 1000);
    } else {
      setK3Drawing(true);
      setTimeout(() => {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        setK3Dice([d1, d2, d3]);
        setK3HistoryNum(k3Period % 1000);
        setK3Period(prev => prev + 1);
        setK3TimeLeft(30);
        setK3Drawing(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [k3TimeLeft, k3Period]);

  // 3. One-Minute SSC Timer & Drawing
  const [sscTimeLeft, setSscTimeLeft] = useState(45);
  const [sscPeriod, setSscPeriod] = useState(284);
  const [sscHistoryNum, setSscHistoryNum] = useState(41);
  const [sscBalls, setSscBalls] = useState([3, 8, 1, 5, 7]);
  const [sscDrawing, setSscDrawing] = useState(false);

  useEffect(() => {
    let timer;
    if (sscTimeLeft > 0) {
      timer = setTimeout(() => setSscTimeLeft(prev => prev - 1), 1000);
    } else {
      setSscDrawing(true);
      setTimeout(() => {
        const balls = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10));
        setSscBalls(balls);
        setSscHistoryNum(sscPeriod % 1000);
        setSscPeriod(prev => prev + 1);
        setSscTimeLeft(45);
        setSscDrawing(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [sscTimeLeft, sscPeriod]);

  // 4. One-Minute Mark Six (LHC) Timer & Drawing
  const [lhcTimeLeft, setLhcTimeLeft] = useState(55);
  const [lhcPeriod, setLhcPeriod] = useState(2026060);
  const [lhcHistoryNum, setLhcHistoryNum] = useState(88);
  const [lhcBalls, setLhcBalls] = useState(['06', '12', '24', '33', '41', '48', '08']);
  const [lhcDrawing, setLhcDrawing] = useState(false);

  useEffect(() => {
    let timer;
    if (lhcTimeLeft > 0) {
      timer = setTimeout(() => setLhcTimeLeft(prev => prev - 1), 1000);
    } else {
      setLhcDrawing(true);
      setTimeout(() => {
        const balls = [];
        while (balls.length < 7) {
          const num = Math.floor(Math.random() * 49) + 1;
          const formatted = num < 10 ? '0' + num : '' + num;
          if (!balls.includes(formatted)) balls.push(formatted);
        }
        setLhcBalls(balls);
        setLhcHistoryNum(lhcPeriod % 1000);
        setLhcPeriod(prev => prev + 1);
        setLhcTimeLeft(55);
        setLhcDrawing(false);
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [lhcTimeLeft, lhcPeriod]);

  // Format countdown text helper
  const formatTime = (secs, isDrawing) => {
    if (isDrawing) return '开奖中';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 5. Actions Handlers
  const handleHomeSearch = () => {
    showToast('提示：【搜索功能】正在对接中，敬请期待！');
  };

  const handleCS = () => {
    showToast('正在为您连接在线客服，请稍候...');
  };

  const handleNotification = () => {
    showToast('您有 3 条未读公告消息！');
  };

  const handleDepositPromo = () => {
    updateBalance(120);
    showToast('首充成功！充值金额 ¥100 及送首充红利 ¥20 已打入您的虚拟账户。');
  };

  // Navigations routing from portal cards
  const handlePortalRoute = (route) => {
    if (route === 'page-games-lottery') {
      setActivePage('page-games');
      setActiveGameCategory('lottery');
      setAutoOpenGameId('fast_three');
    } else if (route === 'page-games-slots') {
      setActivePage('page-games');
      setActiveGameCategory('pg');
      setAutoOpenGameId(null);
    } else {
      setActivePage(route);
    }
  };

  const handleLiveRoute = (roomName) => {
    setActivePage('page-chats');
    setActiveChatroom(roomName);
  };

  const handleMovieRoute = (title, img) => {
    let tags = ['#剧情', '#经典'];
    let description = '影片精彩内容即将呈现，敬请期待更多剧情与高清画质体验。';
    if (title.includes('诺曼底')) {
      tags = ['#剧情', '#战争'];
      description = '影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。';
    } else if (title.includes('繁花')) {
      tags = ['#剧情', '#商战'];
      description = '阿宝在上海黄河路的传奇商战风云与情感抉择。展现上世纪九十年代初沪上弄潮儿女的奋斗与爱恨。';
    } else if (title.includes('数码好物')) {
      tags = ['#科技', '#数码'];
      description = '最新旗舰手机深度测评，从外观设计、屏幕素质、影像系统到处理器性能进行全方位对比，为你带来最客观的购机建议。';
    }
    setActiveVideo({ title, img, tags, description });
    setVideoPlayerActive(true);
  };

  const handleGameRoute = (gameId) => {
    setActivePage('page-games');
    setActiveGameCategory('lottery');
    setAutoOpenGameId(gameId);
  };

  // Carousel Promotion Actions
  const handlePromoAction = (slideIdx) => {
    if (slideIdx === 0) {
      handlePortalRoute('page-games-lottery');
      showToast('已为您推荐进入【一分快三】热门游戏房！');
    } else if (slideIdx === 1) {
      handlePortalRoute('page-games-lottery');
      showToast('已为您推荐进入【一分时时彩】热门房间！');
    } else if (slideIdx === 2) {
      setActivePage('page-games');
      setActiveGameCategory('lottery');
      setAutoOpenGameId('mark_six');
      showToast('已为您推荐进入【一分六合彩】经典游戏房！');
    } else if (slideIdx === 3) {
      setActivePage('page-profile');
      showToast('欢迎查看每周首充返利特权！');
    } else if (slideIdx === 4) {
      setActivePage('page-sports');
      showToast('已为您加载顶级赛事，尊享体育返水特权！');
    }
  };

  return (
    <div className="app-page active" id="page-home">
      {/* Home Top Search & Header Row */}
      <div className="home-search-row">
        <div className="home-search-input-box" onClick={handleHomeSearch}>
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" placeholder="搜索彩种 / 主播 / 短剧" readOnly />
        </div>
        <div className="home-header-icons">
          <div className="header-icon-btn" onClick={handleCS}><i className="fa-solid fa-headset"></i></div>
          <div className="header-icon-btn" onClick={handleNotification}>
            <i className="fa-regular fa-bell"></i>
            <span className="badge-dot"></span>
          </div>
        </div>
      </div>

      <div className="scroll-content" style={{ paddingBottom: '24px' }}>
        
        {/* Hero Promo Carousel */}
        <div className="home-hero-carousel">
          <div className="carousel-track">
            {/* Slide 0: 一分快三 */}
            <div 
              className={`home-hero-banner ${carouselIndex === 0 ? 'active' : ''}`}
              style={{ background: 'linear-gradient(135deg, #70a1ff 0%, #1e90ff 100%)' }}
            >
              <div className="hero-left">
                <div className="hero-tag"><i className="fa-solid fa-dice"></i> 热门</div>
                <h3 className="hero-title">一分快三</h3>
                <span className="hero-period-label">第 {k3Period} 期 · 距封盘</span>
                <div className="hero-countdown">{formatTime(k3TimeLeft, k3Drawing)}</div>
              </div>
              <div className="hero-right">
                <span className="hero-history-label">上期 #{k3HistoryNum}</span>
                <div className="hero-balls-row" style={{ gap: '6px' }}>
                  {k3Dice.map((val, idx) => (
                    <div key={idx} className={`dice dice-${val}`}>
                      {val === 1 ? (
                        <span className="dot red-dot"></span>
                      ) : (
                        Array.from({ length: val }).map((_, dIdx) => (
                          <span key={dIdx} className="dot"></span>
                        ))
                      )}
                    </div>
                  ))}
                </div>
                <button className="hero-bet-btn" onClick={() => handlePromoAction(0)} style={{ color: '#1e90ff' }}>
                  立即下注 <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Slide 1: 一分时时彩 */}
            <div 
              className={`home-hero-banner ${carouselIndex === 1 ? 'active' : ''}`}
              style={{ background: 'linear-gradient(135deg, #ff4757 0%, #ff6b81 40%, #ff7f50 100%)' }}
            >
              <div className="hero-left">
                <div className="hero-tag"><i className="fa-solid fa-fire"></i> 主推</div>
                <h3 className="hero-title">一分时时彩</h3>
                <span className="hero-period-label">第 {sscPeriod} 期 · 距封盘</span>
                <div className="hero-countdown">{formatTime(sscTimeLeft, sscDrawing)}</div>
              </div>
              <div className="hero-right">
                <span className="hero-history-label">上期 #{sscHistoryNum}</span>
                <div className="hero-balls-row">
                  {sscBalls.map((num, idx) => (
                    <div key={idx} className="ssc-ball">{num}</div>
                  ))}
                </div>
                <button className="hero-bet-btn" onClick={() => handlePromoAction(1)} style={{ color: '#ff4757' }}>
                  立即下注 <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Slide 2: 一分六合彩 */}
            <div 
              className={`home-hero-banner ${carouselIndex === 2 ? 'active' : ''}`}
              style={{ background: 'linear-gradient(135deg, #2ed573 0%, #20bf6b 100%)' }}
            >
              <div className="hero-left">
                <div className="hero-tag"><i className="fa-solid fa-star"></i> 经典</div>
                <h3 className="hero-title">一分六合彩</h3>
                <span className="hero-period-label">第 {lhcPeriod} 期 · 距封盘</span>
                <div className="hero-countdown">{formatTime(lhcTimeLeft, lhcDrawing)}</div>
              </div>
              <div className="hero-right">
                <span className="hero-history-label">上期 #{lhcHistoryNum}</span>
                <div className="hero-balls-row" style={{ gap: '3px' }}>
                  {lhcBalls.slice(0, 6).map((num, idx) => (
                    <div key={idx} className="ssc-ball lhc-ball">{num}</div>
                  ))}
                  <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', alignSelf: 'center' }}>+</span>
                  <div className="ssc-ball lhc-ball lhc-special-ball" style={{ backgroundColor: '#eb3b5a' }}>
                    {lhcBalls[6]}
                  </div>
                </div>
                <button className="hero-bet-btn" onClick={() => handlePromoAction(2)} style={{ color: '#2ed573' }}>
                  立即下注 <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Slide 3: 广告1 */}
            <div 
              className={`home-hero-banner ${carouselIndex === 3 ? 'active' : ''}`}
              style={{ background: 'linear-gradient(135deg, #3742fa 0%, #5352ed 100%)' }}
            >
              <div className="hero-left">
                <div className="hero-tag"><i className="fa-solid fa-gift"></i> 优惠</div>
                <h3 className="hero-title" style={{ fontSize: '1.1rem' }}>每周首充返利 20%</h3>
                <span className="hero-period-label">全网最高优惠 · 限时狂欢</span>
                <div className="hero-countdown" style={{ fontSize: '0.76rem', marginTop: '10px', fontWeight: '500', opacity: 0.95, whiteSpace: 'nowrap' }}>
                  VIP专享最高 ¥88,888 红包
                </div>
              </div>
              <div className="hero-right" style={{ justifyContent: 'center', gap: '8px' }}>
                <span className="hero-history-label" style={{ opacity: 0.8, marginBottom: '2px' }}>AC俱乐部</span>
                <div style={{ fontSize: '0.76rem', fontWeight: 'bold', color: '#ffeaa7', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <i className="fa-solid fa-gem"></i> VIP专享特权
                </div>
                <button className="hero-bet-btn" onClick={() => handlePromoAction(3)} style={{ color: '#3742fa' }}>
                  立即查看 <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Slide 4: 广告2 */}
            <div 
              className={`home-hero-banner ${carouselIndex === 4 ? 'active' : ''}`}
              style={{ background: 'linear-gradient(135deg, #ffa502 0%, #ff7f50 100%)' }}
            >
              <div className="hero-left">
                <div className="hero-tag"><i className="fa-solid fa-trophy"></i> 体育</div>
                <h3 className="hero-title" style={{ fontSize: '1.1rem' }}>顶级体育赛事推荐</h3>
                <span className="hero-period-label">滾球盤口 · 實時動態返水</span>
                <div className="hero-countdown" style={{ fontSize: '0.76rem', marginTop: '10px', fontWeight: '500', opacity: 0.95, whiteSpace: 'nowrap' }}>
                  每日投注享 2.0% 返水无上限
                </div>
              </div>
              <div className="hero-right" style={{ justifyContent: 'center', gap: '8px' }}>
                <span className="hero-history-label" style={{ opacity: 0.8, marginBottom: '2px' }}>全球精彩赛程</span>
                <div style={{ fontSize: '0.76rem', fontWeight: 'bold', color: '#ffeaa7', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <i className="fa-solid fa-football"></i> 返水無上限
                </div>
                <button className="hero-bet-btn" onClick={() => handlePromoAction(4)} style={{ color: '#ff7f50' }}>
                  立即前往 <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="carousel-indicators">
            {[0, 1, 2, 3, 4].map(idx => (
              <span 
                key={idx} 
                className={`dot ${carouselIndex === idx ? 'active' : ''}`} 
                onClick={() => setCarouselIndex(idx)}
              ></span>
            ))}
          </div>
        </div>

        {/* Newbie Deposit Banner */}
        <div className="home-deposit-banner" id="btn-home-deposit-promo" onClick={handleDepositPromo}>
          <div className="deposit-left">
            <div className="deposit-icon-box">🎁</div>
            <div className="deposit-info">
              <h4>新人首充 +20%</h4>
              <p>充 ¥100 送 ¥20 · 解锁所有玩法</p>
            </div>
          </div>
          <button className="deposit-btn">立即首充 ›</button>
        </div>

        {/* 3x2 Portal Grid */}
        <h4 className="home-section-title">🗺️ 平台大图导航</h4>
        <div className="home-map-grid">
          <HomeCard 
            images={['assets/sports_cover.png', 'assets/chat_cover.png', 'assets/game_fast3.png', 'assets/drawing.png']} 
            badge={<><i className="fa-solid fa-fire"></i> 4.2w</>}
            title="体育直播" 
            action="立即观看 »" 
            onClick={() => handlePortalRoute('page-sports')}
          />
          <HomeCard 
            images={['assets/banner.png', 'assets/drama_still1.png', 'assets/sports_cover.png', 'assets/drawing.png']} 
            badge={<><i className="fa-solid fa-fire"></i> 2.5亿</>}
            title="影视大厅" 
            action="立即观看 »" 
            onClick={() => handlePortalRoute('page-videos')}
          />
          <HomeCard 
            images={['assets/chat_cover.png', 'assets/game_casino.png', 'assets/sports_cover.png', 'assets/drawing.png']} 
            badge={<><i className="fa-solid fa-fire"></i> 3.8w</>}
            title="交流社区" 
            action="立即观看 »" 
            onClick={() => handlePortalRoute('page-chats')}
          />
          <HomeCard 
            images={['assets/gold_dragon_bg.png', 'assets/origami.png', 'assets/game_fast3.png', 'assets/drawing.png']} 
            badge={<><i className="fa-solid fa-fire"></i> 热门</>}
            title="一分彩票" 
            action="立即下注 »" 
            onClick={() => handlePortalRoute('page-games-lottery')}
          />
          <HomeCard 
            images={['assets/game_mahjong.png', 'assets/lego.png', 'assets/drawing.png', 'assets/origami.png']} 
            badge={<><i className="fa-solid fa-fire"></i> 97.5%</>}
            title="电子游艺" 
            action="立即体验 »" 
            onClick={() => handlePortalRoute('page-games-slots')}
          />
          <HomeCard 
            images={['assets/drama_still1.png', 'assets/origami.png', 'assets/science.png', 'assets/drawing.png']} 
            badge={<><i className="fa-solid fa-fire"></i> 海量</>}
            title="精品短剧" 
            action="立即观看 »" 
            onClick={() => handlePortalRoute('page-dramas')}
          />
        </div>

        <div className="home-divider"></div>

        {/* Section: 热门直播 */}
        <h4 className="home-section-title">📺 热门直播</h4>
        <div className="home-map-grid">
          <HomeLiveCard 
            images={['assets/game_fast3.png', 'assets/chat_cover.png', 'assets/drawing.png', 'assets/origami.png']}
            badge={<><i className="fa-solid fa-fire"></i> 4.2w</>}
            title="快三刀枪炮"
            action="立即观看 »"
            onClick={() => handleLiveRoute('快三刀枪炮')}
          />
          <HomeLiveCard 
            images={['assets/sports_cover.png', 'assets/lego.png', 'assets/chat_cover.png', 'assets/drawing.png']}
            badge={<><i className="fa-solid fa-fire"></i> 2.8w</>}
            title="体育红单基地"
            action="立即观看 »"
            onClick={() => handleLiveRoute('体育红单基地')}
          />
          <HomeLiveCard 
            images={['assets/drawing.png', 'assets/origami.png', 'assets/science.png', 'assets/chat_cover.png']}
            badge={<><i className="fa-solid fa-fire"></i> 3.5w</>}
            title="深夜情感电台"
            action="立即观看 »"
            onClick={() => handleLiveRoute('深夜情感电台')}
          />
        </div>

        {/* Section: 热搜电影 */}
        <h4 className="home-section-title">🎬 热搜电影</h4>
        <div className="home-map-grid">
          <HomeMovieCard 
            images={['assets/drama_still1.png', 'assets/drawing.png', 'assets/origami.png', 'assets/science.png']}
            badge={<><i className="fa-solid fa-circle-play"></i> 289w</>}
            title="诺曼底72小时"
            action="立即观看 »"
            onClick={() => handleMovieRoute('诺曼底72小时', 'assets/drama_still1.png')}
          />
          <HomeMovieCard 
            images={['assets/origami.png', 'assets/science.png', 'assets/drawing.png', 'assets/chat_cover.png']}
            badge={<><i className="fa-solid fa-circle-play"></i> 123w</>}
            title="繁花"
            action="立即观看 »"
            onClick={() => handleMovieRoute('繁花 极清珍藏版', 'assets/origami.png')}
          />
          <HomeMovieCard 
            images={['assets/science.png', 'assets/origami.png', 'assets/drawing.png', 'assets/chat_cover.png']}
            badge={<><i className="fa-solid fa-circle-play"></i> 98w</>}
            title="数码好物开箱评测"
            action="立即观看 »"
            onClick={() => handleMovieRoute('数码好物开箱评测', 'assets/science.png')}
          />
        </div>

        {/* Section: 好玩游戏 */}
        <h4 className="home-section-title">🎮 好玩游戏</h4>
        <div className="home-map-grid" style={{ marginBottom: '16px' }}>
          <HomeGameCard 
            images={['assets/game_fast3.png', 'assets/chat_cover.png', 'assets/drawing.png', 'assets/origami.png']}
            badge={<><i className="fa-solid fa-dice"></i> 极速</>}
            title="一分快三"
            action="立即体验 »"
            onClick={() => handleGameRoute('fast_three')}
          />
          <HomeGameCard 
            images={['assets/chat_cover.png', 'assets/game_fast3.png', 'assets/drawing.png', 'assets/origami.png']}
            badge={<><i className="fa-solid fa-clover"></i> 经典</>}
            title="一分六合彩"
            action="立即体验 »"
            onClick={() => handleGameRoute('mark_six')}
          />
          <HomeGameCard 
            images={['assets/sports_cover.png', 'assets/game_mahjong.png', 'assets/chat_cover.png', 'assets/drawing.png']}
            badge={<><i className="fa-solid fa-circle-nodes"></i> 热门</>}
            title="加拿大28"
            action="立即体验 »"
            onClick={() => showToast('加拿大28 正在对接中，请先体验一分快三和一分六合彩哦！')}
          />
        </div>
      </div>
    </div>
  );
}
