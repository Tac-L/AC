import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// Helper to render points as dice
const renderDiceOptionName = (name) => {
  if (/^\d+$/.test(name)) {
    const digits = name.split('').map(Number);
    return (
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center' }}>
        {digits.map((val, idx) => (
          <div key={idx} className={`dice dice-${val}`} style={{ width: '18px', height: '18px', padding: '2px', border: '1px solid #cbd5e0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            {val === 1 ? (
              <span className="dot red-dot" style={{ width: '4px', height: '4px' }}></span>
            ) : (
              Array.from({ length: val }).map((_, dIdx) => (
                <span key={dIdx} className="dot" style={{ width: '3px', height: '3px' }}></span>
              ))
            )}
          </div>
        ))}
      </div>
    );
  }
  return name;
};

// Mark Six (六合彩) number color mapping
const M6_RED_NUMS = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
const M6_BLUE_NUMS = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
const M6_ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const getM6BallColor = (num) => {
  if (M6_RED_NUMS.includes(num)) return 'red';
  if (M6_BLUE_NUMS.includes(num)) return 'blue';
  return 'green';
};

// Speed Race (极速赛车) 1~10 名次球颜色（PK10 标准配色）
const RACE_COLORS = {
  1: '#f5c211', 2: '#2f6fdb', 3: '#3a3a3a', 4: '#f07c19', 5: '#16b1c4',
  6: '#7a52d6', 7: '#9aa1a8', 8: '#e03131', 9: '#7a2222', 10: '#2f9e44'
};

