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

export default function PageChats() {
  const { 
    balance, 
    updateBalance, 
    activeChatroom, 
    setActiveChatroom, 
    quickAmounts, 
    openBetDetailsModal, 
    setEditQuickAmountsActive,
    showToast 
  } = useApp();

  // Redesigned Custom Top Nav states
  const [activeCustomTab, setActiveCustomTab] = useState('全部'); // 关注, 预约, 预告, 全部, 房间, 游戏
  const [showSearchPage, setShowSearchPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Static search page initial data
  const initialSearchRooms = [
    { id: 101, title: '金纳西亚 vs 圣地亚哥奎姆萨', creator: '篮球官方直播', avatar: 'assets/black_panther_logo.png', img: 'assets/basketball_live1.png', isLive: true, category: 'sports' },
    { id: 102, title: '桑图尔塞螃蟹 vs 马亚圭斯...', creator: '篮球官方直播', avatar: 'assets/black_panther_logo.png', img: 'assets/basketball_live2.png', isLive: true, category: 'sports' },
    { id: 103, title: '阿雷西博上尉 vs 桑特罗斯德', creator: '篮球官方直播', avatar: 'assets/black_panther_logo.png', img: 'assets/basketball_live3.png', isLive: true, category: 'sports' },
    { id: 104, title: '拉戈马尔 vs 塔巴雷', creator: '篮球官方直播', avatar: 'assets/black_panther_logo.png', img: 'assets/basketball_live4.png', isLive: true, category: 'sports' },
    { id: 105, title: '亚特兰大梦想 (女) vs 纽约...', creator: '篮球官方直播', avatar: 'assets/black_panther_logo.png', img: 'assets/basketball_live5.png', isLive: true, category: 'sports' },
    { id: 106, title: '印第安纳狂热 (女) vs 芝加...', creator: '篮球官方直播', avatar: 'assets/black_panther_logo.png', img: 'assets/basketball_live6.png', isLive: true, category: 'sports' },
    { id: 107, title: '香港六合彩', creator: '香港六合彩官方...', avatar: 'assets/black_panther_logo.png', img: 'assets/hk_mark_six.png', isLive: false, category: 'lottery' },
    { id: 108, title: '澳门六合彩', creator: '澳门六合彩官方...', avatar: 'assets/black_panther_logo.png', img: 'assets/mo_mark_six.png', isLive: false, category: 'lottery' }
  ];

  const [searchRooms, setSearchRooms] = useState(initialSearchRooms);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchRooms(initialSearchRooms);
      return;
    }
    const filtered = initialSearchRooms.filter(room => 
      room.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) || 
      room.creator.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
    setSearchRooms(filtered);
  };

  const handleEnterSearchRoom = (room) => {
    const targetRoom = {
      id: room.id,
      name: room.title,
      category: room.category === 'sports' ? 'chatroom' : 'vip',
      sub: [room.category],
      img: room.img,
      viewer: Math.floor(Math.random() * 50000) + 120000,
      label: room.category === 'sports' ? 'BL 体育赛事' : 'BL 彩票预测',
      badge: '99'
    };
    handleEnterRoom(targetRoom);
    setShowSearchPage(false);
  };
  
  // Active room view state
  const [currentRoom, setCurrentRoom] = useState(null); // room object or null
  const [showBetPanel, setShowBetPanel] = useState(false);
  const [activeLiveTab, setActiveLiveTab] = useState('chat'); // chat, follow, more

  // Upcoming room forecast state for "更多" tab
  const [forecastRooms, setForecastRooms] = useState([
    { id: 1, title: '香港六合彩', creator: '香港六合彩官方', avatar: 'assets/black_panther_logo.png', img: 'assets/hk_mark_six.png', reserved: true, typeBadge: '六合彩', gameBadge: '六合彩' },
    { id: 2, title: '澳门六合彩', creator: '澳门六合彩官方', avatar: 'assets/black_panther_logo.png', img: 'assets/mo_mark_six.png', reserved: true, typeBadge: '六合彩', gameBadge: '六合彩' },
    { id: 3, title: '快三', creator: 'XCM-阿英', avatar: 'assets/drama_author.png', img: 'assets/fast_three.png', reserved: false, typeBadge: '快三游戏', gameBadge: '快三游戏' },
    { id: 4, title: '门票房', creator: 'XCM-甜馨', avatar: 'assets/drama_author.png', img: 'assets/ticket_room.png', reserved: false, typeBadge: '直播大秀', gameBadge: '六合彩' },
    { id: 5, title: 'VIP欢乐斗地主', creator: 'XCM-双双', avatar: 'assets/drama_author.png', img: 'assets/game_mahjong.png', reserved: false, typeBadge: 'VIP房', gameBadge: '斗地主' },
    { id: 6, title: '密码大秀房', creator: 'XCM-雨熙', avatar: 'assets/drama_author.png', img: 'assets/chat_cover.png', reserved: false, typeBadge: '密码房', gameBadge: '大秀' }
  ]);

  const handleToggleReserve = (id) => {
    setForecastRooms(prev => prev.map(room => {
      if (room.id === id) {
        const nextState = !room.reserved;
        showToast(nextState ? `预约成功：${room.title}！` : `已取消预约：${room.title}！`);
        return { ...room, reserved: nextState };
      }
      return room;
    }));
  };

  // Chat stream messages state
  const [messages, setMessages] = useState([]);
  const [chatInputVal, setChatInputVal] = useState('');
  const chatMessagesEndRef = useRef(null);

  // Fast Three Betting states inside chat
  const [selectedPlayCat, setSelectedPlayCat] = useState('size'); // size, pair, triple, sum, single
  const [selectedOddsCards, setSelectedOddsCards] = useState(new Set());
  const [betAmount, setBetAmount] = useState(50); // defaults to 50
  const [manualAmount, setManualAmount] = useState('');

  // Mock Fast Three results inside chat room (running countdown)
  const [liveK3Issue, setLiveK3Issue] = useState(20260609622);
  const [liveK3Dice, setLiveK3Dice] = useState([4, 2, 2]);
  
  // Auto Chat generator interval reference
  const chatInterval = useRef(null);

  const roomsData = [
    { id: 1, name: '快三刀枪炮', category: 'chatroom', sub: ['recommend', 'game'], img: 'assets/game_fast3.png', viewer: 192546, label: 'BL 一分快三', badge: '43' },
    { id: 2, name: '鸿运快三', category: 'chatroom', sub: ['game'], img: 'assets/game_fast3.png', viewer: 199505, label: 'BL 一分快三', badge: '19' },
    { id: 3, name: '七妹带飞', category: 'chatroom', sub: ['recommend', 'game'], img: 'assets/game_fast3.png', viewer: 201613, label: 'BL 一分快三', badge: '53' },
    { id: 4, name: '炮总快三王', category: 'chatroom', sub: ['game'], img: 'assets/game_fast3.png', viewer: 191883, label: 'BL 一分快三', badge: '24' },
    { id: 5, name: '体育红单基地', category: 'chatroom', sub: ['recommend', 'worldcup'], img: 'assets/sports_cover.png', viewer: 197130, label: 'BL 体育赛事', badge: '58' },
    { id: 6, name: '美加墨爆庄房', category: 'chatroom', sub: ['worldcup'], img: 'assets/sports_cover.png', viewer: 190262, label: 'BL 体育赛事', badge: '24' },
    { id: 7, name: '骚男淫女房', category: 'chatroom', sub: ['voice'], img: 'assets/science.png', viewer: 19911, label: 'BL 语音厅', badge: '24' },
    { id: 8, name: '专属服从房', category: 'chatroom', sub: ['recommend', 'voice'], img: 'assets/drawing.png', viewer: 32748, label: 'BL 语音厅', badge: '31' },
    { id: 9, name: 'VIP专属至尊快三', category: 'vip', sub: ['recommend', 'game'], img: 'assets/game_fast3.png', viewer: 250109, label: 'BL 一分快三', badge: '88' },
    { id: 10, name: 'VIP美女一对一', category: 'vip', sub: ['voice'], img: 'assets/chat_cover.png', viewer: 48201, label: 'BL 语音厅', badge: '99' },
    { id: 11, name: '午夜激情诱惑', category: 'naked', sub: ['recommend', 'voice'], img: 'assets/science.png', viewer: 398104, label: 'BL 语音厅', badge: '99' },
    { id: 12, name: '户外直播大秀', category: 'naked', sub: ['worldcup'], img: 'assets/sports_cover.png', viewer: 148202, label: 'BL 体育赛事', badge: '72' }
  ];

  const chatTemplates = [
    '这期买单还是买双？有计划员发单没？',
    '稳了稳了，我跟大！上期开大，这期继续追。',
    '刚才特码开出了猴，我直接中了48倍！',
    '百家乐庄已经连开了4局了，要不要斩龙？',
    '有没有稳妥的分析师？拉我一下。',
    '感觉六合彩绿波今晚概率特别高。',
    '跟紧计划！每天赚个买菜钱就收工。',
    '充值了1000，今晚能回血不？',
    '卧槽，又中了，感谢老板的一单！',
    '这路单画的真好，必胜路线！'
  ];

  const roomTemplates = {
    fast3: [
      '糖糖主播今天太辣了！',
      '跟着糖糖买单，已经连赢三期了！',
      '糖糖主播，下期还买大吗？',
      '糖糖，求带飞！',
      '今天充值了2000，跟糖糖赢个痛快！',
      '太稳了，这波操作我服！',
      '糖糖么么哒，跟单中'
    ],
    sports: [
      '这局强推皇马让半球，稳！',
      '老哥们，刚才利物浦那个进球帅呆了！',
      '上半场还有戏不，角球买多大？',
      '红单稳妥，跟着大佬走！',
      '体育赛事水位变动好快，要抓紧时间了。',
      '今晚还有NBA推荐吗？'
    ],
    voice: [
      'CC主播身材太正了！',
      'CC老师，晚上几点继续直播呀？',
      '求连麦！声音太甜了。',
      '这主播脾气真好，爱了爱了。',
      '送个火箭，主播求眼熟！'
    ]
  };

  const userNames = ['快三玩家老王', '彩票分析官', '百家乐尊爵', '回血狂魔', '特码狙击手', '小资生活', '庄闲路单研究', '神算子'];

  // Handle cross-component triggers from AppContext
  useEffect(() => {
    if (activeChatroom) {
      const room = roomsData.find(r => r.name === activeChatroom);
      if (room) {
        handleEnterRoom(room);
      } else {
        // Fallback room creation
        handleEnterRoom({
          id: 99,
          name: activeChatroom,
          category: 'chatroom',
          sub: ['recommend'],
          img: 'assets/game_fast3.png',
          viewer: 28456,
          label: 'BL 直播演示',
          badge: '99'
        });
      }
      setActiveChatroom(null); // clear trigger
    }
  }, [activeChatroom]);

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (chatInterval.current) clearInterval(chatInterval.current);
    };
  }, []);

  // Auto scroll chat to bottom when message log updates
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Live betting Fast Three random drawings inside chat
  useEffect(() => {
    if (!currentRoom) return;
    const interval = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      setLiveK3Dice([d1, d2, d3]);
      setLiveK3Issue(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [currentRoom]);

  // Redesigned Custom Filters
  const getCustomFilteredRooms = () => {
    if (activeCustomTab === '全部') {
      return roomsData;
    }
    if (activeCustomTab === '关注') {
      // Mock follow list
      return roomsData.filter(r => [2, 5, 8, 10].includes(r.id));
    }
    if (activeCustomTab === '房间') {
      return roomsData.filter(r => r.category === 'chatroom' || r.category === 'naked' || r.label.includes('语音'));
    }
    if (activeCustomTab === '游戏') {
      return roomsData.filter(r => r.category === 'vip' || r.label.includes('快三'));
    }
    return []; // '预告' and '预约' are handled separately in the render
  };

  const handleEnterRoom = (room) => {
    setCurrentRoom(room);
    setShowBetPanel(false);
    
    // Set mock live viewer count
    const randViewer = (Math.floor(Math.random() * 5000) + 12000);
    room.viewer = randViewer;

    // Reset messages and append announcements
    const initialMsgs = [
      { id: 'ann', name: '平台公告', text: '欢迎来到黑豹娱乐交流社区！本群仅供技术探讨，禁止恶意灌水。绿色投资，理智博弈。', isSystem: true }
    ];

    let activeTemplates = chatTemplates;
    let hostName = '主播：糖糖 💖';
    let welcomeMsg = '欢迎宝宝们来到我的快三带飞房！本期方案已经在公屏上方展示，跟上的宝宝扣 111 喔！';

    if (room.name.includes('体育') || room.label.includes('体育')) {
      activeTemplates = roomTemplates.sports;
      hostName = '讲师：CC ⚽';
      welcomeMsg = '欢迎来到体育教学实战，刚来的宝宝记得关注一下让盘走势！看准时机跟单！';
    } else if (room.name.includes('专属') || room.name.includes('骚男') || room.label.includes('语音')) {
      activeTemplates = roomTemplates.voice;
      hostName = '主播：阿英 🎙️';
      welcomeMsg = '小哥哥们好呀，欢迎来到阿英的语音厅，送礼物可以连麦互动哦～';
    } else {
      activeTemplates = roomTemplates.fast3;
    }

    // Add preset messages matching screenshot mock
    initialMsgs.push({
      id: 'mock-msg-1',
      name: 'dcryyu11',
      isBetCard: true,
      betDetail: {
        game: '一分快三',
        issue: '202606050833',
        play: '三不同',
        odds: '35.28',
        amount: '3',
        selection: '123'
      }
    });

    initialMsgs.push({
      id: 'mock-msg-2',
      name: 'test0327',
      isBetCard: true,
      betDetail: {
        game: '一分快三',
        issue: '202606061190',
        play: '全骰',
        odds: '200.88',
        amount: '50',
        selection: '111'
      }
    });

    initialMsgs.push({
      id: 'host-welcome',
      name: hostName,
      text: welcomeMsg,
      isSystem: false,
      isHost: true
    });

    setMessages(initialMsgs);

    // Start Chat logs generator loop
    if (chatInterval.current) clearInterval(chatInterval.current);
    chatInterval.current = setInterval(() => {
      const sender = userNames[Math.floor(Math.random() * userNames.length)];
      const text = activeTemplates[Math.floor(Math.random() * activeTemplates.length)];
      
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString() + Math.random(), name: sender, text }
      ]);
    }, 2200 + Math.random() * 800);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    setShowBetPanel(false);
    if (chatInterval.current) {
      clearInterval(chatInterval.current);
      chatInterval.current = null;
    }
  };

  const handleSendMessage = () => {
    if (!chatInputVal.trim()) return;
    
    const userMsg = {
      id: Date.now().toString(),
      name: '我',
      text: chatInputVal.trim(),
      isMy: true
    };
    setMessages(prev => [...prev, userMsg]);
    setChatInputVal('');

    // Simulate chat response reply
    setTimeout(() => {
      const replies = ['跟了跟了！我也觉得！', '稳，听兄弟的！', '加油，今晚必发！', '分析得有道理啊。'];
      const replier = userNames[Math.floor(Math.random() * userNames.length)];
      const text = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { id: Date.now().toString(), name: replier, text }]);
    }, 1200);
  };

  // Follow betting handler in chat logs
  const handleFollowBet = (detail) => {
    const items = [{
      name: detail.selection,
      odds: detail.odds,
      baseVal: parseFloat(detail.amount) || 10,
      category: detail.play
    }];
    openBetDetailsModal('fast_three_embedded', items);
  };

  // Live betting selections helpers
  const handleOddsCardClick = (name, odds) => {
    const nextSet = new Set(selectedOddsCards);
    if (nextSet.has(name)) {
      nextSet.delete(name);
    } else {
      nextSet.add(name);
    }
    setSelectedOddsCards(nextSet);
  };

  const activeQuickAmount = manualAmount === '' ? betAmount : 0;

  const handleQuickAmountClick = (val) => {
    setBetAmount(val);
    setManualAmount('');
  };

  const handleManualAmountChange = (e) => {
    const val = e.target.value;
    setManualAmount(val);
  };

  const currentBetPrice = manualAmount !== '' ? parseFloat(manualAmount) || 0 : betAmount;
  const totalCost = selectedOddsCards.size * currentBetPrice;

  const handleResetBets = () => {
    selectedOddsCards.clear();
    setSelectedOddsCards(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleSubmitLiveBets = () => {
    if (selectedOddsCards.size === 0) {
      showToast('请选择投注盘口！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入或选择有效的投注金额！');
      return;
    }

    const items = Array.from(selectedOddsCards).map(name => {
      // Find matching odds from configured grids
      let odds = '9.75'; // default
      if (selectedPlayCat === 'pair') odds = '12.5';
      if (selectedPlayCat === 'triple') odds = name === '任意豹子' ? '35.0' : '200.0';
      if (selectedPlayCat === 'sum') odds = ['和值4', '和值17'].includes(name) ? '80.0' : '9.0'; // mock
      if (selectedPlayCat === 'single') odds = '2.0';

      return {
        name,
        odds,
        baseVal: currentBetPrice,
        category: selectedPlayCat === 'size' ? '大小' : selectedPlayCat
      };
    });

    openBetDetailsModal('fast_three_embedded', items);
  };

  // Options grids maps
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

  return (
    <div className="app-page active" id="page-chats">
      {/* 1. Chatrooms Lobby View */}
      {!currentRoom ? (
        showSearchPage ? (
          <div className="lobby-search-page" id="lobby-search-page">
            {/* Search Header Bar */}
            <div className="search-header-bar">
              <button className="search-back-btn" onClick={() => setShowSearchPage(false)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <form className="search-input-wrapper" onSubmit={handleSearchSubmit}>
                <i className="fa-solid fa-magnifying-glass"></i>
                <input 
                  type="text" 
                  className="search-bar-input" 
                  placeholder="请输入主播昵称或直播间标题" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              <button className="search-submit-btn" onClick={() => handleSearchSubmit()}>
                搜索
              </button>
            </div>

            {/* Search Results */}
            <div className="search-results-container">
              <div className="search-results-grid">
                {searchRooms.map(room => (
                  <div key={room.id} className="search-result-card" onClick={() => handleEnterSearchRoom(room)}>
                    <div className="search-card-thumb">
                      <img src={room.img} alt={room.title} />
                      <span className={`live-status-badge ${!room.isLive ? 'forecast' : ''}`}>
                        {room.isLive ? '直播中' : '预告'}
                      </span>
                    </div>
                    <div className="search-card-info">
                      <h4 className="search-card-title">{room.title}</h4>
                      <div className="search-card-bottom">
                        <div className="search-card-host">
                          <img src={room.avatar} alt={room.creator} className="search-card-logo" />
                          <span className="search-card-host-name">{room.creator}</span>
                        </div>
                        <button className="search-card-btn">点击进入</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {searchRooms.length === 0 && (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '40px 20px' }}>
                  没有找到相关的直播间
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="chatrooms-lobby" id="chatrooms-lobby">
            {/* Custom Redesigned Top Navigation Bar (Matching 2nd Image) */}
            <div className="chat-lobby-custom-nav">
              <div className="custom-nav-tabs-wrapper">
                {['关注', '预约', '预告', '全部', '房间', '游戏'].map(tab => (
                  <div 
                    key={tab} 
                    className={`custom-lobby-tab ${activeCustomTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveCustomTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              {/* Search Icon Trigger on the right */}
              <div className="custom-search-trigger" onClick={() => { setShowSearchPage(true); setSearchQuery(''); setSearchRooms(initialSearchRooms); }}>
                <i className="fa-solid fa-magnifying-glass search-glass-icon"></i>
                <span className="search-yellow-dot"></span>
              </div>
            </div>

            {/* Scroll Content based on Custom Tabs */}
            {['预告', '预约'].includes(activeCustomTab) ? (
              <div className="scroll-content" style={{ padding: '12px', overflowY: 'auto' }}>
                <div className="more-rooms-grid">
                  {(activeCustomTab === '预告' ? forecastRooms : forecastRooms.filter(r => r.reserved)).map(room => (
                    <div key={room.id} className="more-room-card">
                      <div className="more-room-thumb-wrapper">
                        <img src={room.img} alt={room.title} />
                        <span className="preview-tag">预告</span>
                        <span className="room-type-tag">{room.typeBadge}</span>
                        <span className={`game-icon-badge ${room.title.includes('快三') ? 'fast3-badge' : 'live-badge'}`}>
                          <i className="fa-solid fa-trophy"></i> {room.gameBadge}
                        </span>
                      </div>
                      <div className="more-room-info-box">
                        <h4 className="more-room-title">{room.title}</h4>
                        <div className="more-room-creator-row">
                          <div className="more-room-creator-left">
                            <img src={room.avatar} alt={room.creator} className="more-room-avatar" />
                            <span className="more-room-creator-name">{room.creator}</span>
                          </div>
                          <button 
                            className={`more-room-reserve-btn ${room.reserved ? 'reserved' : ''}`}
                            onClick={() => handleToggleReserve(room.id)}
                          >
                            {room.reserved ? '已预约' : '预约'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {activeCustomTab === '预约' && forecastRooms.filter(r => r.reserved).length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '40px 20px' }}>
                    您尚未预约任何预告直播
                  </div>
                )}
              </div>
            ) : (
              <div className="scroll-content" style={{ overflowY: 'auto' }}>
                <div className="chat-rooms-grid">
                  {getCustomFilteredRooms().map(room => (
                    <div 
                      key={room.id} 
                      className="chat-room-grid-card"
                      onClick={() => handleEnterRoom(room)}
                    >
                      <div className="chat-room-thumb">
                        <img src={room.img} alt={room.name} />
                        <span className={`room-label-badge ${room.label.includes('快三') ? 'badge-fast3' : (room.label.includes('体育') ? 'badge-sports' : 'badge-voice')}`}>
                          {room.label}
                        </span>
                        <span className="room-hot-badge">{room.badge}</span>
                        <div className="thumb-bottom-overlays">
                          <span className="room-viewer-count"><i className="fa-solid fa-user"></i> {room.viewer.toLocaleString()}</span>
                          <span className="room-status-tag"><i className="fa-solid fa-circle-play"></i> 热聊中</span>
                        </div>
                      </div>
                      <div className="chat-room-info">
                        <h4>{room.name}</h4>
                      </div>
                    </div>
                  ))}
                </div>
                {getCustomFilteredRooms().length === 0 && (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '40px 20px' }}>
                    暂无相关直播间
                  </div>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        /* 2. Split Active Chatroom screen view */
        <div className="chat-split-room active" id="chat-split-room">
          
          {/* Live stream player box */}
          <div className="live-stream-player-box">
            <img src={currentRoom.img} alt="Live Stream" className="live-stream-player-img" />
            <button id="btn-leave-chat" className="live-back-btn" onClick={handleLeaveRoom}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#d4af37',
              fontSize: '0.6rem',
              padding: '2px 8px',
              borderRadius: '10px'
            }}>
              <i className="fa-solid fa-user" style={{ marginRight: '3px' }}></i>
              <span id="chat-online-count">{currentRoom.viewer?.toLocaleString()}</span>
            </div>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }} id="split-current-room-name">
              {currentRoom.name}
            </div>
          </div>

          {/* Sub-tabs bar below the stream */}
          <div className="live-room-tabs-bar">
            <div className="live-tabs-left">
              {['chat', 'follow', 'more'].map(tab => (
                <div 
                  key={tab} 
                  className={`live-tab ${activeLiveTab === tab ? 'active' : ''}`}
                  onClick={() => {
                    setActiveLiveTab(tab);
                    setShowBetPanel(false);
                  }}
                >
                  {tab === 'chat' ? '聊天' : (tab === 'follow' ? '跟注' : '更多')}
                </div>
              ))}
            </div>
            <button className="live-play-same-btn" id="btn-play-same-game" onClick={() => setShowBetPanel(true)}>
              <i className="fa-solid fa-gamepad" style={{ marginRight: '4px' }}></i>玩同款
            </button>
          </div>

          {/* Live Chat View Container */}
          {!showBetPanel ? (
            <div className="live-chat-view-container" id="live-chat-view-container" style={{ display: 'flex' }}>
              {activeLiveTab === 'chat' && (
                <>
                  <div className="split-chat-messages" id="split-chat-log">
                    {messages.map(msg => (
                      <div key={msg.id} className="live-msg-wrapper">
                        {msg.isSystem ? (
                          <div className="live-system-message-row">
                            <span className="sys-msg-label">{msg.name}:</span>
                            <div className="sys-msg-content">{msg.text}</div>
                          </div>
                        ) : msg.isBetCard ? (
                          <div className="live-msg-wrapper">
                            <div className="live-msg-user-header">
                              <span className="user-level-badge"><i className="fa-solid fa-diamond"></i> 1</span>
                              <span className="live-msg-username">{msg.name}:</span>
                            </div>
                            <div className="live-bet-slip-card">
                              <div className="bet-card-header">
                                <span className="bet-card-title">注单</span>
                                <span className="bet-card-game-info">{msg.betDetail.game} {msg.betDetail.issue}</span>
                              </div>
                              <div className="bet-card-body">
                                <div className="bet-card-left">
                                  <span className="bet-card-play-type">{msg.betDetail.play}</span>
                                  <span className="bet-card-odds-detail">
                                    {msg.betDetail.play} 【{msg.betDetail.selection}】 @{msg.betDetail.odds}
                                  </span>
                                </div>
                                <div className="bet-card-right">
                                  <span className="bet-card-amount">¥{msg.betDetail.amount}</span>
                                  <button className="bet-card-follow-btn" onClick={() => handleFollowBet(msg.betDetail)}>跟单</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={`chat-bubble ${msg.isMy ? 'my-message' : ''}`}>
                            <div className="chat-bubble-name">
                              {msg.isHost && <span className="anchor-badge" style={{ marginRight: '4px', backgroundColor: '#ff4757', color: '#fff', fontSize: '0.55rem', padding: '1px 3px', borderRadius: '3px' }}>主播</span>}
                              {msg.name}
                            </div>
                            <div className="chat-bubble-text">{msg.text}</div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* Bottom Chat input bar */}
                  <div className="live-chat-input-bar">
                    <button className="live-smiley-btn" onClick={() => showToast('表情包加载中...')}>
                      <i className="fa-regular fa-face-smile"></i>
                    </button>
                    <input 
                      type="text" 
                      className="live-chat-text-input" 
                      placeholder="说点什么吧..." 
                      value={chatInputVal}
                      onChange={(e) => setChatInputVal(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    />
                    <div className="live-right-icons">
                      <button className="live-gift-btn" onClick={() => showToast('礼物盒子准备中...')}><i className="fa-solid fa-gift"></i></button>
                      <button className="live-heart-btn" onClick={() => showToast('么么哒 ❤️')}><i className="fa-solid fa-heart"></i></button>
                    </div>
                  </div>
                </>
              )}

              {activeLiveTab === 'follow' && (
                <div className="split-follow-container" id="split-follow-container">
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>
                    可跟注注单 ({messages.filter(msg => msg.isBetCard).length})
                  </div>
                  {messages.filter(msg => msg.isBetCard).map(msg => (
                    <div key={msg.id} className="follow-bet-item-wrapper">
                      <div className="follow-bet-user-row">
                        <span className="user-level-badge"><i className="fa-solid fa-diamond"></i> 1</span>
                        <span className="live-msg-username">{msg.name} 分享了注单:</span>
                      </div>
                      <div className="live-bet-slip-card" style={{ maxWidth: '100%' }}>
                        <div className="bet-card-header">
                          <span className="bet-card-title">注单</span>
                          <span className="bet-card-game-info">{msg.betDetail.game} {msg.betDetail.issue}</span>
                        </div>
                        <div className="bet-card-body">
                          <div className="bet-card-left">
                            <span className="bet-card-play-type">{msg.betDetail.play}</span>
                            <span className="bet-card-odds-detail">
                              {msg.betDetail.play} 【{msg.betDetail.selection}】 @{msg.betDetail.odds}
                            </span>
                          </div>
                          <div className="bet-card-right">
                            <span className="bet-card-amount">¥{msg.betDetail.amount}</span>
                            <button className="bet-card-follow-btn" onClick={() => handleFollowBet(msg.betDetail)}>跟单</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.filter(msg => msg.isBetCard).length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', padding: '20px' }}>
                      暂无可跟注的注单
                    </div>
                  )}
                </div>
              )}

              {activeLiveTab === 'more' && (
                <div className="split-more-container" id="split-more-container">
                  <div className="more-rooms-grid">
                    {forecastRooms.map(room => (
                      <div key={room.id} className="more-room-card">
                        <div className="more-room-thumb-wrapper">
                          <img src={room.img} alt={room.title} />
                          <span className="preview-tag">预告</span>
                          <span className="room-type-tag">{room.typeBadge}</span>
                          <span className={`game-icon-badge ${room.title.includes('快三') ? 'fast3-badge' : 'live-badge'}`}>
                            <i className="fa-solid fa-trophy"></i> {room.gameBadge}
                          </span>
                        </div>
                        <div className="more-room-info-box">
                          <h4 className="more-room-title">{room.title}</h4>
                          <div className="more-room-creator-row">
                            <div className="more-room-creator-left">
                              <img src={room.avatar} alt={room.creator} className="more-room-avatar" />
                              <span className="more-room-creator-name">{room.creator}</span>
                            </div>
                            <button 
                              className={`more-room-reserve-btn ${room.reserved ? 'reserved' : ''}`}
                              onClick={() => handleToggleReserve(room.id)}
                            >
                              {room.reserved ? '已预约' : '预约'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Betting Panel for Fast Three */
            <div className="live-betting-panel" id="live-betting-panel" style={{ display: 'flex' }}>
              {/* Header */}
              <div className="live-betting-header">
                <div className="live-betting-title-left">
                  <i className="fa-solid fa-chevron-up"></i>
                  <span>一分快三</span>
                </div>
                <span className="live-betting-status-tag">开奖中</span>
                <div className="live-betting-actions-right">
                  <button className="live-playbook-btn" onClick={() => showToast('玩法说明：一分快三，快速开奖！')}><i className="fa-regular fa-lightbulb"></i> 玩法</button>
                  <button className="live-close-betting-btn" onClick={() => setShowBetPanel(false)}><i className="fa-solid fa-xmark"></i></button>
                </div>
              </div>

              {/* Subheader with issue and rolling dice */}
              <div className="live-betting-subheader">
                <span className="live-issue-number">第 {liveK3Issue} 期</span>
                <div className="live-dice-results-row">
                  <div className="live-dice-balls">
                    {liveK3Dice.map((val, idx) => (
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
                  <i className="fa-solid fa-chevron-down"></i>
                </div>
              </div>

              {/* Play Tabs */}
              <div className="live-play-tabs-row">
                {[
                  { cat: 'size', label: '大小' },
                  { cat: 'pair', label: '对子' },
                  { cat: 'triple', label: '豹子' },
                  { cat: 'sum', label: '总和' },
                  { cat: 'single', label: '单骰' }
                ].map(tab => (
                  <div 
                    key={tab.cat}
                    className={`live-play-tab ${selectedPlayCat === tab.cat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedPlayCat(tab.cat);
                      selectedOddsCards.clear();
                      setSelectedOddsCards(new Set());
                    }}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>

              {/* Betting Options Grid */}
              <div className="live-betting-options-container">
                <div className="live-betting-options-grid active">
                  {oddsData[selectedPlayCat]?.map(card => {
                    const isSelected = selectedOddsCards.has(card.name);
                    return (
                      <div 
                        key={card.name} 
                        className={`live-odds-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleOddsCardClick(card.name, card.odds)}
                      >
                        <div className="odds-card-name">{renderDiceOptionName(card.name)}</div>
                        <div className="odds-card-val">{card.odds}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Console Footers */}
              <div className="live-bet-console">
                {/* Row 1: Balance & Summaries */}
                <div className="console-info-row">
                  <span className="console-balance">
                    余额: <span>{balance.toFixed(2)}</span> 
                    <i 
                      className="fa-solid fa-rotate-right" 
                      onClick={() => {
                        updateBalance(3000, false);
                        showToast('余额已刷新为 ¥3000.00！');
                      }}
                      style={{ cursor: 'pointer', fontSize: '0.7rem', marginLeft: '4px' }}
                    ></i>
                  </span>
                  <span className="console-bet-summary">
                    下注金额: <span className="bet-cost-value">{totalCost.toFixed(2)}</span>
                  </span>
                </div>

                {/* Row 2: Preset amounts & Inputs */}
                <div className="console-amount-row">
                  <div className="console-amount-left">
                    <button 
                      className="console-edit-amount-btn" 
                      onClick={() => setEditQuickAmountsActive(true)}
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </button>
                    <div className="console-quick-amounts">
                      {quickAmounts.map(val => (
                        <button 
                          key={val} 
                          className={`quick-amount-btn ${activeQuickAmount === val ? 'active' : ''}`}
                          onClick={() => handleQuickAmountClick(val)}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input 
                    type="number" 
                    className="console-manual-input" 
                    placeholder="输入金额" 
                    value={manualAmount}
                    onChange={handleManualAmountChange}
                  />
                </div>

                {/* Row 3: Action Buttons */}
                <div className="console-action-row">
                  <button className="console-cancel-btn" onClick={handleResetBets}>
                    <i className="fa-solid fa-rotate-left"></i> 撤回
                  </button>
                  <button 
                    className={`console-submit-btn ${selectedOddsCards.size > 0 && currentBetPrice > 0 ? 'active' : ''}`}
                    onClick={handleSubmitLiveBets}
                  >
                    提交
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
