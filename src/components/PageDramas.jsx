import { useState, useRef, useEffect } from 'react';
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

export default function PageDramas() {
  const { 
    setActivePage, 
    setActiveGameCategory, 
    setAutoOpenGameId, 
    showToast,
    balance,
    updateBalance,
    quickAmounts,
    openBetDetailsModal,
    setEditQuickAmountsActive
  } = useApp();

  // Top-left content category tabs. Both tabs share the exact same layout /
  // functionality — only the content list differs ("内容分类").
  const TAB_CONTENT = {
    douyin: {
      bases: ['drama_still1', 'origami', 'science', 'banner'],
      stills: [
        'assets/drama_still1.png',
        'assets/origami.png',
        'assets/science.png',
        'assets/banner.png'
      ],
      titles: [
        '东京夜の散步｜霓虹街头治愈漫步 #旅行 #vlog #日本',
        '三分钟折出一朵玫瑰🌹新手也能学会 #手工 #折纸 #DIY',
        '涨知识了！3个你不知道的科学冷知识 #科普 #知识 #涨姿势',
        '周末好去处推荐｜city walk 打卡日常 #生活 #分享 #日常'
      ],
      creators: ['@旅行的意义', '@巧手日记', '@科学怪谈', '@城市漫游者'],
      likes: [0, 89000, 152000, 67000]
    },
    duanju: {
      bases: ['drama_still1', 'origami', 'banner', 'science'],
      stills: [
        'assets/drama_still1.png',
        'assets/origami.png',
        'assets/banner.png',
        'assets/science.png'
      ],
      titles: [
        '秘密日记',
        '《霸道总裁爱上我》第一集：命运的偶遇 #短剧 #反转 #高爽',
        '《真假千金的豪门较量》第十集：身份拆穿 #虐恋 #豪门 #高能',
        '《战神重生成奶爸》第二集：我的萌宝是天才 #都市 #热血 #打脸'
      ],
      creators: ['@陈名豪,谭盐盐,李一沐,伍雅露', '@小美剧场', '@经典剧场栏目', '@奶爸战神'],
      likes: [0, 125000, 348000, 521000]
    }
  };

  const [activeTab, setActiveTab] = useState('douyin'); // 'douyin' | 'duanju'
  const activeContent = TAB_CONTENT[activeTab];

  const dramaStills = activeContent.stills;

  // Frame sequences used for scrubbing: each drama maps to several similar
  // "frames" (progressive zoom of the same scene) so dragging the progress
  // bar changes the on-screen picture like seeking through a video.
  const dramaFrameBases = activeContent.bases;
  const FRAMES_PER_DRAMA = 6;
  const DRAMA_TOTAL_SECONDS = 24 * 60; // simulated total duration (24:00)
  const frameSrc = (idx, f) => `assets/frames/${dramaFrameBases[idx]}_f${f}.png`;
  const frameForPct = (p) =>
    Math.max(0, Math.min(FRAMES_PER_DRAMA - 1, Math.floor(p * FRAMES_PER_DRAMA)));
  const fmtTime = (secs) => {
    const s = Math.max(0, Math.round(secs));
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const dramaTitles = activeContent.titles;
  const dramaCreators = activeContent.creators;

  // Store numerical representation of likes to handle local increments
  const [likesData, setLikesData] = useState(TAB_CONTENT.douyin.likes);
  const [likedList, setLikedList] = useState([false, false, false, false]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [promoVisible, setPromoVisible] = useState(true);

  // Progress bar / scrubbing state
  const [seekPct, setSeekPct] = useState(0.45); // playback progress 0..1
  const [scrubbing, setScrubbing] = useState(false);
  // Once the user scrubs, keep showing the frame at the released position
  // (don't snap back to the original still) until the drama is switched.
  const [seekFrameActive, setSeekFrameActive] = useState(false);
  const scrubbingRef = useRef(false);
  const seekTrackRef = useRef(null);

  // Long-press fast-forward (2x) state
  const [fastForward, setFastForward] = useState(false);
  const fastForwardTimer = useRef(null);

  // Betting Panel States
  const [betPanelOpen, setBetPanelOpen] = useState(false);
  const [selectedPlayCat, setSelectedPlayCat] = useState('size'); // size, pair, triple, sum, single
  const [selectedOddsCards, setSelectedOddsCards] = useState(new Set());
  const [betAmount, setBetAmount] = useState(50); // defaults to 50
  const [manualAmount, setManualAmount] = useState('');
  const [liveK3Issue, setLiveK3Issue] = useState(20260609622);
  const [liveK3Dice, setLiveK3Dice] = useState([4, 2, 2]);

  // Comments state
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState({
    0: [],
    1: [],
    2: [],
    3: []
  });
  const [newCommentText, setNewCommentText] = useState('');

  // Transition fading state
  const [opacity, setOpacity] = useState(1);
  const isTransitioning = useRef(false);
  const wheelThrottle = useRef(false);

  // Switch drama helper with fade animation
  const switchDrama = (nextIdx) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setOpacity(0);
    setTimeout(() => {
      setActiveIdx(nextIdx);
      setSeekPct(0.08); // restart progress for the new drama
      setSeekFrameActive(false);
      setOpacity(1);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 200);
    }, 200);
  };

  // Switch top-left content category tab. Resets to the first item of the new
  // tab and reinitialises like state for that content list.
  const handleTabSwitch = (tab) => {
    if (tab === activeTab || isTransitioning.current) return;
    isTransitioning.current = true;
    setOpacity(0);
    setTimeout(() => {
      setActiveTab(tab);
      setActiveIdx(0);
      setLikesData(TAB_CONTENT[tab].likes);
      setLikedList([false, false, false, false]);
      setSeekPct(0.08);
      setSeekFrameActive(false);
      setOpacity(1);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 200);
    }, 200);
  };

  const handlePrev = () => {
    const nextIdx = (activeIdx - 1 + dramaStills.length) % dramaStills.length;
    switchDrama(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIdx + 1) % dramaStills.length;
    switchDrama(nextIdx);
  };

  // --- Progress bar scrubbing ---
  const pctFromClientX = (clientX) => {
    const el = seekTrackRef.current;
    if (!el) return seekPct;
    const rect = el.getBoundingClientRect();
    const p = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, p));
  };

  const handleSeekDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
    scrubbingRef.current = true;
    setScrubbing(true);
    setSeekFrameActive(true);
    setSeekPct(pctFromClientX(e.clientX));
  };

  const handleSeekMove = (e) => {
    if (!scrubbingRef.current) return;
    e.stopPropagation();
    setSeekPct(pctFromClientX(e.clientX));
  };

  const handleSeekUp = (e) => {
    if (!scrubbingRef.current) return;
    e.stopPropagation();
    scrubbingRef.current = false;
    setScrubbing(false);
  };

  // Preload the current drama's frames so scrubbing is flicker-free
  useEffect(() => {
    for (let f = 0; f < FRAMES_PER_DRAMA; f++) {
      const img = new Image();
      img.src = frameSrc(activeIdx, f);
    }
  }, [activeIdx]);

  // Wheel scroll handler (throttled)
  const handleWheel = (e) => {
    if (commentsOpen) return;
    if (wheelThrottle.current) return;
    wheelThrottle.current = true;
    setTimeout(() => { wheelThrottle.current = false; }, 800);

    if (e.deltaY > 0) {
      handleNext();
    } else if (e.deltaY < 0) {
      handlePrev();
    }
  };

  const handleLike = () => {
    const isCurrentlyLiked = likedList[activeIdx];
    const newLikedList = [...likedList];
    newLikedList[activeIdx] = !isCurrentlyLiked;
    setLikedList(newLikedList);

    const newLikesData = [...likesData];
    if (isCurrentlyLiked) {
      newLikesData[activeIdx] -= 1;
    } else {
      newLikesData[activeIdx] += 1;
      showToast('点赞成功 ❤️');
    }
    setLikesData(newLikesData);
  };

  const formatLikes = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w';
    }
    return num.toString();
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    const newMuted = !muted;
    setMuted(newMuted);
    showToast(newMuted ? '声音已静音 🔇' : '声音已开启 🔊');
  };

  const handleGameRedirect = (e) => {
    e.stopPropagation();
    setActivePage('page-games');
    setActiveGameCategory('lottery');
    setAutoOpenGameId('fast_three');
  };

  const handleUpgradeMember = () => {
    showToast('提示：升级会员观看完整版功能正在对接中，敬请期待！');
  };

  // Long-press to fast-forward (2x). Hold the right-side zone to show ">> 快進 x2",
  // release to hide it again.
  const startFastForward = () => {
    if (fastForwardTimer.current) clearTimeout(fastForwardTimer.current);
    fastForwardTimer.current = setTimeout(() => {
      setFastForward(true);
    }, 400);
  };

  const stopFastForward = () => {
    if (fastForwardTimer.current) {
      clearTimeout(fastForwardTimer.current);
      fastForwardTimer.current = null;
    }
    setFastForward(false);
  };

  // Clear any pending long-press timer on unmount
  useEffect(() => {
    return () => {
      if (fastForwardTimer.current) clearTimeout(fastForwardTimer.current);
    };
  }, []);

  // Live betting Fast Three random drawings inside short drama
  useEffect(() => {
    if (!betPanelOpen) return;
    const interval = setInterval(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      setLiveK3Dice([d1, d2, d3]);
      setLiveK3Issue(prev => prev + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [betPanelOpen]);

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

  const handleQuickAmountClick = (val) => {
    setBetAmount(val);
    setManualAmount('');
  };

  const handleManualAmountChange = (e) => {
    const val = e.target.value;
    setManualAmount(val);
  };

  const handleResetBets = () => {
    selectedOddsCards.clear();
    setSelectedOddsCards(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const activeQuickAmount = manualAmount === '' ? betAmount : 0;
  const currentBetPrice = manualAmount !== '' ? parseFloat(manualAmount) || 0 : betAmount;
  const totalCost = selectedOddsCards.size * currentBetPrice;

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

  const handleLikeComment = (commentId) => {
    const activeDramaComments = commentsList[activeIdx] || [];
    const updated = activeDramaComments.map(c => {
      if (c.id === commentId) {
        const liked = !c.liked;
        return {
          ...c,
          liked,
          likes: liked ? c.likes + 1 : c.likes - 1
        };
      }
      return c;
    });
    setCommentsList({
      ...commentsList,
      [activeIdx]: updated
    });
  };

  const handleSendComment = (e) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      author: '游客用户',
      avatar: 'assets/drama_author.png',
      text: newCommentText,
      time: '刚刚',
      likes: 0,
      liked: false
    };

    setCommentsList({
      ...commentsList,
      [activeIdx]: [newComment, ...(commentsList[activeIdx] || [])]
    });
    setNewCommentText('');
  };

  return (
    <div className="app-page active" id="page-dramas" onWheel={handleWheel}>
      <div className="short-drama-container" id="drama-player-area">
        {/* Vertical still background */}
        <img
          id="drama-bg-img"
          src={(scrubbing || seekFrameActive) ? frameSrc(activeIdx, frameForPct(seekPct)) : dramaStills[activeIdx]}
          alt="短剧画面"
          className="drama-still-bg"
          style={{ opacity, transition: 'opacity 0.2s ease-in-out' }}
        />
        
        {/* Top-left content category tabs (抖音 / 短剧). Same layout, different content. */}
        <div className="drama-top-tabs">
          <button
            className={`drama-top-tab ${activeTab === 'douyin' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleTabSwitch('douyin'); }}
          >
            抖音
          </button>
          <button
            className={`drama-top-tab ${activeTab === 'duanju' ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleTabSwitch('duanju'); }}
          >
            短剧
          </button>
        </div>

        {/* Long-press fast-forward zone (right side). Sits below the HUD buttons
            (z-index) so taps on like/comment/share still work. */}
        <div
          className="drama-fastforward-zone"
          onPointerDown={startFastForward}
          onPointerUp={stopFastForward}
          onPointerLeave={stopFastForward}
          onPointerCancel={stopFastForward}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Fast-forward hint shown while long-pressing */}
        {fastForward && (
          <div className="drama-fastforward-hint">
            <i className="fa-solid fa-angles-right"></i>
            <span>快進 x2</span>
          </div>
        )}

        {/* Left Promo Gift Badge */}
        {promoVisible && (
          <div className="drama-left-promo" id="drama-promo-badge">
            <div className="drama-promo-close" onClick={(e) => { e.stopPropagation(); setPromoVisible(false); }}>×</div>
            <div className="drama-promo-item highlight">開通特權</div>
            <div className="drama-promo-item">邀請好友</div>
            <div className="drama-promo-item">打卡賺錢</div>
          </div>
        )}

        {/* Right Mute Toggle Button */}
        <div className="drama-mute-toggle" id="btn-drama-mute" onClick={handleMuteToggle}>
          <i className={`fa-solid ${muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high'}`}></i>
        </div>

        {/* Overlay HUD details */}
        <div className="drama-overlay-right">
          <div className="drama-author-avatar" onClick={() => showToast('已关注该创作者！')}>
            <img src="assets/drama_author.png" alt="作者" />
            <i className="fa-solid fa-plus add-author-icon"></i>
          </div>
          <div className={`hud-action-icon ${likedList[activeIdx] ? 'liked' : ''}`} id="btn-like-drama" onClick={handleLike}>
            <i className={likedList[activeIdx] ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} style={{ color: likedList[activeIdx] ? '#ff4757' : '' }}></i>
            <span id="drama-likes-count">{formatLikes(likesData[activeIdx])}</span>
          </div>
          <div className="hud-action-icon" onClick={() => setCommentsOpen(true)}>
            <i className="fa-solid fa-comment-dots"></i>
            <span>{(commentsList[activeIdx] || []).length > 0 ? (commentsList[activeIdx] || []).length : '2.8k'}</span>
          </div>
          <div className="hud-action-icon" onClick={() => showToast('已加入收藏夹！')}>
            <i className="fa-regular fa-star"></i>
            <span>9.4w</span>
          </div>
          <div className="hud-action-icon" onClick={() => showToast('链接已复制到剪切板，去分享给好友吧！')}>
            <i className="fa-solid fa-share"></i>
            <span style={{ fontSize: '0.55rem', marginTop: '2px' }}>分享</span>
          </div>
        </div>
        
        <div className="drama-overlay-bottom">
          {/* Game link button */}
          <div className="drama-game-link-pill" id="drama-game-redirect" onClick={(e) => { e.stopPropagation(); setBetPanelOpen(true); }}>
            <div className="game-link-logo">
              <img src="assets/game_fast3.png" alt="快三" />
            </div>
            <span>一分快三 · 立即游戏</span>
          </div>
          
          {/* Time code */}
          <div className="drama-timecode">
            {fmtTime(seekPct * DRAMA_TOTAL_SECONDS)} / {fmtTime(DRAMA_TOTAL_SECONDS)}
          </div>

          {/* Creator name */}
          <h3 id="drama-creator">{dramaCreators[activeIdx]}</h3>
          
          {/* Title */}
          <p id="drama-title">{dramaTitles[activeIdx]}</p>
          
          {/* Series episodes list link */}
          <div className="drama-episodes-link" onClick={() => showToast('正在加载短剧剧集列表...')}>
            <span>全9集 进入剧集</span>
            <i className="fa-solid fa-chevron-right" style={{ marginLeft: '4px' }}></i>
          </div>

          {/* Upgrade member button */}
          <button className="drama-member-upgrade-btn" onClick={handleUpgradeMember}>
            <i className="fa-solid fa-crown" style={{ color: '#ffe066', marginRight: '6px' }}></i>
            升级会员观看完整版 00:10:12
          </button>

          {/* Progress Bar (draggable seek) */}
          <div
            className={`progress-bar-drama ${scrubbing ? 'scrubbing' : ''}`}
            ref={seekTrackRef}
            onPointerDown={handleSeekDown}
            onPointerMove={handleSeekMove}
            onPointerUp={handleSeekUp}
            onPointerCancel={handleSeekUp}
          >
            {scrubbing && (
              <div className="progress-seek-bubble" style={{ left: `${seekPct * 100}%` }}>
                {fmtTime(seekPct * DRAMA_TOTAL_SECONDS)}
              </div>
            )}
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${seekPct * 100}%` }}></div>
              <div className="progress-thumb" style={{ left: `${seekPct * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Navigation Controls inside drama page */}
        <div className="drama-nav-controls">
          <button id="btn-prev-drama" className="drama-nav-btn" onClick={handlePrev}><i className="fa-solid fa-chevron-up"></i></button>
          <button id="btn-next-drama" className="drama-nav-btn" onClick={handleNext}><i className="fa-solid fa-chevron-down"></i></button>
        </div>

        {/* Comments Backdrop Overlay */}
        <div 
          className={`drama-comments-backdrop ${commentsOpen ? 'open' : ''}`} 
          onClick={() => setCommentsOpen(false)}
        />

        {/* Comments Bottom Sheet Drawer */}
        <div className={`drama-comments-sheet ${commentsOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="drama-comments-header">
            <div className="drama-comments-header-placeholder"></div>
            <div className="drama-comments-title">评论</div>
            <div className="drama-comments-close" onClick={() => setCommentsOpen(false)}>✕</div>
          </div>

          <div className="drama-comments-body">
            {(commentsList[activeIdx] || []).length === 0 ? (
              <div className="drama-comments-empty">
                <div className="drama-comments-empty-icon">
                  <i className="fa-regular fa-comment-dots"></i>
                </div>
                <div className="drama-comments-empty-text">还没有评论，快来抢沙发</div>
              </div>
            ) : (
              <div className="drama-comments-list">
                {(commentsList[activeIdx] || []).map((comment) => (
                  <div key={comment.id} className="drama-comment-item">
                    <img src={comment.avatar} alt="Avatar" className="drama-comment-avatar" />
                    <div className="drama-comment-content">
                      <div className="drama-comment-author">{comment.author}</div>
                      <div className="drama-comment-text">{comment.text}</div>
                      <div className="drama-comment-footer">
                        <span className="drama-comment-time">{comment.time}</span>
                        <div className="drama-comment-actions">
                          <div 
                            className={`drama-comment-like-btn ${comment.liked ? 'liked' : ''}`}
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            <i className={comment.liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                            <span>{comment.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSendComment} className="drama-comments-footer" onClick={(e) => e.stopPropagation()}>
            <div className="drama-comments-input-wrapper">
              <input 
                type="text" 
                className="drama-comments-input" 
                placeholder="说点什么..." 
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className={`drama-comments-send-btn ${newCommentText.trim() ? 'active' : ''}`}
              disabled={!newCommentText.trim()}
            >
              发送
            </button>
          </form>
        </div>

        {/* Betting Backdrop Overlay */}
        <div 
          className={`drama-comments-backdrop ${betPanelOpen ? 'open' : ''}`} 
          onClick={() => setBetPanelOpen(false)}
        />

        {/* Betting Bottom Sheet Drawer */}
        <div className={`drama-comments-sheet drama-betting-sheet ${betPanelOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="live-betting-panel" id="live-betting-panel" style={{ display: 'flex', height: '100%', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', overflow: 'hidden' }}>
            {/* Header */}
            <div className="live-betting-header">
              <div className="live-betting-title-left">
                <i className="fa-solid fa-chevron-up"></i>
                <span>一分快三</span>
              </div>
              <span className="live-betting-status-tag">开奖中</span>
              <div className="live-betting-actions-right">
                <button className="live-playbook-btn" onClick={() => showToast('玩法说明：一分快三，快速开奖！')}><i className="fa-regular fa-lightbulb"></i> 玩法</button>
                <button className="live-close-betting-btn" onClick={() => setBetPanelOpen(false)}><i className="fa-solid fa-xmark"></i></button>
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
            <div className="live-betting-options-container" style={{ flex: 'none', height: '150px', overflowY: 'auto' }}>
              <div className={`live-betting-options-grid active grid-${selectedPlayCat}`}>
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
        </div>
      </div>
    </div>
  );
}