export default function ModalVideoPlayer() {
  const {
    balance,
    updateBalance,
    videoPlayerActive,
    setVideoPlayerActive,
    activeVideo,
    setActivePage,
    quickAmounts,
    setEditQuickAmountsActive,
    openBetDetailsModal,
    showToast
  } = useApp();

  // Local state for embedded Fast Three
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(9);
  const [isDrawing, setIsDrawing] = useState(false);
  const [issue, setIssue] = useState(202606041274);
  const [lastDice, setLastDice] = useState([1, 3, 6]);
  const [analysis, setAnalysis] = useState({ sum: 10, size: '小', oe: '双' });

  // Betting states
  const [activeTab, setActiveTab] = useState('size'); // size, pair, triple, sum, single
  const [selectedOdds, setSelectedOdds] = useState(new Set());
  const [betAmount, setBetAmount] = useState(50);
  const [manualAmount, setManualAmount] = useState('');

  // Mark Six (六合彩) embedded selections: each entry is { name, odds, category }
  const [selectedM6, setSelectedM6] = useState(new Set());
  const [m6ActiveTab, setM6ActiveTab] = useState('two-sides'); // two-sides, color, zodiac, special
  // Mark Six last draw result: 6 regular + 1 special number
  const [m6Result, setM6Result] = useState([23, 41, 24, 26, 33, 7, 32]);

  // Speed Race (一分极速赛车) embedded selections: key encoded as `${category}|${name}`
  const [selectedSR, setSelectedSR] = useState(new Set());
  const [srActiveTab, setSrActiveTab] = useState('two-sides'); // two-sides, sum, single
  // Speed Race last draw result:排列 1~10
  const [srResult, setSrResult] = useState([1, 2, 7, 9, 4, 10, 6, 5, 8, 3]);

  // Restructured Layout States
  const [vpActiveTab, setVpActiveTab] = useState('chatroom'); // chatroom, play, recommend, more-games
  const [activeCarouselGame, setActiveCarouselGame] = useState('fast3');
  const [activeMoreGamesCat, setActiveMoreGamesCat] = useState('hot');

  // Video details interaction states
  const [likes, setLikes] = useState(198);
  const [hasLiked, setHasLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [favCount, setFavCount] = useState(7);
  const [hasFav, setHasFav] = useState(false);

  // Rotating banner index
  const [bannerIdx, setBannerIdx] = useState(0);

  // Player view modes
  const [immersive, setImmersive] = useState(false); // 沉浸式：视频铺满竖屏
  const [landscape, setLandscape] = useState(false);  // 全屏：强制横屏观看
  const [landscapeSize, setLandscapeSize] = useState({ w: 0, h: 0 });
  const overlayRef = useRef(null);

  // Simulated live chatroom messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, type: 'join', user: 'h***6', text: '进入了直播间' },
    { id: 2, type: 'win', user: 'H***7', game: '麒麟送宝', prize: '155.27' },
    { id: 3, type: 'win', user: 'k***0', game: '麒麟送宝', prize: '154.16' },
    { id: 4, type: 'join', user: 'e***4', text: '进入了直播间' },
    { id: 5, type: 'win', user: 'Z***6', game: '跳起来', prize: '191.74' },
    { id: 6, type: 'win', user: 'F***4', game: '冰球突破', prize: '34.91' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Slots gameplay simulator states
  const [slotsBetAmount, setSlotsBetAmount] = useState(50);
  const [slotsDisplay, setSlotsDisplay] = useState(['🍒', '🍋', '💎']);
  const [slotsSpinning, setSlotsSpinning] = useState(false);

  // Refs for scroll handling
  const chatEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Countdown loop
  useEffect(() => {
    if (!videoPlayerActive) return;
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      performDrawing();
    }
    return () => clearTimeout(timer);
  }, [countdown, videoPlayerActive]);

  const performDrawing = () => {
    setIsDrawing(true);
    let rollCount = 0;
    const rollTimer = setInterval(() => {
      setLastDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      rollCount++;
      if (rollCount >= 10) {
        clearInterval(rollTimer);
        const finalDice = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ];
        setLastDice(finalDice);
        
        const sumVal = finalDice[0] + finalDice[1] + finalDice[2];
        const sizeVal = sumVal >= 11 ? '大' : '小';
        const oeVal = sumVal % 2 === 0 ? '双' : '单';
        setAnalysis({ sum: sumVal, size: sizeVal, oe: oeVal });

        setIssue(prev => prev + 1);
        setCountdown(15);
        setIsDrawing(false);
      }
    }, 100);
  };

  // Rotating banner announcements configuration
  const winningAnnouncements = [
    { name: 'q***6', amount: '184.18', game: '亡灵大盗' },
    { name: 'H***7', amount: '155.27', game: '麒麟送宝' },
    { name: 'k***0', amount: '154.16', game: '麒麟送宝' },
    { name: 'Z***6', amount: '191.74', game: '跳起来' },
    { name: 'F***4', amount: '34.91', game: '冰球突破' }
  ];

  // Rotate winning announcement banner every 3 seconds
  useEffect(() => {
    if (!videoPlayerActive) return;
    const bannerInterval = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % winningAnnouncements.length);
    }, 3000);
    return () => clearInterval(bannerInterval);
  }, [videoPlayerActive]);

  // Dynamic simulated chatroom messages
  useEffect(() => {
    if (!videoPlayerActive || vpActiveTab !== 'chatroom') return;
    const userPool = ['a***1', 'b***2', 'c***3', 'd***4', 'u***9', 'x***8', 'y***7', 'z***5'];
    const gamePool = ['麻将胡了2', '赏金船长', '赏金女王', '大富翁', '一分快三', '跳起来', '冰球突破'];
    
    const simulatorInterval = setInterval(() => {
      const isWin = Math.random() > 0.4;
      const randomUser = userPool[Math.floor(Math.random() * userPool.length)];
      
      let newMsg;
      if (isWin) {
        const randomGame = gamePool[Math.floor(Math.random() * gamePool.length)];
        const randomPrize = (Math.random() * 200 + 20).toFixed(2);
        newMsg = {
          id: Date.now(),
          type: 'win',
          user: randomUser,
          game: randomGame,
          prize: randomPrize
        };
      } else {
        newMsg = {
          id: Date.now(),
          type: 'join',
          user: randomUser,
          text: '进入了直播间'
        };
      }
      
      setChatMessages(prev => {
        const next = [...prev, newMsg];
        if (next.length > 50) next.shift();
        return next;
      });
    }, 2500);

    return () => clearInterval(simulatorInterval);
  }, [videoPlayerActive, vpActiveTab]);

  // Auto scroll chatroom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, vpActiveTab]);

  // Like, Dislike, Favorite click handlers
  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      if (hasDisliked) {
        setDislikes(prev => prev - 1);
        setHasDisliked(false);
      }
      showToast('感谢点赞！');
    }
  };

  const handleDislike = () => {
    if (hasDisliked) {
      setDislikes(prev => prev - 1);
      setHasDisliked(false);
    } else {
      setDislikes(prev => prev + 1);
      setHasDisliked(true);
      if (hasLiked) {
        setLikes(prev => prev - 1);
        setHasLiked(false);
      }
      showToast('我们会继续优化内容！');
    }
  };

  const handleFavorite = () => {
    if (hasFav) {
      setFavCount(prev => prev - 1);
      setHasFav(false);
    } else {
      setFavCount(prev => prev + 1);
      setHasFav(true);
      showToast('已加入您的收藏列表！');
    }
  };

  // Only Fast Three, Mark Six and Speed Race are playable for now
  const playableCarouselGames = ['fast3', 'marksix', 'speedrace'];

  // Switch Watch & Play Carousel Game Selector
  const handleCarouselGameClick = (item) => {
    if (!playableCarouselGames.includes(item.key)) return;
    setActiveCarouselGame(item.key);
    setMenuOpen(false);
    showToast(`已切换至游戏：${item.label}`);
  };

  // Close bet area chevron/x
  const handleBetHeaderClose = () => {
    setVpActiveTab('chatroom');
  };

  // Spin/Play slots game simulator
  const handleSlotsSpin = () => {
    if (balance < slotsBetAmount) {
      showToast('余额不足，请先充值！');
      return;
    }
    if (slotsBetAmount <= 0) {
      showToast('请输入有效的下注金额！');
      return;
    }
    updateBalance(-slotsBetAmount);
    setSlotsSpinning(true);

    const slotItems = ['🍒', '🍋', '💎', '🍇', '🔔', '7️⃣'];
    
    let count = 0;
    const interval = setInterval(() => {
      setSlotsDisplay([
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)]
      ]);
      count++;
      
      if (count >= 10) {
        clearInterval(interval);
        
        const finalResults = [
          slotItems[Math.floor(Math.random() * slotItems.length)],
          slotItems[Math.floor(Math.random() * slotItems.length)],
          slotItems[Math.floor(Math.random() * slotItems.length)]
        ];
        setSlotsDisplay(finalResults);
        setSlotsSpinning(false);

        const uniqueItems = new Set(finalResults);
        if (uniqueItems.size === 1) {
          const prize = slotsBetAmount * 10;
          updateBalance(prize);
          showToast(`恭喜！大满贯！获得 ${prize.toFixed(2)} 元！🎉`);
        } else if (uniqueItems.size === 2) {
          const prize = slotsBetAmount * 2;
          updateBalance(prize);
          showToast(`中奖！获得 ${prize.toFixed(2)} 元！⭐`);
        } else {
          showToast('很遗憾未中奖，换个筹码试试！');
        }
      }
    }, 100);
  };

  // Click handler for Recommended videos
  const recommendedVideosList = [
    { 
      id: 101, 
      title: '诺曼底72小时', 
      img: 'assets/sports_cover.png', 
      rating: '8.2', 
      views: '386次播放',
      tags: ['#剧情', '#战争'],
      description: '影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。'
    },
    { 
      id: 102, 
      title: '繁花', 
      img: 'assets/origami.png', 
      rating: '9.5', 
      views: '1.2万次播放',
      tags: ['#剧情', '#商战'],
      description: '阿宝在上海黄河路的传奇商战风云与情感抉择。展现上世纪九十年代初沪上弄潮儿女的奋斗与爱恨。'
    },
    { 
      id: 103, 
      title: '歌手2026', 
      img: 'assets/chat_cover.png', 
      rating: '9.2', 
      views: '8.2万次播放',
      tags: ['#综艺', '#音乐'],
      description: '《歌手2026》迎来年度歌王争霸之夜！各路实力唱将齐聚一堂，带来精彩纷呈的现场Live表演。'
    }
  ];

  const handleRecommendedVideoClick = (vid) => {
    setActiveVideo(vid);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    showToast(`正在播放：${vid.title}`);
  };

  // More games categories configuration
  const moreGamesCategories = [
    { id: 'hot', label: '热门' },
    { id: 'video', label: '视讯' },
    { id: 'slots', label: '电子' },
    { id: 'sports', label: '体育' },
    { id: 'lottery', label: '彩票' },
    { id: 'fish', label: '捕鱼' }
  ];

  const moreGamesList = {
    hot: [
      { key: 'fast3', label: '一分快三', img: 'assets/game_fast3.png' },
      { key: 'mahjong', label: '麻将胡了2', img: 'assets/game_mahjong.png' },
      { key: 'captain', label: '赏金船长', img: 'assets/origami.png' },
      { key: 'queen', label: '赏金女王', img: 'assets/sports_cover.png' },
      { key: 'goldcity', label: '寻宝黄金城', img: 'assets/drawing.png' },
      { key: 'richman', label: '大富翁', img: 'assets/chat_cover.png' }
    ],
    video: [
      { key: 'ag', label: 'AG视讯', img: 'assets/science.png' },
      { key: 'bg', label: 'BG视讯', img: 'assets/sports_cover.png' },
      { key: 'bbin', label: 'BBIN视讯', img: 'assets/chat_cover.png' }
    ],
    slots: [
      { key: 'mahjong', label: '麻将胡了2', img: 'assets/game_mahjong.png' },
      { key: 'captain', label: '赏金船长', img: 'assets/origami.png' },
      { key: 'queen', label: '赏金女王', img: 'assets/sports_cover.png' },
      { key: 'goldcity', label: '寻宝黄金城', img: 'assets/drawing.png' }
    ],
    sports: [
      { key: 'shaba', label: '沙巴体育', img: 'assets/sports_cover.png' },
      { key: 'crown', label: '皇冠体育', img: 'assets/lego.png' },
      { key: 'imsports', label: 'IM体育', img: 'assets/drawing.png' }
    ],
    lottery: [
      { key: 'fast3', label: '一分快三', img: 'assets/game_fast3.png' },
      { key: 'marksix', label: '一分六合彩', img: 'assets/mo_mark_six.png' },
      { key: 'racing', label: '一分赛车', img: 'assets/speed_race.png' }
    ],
    fish: [
      { key: 'fish1', label: '财神捕鱼', img: 'assets/chat_cover.png' },
      { key: 'fish2', label: '欢乐捕鱼', img: 'assets/drawing.png' }
    ]
  };

  // Mirror the 边看边玩 menu: only Fast Three, Mark Six and Speed Race are openable.
  // Map a more-games key to its playable carousel console.
  const moreGamesPlayableMap = {
    fast3: 'fast3',
    marksix: 'marksix',
    racing: 'speedrace'
  };

  const handleMoreGamesGameClick = (game) => {
    const target = moreGamesPlayableMap[game.key];
    if (!target) return;
    setActiveCarouselGame(target);
    setVpActiveTab('play');
    showToast(`已为您切入：【${game.label}】`);
  };

  if (!videoPlayerActive) return null;

  // Games carousel items
  const carouselGameItems = [
    { key: 'fast3', label: '一分快三', img: 'assets/game_fast3.png' },
    { key: 'marksix', label: '一分六合彩', img: 'assets/mo_mark_six.png' },
    { key: 'speedrace', label: '一分极速赛车', img: 'assets/speed_race.png' },
    { key: 'mahjong', label: '麻将胡了2', img: 'assets/game_mahjong.png' },
    { key: 'captain', label: '赏金船长', img: 'assets/origami.png' },
    { key: 'queen', label: '赏金女王', img: 'assets/sports_cover.png' },
    { key: 'goldcity', label: '寻宝黄金城', img: 'assets/drawing.png' },
    { key: 'richman', label: '大富翁', img: 'assets/chat_cover.png' }
  ];

  // Odds cards lists
  const oddsData = {
    size: [
      { name: '大', odds: '9.75' },
      { name: '小', odds: '9.75' },
      { name: '单', odds: '9.75' },
      { name: '双', odds: '9.75' }
    ],
    pair: [
      { name: '11', odds: '12.5' }, { name: '22', odds: '12.5' }, { name: '33', odds: '12.5' },
      { name: '44', odds: '12.5' }, { name: '55', odds: '12.5' }, { name: '66', odds: '12.5' }
    ],
    triple: [
      { name: '111', odds: '200.0' }, { name: '222', odds: '200.0' }, { name: '333', odds: '200.0' },
      { name: '444', odds: '200.0' }, { name: '555', odds: '200.0' }, { name: '666', odds: '200.0' },
      { name: '任意豹子', odds: '35.0' }
    ],
    sum: [
      { name: '和值4', odds: '80.0' }, { name: '和值5', odds: '40.0' }, { name: '和值6', odds: '25.0' },
      { name: '和值7', odds: '16.0' }, { name: '和值8', odds: '12.0' }, { name: '和值9', odds: '9.0' },
      { name: '和值10', odds: '9.0' }, { name: '和值11', odds: '9.0' }, { name: '和值12', odds: '9.0' },
      { name: '和值13', odds: '12.0' }, { name: '和值14', odds: '16.0' }, { name: '和值15', odds: '25.0' },
      { name: '和值16', odds: '40.0' }, { name: '和值17', odds: '80.0' }
    ],
    single: [
      { name: '1', odds: '2.0' }, { name: '2', odds: '2.0' }, { name: '3', odds: '2.0' },
      { name: '4', odds: '2.0' }, { name: '5', odds: '2.0' }, { name: '6', odds: '2.0' }
    ]
  };

  const handleOddsCardClick = (name) => {
    const nextSet = new Set(selectedOdds);
    if (nextSet.has(name)) {
      nextSet.delete(name);
    } else {
      nextSet.add(name);
    }
    setSelectedOdds(nextSet);
  };

  const activeQuickAmount = manualAmount === '' ? betAmount : 0;

  const handleQuickAmountClick = (val) => {
    setBetAmount(val);
    setManualAmount('');
  };

  const currentBetPrice = manualAmount !== '' ? parseFloat(manualAmount) || 0 : betAmount;
  const totalCost = selectedOdds.size * currentBetPrice;

  const handleResetBets = () => {
    setSelectedOdds(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast("余额已刷新为 ¥3000.00！");
  };

  const handleSubmitBet = () => {
    if (selectedOdds.size === 0) {
      showToast("请选择投注盘口！");
      return;
    }
    if (currentBetPrice <= 0) {
      showToast("请输入或选择有效的投注金额！");
      return;
    }
    if (totalCost > balance) {
      showToast("余额不足，请先充值！");
      return;
    }

    const items = Array.from(selectedOdds).map(name => {
      // Find matching odds from configured grids
      let odds = '9.75'; // default
      if (activeTab === 'pair') odds = '12.5';
      if (activeTab === 'triple') odds = name === '任意豹子' ? '35.0' : '200.0';
      if (activeTab === 'sum') {
        const found = oddsData.sum.find(x => x.name === name);
        odds = found ? found.odds : '9.0';
      }
      if (activeTab === 'single') odds = '2.0';

      return {
        name,
        odds,
        baseVal: currentBetPrice,
        category: activeTab === 'size' ? '大小' : activeTab
      };
    });

    openBetDetailsModal('fast_three_embedded', items);
    // Clear selections locally
    setSelectedOdds(new Set());
  };

  // ===== Mark Six (一分六合彩) embedded gameplay =====
  // Each selection key is encoded as `${category}|${name}`
  const handleM6CardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedM6);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedM6(next);
  };

  const m6Count = selectedM6.size;
  const m6TotalCost = m6Count * currentBetPrice;

  const handleM6Reset = () => {
    setSelectedM6(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleM6Submit = () => {
    if (m6Count === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (m6TotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedM6).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: '9.75', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('mark_six', items);
    setSelectedM6(new Set());
  };

  // ===== Speed Race (一分极速赛车) embedded gameplay =====
  const handleSRCardClick = (category, name) => {
    const key = `${category}|${name}`;
    const next = new Set(selectedSR);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedSR(next);
  };

  const srCount = selectedSR.size;
  const srTotalCost = srCount * currentBetPrice;

  const handleSRReset = () => {
    setSelectedSR(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleSRSubmit = () => {
    if (srCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (srTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedSR).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: '9.75', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('speed_race', items);
    setSelectedSR(new Set());
  };

  const toggleDropdownMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleMenuDropdownItemClick = (label) => {
    showToast(`提示：【${label}】正在对接中，敬请期待！`);
    setMenuOpen(false);
  };

  // 沉浸式：切换视频铺满竖屏
  const toggleImmersive = () => {
    setImmersive(prev => {
      const next = !prev;
      showToast(next ? '已进入沉浸模式' : '已退出沉浸模式');
      return next;
    });
  };

  // 全屏：强制横屏观看（按播放器容器尺寸旋转 90°）
  const enterLandscape = () => {
    const el = overlayRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setLandscapeSize({ w: r.width, h: r.height });
    }
    setLandscape(true);
  };

  return (
    <div className="video-player-overlay active" id="video-player-modal" style={{ display: 'flex' }} ref={overlayRef}>
      <div className={`split-player-container ${immersive ? 'immersive' : ''}`}>

        {/* 1/3 Top Mock Video Player */}
        <div className="mock-player-box">
          <img id="modal-player-still" src={activeVideo?.img || "assets/sports_cover.png"} alt="播放视频" />
          <div className="player-hud-top">
            <button id="btn-close-player" className="player-close-btn" onClick={() => setVideoPlayerActive(false)}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <span className="video-watermark-overlay">影院独播 1080P</span>
          </div>
          <div className="player-hud-center">
            <i className="fa-solid fa-circle-play player-btn-main"></i>
          </div>
          <div className="player-hud-bottom">
            <i className="fa-solid fa-pause"></i>
            <div className="player-progress-track">
              <div className="progress-indicator" style={{ width: '32%' }}></div>
            </div>
            <span className="time-lbl">02:18 / 95:00</span>
            <i className="fa-solid fa-gear player-hud-icon" title="设置" onClick={() => showToast('画质 / 倍速设置开发中')}></i>
            <i className={`fa-solid fa-film player-hud-icon ${immersive ? 'active' : ''}`} title="沉浸式" onClick={toggleImmersive}></i>
            <i className="fa-solid fa-up-right-and-down-left-from-center player-hud-icon" title="全屏" onClick={enterLandscape}></i>
          </div>
        </div>

        {/* 2/3 Scrollable Video Info & Games Content */}
        <div className="player-scroll-content" ref={scrollContainerRef}>
          
          {/* Video Info Block & Tab Bar - Only show when NOT in Watch & Play tab */}
          {vpActiveTab !== 'play' && (
            <>
              {/* Video Info Block */}
              <div className="vp-video-info-block">
                <h3 className="vp-video-title">
                  {activeVideo?.title || "诺曼底72小时"}
                </h3>
                
                {/* Meta stats row */}
                <div className="vp-video-meta-row">
                  <div className="vp-meta-item">
                    <i className="fa-regular fa-clock"></i>
                    <span>{activeVideo?.views ? "3天前" : "昨天 01:00"}</span>
                  </div>
                  <div className="vp-meta-item">
                    <i className="fa-regular fa-eye"></i>
                    <span>{activeVideo?.views || "1.9万"}</span>
                  </div>
                  <div className="vp-meta-item">
                    <i className="fa-solid fa-star meta-star"></i>
                    <span>{activeVideo?.rating || "8.2"}</span>
                  </div>
                </div>

                {/* Tags row */}
                <div className="vp-video-tags-row">
                  {(activeVideo?.tags || ['#剧情', '#战争']).map((tag, idx) => (
                    <span key={idx} className="vp-video-tag">{tag}</span>
                  ))}
                </div>

                {/* Description block */}
                <div className="vp-video-description-box" style={{ 
                  margin: '8px 12px', 
                  padding: '10px 0', 
                  borderTop: '1px solid #f1f5f9',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.78rem', 
                  color: '#4b5563', 
                  lineHeight: '1.45',
                  textAlign: 'justify'
                }}>
                  {activeVideo?.description || "影片聚焦诺曼底登陆前夕的紧张局势，围绕盟军远征军最高司令部首席气象学家詹姆斯斯塔格上校（安德鲁斯科特饰）展开，他的职责是向盟军最高指挥官德怀特特戴维汇报天气情况，决定登陆的最佳时机。"}
                  <span style={{ color: '#3b82f6', cursor: 'pointer', marginLeft: '4px', fontWeight: '500' }} onClick={() => showToast('详情功能暂未开放')}>
                    详情 &gt;
                  </span>
                </div>

                {/* Actions row */}
                <div className="vp-actions-row">
                  <button className={`vp-action-btn ${hasLiked ? 'active' : ''}`} onClick={handleLike}>
                    <i className={`${hasLiked ? 'fa-solid' : 'fa-regular'} fa-thumbs-up`}></i>
                    <span>{likes}</span>
                  </button>
                  <button className={`vp-action-btn ${hasDisliked ? 'active' : ''}`} onClick={handleDislike}>
                    <i className={`${hasDisliked ? 'fa-solid' : 'fa-regular'} fa-thumbs-down`}></i>
                    <span>{dislikes}</span>
                  </button>
                  <button className="vp-action-btn" onClick={() => showToast('评论功能暂未开放')}>
                    <i className="fa-regular fa-comment-dots"></i>
                    <span>0</span>
                  </button>
                  <button className={`vp-action-btn ${hasFav ? 'active' : ''}`} onClick={handleFavorite}>
                    <i className={`${hasFav ? 'fa-solid' : 'fa-regular'} fa-star`}></i>
                    <span>{favCount}</span>
                  </button>
                </div>

                {/* Rotating winning banner */}
                <div className="vp-winning-banner">
                  <div className="vp-banner-left">
                    <span className="vp-banner-badge">恭喜中奖</span>
                    <span className="vp-banner-text">
                      恭喜 <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{winningAnnouncements[bannerIdx].name}</span> 赢的 <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{winningAnnouncements[bannerIdx].amount}</span> 元
                    </span>
                  </div>
                  <div className="vp-banner-right">
                    <span className="vp-banner-game-tag">{winningAnnouncements[bannerIdx].game}</span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </div>
              </div>

              {/* Sticky Tab Bar */}
              <div className="vp-tab-bar">
                <button className={`vp-tab-btn ${vpActiveTab === 'chatroom' ? 'active' : ''}`} onClick={() => setVpActiveTab('chatroom')}>
                  聊天室
                </button>
                <button className={`vp-tab-btn ${vpActiveTab === 'play' ? 'active' : ''}`} onClick={() => setVpActiveTab('play')}>
                  边看边玩
                </button>
                <button className={`vp-tab-btn ${vpActiveTab === 'recommend' ? 'active' : ''}`} onClick={() => setVpActiveTab('recommend')}>
                  为您推荐
                </button>
                <button className={`vp-tab-btn ${vpActiveTab === 'more-games' ? 'active' : ''}`} onClick={() => setVpActiveTab('more-games')}>
                  更多游戏
                </button>
              </div>
            </>
          )}

          {/* Tab Content Panel */}
          <div className="vp-tab-content">
            {vpActiveTab === 'chatroom' && (
              <div className="vp-chatroom-panel">
                <div className="vp-chat-messages-list">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="vp-chat-msg-row">
                      {msg.type === 'join' ? (
                        <>
                          <span className="vp-msg-badge join">进入</span>
                          <span className="vp-chat-user">{msg.user}</span>
                          <span className="vp-chat-text">{msg.text || '进入了直播间'}</span>
                        </>
                      ) : (
                        <>
                          <span className="vp-msg-badge win">中奖</span>
                          <span className="vp-chat-user">{msg.user}</span>
                          <span className="vp-chat-text">
                            在 <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{msg.game}</span> 中中了 <span className="vp-chat-win-highlight">{msg.prize} 元</span>
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Chat bottom bar */}
                <div className="vp-chatroom-bottom-bar">
                  <div className="vp-chat-input-wrap">
                    <i className="fa-regular fa-comment-dots"></i>
                    <input 
                      type="text" 
                      placeholder="说点什么~" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          setChatMessages(prev => [
                            ...prev, 
                            { id: Date.now(), type: 'join', user: '我', text: chatInput.trim() }
                          ]);
                          setChatInput('');
                        }
                      }}
                    />
                  </div>
                  <button className="vp-chat-bet-btn" onClick={() => setVpActiveTab('play')}>
                    立即下注
                  </button>
                </div>
              </div>
            )}

            {vpActiveTab === 'play' && (
              <div className="vp-play-panel">
                {/* Game Carousel Switcher */}
                <div className="vp-game-carousel">
                  {carouselGameItems.map(item => {
                    const isPlayable = playableCarouselGames.includes(item.key);
                    return (
                      <div
                        key={item.key}
                        className={`vp-game-card ${activeCarouselGame === item.key ? 'active' : ''} ${isPlayable ? '' : 'disabled'}`}
                        onClick={() => handleCarouselGameClick(item)}
                      >
                        <img src={item.img} alt={item.label} />
                        <span className="vp-game-label-capsule">{item.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Betting Area - conditional on selected game */}
                {activeCarouselGame === 'fast3' ? (
                  // Fully interactive Fast Three Lottery console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <i className="fa-solid fa-dice" style={{ color: '#3b82f6' }}></i>
                          <span>一分快三</span>
                        </div>
                        <div className="vp-bet-countdown-box">
                          <span className="vp-digit-box">0</span>
                          <span className="vp-digit-box">0</span>
                          <span className="vp-digit-colon">:</span>
                          <span className="vp-digit-box">{Math.floor(countdown / 10)}</span>
                          <span className="vp-digit-box">{countdown % 10}</span>
                        </div>
                        <div className="vp-bet-header-right">
                          <i className="fa-solid fa-list" onClick={toggleDropdownMenu}></i>
                          <i className="fa-solid fa-xmark" onClick={handleBetHeaderClose}></i>
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div 
                              key={opt} 
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        <div className="fast3-draw-balls" style={{ gap: '4px' }}>
                          {lastDice.map((val, idx) => (
                            <div key={idx} className={`dice dice-${val}`} style={{ width: '18px', height: '18px' }}>
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
                      </div>
                    </div>

                    <div className="embedded-game-body" style={{ backgroundColor: '#f8fafc' }}>
                      {/* Play tabs */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'size', label: '大小' },
                          { cat: 'pair', label: '对子' },
                          { cat: 'triple', label: '豹子' },
                          { cat: 'sum', label: '总和' },
                          { cat: 'single', label: '单骰' }
                        ].map(tab => (
                          <div 
                            key={tab.cat}
                            className={`live-play-tab ${activeTab === tab.cat ? 'active' : ''}`}
                            onClick={() => {
                              setActiveTab(tab.cat);
                              setSelectedOdds(new Set());
                            }}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      {/* Betting Options Grid */}
                      <div className="vid-fast3-options-wrap" style={{ padding: '8px 12px', minHeight: '120px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                        <div className="live-betting-options-grid active" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {oddsData[activeTab]?.map(card => {
                            const isSelected = selectedOdds.has(card.name);
                            return (
                              <div 
                                key={card.name}
                                className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleOddsCardClick(card.name)}
                                style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                              >
                                <div className="odds-card-name" style={{ fontSize: '0.75rem' }}>{renderDiceOptionName(card.name)}</div>
                                <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>{card.odds}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Embedded game betting console */}
                      <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                        {/* Top Info Row */}
                        <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                          <div className="info-balance-box">
                            余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                            <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                          </div>
                          <div className="info-selected-box">
                            下注金额: <span className="console-selected-value">{totalCost.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Middle Action Row */}
                        <div className="bet-console-action-row" style={{ gap: '6px' }}>
                          <div className="quick-amounts-bar" style={{ padding: '2px', gap: '3px' }}>
                            {quickAmounts.map(val => (
                              <div 
                                key={val}
                                className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                                onClick={() => handleQuickAmountClick(val)}
                                style={{ fontSize: '0.65rem', padding: '4px 6px' }}
                              >
                                {val}
                              </div>
                            ))}
                          </div>
                          <input 
                            type="number" 
                            className="manual-amount-input" 
                            placeholder="输入金额" 
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                          />
                        </div>

                        {/* Bottom Button Row */}
                        <div className="bet-console-buttons-row">
                          <button className="console-cancel-btn" onClick={handleResetBets} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                            <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                          </button>
                          <button className="console-submit-btn active" onClick={handleSubmitBet} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                            提交下注
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'marksix' ? (
                  // Mark Six (一分六合彩) lottery console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <i className="fa-solid fa-table-cells" style={{ color: '#e03131' }}></i>
                          <span>一分六合彩</span>
                        </div>
                        <div className="vp-bet-countdown-box">
                          <span className="vp-digit-box">0</span>
                          <span className="vp-digit-box">0</span>
                          <span className="vp-digit-colon">:</span>
                          <span className="vp-digit-box">{Math.floor(countdown / 10)}</span>
                          <span className="vp-digit-box">{countdown % 10}</span>
                        </div>
                        <div className="vp-bet-header-right">
                          <i className="fa-solid fa-list" onClick={toggleDropdownMenu}></i>
                          <i className="fa-solid fa-xmark" onClick={handleBetHeaderClose}></i>
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div 
                              key={opt} 
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        <div className="vp-m6-result-balls">
                          {m6Result.slice(0, 6).map((n, idx) => (
                            <span key={idx} className={`vp-m6-result-ball ball-${getM6BallColor(n)}`}>{n.toString().padStart(2, '0')}</span>
                          ))}
                          <span className="vp-m6-result-plus">+</span>
                          <span className={`vp-m6-result-ball ball-${getM6BallColor(m6Result[6])}`}>{m6Result[6].toString().padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="embedded-game-body" style={{ backgroundColor: '#f8fafc' }}>
                      {/* Play category tabs */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'two-sides', label: '两面' },
                          { cat: 'color', label: '色波' },
                          { cat: 'zodiac', label: '生肖' },
                          { cat: 'special', label: '特码' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${m6ActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setM6ActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        {/* 两面 */}
                        {m6ActiveTab === 'two-sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['大', '小', '单', '双'].map(name => {
                              const isSelected = selectedM6.has(`两面|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('两面', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 色波 */}
                        {m6ActiveTab === 'color' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {[{ name: '红', color: '#e03131' }, { name: '绿', color: '#2f9e44' }, { name: '蓝', color: '#1c7ed6' }].map(opt => {
                              const isSelected = selectedM6.has(`色波|${opt.name}`);
                              return (
                                <div
                                  key={opt.name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('色波', opt.name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px', color: opt.color }}>{opt.name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 生肖 */}
                        {m6ActiveTab === 'zodiac' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                            {M6_ZODIACS.map(name => {
                              const isSelected = selectedM6.has(`生肖|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('生肖', name)}
                                  style={{ height: '48px', padding: '0 2px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.8rem', marginBottom: '2px' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.62rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 特码 */}
                        {m6ActiveTab === 'special' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                            {Array.from({ length: 49 }, (_, i) => i + 1).map(n => {
                              const name = n.toString().padStart(2, '0');
                              const isSelected = selectedM6.has(`特码|${name}`);
                              return (
                                <div
                                  key={n}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('特码', name)}
                                  style={{ height: '46px', padding: '2px' }}
                                >
                                  <span className={`m6new-num-ball ball-${getM6BallColor(n)}`} style={{ width: '24px', height: '24px', fontSize: '0.6rem', marginBottom: '2px' }}>{name}</span>
                                  <div className="odds-card-val" style={{ fontSize: '0.55rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{m6Count}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{m6TotalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <div className="quick-amounts-bar" style={{ padding: '2px', gap: '3px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.65rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleM6Reset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleM6Submit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'speedrace' ? (
                  // Speed Race (一分极速赛车) lottery console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <i className="fa-solid fa-flag-checkered" style={{ color: '#2f9e44' }}></i>
                          <span>一分极速赛车</span>
                        </div>
                        <div className="vp-bet-countdown-box">
                          <span className="vp-digit-box">0</span>
                          <span className="vp-digit-box">0</span>
                          <span className="vp-digit-colon">:</span>
                          <span className="vp-digit-box">{Math.floor(countdown / 10)}</span>
                          <span className="vp-digit-box">{countdown % 10}</span>
                        </div>
                        <div className="vp-bet-header-right">
                          <i className="fa-solid fa-list" onClick={toggleDropdownMenu}></i>
                          <i className="fa-solid fa-xmark" onClick={handleBetHeaderClose}></i>
                        </div>
                      </div>

                      {menuOpen && (
                        <div className="feg-dropdown open" style={{ display: 'block', top: '35px' }}>
                          {['未结明细', '今日已结', '报表查询', '开奖历史', '活动规则'].map(opt => (
                            <div 
                              key={opt} 
                              className="feg-dropdown-item"
                              onClick={() => handleMenuDropdownItemClick(opt)}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        <div className="vp-sr-result-balls" style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                          {srResult.map((n, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: '18px', height: '18px', borderRadius: '50%',
                                background: RACE_COLORS[n], color: '#fff', fontSize: '0.6rem', fontWeight: 'bold'
                              }}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="embedded-game-body" style={{ backgroundColor: '#f8fafc' }}>
                      {/* Play category tabs */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'two-sides', label: '冠军两面' },
                          { cat: 'sum', label: '冠亚和' },
                          { cat: 'single', label: '冠军单码' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${srActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setSrActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        {/* 冠军两面 */}
                        {srActiveTab === 'two-sides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['大', '小', '单', '双'].map(name => {
                              const isSelected = selectedSR.has(`冠军两面|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRCardClick('冠军两面', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 冠亚和 */}
                        {srActiveTab === 'sum' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {['和大', '和小', '和单', '和双'].map(name => {
                              const isSelected = selectedSR.has(`冠亚和|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRCardClick('冠亚和', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 冠军单码 */}
                        {srActiveTab === 'single' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                              const name = String(num);
                              const isSelected = selectedSR.has(`冠军单码|${name}`);
                              return (
                                <div
                                  key={num}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSRCardClick('冠军单码', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <span
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      width: '22px', height: '22px', borderRadius: '50%',
                                      background: RACE_COLORS[num], color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '2px'
                                    }}
                                  >
                                    {num}
                                  </span>
                                  <div className="odds-card-val" style={{ fontSize: '0.6rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{srCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{srTotalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <div className="quick-amounts-bar" style={{ padding: '2px', gap: '3px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.65rem', padding: '4px 6px' }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                        <input
                          type="number"
                          className="manual-amount-input"
                          placeholder="输入金额"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleSRReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleSRSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Interactive slots gameplay panel
                  <div className="vp-slots-betting-box">
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          <i className="fa-solid fa-gamepad" style={{ color: '#d97706' }}></i>
                          <span>{carouselGameItems.find(g => g.key === activeCarouselGame)?.label || '电子游戏'}</span>
                        </div>
                        <div className="vp-bet-header-right">
                          <i className="fa-solid fa-xmark" onClick={handleBetHeaderClose}></i>
                        </div>
                      </div>
                    </div>

                    {/* Slots display screen */}
                    <div className="vp-slots-display-grid">
                      <div className={`vp-slots-column ${slotsSpinning ? 'spinning' : ''}`}>
                        {slotsDisplay[0]}
                      </div>
                      <div className={`vp-slots-column ${slotsSpinning ? 'spinning' : ''}`}>
                        {slotsDisplay[1]}
                      </div>
                      <div className={`vp-slots-column ${slotsSpinning ? 'spinning' : ''}`}>
                        {slotsDisplay[2]}
                      </div>
                    </div>

                    {/* Slots betting console */}
                    <div className="vp-slots-console">
                      <div className="vp-slots-info-row">
                        <span>余额: <span style={{ color: '#3b82f6' }}>¥{balance.toFixed(2)}</span></span>
                        <span>投注额: <span style={{ color: '#ef4444' }}>¥{slotsBetAmount}</span></span>
                      </div>

                      <div className="vp-slots-input-row">
                        <label>筹码选择:</label>
                        <div className="vp-slots-amount-select">
                          {[10, 50, 100, 500].map(amt => (
                            <button 
                              key={amt}
                              className={`vp-slots-chip-btn ${slotsBetAmount === amt ? 'active' : ''}`}
                              onClick={() => setSlotsBetAmount(amt)}
                            >
                              {amt}
                            </button>
                          ))}
                        </div>
                        <input 
                          type="number" 
                          className="vp-slots-input"
                          value={slotsBetAmount}
                          onChange={(e) => setSlotsBetAmount(Number(e.target.value))}
                        />
                      </div>

                      <button 
                        className="vp-slots-spin-btn" 
                        onClick={handleSlotsSpin}
                        disabled={slotsSpinning}
                      >
                        {slotsSpinning ? '正在旋转...' : '🎰 旋转拉霸 (开始投注)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {vpActiveTab === 'recommend' && (
              <div className="vp-recommend-panel">
                {/* Narrow VIP ad banner */}
                <div className="vp-promo-banner" onClick={() => showToast('恭喜！特权赠送活动正在对接中！')}>
                  <div>
                    <span className="vp-promo-badge">VIP</span>
                    <span>开通特权 送钱 畅享全站资源... 可游戏 可提现 可约炮</span>
                  </div>
                  <span style={{ color: '#f59e0b', fontSize: '0.65rem' }}>立即开通 &gt;&gt;</span>
                </div>

                {/* 3 videos row */}
                <div className="vp-recommend-grid">
                  {recommendedVideosList.map(vid => (
                    <div key={vid.id} className="vp-recommend-card" onClick={() => handleRecommendedVideoClick(vid)}>
                      <div className="vp-recommend-thumb">
                        <img src={vid.img} alt={vid.title} />
                        <span className="vp-recommend-badge-free">免费</span>
                        <div className="vp-recommend-rating">
                          <i className="fa-solid fa-star"></i>
                          <span>{vid.rating}</span>
                        </div>
                        <div className="vp-recommend-views">
                          <i className="fa-regular fa-eye"></i>
                          <span>{vid.views}</span>
                        </div>
                        <div className="vp-recommend-play-overlay">
                          <i className="fa-solid fa-play"></i>
                        </div>
                      </div>
                      <span className="vp-recommend-title">{vid.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {vpActiveTab === 'more-games' && (
              <div className="vp-moregames-panel">
                {/* Sub category tabs */}
                <div className="vp-moregames-cats">
                  {moreGamesCategories.map(cat => (
                    <div 
                      key={cat.id}
                      className={`vp-moregames-cat-pill ${activeMoreGamesCat === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveMoreGamesCat(cat.id)}
                    >
                      {cat.label}
                    </div>
                  ))}
                </div>

                {/* Games grid */}
                <div className="vp-moregames-grid">
                  {moreGamesList[activeMoreGamesCat]?.map(game => {
                    const isPlayable = !!moreGamesPlayableMap[game.key];
                    return (
                      <div
                        key={game.key}
                        className={`vp-moregames-item ${isPlayable ? '' : 'disabled'}`}
                        onClick={() => handleMoreGamesGameClick(game)}
                      >
                        <div className="vp-moregames-icon-box">
                          <img src={game.img} alt={game.label} />
                        </div>
                        <span className="vp-moregames-label">{game.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 全屏：强制横屏观看，按容器尺寸旋转 90° 铺满 */}
      {landscape && (
        <div
          className="player-landscape-overlay"
          style={{
            width: landscapeSize.h,
            height: landscapeSize.w,
            left: (landscapeSize.w - landscapeSize.h) / 2,
            top: (landscapeSize.h - landscapeSize.w) / 2,
            transform: 'rotate(90deg)'
          }}
        >
          <img className="landscape-video-img" src={activeVideo?.img || 'assets/sports_cover.png'} alt="横屏播放" />
          <button className="landscape-exit-btn" onClick={() => setLandscape(false)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="video-watermark-overlay">影院独播 1080P</span>
          <div className="landscape-hud-bottom">
            <i className="fa-solid fa-pause"></i>
            <div className="player-progress-track">
              <div className="progress-indicator" style={{ width: '32%' }}></div>
            </div>
            <span className="time-lbl">02:18 / 95:00</span>
            <i className="fa-solid fa-down-left-and-up-right-to-center player-hud-icon" title="退出全屏" onClick={() => setLandscape(false)}></i>
          </div>
        </div>
      )}
    </div>
  );
}
