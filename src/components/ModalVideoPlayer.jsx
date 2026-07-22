import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// 快三点位：用 public/K3-ball/{1-6}.png 骰子球图渲染点数（单/对/豹子按数量调整大小）
const renderDiceOptionName = (name) => {
  if (/^\d+$/.test(name)) {
    const digits = name.split('');
    const size = digits.length === 1 ? 42 : digits.length === 2 ? 32 : 24;
    return (
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center' }}>
        {digits.map((val, idx) => (
          <img key={idx} src={`K3-ball/${val}.png`} alt={val} style={{ width: `${size}px`, height: `${size}px` }} />
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

// 鱼虾蟹（魚蝦蟹）六面图案 —— 图标来自 public/鱼虾蟹/
const FISH_CRAB_SYMBOLS = [
  { key: 'fish', label: '鱼', icon: '鱼虾蟹/鱼.svg', color: '#e03131' },
  { key: 'prawn', label: '虾', icon: '鱼虾蟹/虾.svg', color: '#2f9e44' },
  { key: 'crab', label: '蟹', icon: '鱼虾蟹/蟹.svg', color: '#2f9e44' },
  { key: 'gourd', label: '葫芦', icon: '鱼虾蟹/葫芦.svg', color: '#1971c2' },
  { key: 'coin', label: '金钱', icon: '鱼虾蟹/金钱.svg', color: '#1971c2' },
  { key: 'rooster', label: '鸡', icon: '鱼虾蟹/鸡.svg', color: '#c2255c' }
];

// ===== 百家乐 (Baccarat) 配置 —— 扑克牌素材来自 public/poker/{花色}/{点数}.svg =====
const BAC_C = { banker: '#e5405e', player: '#12a5cf', tie: '#2fb344', gold: '#e8912a' };
// 庄闲：庄/闲左右两列（竖），和/庄幸运6 中间上下
const BAC_MAIN = [
  { name: '庄', odds: '1.95', color: BAC_C.banker, area: 'z' },
  { name: '和', odds: '9.0', color: BAC_C.tie, area: 'h' },
  { name: '庄幸运6', odds: '12.0', color: BAC_C.gold, area: 'l' },
  { name: '闲', odds: '2.0', color: BAC_C.player, area: 'x' }
];
const BAC_PAIR = [
  { name: '庄对', odds: '12.0', color: BAC_C.banker },
  { name: '闲对', odds: '12.0', color: BAC_C.player },
  { name: '任意对子', odds: '6.0', color: BAC_C.tie },
  { name: '完美对子', odds: '26.0', color: BAC_C.gold }
];
const BAC_SIDES = [
  { name: '闲单', odds: '1.96', color: BAC_C.player },
  { name: '闲双', odds: '1.96', color: BAC_C.player },
  { name: '庄单', odds: '1.96', color: BAC_C.banker },
  { name: '庄双', odds: '1.96', color: BAC_C.banker }
];
// 百家乐点数：A=1，10/J/Q/K=0，其余按面值；总和取个位
const bacCardPoint = (rank) => (rank === 'A' ? 1 : ['10', 'J', 'Q', 'K'].includes(rank) ? 0 : parseInt(rank, 10));
const bacHandPoints = (cards) => cards.reduce((s, c) => s + bacCardPoint(c.rank), 0) % 10;

// ===== 动物运动会（冠军玩法）—— 开奖用 public/T-ball/T{1-6}.svg =====
const ANIMAL_C = { blue: '#5b7cf5', orange: '#f0a83a' };
const ANIMAL_TWOSIDES = [
  { name: '大', color: ANIMAL_C.blue }, { name: '小', color: ANIMAL_C.orange },
  { name: '单', color: ANIMAL_C.blue }, { name: '双', color: ANIMAL_C.orange },
  { name: '龙', color: ANIMAL_C.blue }, { name: '虎', color: ANIMAL_C.orange }
];

export default function ModalVideoPlayer({ embedded = false, onClose } = {}) {
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
  const [countdown, setCountdown] = useState(55);
  const [phase, setPhase] = useState('betting'); // 'betting' | 'sealed'（封盘含开奖）
  const [issue, setIssue] = useState(202606041274);
  const [lastDice, setLastDice] = useState([1, 3, 6]);
  const [analysis, setAnalysis] = useState({ sum: 10, size: '小', oe: '双' });

  // Betting states
  const [activeTab, setActiveTab] = useState('size'); // size, pair, triple, sum, single
  const [selectedOdds, setSelectedOdds] = useState(new Set());
  const [betAmount, setBetAmount] = useState(50);
  const [manualAmount, setManualAmount] = useState('');
  const [manualFocused, setManualFocused] = useState(false); // 是否聚焦「输入金额」

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

  // 鱼虾蟹 (Fish-Prawn-Crab) embedded selections: key encoded as `${category}|${symbolKey}`
  const [selectedFC, setSelectedFC] = useState(new Set());
  const [fcActiveTab, setFcActiveTab] = useState('single'); // single(单骰), all(全围)
  const [showFcRules, setShowFcRules] = useState(false);
  // 鱼虾蟹 last draw result: three symbol keys
  const [fcResult, setFcResult] = useState(['fish', 'coin', 'rooster']);

  // 百家乐 (Baccarat) selections: key `${category}|${name}`
  const [selectedBac, setSelectedBac] = useState(new Set());
  const [bacActiveTab, setBacActiveTab] = useState('main'); // main(庄闲), pair(对子), sides(两面)
  const [showBacRules, setShowBacRules] = useState(false);
  // 百家乐当前牌局（补牌示例：闲 2♠3♦=5点→补 4♣=9点；庄 4♥A♠=5点，闲三张为4→补 2♦=7点）
  const [bacPlayer] = useState([{ suit: 'spade', rank: '2' }, { suit: 'diamond', rank: '3' }, { suit: 'club', rank: '4' }]);
  const [bacBanker] = useState([{ suit: 'heart', rank: '4' }, { suit: 'spade', rank: 'A' }, { suit: 'diamond', rank: '2' }]);

  // 动物运动会 (Animal Sports) selections: key `${category}|${name}`
  const [selectedAnimal, setSelectedAnimal] = useState(new Set());
  const [animalActiveTab, setAnimalActiveTab] = useState('twosides'); // twosides(冠军两面), single(冠军单码)
  // 动物运动会开奖结果：名次排列（T-ball 1~6）
  const [animalResult] = useState([3, 1, 5, 2, 6, 4]);

  // Restructured Layout States
  const [vpActiveTab, setVpActiveTab] = useState('chatroom'); // chatroom, play, recommend, more-games
  const [activeCarouselGame, setActiveCarouselGame] = useState('fast3');
  const [carouselOpen, setCarouselOpen] = useState(false); // 短剧模式：切换游戏面板是否展开
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

  // 投注时长：百家乐 25 秒，其他游戏 55 秒（+ 5 秒封盘含开奖）
  const SEALED_SECONDS = 5;
  const getBettingSeconds = () => (activeCarouselGame === 'baccarat' ? 25 : 55);

  // 切换游戏时重置本期倒计时为该游戏的投注时长
  useEffect(() => {
    setPhase('betting');
    setCountdown(activeCarouselGame === 'baccarat' ? 25 : 55);
  }, [activeCarouselGame]);

  // 倒计时状态机：投注(倒计时) → 封盘(含开奖, 5秒) → 下一期
  useEffect(() => {
    if (!videoPlayerActive && !embedded) return;
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (phase === 'betting') {
      // 进入封盘并开奖
      performDrawing();
      setPhase('sealed');
      setCountdown(SEALED_SECONDS);
    } else {
      // 封盘结束，进入下一期投注
      setIssue(prev => prev + 1);
      setPhase('betting');
      setCountdown(getBettingSeconds());
    }
    return () => clearTimeout(timer);
  }, [countdown, phase, videoPlayerActive, activeCarouselGame]);

  // 开奖：更新快三骰子/分析结果（不再重置倒计时，由状态机负责）
  const performDrawing = () => {
    const finalDice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    setLastDice(finalDice);
    const sumVal = finalDice[0] + finalDice[1] + finalDice[2];
    setAnalysis({ sum: sumVal, size: sumVal >= 11 ? '大' : '小', oe: sumVal % 2 === 0 ? '双' : '单' });
  };

  // 倒计时显示：投注中(数字) → 已封盘
  const renderCountdown = () => {
    if (phase === 'sealed') {
      return <span className="vp-phase-tag vp-phase-sealed">已封盘</span>;
    }
    return (
      <div className="vp-bet-countdown-box">
        <span className="vp-digit-box">0</span>
        <span className="vp-digit-box">0</span>
        <span className="vp-digit-colon">:</span>
        <span className="vp-digit-box">{Math.floor(countdown / 10)}</span>
        <span className="vp-digit-box">{countdown % 10}</span>
      </div>
    );
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
  const playableCarouselGames = ['fast3', 'marksix', 'speedrace', 'animal', 'fishcrab', 'baccarat'];

  // Switch Watch & Play Carousel Game Selector
  const handleCarouselGameClick = (item) => {
    if (!playableCarouselGames.includes(item.key)) return;
    setActiveCarouselGame(item.key);
    setMenuOpen(false);
    if (embedded) setCarouselOpen(false); // 短剧：选择游戏后关闭切换面板
    showToast(`已切换至游戏：${item.label}`);
  };

  // Close bet area chevron/x
  const handleBetHeaderClose = () => {
    if (embedded) {
      onClose?.();
      return;
    }
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

  if (!videoPlayerActive && !embedded) return null;

  // Games carousel items
  const carouselGameItems = [
    { key: 'fast3', label: '一分快三', img: '游戏图标/701010.png' },
    { key: 'marksix', label: '一分六合彩', img: '游戏图标/1070110.png' },
    { key: 'speedrace', label: '一分极速赛车', img: '游戏图标/1062010.png' },
    { key: 'animal', label: '动物运动会', img: '游戏图标/1001-D6CpfLEz.png' },
    { key: 'fishcrab', label: '鱼虾蟹', img: '鱼虾蟹/鱼.svg' },
    { key: 'baccarat', label: '百家乐', emoji: '🃏' },
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
      { name: '全豹', odds: '35.0' }
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

  const activeQuickAmount = (manualFocused || manualAmount !== '') ? 0 : betAmount;

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
      if (activeTab === 'triple') odds = name === '全豹' ? '35.0' : '200.0';
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

  // ===== 鱼虾蟹 (Fish-Prawn-Crab) embedded gameplay =====
  const FC_ODDS = { single: '1.97', all: '180.0' };
  const handleFCCardClick = (category, symbolKey) => {
    const key = `${category}|${symbolKey}`;
    const next = new Set(selectedFC);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedFC(next);
  };

  const fcCount = selectedFC.size;
  const fcTotalCost = fcCount * currentBetPrice;

  const handleFCReset = () => {
    setSelectedFC(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleFCSubmit = () => {
    if (fcCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (fcTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedFC).map(key => {
      const [category, symbolKey] = key.split('|');
      const sym = FISH_CRAB_SYMBOLS.find(s => s.key === symbolKey);
      return {
        name: sym ? sym.label : symbolKey,
        odds: category === '全围' ? FC_ODDS.all : FC_ODDS.single,
        baseVal: currentBetPrice,
        category
      };
    });
    openBetDetailsModal('fish_crab', items);
    setSelectedFC(new Set());
  };

  // ===== 百家乐 (Baccarat) embedded gameplay =====
  const BAC_ALL = [...BAC_MAIN, ...BAC_PAIR, ...BAC_SIDES];
  const bacCategoryOf = { main: '庄闲', pair: '对子', sides: '两面' };
  // 互斥盘口：选中其一会取消同组其他项（庄/闲，闲单/闲双，庄单/庄双）
  const BAC_EXCLUSIVE = {
    '庄闲|庄': ['庄闲|闲'],
    '庄闲|闲': ['庄闲|庄'],
    '两面|闲单': ['两面|闲双'],
    '两面|闲双': ['两面|闲单'],
    '两面|庄单': ['两面|庄双'],
    '两面|庄双': ['两面|庄单']
  };
  const handleBacCardClick = (name) => {
    const key = `${bacCategoryOf[bacActiveTab]}|${name}`;
    const next = new Set(selectedBac);
    if (next.has(key)) {
      next.delete(key);
    } else {
      (BAC_EXCLUSIVE[key] || []).forEach(k => next.delete(k));
      next.add(key);
    }
    setSelectedBac(next);
  };

  const bacCount = selectedBac.size;
  const bacTotalCost = bacCount * currentBetPrice;

  const handleBacReset = () => {
    setSelectedBac(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleBacSubmit = () => {
    if (bacCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (bacTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedBac).map(key => {
      const [category, name] = key.split('|');
      const def = BAC_ALL.find(b => b.name === name);
      return { name, odds: def ? def.odds : '2.0', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('baccarat', items);
    setSelectedBac(new Set());
  };

  // ===== 动物运动会 (Animal Sports) embedded gameplay =====
  const animalCatOf = { twosides: '冠军两面', single: '冠军单码' };
  const handleAnimalCardClick = (name) => {
    const key = `${animalCatOf[animalActiveTab]}|${name}`;
    const next = new Set(selectedAnimal);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedAnimal(next);
  };

  const animalCount = selectedAnimal.size;
  const animalTotalCost = animalCount * currentBetPrice;

  const handleAnimalReset = () => {
    setSelectedAnimal(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleAnimalSubmit = () => {
    if (animalCount === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }
    if (animalTotalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }
    const items = Array.from(selectedAnimal).map(key => {
      const [category, name] = key.split('|');
      return { name, odds: category === '冠军单码' ? '5.7' : '1.9', baseVal: currentBetPrice, category };
    });
    openBetDetailsModal('animal_sports', items);
    setSelectedAnimal(new Set());
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

  // 边看边玩游戏控制台（视频/短剧共用）
  const renderPlayTab = () => (
              <div className="vp-play-panel">
                {/* Game Carousel Switcher（视频常驻顶部；短剧点切换箭头后从上方弹出） */}
                {(!embedded || carouselOpen) && (
                <div className={`vp-game-carousel ${embedded ? 'vp-game-carousel-overlay' : ''}`}>
                  {carouselGameItems.map(item => {
                    const isPlayable = playableCarouselGames.includes(item.key);
                    return (
                      <div
                        key={item.key}
                        className={`vp-game-card ${activeCarouselGame === item.key ? 'active' : ''} ${isPlayable ? '' : 'disabled'}`}
                        onClick={() => handleCarouselGameClick(item)}
                      >
                        {item.emoji ? (
                          <span className="vp-game-emoji-icon">{item.emoji}</span>
                        ) : (
                          <img src={item.img} alt={item.label} />
                        )}
                        <span className="vp-game-label-capsule">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
                )}

                {/* Betting Area - conditional on selected game */}
                {activeCarouselGame === 'fast3' ? (
                  // Fully interactive Fast Three Lottery console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          {embedded && <i className="fa-solid fa-left-right vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏"></i>}
                          <span>一分快三</span>
                        </div>
                        {renderCountdown()}
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

                      {/* Betting Options Grid（点位样式与一分六合彩一致） */}
                      <div style={{ padding: '8px 12px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                          {oddsData[activeTab]?.map(card => {
                            const isSelected = selectedOdds.has(card.name);
                            return (
                              <div
                                key={card.name}
                                className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleOddsCardClick(card.name)}
                                style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                              >
                                <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px' }}>{activeTab === 'sum' ? card.name.replace('和值', '') : renderDiceOptionName(card.name)}</div>
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
                          <button
                            className="console-edit-amount-btn"
                            onClick={() => setEditQuickAmountsActive(true)}
                          >
                            <i className="fa-solid fa-pencil"></i>
                          </button>
                          <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                            {quickAmounts.map(val => (
                              <div
                                key={val}
                                className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                                onClick={() => handleQuickAmountClick(val)}
                                style={{ fontSize: '0.7rem', padding: '4px 6px' }}
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
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
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
                          {embedded && <i className="fa-solid fa-left-right vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏"></i>}
                          <span>一分六合彩</span>
                        </div>
                        {renderCountdown()}
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
                          { cat: 'two-sides', label: '特码两面' },
                          { cat: 'color', label: '特码色波' },
                          { cat: 'zodiac', label: '特码生肖' },
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
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {M6_ZODIACS.map(name => {
                              const isSelected = selectedM6.has(`生肖|${name}`);
                              return (
                                <div
                                  key={name}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('生肖', name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.9rem', marginBottom: '2px' }}>{name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>9.75</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 特码 */}
                        {m6ActiveTab === 'special' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                            {Array.from({ length: 49 }, (_, i) => i + 1).map(n => {
                              const name = n.toString().padStart(2, '0');
                              const isSelected = selectedM6.has(`特码|${name}`);
                              return (
                                <div
                                  key={n}
                                  className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleM6CardClick('特码', name)}
                                  style={{ height: '58px', padding: '2px' }}
                                >
                                  <span className={`m6new-num-ball ball-${getM6BallColor(n)}`} style={{ width: '30px', height: '30px', fontSize: '0.72rem', marginBottom: '3px' }}>{name}</span>
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
                          共 <span className="console-selected-value">{m6Count}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{m6TotalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
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
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
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
                          {embedded && <i className="fa-solid fa-left-right vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏"></i>}
                          <span>一分极速赛车</span>
                        </div>
                        {renderCountdown()}
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
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
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
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
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
                ) : activeCarouselGame === 'fishcrab' ? (
                  // 鱼虾蟹 (Fish-Prawn-Crab) console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          {embedded && <i className="fa-solid fa-left-right vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏"></i>}
                          <span>鱼虾蟹</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <i className="fa-solid fa-circle-question" onClick={() => setShowFcRules(true)} title="玩法说明"></i>
                          <i className="fa-solid fa-xmark" onClick={handleBetHeaderClose}></i>
                        </div>
                      </div>
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        <div className="vp-fc-result-row" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          {fcResult.map((symKey, idx) => {
                            const sym = FISH_CRAB_SYMBOLS.find(s => s.key === symKey);
                            return sym ? (
                              <img key={idx} src={sym.icon} alt={sym.label} className="vp-fc-result-img" />
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="embedded-game-body" style={{ backgroundColor: '#f8fafc' }}>
                      {/* Play tabs: 单骰 / 全围 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'single', label: '单骰' },
                          { cat: 'all', label: '全围' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${fcActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setFcActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '10px 12px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          {FISH_CRAB_SYMBOLS.map(sym => {
                            const category = fcActiveTab === 'all' ? '全围' : '单骰';
                            const odds = fcActiveTab === 'all' ? FC_ODDS.all : FC_ODDS.single;
                            const isSelected = selectedFC.has(`${category}|${sym.key}`);
                            return (
                              <div
                                key={sym.key}
                                className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleFCCardClick(category, sym.key)}
                                style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                              >
                                <img className="vp-fc-symbol-img" src={sym.icon} alt={sym.label} />
                                <div className="odds-card-val" style={{ fontSize: '0.74rem', color: sym.color, fontWeight: 'bold' }}>{odds}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* 玩法/游戏规则 overlay */}
                    {showFcRules && (
                      <div className="vp-fc-rules-overlay" onClick={() => setShowFcRules(false)}>
                        <div className="vp-fc-rules-panel" onClick={(e) => e.stopPropagation()}>
                          <div className="vp-fc-rules-header">
                            <span>鱼虾蟹玩法说明</span>
                            <i className="fa-solid fa-xmark" onClick={() => setShowFcRules(false)}></i>
                          </div>
                          <div className="vp-fc-rules-body">
                            <p>鱼虾蟹，又称鱼虾蟹骰宝，在中国南方民间曾是相当普遍的游戏，直至现在人们仍然经常于新春期间进行作娱乐之用。其型式与赔率跟另壹游戏骰宝玩法基本壹样，不过采用的骰子由鱼、虾、蟹、金钱、葫芦及鸡的图案代替点数。</p>
                            <p className="vp-fc-rules-subtitle">1. 单骰</p>
                            <p>投注每颗骰子 1 至 6 中指定的图案：</p>
                            <ul>
                              <li>图案出现壹次，赔率 1.97</li>
                              <li>图案出现二次，赔率 2.94</li>
                              <li>图案出现三次，赔率 3.92</li>
                            </ul>
                            <p className="vp-fc-rules-subtitle">2. 全围</p>
                            <ul>
                              <li>三颗骰子的图案都壹样视为中奖，赔率 180.0</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{fcCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{fcTotalCost.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
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
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>

                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleFCReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleFCSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'baccarat' ? (
                  // 百家乐 (Baccarat) console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          {embedded && <i className="fa-solid fa-left-right vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏"></i>}
                          <span>百家乐</span>
                        </div>
                        {renderCountdown()}
                        <div className="vp-bet-header-right">
                          <i className="fa-solid fa-circle-question" onClick={() => setShowBacRules(true)} title="游戏规则"></i>
                          <i className="fa-solid fa-xmark" onClick={handleBetHeaderClose}></i>
                        </div>
                      </div>
                      {/* 开奖结果：缩小置于右上角，比照其他游戏 */}
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        <div className="bac-mini-result">
                          <span className="bac-mini-pts" style={{ color: BAC_C.player }}>闲{bacHandPoints(bacPlayer)}</span>
                          {/* 闲家：补牌（第三张）放在最左侧，横放 */}
                          {(bacPlayer.length === 3 ? [bacPlayer[2], bacPlayer[0], bacPlayer[1]] : bacPlayer).map((c, i) => (
                            <img key={`p${i}`} className={`bac-mini-card ${bacPlayer.length === 3 && i === 0 ? 'bac-mini-card-h' : ''}`} src={`poker/${c.suit}/${c.rank}.svg`} alt={`${c.suit}-${c.rank}`} />
                          ))}
                          <span className="bac-mini-sep">|</span>
                          {/* 庄家：补牌（第三张）放在最右侧，横放 */}
                          {bacBanker.map((c, i) => (
                            <img key={`b${i}`} className={`bac-mini-card ${bacBanker.length === 3 && i === 2 ? 'bac-mini-card-h' : ''}`} src={`poker/${c.suit}/${c.rank}.svg`} alt={`${c.suit}-${c.rank}`} />
                          ))}
                          <span className="bac-mini-pts" style={{ color: BAC_C.banker }}>庄{bacHandPoints(bacBanker)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="embedded-game-body" style={{ backgroundColor: '#f8fafc' }}>
                      {/* Play tabs: 庄闲 / 对子 / 两面 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'main', label: '庄闲' },
                          { cat: 'pair', label: '对子' },
                          { cat: 'sides', label: '两面' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${bacActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setBacActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '10px 12px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        {bacActiveTab === 'main' && (
                          <div className="bac-main-grid">
                            {BAC_MAIN.map(bet => {
                              const isSel = selectedBac.has(`庄闲|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`bac-bet-card bac-area-${bet.area} ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleBacCardClick(bet.name)}
                                >
                                  <span className="bac-bet-name" style={{ color: bet.color }}>{bet.name}</span>
                                  <span className="bac-bet-odds" style={{ color: bet.color }}>{bet.odds}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {(bacActiveTab === 'pair' || bacActiveTab === 'sides') && (
                          <div className="bac-2x2-grid">
                            {(bacActiveTab === 'pair' ? BAC_PAIR : BAC_SIDES).map(bet => {
                              const cat = bacActiveTab === 'pair' ? '对子' : '两面';
                              const isSel = selectedBac.has(`${cat}|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`bac-bet-card ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleBacCardClick(bet.name)}
                                >
                                  <span className="bac-bet-name" style={{ color: bet.color }}>{bet.name}</span>
                                  <span className="bac-bet-odds" style={{ color: bet.color }}>{bet.odds}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 游戏规则 overlay */}
                    {showBacRules && (
                      <div className="vp-fc-rules-overlay" onClick={() => setShowBacRules(false)}>
                        <div className="vp-fc-rules-panel" onClick={(e) => e.stopPropagation()}>
                          <div className="vp-fc-rules-header">
                            <span>百家乐游戏规则</span>
                            <i className="fa-solid fa-xmark" onClick={() => setShowBacRules(false)}></i>
                          </div>
                          <div className="vp-fc-rules-body">
                            <p className="vp-fc-rules-subtitle">游戏简介</p>
                            <p>百家乐分为【闲家】和【庄家】，玩家可以下注闲家或庄家，点数总和最接近 9 点者获胜。双方各收到至少两至三张牌，将依照补牌规则多发一张牌。任何一家拿到「例牌」（两张牌合计为 8 或 9 点）时，牌局即结束，不再补牌。</p>
                            <p className="vp-fc-rules-subtitle">点数计算方法</p>
                            <p>10、J、Q、K 的扑克牌算作零点，其他按牌面点数计算。当所有牌的点数总和超过 9 点时，仅算总数中的个位。例，最小点数为 0 点（4+6=10）；最大点数为 9 点（4+5=9）取个位数。</p>
                            <p className="vp-fc-rules-subtitle">例牌</p>
                            <p>庄闲任何一方两牌合计为 8 或 9 点（称为例牌），双方都不需补牌，即定胜负（双方同持 8 点或 9 点为和局）。</p>
                            <p className="vp-fc-rules-subtitle">补牌规则</p>
                            <p>若闲家不需补牌（即闲家首两张牌合计为「6 至 9 点」），庄家以「闲家补牌规则」补牌，即庄首两张牌合计「0 至 5」点要补一张牌，6 点以上不许补牌。</p>
                            <p className="vp-fc-rules-subtitle">赔率</p>
                            <ul>
                              <li>庄 1.95 / 闲 2.0 / 和 9.0 / 庄幸运6 12.0</li>
                              <li>庄对 12.0 / 闲对 12.0 / 任意对子 6.0 / 完美对子 26.0</li>
                              <li>闲单 / 闲双 / 庄单 / 庄双 1.96</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Embedded betting console */}
                    <div className="embedded-bet-console" style={{ borderTop: '1px solid #e2e8f0' }}>
                      <div className="bet-console-info-row" style={{ fontSize: '0.7rem' }}>
                        <div className="info-balance-box">
                          余额: <span className="console-balance-value">{balance.toFixed(2)}</span>
                          <i className="fa-solid fa-rotate console-refresh-icon" onClick={handleRefreshBalance} style={{ marginLeft: '4px' }}></i>
                        </div>
                        <div className="info-selected-box">
                          共 <span className="console-selected-value">{bacCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{bacTotalCost.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
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
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>
                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleBacReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleBacSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          提交下注
                        </button>
                      </div>
                    </div>
                  </div>
                ) : activeCarouselGame === 'animal' ? (
                  // 动物运动会 (Animal Sports) console
                  <div className="player-embedded-game-panel" style={{ position: 'relative', display: 'flex', zIndex: 1, flex: 1, minHeight: 0 }}>
                    <div className="vp-bet-header">
                      <div className="vp-bet-header-row1">
                        <div className="vp-bet-title-box">
                          {embedded && <i className="fa-solid fa-left-right vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏"></i>}
                          <span>动物运动会</span>
                        </div>
                        {renderCountdown()}
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

                      {/* 开奖结果：T-ball 名次排列 */}
                      <div className="vp-bet-header-row2">
                        <span>第 {issue} 期</span>
                        <div className="animal-mini-result">
                          {animalResult.map((n, i) => (
                            <img key={i} className="animal-mini-ball" src={`T-ball/T${n}.svg`} alt={`T${n}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="embedded-game-body" style={{ backgroundColor: '#f8fafc' }}>
                      {/* Play tabs: 冠军两面 / 冠军单码 */}
                      <div className="live-play-tabs-row" style={{ backgroundColor: '#ffffff', padding: '6px 12px' }}>
                        {[
                          { cat: 'twosides', label: '冠军两面' },
                          { cat: 'single', label: '冠军单码' }
                        ].map(tab => (
                          <div
                            key={tab.cat}
                            className={`live-play-tab ${animalActiveTab === tab.cat ? 'active' : ''}`}
                            onClick={() => setAnimalActiveTab(tab.cat)}
                          >
                            {tab.label}
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '10px 12px', flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        {animalActiveTab === 'twosides' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {ANIMAL_TWOSIDES.map(bet => {
                              const isSel = selectedAnimal.has(`冠军两面|${bet.name}`);
                              return (
                                <div
                                  key={bet.name}
                                  className={`live-odds-card ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleAnimalCardClick(bet.name)}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <div className="odds-card-name" style={{ fontSize: '0.85rem', marginBottom: '2px' }}>{bet.name}</div>
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>1.9</div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {animalActiveTab === 'single' && (
                          <div className="live-betting-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                            {[1, 2, 3, 4, 5, 6].map(n => {
                              const isSel = selectedAnimal.has(`冠军单码|${n}`);
                              return (
                                <div
                                  key={n}
                                  className={`live-odds-card ${isSel ? 'selected' : ''}`}
                                  onClick={() => handleAnimalCardClick(String(n))}
                                  style={{ aspectRatio: '1 / 1', height: 'auto', padding: '0 4px' }}
                                >
                                  <img className="animal-ball-img" src={`T-ball/T${n}.svg`} alt={`T${n}`} style={{ marginBottom: '4px' }} />
                                  <div className="odds-card-val" style={{ fontSize: '0.7rem' }}>5.7</div>
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
                          共 <span className="console-selected-value">{animalCount}</span> 注 &nbsp; 下注金额: <span className="console-selected-value">{animalTotalCost.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="bet-console-action-row" style={{ gap: '6px' }}>
                        <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                        <div className="quick-amounts-bar" style={{ gap: '4px' }}>
                          {quickAmounts.map(val => (
                            <div
                              key={val}
                              className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                              onClick={() => handleQuickAmountClick(val)}
                              style={{ fontSize: '0.7rem', padding: '4px 6px' }}
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
                          onFocus={() => setManualFocused(true)}
                          onBlur={() => setManualFocused(false)}
                          style={{ height: '28px', fontSize: '0.7rem', width: '70px' }}
                        />
                      </div>
                      <div className="bet-console-buttons-row">
                        <button className="console-cancel-btn" onClick={handleAnimalReset} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
                          <i className="fa-solid fa-arrow-rotate-left"></i> 撤回
                        </button>
                        <button className="console-submit-btn active" onClick={handleAnimalSubmit} style={{ padding: '6px 0', fontSize: '0.7rem' }}>
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
                          {embedded && <i className="fa-solid fa-left-right vp-switch-game" onClick={() => setCarouselOpen(o => !o)} title="切换游戏"></i>}
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
  );

  // 短剧等嵌入场景：只渲染游戏控制台
  if (embedded) {
    return <div className="drama-embedded-games">{renderPlayTab()}</div>;
  }

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

            {vpActiveTab === 'play' && renderPlayTab()}

            {vpActiveTab === 'recommend' && (
              <div className="vp-recommend-panel">
                {/* Narrow VIP ad banner */}
                <div className="vp-promo-banner" onClick={() => showToast('恭喜！特权赠送活动正在对接中！')}>
                  <div>
                    <span className="vp-promo-badge">VIP</span>
                    <span>开通特权 送钱 畅享全站资源... 可游戏 可提现</span>
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
