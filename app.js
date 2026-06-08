/* ==========================================================================
   BLACK PANTHER CASINO SIMULATOR - INTERACTIVE JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Global State: User Balance & Clock
  // ==========================================
  let balance = 1000.00;

  function updateBalance(amount, isRelative = true) {
    if (isRelative) {
      balance += amount;
    } else {
      balance = amount;
    }
    
    // Format to 2 decimal places
    const formatted = `¥${balance.toFixed(2)}`;
    
    // Update all balance displays in the DOM
    document.getElementById('sidebar-balance-display').textContent = formatted;
    document.getElementById('app-balance-display').textContent = formatted;
    document.getElementById('profile-balance-val').textContent = formatted;
    document.getElementById('game-top-balance').textContent = balance.toFixed(2);
    const fastthreeTopBal = document.getElementById('fastthree-top-balance');
    if (fastthreeTopBal) fastthreeTopBal.textContent = balance.toFixed(2);
  }

  // Initial balance update
  updateBalance(0);

  // Status Bar Clock
  const statusTime = document.getElementById('status-time');
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    statusTime.textContent = `${hours}:${minutes}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ==========================================
  // 2. Navigation Routing (Main Tabs & Sub-pages)
  // ==========================================
  const navButtons = document.querySelectorAll('.bottom-nav .nav-btn');
  const pages = document.querySelectorAll('.app-page');
  const pageMarkSix = document.getElementById('page-mark-six');
  const pageFastThree = document.getElementById('page-fast-three');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPageId = btn.getAttribute('data-target');

      // Update active nav button
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/Hide pages
      pages.forEach(p => {
        if (p.id === targetPageId) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      // Exit sub-games if switching tabs
      pageMarkSix.classList.remove('active');
      if (pageFastThree) pageFastThree.classList.remove('active');
    });
  });

  // Homepage Portal Map Cards Routing
  const homeMapCards = document.querySelectorAll('#page-home .home-map-card');
  homeMapCards.forEach(card => {
    card.addEventListener('click', () => {
      const route = card.getAttribute('data-route');
      if (!route) return;

      if (route === 'page-games-lottery') {
        // Switch to games page
        const gamesBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-games"]');
        if (gamesBtn) {
          gamesBtn.click();
          // Switch tab to lottery
          const lotteryTab = document.querySelector('.menu-tab-item[data-category="lottery"]');
          if (lotteryTab) lotteryTab.click();
          // Trigger 一分快三 click
          const fastThree = document.querySelector('.lobby-game-card[data-game-id="fast_three"]');
          if (fastThree) {
            setTimeout(() => {
              fastThree.click();
            }, 150);
          }
        }
      } else if (route === 'page-games-slots') {
        // Switch to games page
        const gamesBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-games"]');
        if (gamesBtn) {
          gamesBtn.click();
          // Switch tab to pg (slots)
          const pgTab = document.querySelector('.menu-tab-item[data-category="pg"]');
          if (pgTab) pgTab.click();
        }
      } else {
        // General page routing
        const targetBtn = document.querySelector(`.bottom-nav .nav-btn[data-target="${route}"]`);
        if (targetBtn) {
          targetBtn.click();
        }
      }
    });
  });

  // Deposit/Withdraw buttons triggers
  const depositBtns = [
    document.getElementById('btn-sidebar-deposit'),
    document.getElementById('btn-deposit-popup'),
    document.getElementById('btn-profile-deposit')
  ];

  depositBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        updateBalance(500);
        showPopupToast("充值成功！您的账户已打入 ¥500.00 元虚拟额度。");
      });
    }
  });

  const btnWithdraw = document.getElementById('btn-withdraw-popup');
  if (btnWithdraw) {
    btnWithdraw.addEventListener('click', () => {
      if (balance <= 0) {
        showPopupToast("提现失败：当前可用余额为 0 元。");
        return;
      }
      const withdrawAmount = balance;
      updateBalance(-withdrawAmount);
      showPopupToast(`提现发起成功！提现金额 ¥${withdrawAmount.toFixed(2)} 元正在打包处理。`);
    });
  }

  const btnOnekeyRetrieve = document.getElementById('btn-onekey-retrieve');
  if (btnOnekeyRetrieve) {
    btnOnekeyRetrieve.addEventListener('click', () => {
      showPopupToast("一键额度回收成功！所有子钱包额度已全部取回至系统主账户。");
    });
  }

  // Refresh balance icon
  const btnRefresh = document.getElementById('btn-refresh-balance');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      btnRefresh.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        btnRefresh.style.transform = 'rotate(0deg)';
        showPopupToast("余额刷新成功！");
      }, 500);
    });
  }

  // Profile page interactions & shortcuts
  const btnProfileOnekeyRetrieve = document.getElementById('btn-profile-onekey-retrieve');
  if (btnProfileOnekeyRetrieve) {
    btnProfileOnekeyRetrieve.addEventListener('click', () => {
      showPopupToast("一键额度回收成功！所有子钱包额度已全部取回至系统主账户。");
    });
  }

  const btnProfileWithdraw = document.getElementById('btn-profile-withdraw');
  if (btnProfileWithdraw) {
    btnProfileWithdraw.addEventListener('click', () => {
      if (balance <= 0) {
        showPopupToast("提现失败：当前可用余额为 0 元。");
        return;
      }
      const withdrawAmount = balance;
      updateBalance(-withdrawAmount);
      showPopupToast(`提现发起成功！提现金额 ¥${withdrawAmount.toFixed(2)} 元正在打包处理。`);
    });
  }

  const btnEditUsername = document.getElementById('btn-edit-username');
  if (btnEditUsername) {
    btnEditUsername.addEventListener('click', () => {
      showPopupToast("提示：修改昵称功能暂未开放！");
    });
  }

  const btnCopyId = document.getElementById('btn-copy-id');
  if (btnCopyId) {
    btnCopyId.addEventListener('click', () => {
      showPopupToast("复制成功：用户ID已复制到剪贴板！");
    });
  }

  const btnProfileNotifications = document.getElementById('btn-profile-notifications');
  if (btnProfileNotifications) {
    btnProfileNotifications.addEventListener('click', () => {
      showPopupToast("提示：暂无新系统通知！");
    });
  }

  const btnBuyVip = document.getElementById('btn-buy-vip');
  if (btnBuyVip) {
    btnBuyVip.addEventListener('click', () => {
      showPopupToast("提示：VIP通道正在对接中，敬请期待！");
    });
  }

  const profileFeatures = document.querySelectorAll('.profile-feature-item');
  profileFeatures.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.querySelector('span').textContent;
      showPopupToast(`提示：【${name}】功能正在开发中，敬请期待！`);
    });
  });

  const profilePerkCards = document.querySelectorAll('.profile-perk-card');
  profilePerkCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('h4').textContent;
      showPopupToast(`提示：【${name}】项目即将开启！`);
    });
  });

  // ==========================================
  // 3. Video Hall Player Interaction
  // ==========================================
  const videoCards = document.querySelectorAll('.video-full-width-card');
  const videoPlayerModal = document.getElementById('video-player-modal');
  const btnClosePlayer = document.getElementById('btn-close-player');
  const modalPlayerStill = document.getElementById('modal-player-still');
  const modalPlayerTitle = document.getElementById('modal-player-title');

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-video-title');
      const img = card.getAttribute('data-img');

      modalPlayerStill.src = img;
      modalPlayerTitle.textContent = title;
      videoPlayerModal.classList.add('active');
    });
  });

  btnClosePlayer.addEventListener('click', () => {
    videoPlayerModal.classList.remove('active');
  });

  // Video page horizontal category switching
  const catPills = document.querySelectorAll('.category-pill');
  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // ==========================================
  // 4. Short Drama Swipe & Like Controls
  // ==========================================
  const dramaStills = [
    'assets/drama_still1.png',
    'assets/origami.png',
    'assets/banner.png',
    'assets/science.png'
  ];
  const dramaTitles = [
    '《霸道总裁爱上我》第一集：命运的偶遇 #短剧 #反转 #高爽',
    '《真假千金的豪门较量》第十集：身份拆穿 #虐恋 #豪门 #高能',
    '《战神重生成奶爸》第二集：我的萌宝是天才 #都市 #热血 #打脸',
    '《回到古代当首富》第五集：开局买下盐铁专营 #穿越 #爽剧 #脑洞'
  ];
  const dramaCreators = ['@小美剧场', '@经典剧场栏目', '@奶爸战神', '@爆款短剧屋'];
  const dramaLikes = ['12.5w', '34.8w', '52.1w', '8.9w'];

  let currentDramaIdx = 0;
  const dramaBgImg = document.getElementById('drama-bg-img');
  const btnPrevDrama = document.getElementById('btn-prev-drama');
  const btnNextDrama = document.getElementById('btn-next-drama');
  const dramaCreator = document.getElementById('drama-creator');
  const dramaTitle = document.getElementById('drama-title');
  const dramaLikesCount = document.getElementById('drama-likes-count');
  const btnLikeDrama = document.getElementById('btn-like-drama');

  function updateDrama(index) {
    // Apply slide animation effect
    dramaBgImg.style.opacity = 0;
    setTimeout(() => {
      dramaBgImg.src = dramaStills[index];
      dramaCreator.textContent = dramaCreators[index];
      dramaTitle.textContent = dramaTitles[index];
      dramaLikesCount.textContent = dramaLikes[index];
      btnLikeDrama.classList.remove('liked');
      dramaBgImg.style.opacity = 1;
    }, 200);
  }

  btnPrevDrama.addEventListener('click', () => {
    currentDramaIdx = (currentDramaIdx - 1 + dramaStills.length) % dramaStills.length;
    updateDrama(currentDramaIdx);
  });

  btnNextDrama.addEventListener('click', () => {
    currentDramaIdx = (currentDramaIdx + 1) % dramaStills.length;
    updateDrama(currentDramaIdx);
  });

  // Like Toggle
  btnLikeDrama.addEventListener('click', () => {
    btnLikeDrama.classList.toggle('liked');
    const isLiked = btnLikeDrama.classList.contains('liked');
    if (isLiked) {
      showPopupToast("点赞成功 ❤️");
    }
  });

  // Mouse wheel scroll to switch vertical short drama
  const dramaArea = document.getElementById('drama-player-area');
  let scrollThrottle = false;
  dramaArea.addEventListener('wheel', (e) => {
    if (scrollThrottle) return;
    scrollThrottle = true;
    setTimeout(() => { scrollThrottle = false; }, 800);

    if (e.deltaY > 0) {
      currentDramaIdx = (currentDramaIdx + 1) % dramaStills.length;
    } else {
      currentDramaIdx = (currentDramaIdx - 1 + dramaStills.length) % dramaStills.length;
    }
    updateDrama(currentDramaIdx);
  });

  // ==========================================
  // 5. Chat Split Room (1/3 recommended, 2/3 chat messages)
  // ==========================================
  const chatroomsLobby = document.getElementById('chatrooms-lobby');
  const chatSplitRoom = document.getElementById('chat-split-room');
  const btnLeaveChat = document.getElementById('btn-leave-chat');
  const splitCurrentRoomName = document.getElementById('split-current-room-name');
  const chatMessagesContainer = document.getElementById('split-chat-log');
  const chatInput = document.getElementById('split-chat-input');
  const btnSendChat = document.getElementById('btn-send-split-chat');
  const lobbyCards = document.querySelectorAll('.chat-room-grid-card');
  const recItems = document.querySelectorAll('.rec-room-item');

  let chatInterval = null;

  const chatTemplates = [
    "这期买单还是买双？有计划员发单没？",
    "稳了稳了，我跟大！上期开大，这期继续追。",
    "刚才特码开出了猴，我直接中了48倍！",
    "百家乐庄已经连开了4局了，要不要斩龙？",
    "有没有稳妥的分析师？拉我一下。",
    "感觉六合彩绿波今晚概率特别高。",
    "跟紧计划！每天赚个买菜钱就收工。",
    "充值了1000，今晚能回血不？",
    "卧槽，又中了，感谢老板的一单！",
    "这路单画的真好，必胜路线！"
  ];
  const roomTemplates = {
    fast3: [
      "糖糖主播今天太辣了！",
      "跟着糖糖买单，已经连赢三期了！",
      "糖糖主播，下期还买大吗？",
      "糖糖，求带飞！",
      "今天充值了2000，跟糖糖赢个痛快！",
      "太稳了，这波操作我服！",
      "糖糖么么哒，跟单中"
    ],
    mark_six: [
      "老鬼老师，这期生肖蓝波怎么看？",
      "老鬼老师的拆码图真的很准！",
      "今晚特码跟定老师了！",
      "老鬼老师，绿波这期真的有希望吗？",
      "刚才那波规律讲解太透彻了，谢谢老鬼老师！",
      "求老师推荐下期的特码生肖大底",
      "跟定鬼哥，冲啊！"
    ],
    baccarat: [
      "CC主播身材太正了！",
      "百家乐还是要看CC带路！",
      "庄连开了5把，要斩龙吗，CC老师？",
      "CC老师，求闲路怎么看？",
      "CC老师，刚才那手跟龙爽翻了！",
      "这局下庄，CC你看好谁？",
      "CC主播，晚上几点继续直播呀？"
    ]
  };
  const userNames = ["快三玩家老王", "彩票分析官", "百家乐尊爵", "回血狂魔", "特码狙击手", "小资生活", "庄闲路单研究", "神算子"];

  function enterChatroom(roomName) {
    chatroomsLobby.style.display = 'none';
    chatSplitRoom.classList.add('active');
    splitCurrentRoomName.textContent = roomName;

    // Randomize online count matching screenshot
    const onlineCountEl = document.getElementById('chat-online-count');
    if (onlineCountEl) {
      onlineCountEl.textContent = (Math.floor(Math.random() * 5000) + 12000).toLocaleString();
    }

    // Reset Chat Messages
    chatMessagesContainer.innerHTML = '';
    appendChatMessage("平台公告", "欢迎来到黑豹娱乐交流社区！本群仅供技术探讨，禁止恶意灌水。绿色投资，理智博弈。", true);

    let activeTemplates = chatTemplates;
    let hostName = "主播：糖糖 💖";
    let welcomeMsg = "欢迎宝宝们来到我的快三带飞房！本期方案已经在公屏上方展示，跟上的宝宝扣 111 喔！";

    if (roomName.includes("老鬼")) {
      activeTemplates = roomTemplates.mark_six;
      hostName = "讲师：老鬼 🎓";
      welcomeMsg = "各位学员下午好。今天我们主要拆解本期六合彩的生肖大底。有疑问的可以随时提出来。";
    } else if (roomName.includes("CC")) {
      activeTemplates = roomTemplates.baccarat;
      hostName = "讲师：CC 💃";
      welcomeMsg = "欢迎来到百家乐教学实战，刚来的宝宝记得关注一下路单！庄闲交替，看准时机斩龙！";
    } else {
      activeTemplates = roomTemplates.fast3;
    }

    // Append Welcome Message from the Host
    setTimeout(() => {
      appendChatMessage(hostName, welcomeMsg);
    }, 600);

    // Auto Chat Generation
    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(() => {
      const name = userNames[Math.floor(Math.random() * userNames.length)];
      const text = activeTemplates[Math.floor(Math.random() * activeTemplates.length)];
      appendChatMessage(name, text);
    }, 1800 + Math.random() * 800);
  }

  // Chat tabs filter logic
  const chatMainTabs = document.querySelectorAll('.chat-main-tab');
  const chatSubTabs = document.querySelectorAll('.chat-sub-tab');

  function filterChatRooms() {
    const activeTab = document.querySelector('.chat-main-tab.active');
    const activeSubTab = document.querySelector('.chat-sub-tab.active');
    
    if (!activeTab || !activeSubTab) return;

    const activeCategory = activeTab.getAttribute('data-category');
    const activeSub = activeSubTab.getAttribute('data-sub');

    lobbyCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardSubAttr = card.getAttribute('data-sub');
      if (!cardCategory || !cardSubAttr) return;

      const cardSubs = cardSubAttr.split(',');

      const categoryMatch = (cardCategory === activeCategory);
      const subMatch = (activeSub === 'recommend' || cardSubs.includes(activeSub));

      if (categoryMatch && subMatch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  chatMainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      chatMainTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterChatRooms();
    });
  });

  chatSubTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      chatSubTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      filterChatRooms();
    });
  });

  // Run initial filter
  filterChatRooms();

  lobbyCards.forEach(card => {
    card.addEventListener('click', () => {
      const roomName = card.getAttribute('data-room-name');
      enterChatroom(roomName);
    });
  });

  recItems.forEach(item => {
    item.addEventListener('click', () => {
      const roomName = item.getAttribute('data-room-name');
      enterChatroom(roomName);
    });
  });

  btnLeaveChat.addEventListener('click', () => {
    chatSplitRoom.classList.remove('active');
    chatroomsLobby.style.display = 'flex';
    if (chatInterval) {
      clearInterval(chatInterval);
      chatInterval = null;
    }
  });

  // Clear screen toggle switch matching screenshot
  const toggleClearScreen = document.getElementById('toggle-clear-screen');
  if (toggleClearScreen) {
    toggleClearScreen.addEventListener('change', () => {
      if (toggleClearScreen.checked) {
        chatMessagesContainer.innerHTML = '';
        showPopupToast("已为您清屏！");
        setTimeout(() => {
          toggleClearScreen.checked = false;
        }, 500);
      }
    });
  }

  function appendChatMessage(name, text, isSystem = false, isMy = false) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    if (isMy) bubble.classList.add('my-message');
    if (isSystem) {
      bubble.classList.add('system-message');
    }

    const nameNode = document.createElement('div');
    nameNode.className = 'chat-bubble-name';
    nameNode.textContent = name;

    const textNode = document.createElement('div');
    textNode.className = 'chat-bubble-text';
    textNode.textContent = text;

    bubble.appendChild(nameNode);
    bubble.appendChild(textNode);
    chatMessagesContainer.appendChild(bubble);

    // Auto-scroll
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // Send message
  function sendMyMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    appendChatMessage("我", text, false, true);
    chatInput.value = '';

    // Simulate reply
    setTimeout(() => {
      const replies = ["跟了跟了！我也觉得！", "稳，听兄弟的！", "加油，今晚必发！", "分析得有道理啊。"];
      const replyName = userNames[Math.floor(Math.random() * userNames.length)];
      appendChatMessage(replyName, replies[Math.floor(Math.random() * replies.length)]);
    }, 1200);
  }

  if (btnSendChat) {
    btnSendChat.addEventListener('click', sendMyMessage);
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMyMessage();
    });
  }

  // ==========================================
  // 6. Sports Betting Dashboard
  // ==========================================
  const sportsBetDrawer = document.getElementById('sports-bet-drawer');
  const btnCloseSportsDrawer = document.getElementById('btn-close-sports-drawer');
  const matchCards = document.querySelectorAll('.match-card');
  const betDrawerLeague = document.getElementById('bet-drawer-league');
  const betDrawerMatchTeams = document.getElementById('bet-drawer-match-teams');
  const betDrawerOddsH = document.getElementById('bet-drawer-odds-h');
  const betDrawerOddsD = document.getElementById('bet-drawer-odds-d');
  const betDrawerOddsA = document.getElementById('bet-drawer-odds-a');
  const sportsBetAmountInput = document.getElementById('sports-bet-amount');
  const btnSportsBetSubmit = document.getElementById('btn-sports-bet-submit');
  const sportsChips = document.querySelectorAll('#sports-chips-row .chip-btn');
  const betOptCards = document.querySelectorAll('.bet-opt-card');

  let selectedBetMatchName = "";
  let selectedOddsValue = 1.85;
  let selectedOddsType = "主胜";

  matchCards.forEach(card => {
    // Bind click to open drawer
    card.addEventListener('click', (e) => {
      // If clicked odds buttons, handle selection
      let clickedBtn = e.target.closest('.odds-btn');
      
      const home = card.getAttribute('data-home');
      const away = card.getAttribute('data-away');
      selectedBetMatchName = `${home} VS ${away}`;
      
      betDrawerLeague.textContent = card.querySelector('.match-league').textContent;
      betDrawerMatchTeams.textContent = selectedBetMatchName;
      
      betDrawerOddsH.textContent = card.getAttribute('data-odds-h');
      betDrawerOddsD.textContent = card.getAttribute('data-odds-d');
      betDrawerOddsA.textContent = card.getAttribute('data-odds-a');

      // Pre-select odds card
      betOptCards.forEach(c => c.classList.remove('selected'));
      if (clickedBtn) {
        const txt = clickedBtn.textContent;
        if (txt.includes("主胜")) {
          betOptCards[0].classList.add('selected');
          selectedOddsValue = parseFloat(card.getAttribute('data-odds-h'));
          selectedOddsType = "主胜";
        } else if (txt.includes("平局")) {
          betOptCards[1].classList.add('selected');
          selectedOddsValue = parseFloat(card.getAttribute('data-odds-d'));
          selectedOddsType = "平局";
        } else {
          betOptCards[2].classList.add('selected');
          selectedOddsValue = parseFloat(card.getAttribute('data-odds-a'));
          selectedOddsType = "客胜";
        }
      } else {
        // Default to Home win
        betOptCards[0].classList.add('selected');
        selectedOddsValue = parseFloat(card.getAttribute('data-odds-h'));
        selectedOddsType = "主胜";
      }

      sportsBetDrawer.classList.add('active');
    });
  });

  // Close Sports Bet Drawer
  btnCloseSportsDrawer.addEventListener('click', () => {
    sportsBetDrawer.classList.remove('active');
  });

  // Toggle Bet Options inside Drawer
  betOptCards.forEach(card => {
    card.addEventListener('click', () => {
      betOptCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('active');
      card.classList.add('selected');
      
      const label = card.querySelector('.opt-label').textContent;
      const val = parseFloat(card.querySelector('.opt-odds').textContent);
      selectedOddsType = label;
      selectedOddsValue = val;
    });
  });

  // Chips select
  sportsChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sportsChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      
      const val = chip.getAttribute('data-val');
      sportsBetAmountInput.value = val;
    });
  });

  // Place Sports Bet
  btnSportsBetSubmit.addEventListener('click', () => {
    const betVal = parseFloat(sportsBetAmountInput.value);
    if (isNaN(betVal) || betVal <= 0) {
      alert("请输入有效的押注金额！");
      return;
    }
    if (betVal > balance) {
      alert("投注失败：虚拟账户余额不足！请先点击充值。");
      return;
    }

    // Deduct
    updateBalance(-betVal);
    sportsBetDrawer.classList.remove('active');

    // Bet Success
    alert(`🎉 体育押注成功！\n投注赛事: ${selectedBetMatchName}\n下注项目: ${selectedOddsType} (赔率 ${selectedOddsValue.toFixed(2)})\n投注金额: ¥${betVal.toFixed(2)} 元！`);
  });

  // ==========================================
  // Sports Match Filtering Controller (足球/篮球/网球/排球/乒乓球)
  // ==========================================
  const sportsCategoryPills = document.querySelectorAll('.sports-category-pill');
  const sportsFilterItems = document.querySelectorAll('.sports-filter-item');
  const sportsMatchCards = document.querySelectorAll('#sports-match-list-container .match-card');
  const sportsEmptyState = document.getElementById('sports-empty-state-el');
  const btnSportsMorePlatform = document.querySelector('.sports-more-platform');

  let activeSportsCategory = 'soccer';
  let activeSportsFilter = 'live';

  function filterSportsMatches() {
    let visibleCount = 0;
    sportsMatchCards.forEach(card => {
      const sport = card.getAttribute('data-sport');
      const filterStr = card.getAttribute('data-filter') || '';
      const filters = filterStr.split(' ');

      if (sport === activeSportsCategory && filters.includes(activeSportsFilter)) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (sportsEmptyState) {
      if (visibleCount === 0) {
        sportsEmptyState.style.display = 'block';
      } else {
        sportsEmptyState.style.display = 'none';
      }
    }
  }

  // Bind Category Pills clicks
  sportsCategoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      sportsCategoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeSportsCategory = pill.getAttribute('data-sport');
      
      const categoryName = pill.textContent.trim();
      if (activeSportsCategory === 'volleyball' || activeSportsCategory === 'pingpong') {
        showPopupToast(`提示：【${categoryName}】赛事目前暂无进行中的直播。`);
      }
      
      filterSportsMatches();
    });
  });

  // Bind Filter Items clicks
  sportsFilterItems.forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.getAttribute('data-filter');
      const filterName = item.querySelector('span').textContent.trim();

      if (filter === 'filter') {
        showPopupToast("提示：【条件筛选】功能正在开发中，敬请期待！");
        return;
      }

      sportsFilterItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      activeSportsFilter = filter;

      if (filter === 'anchor') {
        showPopupToast("提示：当前暂无体育主播正在直播。");
      }

      filterSportsMatches();
    });
  });

  // Bind More Platform button click
  if (btnSportsMorePlatform) {
    btnSportsMorePlatform.addEventListener('click', () => {
      showPopupToast("提示：【更多体育平台】正在接入中，敬请期待！");
    });
  }

  // Initial Sports list filter run
  filterSportsMatches();

  // ==========================================
  // 7. Lobby Games Filter & Sub-page routing
  // ==========================================
  const menuTabs = document.querySelectorAll('.menu-tab-item');
  const lobbyGamesList = document.getElementById('lobby-games-list');

  // We can filter grid layout dynamically
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');
      filterGames(category);
    });
  });

  function filterGames(category) {
    const gameCards = lobbyGamesList.querySelectorAll('.lobby-game-card');
    gameCards.forEach(card => {
      const gid = card.getAttribute('data-game-id');
      
      // Basic mock categories mapping
      if (category === 'hot') {
        card.style.display = 'flex';
      } else if (category === 'lottery') {
        if (gid === 'mark_six' || gid === 'fast_three' || gid === 'canada28') {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      } else if (category === 'pg') {
        if (gid === 'mahjong' || gid === 'baccarat') {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      } else if (category === 'wali') {
        if (gid === 'fast_three' || gid === 'baccarat') {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      }
    });
  }

  // Click on Game card
  const markSixCard = lobbyGamesList.querySelector('[data-game-id="mark_six"]');
  const fastThreeCard = lobbyGamesList.querySelector('[data-game-id="fast_three"]');
  const btnBackToLobby = document.getElementById('btn-back-to-lobby');
  const btnBackToLobbyFastThree = document.getElementById('btn-back-to-lobby-fastthree');
  const btnRefreshGameBalance = document.getElementById('btn-refresh-game-balance');
  const btnRefreshFastThreeBalance = document.getElementById('btn-refresh-fastthree-balance');

  if (markSixCard) {
    markSixCard.addEventListener('click', () => {
      pageMarkSix.classList.add('active');
    });
  }

  if (fastThreeCard) {
    fastThreeCard.addEventListener('click', () => {
      if (pageFastThree) {
        pageFastThree.classList.add('active');
        updateBalance(0); // Sync balance display
      }
    });
  }

  if (btnBackToLobby) {
    btnBackToLobby.addEventListener('click', () => {
      pageMarkSix.classList.remove('active');
    });
  }

  if (btnBackToLobbyFastThree) {
    btnBackToLobbyFastThree.addEventListener('click', () => {
      if (pageFastThree) pageFastThree.classList.remove('active');
    });
  }

  if (btnRefreshGameBalance) {
    btnRefreshGameBalance.addEventListener('click', () => {
      btnRefreshGameBalance.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        btnRefreshGameBalance.style.transform = 'rotate(0deg)';
        updateBalance(0);
        showPopupToast("余额同步成功！");
      }, 400);
    });
  }

  if (btnRefreshFastThreeBalance) {
    btnRefreshFastThreeBalance.addEventListener('click', () => {
      btnRefreshFastThreeBalance.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        btnRefreshFastThreeBalance.style.transform = 'rotate(0deg)';
        updateBalance(0);
        showPopupToast("余额同步成功！");
      }, 400);
    });
  }

  // Handle other game cards alert
  const otherGameCards = lobbyGamesList.querySelectorAll('.lobby-game-card:not([data-game-id="mark_six"]):not([data-game-id="fast_three"])');
  otherGameCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.querySelector('span').textContent;
      showPopupToast(`提示：【${name}】正在对接中，目前请体验【一分六合彩】和【一分快三】哦！`);
    });
  });

  // Handle sub-game tabs (全部游戏, 玩法说明, 投注报表, etc.)
  const gameSubTabsContainers = document.querySelectorAll('.game-sub-tabs');
  gameSubTabsContainers.forEach(container => {
    const tabs = container.querySelectorAll('.sub-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const name = tab.textContent.trim();
        if (name !== '全部游戏') {
          showPopupToast(`提示：【${name}】功能正在对接中，敬请期待！`);
          // Re-activate "全部游戏" tab after a short period to keep the UI in sync
          setTimeout(() => {
            tabs.forEach(t => {
              if (t.textContent.trim() === '全部游戏') {
                t.classList.add('active');
              } else {
                t.classList.remove('active');
              }
            });
          }, 1500);
        }
      });
    });
  });

  // ==========================================
  // 8. One-Minute Mark Six (一分六合彩) Drawing & Odds Betting
  // ==========================================
  const mark6Issue = document.getElementById('mark6-issue');
  const mark6Timer = document.getElementById('mark6-timer');
  const mark6BallsContainer = document.getElementById('mark6-balls-container');
  const mark6TagsContainer = document.getElementById('mark6-tags-container');
  const mark6PlayTabs = document.querySelectorAll('.play-side-tab');
  const mark6OddsGrid = document.getElementById('mark6-odds-grid');
  const mark6Chips = document.querySelectorAll('#mark6-chips-row .game-chip');
  const mark6InputAmount = document.getElementById('mark6-input-amount');
  const btnMark6Submit = document.getElementById('btn-mark6-submit');
  const betSelectedCount = document.getElementById('bet-selected-count');
  const betTotalCost = document.getElementById('bet-total-cost');

  let countdownSeconds = 45;
  let activeBetIssue = 202606051273;
  let selectedOddsKeys = new Set();
  let currentMarkSixBetAmount = 50;

  // Countdown timer clock
  function startMarkSixTimer() {
    setInterval(() => {
      if (countdownSeconds > 0) {
        countdownSeconds--;
        let displaySecs = countdownSeconds < 10 ? '0' + countdownSeconds : countdownSeconds;
        mark6Timer.textContent = `00 : ${displaySecs}`;
      } else {
        // Run Draw Drawing
        performMarkSixDrawing();
        countdownSeconds = 45; // Reset countdown
      }
    }, 1000);
  }
  startMarkSixTimer();

  // Perform drawing animation and values update
  function performMarkSixDrawing() {
    mark6Timer.textContent = "正在开奖...";
    showPopupToast(`第 ${activeBetIssue} 期开奖进行中，请留意球号！`);

    setTimeout(() => {
      // Increment issue number
      activeBetIssue++;
      mark6Issue.textContent = activeBetIssue;

      // Draw 7 random balls
      const numbers = [];
      while (numbers.length < 7) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!numbers.includes(num)) numbers.push(num);
      }

      // Ball colors (1-49 colors mapping in Mark Six: Red, Green, Blue)
      const colors = ['red', 'green', 'blue'];
      
      // Populate Ball DOMs
      mark6BallsContainer.innerHTML = '';
      for (let i = 0; i < 6; i++) {
        const num = numbers[i];
        const color = colors[num % 3];
        const ballDiv = document.createElement('div');
        ballDiv.className = `ball ball-${color}`;
        ballDiv.textContent = num;
        mark6BallsContainer.appendChild(ballDiv);
      }
      
      // Plus symbol
      const plus = document.createElement('div');
      plus.className = 'balls-plus';
      plus.textContent = '+';
      mark6BallsContainer.appendChild(plus);

      // Special Ball
      const specialNum = numbers[6];
      const specialColor = colors[specialNum % 3];
      const specialBall = document.createElement('div');
      specialBall.className = `ball ball-${specialColor}`;
      specialBall.textContent = specialNum;
      mark6BallsContainer.appendChild(specialBall);

      // Analyze tags
      const isBig = specialNum >= 25 ? "大" : "小";
      const isSingle = specialNum % 2 !== 0 ? "单" : "双";
      const colorTag = specialColor === 'red' ? "红" : (specialColor === 'green' ? "绿" : "蓝");
      const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
      const zodiacTag = zodiacs[specialNum % 12];

      // Populate Tags
      mark6TagsContainer.innerHTML = `
        <span class="tag-box bg-white">${specialNum}</span>
        <span class="tag-box bg-blue">${isBig}</span>
        <span class="tag-box bg-light-blue">${isSingle}</span>
        <span class="tag-box bg-red">${colorTag}</span>
        <span class="tag-box bg-orange">${zodiacTag}</span>
      `;

      showPopupToast(`第 ${activeBetIssue - 1} 期开奖完毕！特码开出：${specialNum} (${zodiacTag} / ${isBig} / ${isSingle})`);
      setTimeout(() => {
        const name = winPlayerNames[Math.floor(Math.random() * winPlayerNames.length)];
        const amount = Math.floor(Math.random() * 45000) + 5000;
        showWinNotification(name, amount);
      }, 3500);
    }, 2500);
  }

  // Odds selector list configuration based on side tabs
  const playOddsDatabase = {
    twoside: [
      { name: "单", odds: "1.97" },
      { name: "双", odds: "1.97" },
      { name: "大", odds: "1.97" },
      { name: "小", odds: "1.97" }
    ],
    colorwave: [
      { name: "红波", odds: "2.80" },
      { name: "蓝波", odds: "2.80" },
      { name: "绿波", odds: "2.80" }
    ],
    zodiac: [
      { name: "鼠", odds: "11.5" }, { name: "牛", odds: "11.5" },
      { name: "虎", odds: "11.5" }, { name: "兔", odds: "11.5" },
      { name: "龙", odds: "11.5" }, { name: "蛇", odds: "11.5" },
      { name: "马", odds: "11.5" }, { name: "羊", odds: "11.5" },
      { name: "猴", odds: "11.5" }, { name: "鸡", odds: "11.5" },
      { name: "狗", odds: "11.5" }, { name: "猪", odds: "11.5" }
    ],
    number: Array.from({ length: 49 }, (_, i) => ({ name: String(i + 1).padStart(2, '0'), odds: "48.0" }))
  };

  // Switch play methods
  mark6PlayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mark6PlayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const playType = tab.getAttribute('data-play');
      renderBetOddsCards(playType);
    });
  });

  function renderBetOddsCards(playType) {
    mark6OddsGrid.innerHTML = '';
    selectedOddsKeys.clear();
    updateBetSummaryCalculation();

    const data = playOddsDatabase[playType] || [];
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'odds-card';
      card.setAttribute('data-name', item.name);
      card.setAttribute('data-odds', item.odds);

      card.innerHTML = `
        <span class="odds-name">${item.name}</span>
        <strong class="odds-value">${item.odds}</strong>
      `;

      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        if (card.classList.contains('selected')) {
          selectedOddsKeys.add(item.name);
        } else {
          selectedOddsKeys.delete(item.name);
        }
        updateBetSummaryCalculation();
      });

      mark6OddsGrid.appendChild(card);
    });
  }

  // Initialize odds
  renderBetOddsCards('twoside');

  // Chips click to update amount
  mark6Chips.forEach(chip => {
    chip.addEventListener('click', () => {
      mark6Chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const val = parseFloat(chip.getAttribute('data-val'));
      currentMarkSixBetAmount = val;
      mark6InputAmount.value = val;
      updateBetSummaryCalculation();
    });
  });

  mark6InputAmount.addEventListener('input', (e) => {
    let val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      currentMarkSixBetAmount = val;
      updateBetSummaryCalculation();
    }
  });

  function updateBetSummaryCalculation() {
    const count = selectedOddsKeys.size;
    const total = count * currentMarkSixBetAmount;
    betSelectedCount.textContent = count;
    betTotalCost.textContent = total.toFixed(2);
  }

  // Submit Mark Six Bet
  btnMark6Submit.addEventListener('click', () => {
    const count = selectedOddsKeys.size;
    const totalCost = count * currentMarkSixBetAmount;

    if (count <= 0) {
      alert("请至少选择一个投注盘口！");
      return;
    }
    if (isNaN(currentMarkSixBetAmount) || currentMarkSixBetAmount <= 0) {
      alert("请输入有效的每注投注金额！");
      return;
    }
    if (totalCost > balance) {
      alert("投注失败：您的可用余额不足！请先充值。");
      return;
    }

    // Deduct
    updateBalance(-totalCost);

    // Alert
    const betItemsStr = Array.from(selectedOddsKeys).join(', ');
    alert(`🎉 六合彩投注成功！\n期数: 第 ${activeBetIssue} 期\n投注项目: [${betItemsStr}]\n注数: ${count} 注\n每注金额: ¥${currentMarkSixBetAmount.toFixed(2)}\n总投注额: ¥${totalCost.toFixed(2)} 元！`);

    // Reset selection state
    selectedOddsKeys.clear();
    const activePlayType = document.querySelector('.play-side-tab.active').getAttribute('data-play');
    renderBetOddsCards(activePlayType);
  });

  // ==========================================
  // 9. Extra Controls & Helper Toast
  // ==========================================
  function showPopupToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    
    // Style toast container dynamically inside simulator screen container
    toast.style.position = 'absolute';
    toast.style.bottom = '120px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    toast.style.color = '#fff';
    toast.style.border = '1px solid var(--color-gold)';
    toast.style.padding = '8px 16px';
    toast.style.borderRadius = '20px';
    toast.style.fontSize = '0.7rem';
    toast.style.zIndex = '999';
    toast.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
    toast.style.pointerEvents = 'none';
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.width = '80%';
    toast.style.textAlign = 'center';
    toast.style.wordBreak = 'break-all';

    const container = document.getElementById('phone-screen-container') || document.body;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = 0;
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function showWinNotification(playerName, winAmount, gameType = 'mark_six') {
    const toast = document.createElement('div');
    toast.className = 'win-toast-notification';
    const gameName = gameType === 'fast_three' ? '一分快三' : '一分六合彩';
    
    toast.innerHTML = `
      <div class="win-toast-text">
        🎉 恭喜 <strong>${playerName}</strong> 在 [${gameName}] 喜中 <span class="amount">¥${winAmount.toLocaleString()}</span> 元！
      </div>
      <button class="go-watch-btn">去围观 <i class="fa-solid fa-chevron-right"></i></button>
    `;

    const btn = toast.querySelector('.go-watch-btn');
    btn.addEventListener('click', () => {
      // Close video modal if open
      const videoPlayerModal = document.getElementById('video-player-modal');
      if (videoPlayerModal) {
        videoPlayerModal.classList.remove('active');
      }
      // Click Games tab
      const gamesTabBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-games"]');
      if (gamesTabBtn) {
        gamesTabBtn.click();
      }
      
      // Open the appropriate page
      if (gameType === 'fast_three') {
        if (pageFastThree) pageFastThree.classList.add('active');
        if (pageMarkSix) pageMarkSix.classList.remove('active');
      } else {
        if (pageMarkSix) pageMarkSix.classList.add('active');
        if (pageFastThree) pageFastThree.classList.remove('active');
      }
      toast.remove();
    });

    const container = document.getElementById('phone-screen-container') || document.body;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = 0;
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // Background random win notification generator
  const winPlayerNames = ["张**三", "李**四", "回**狂魔", "神**子", "特**狙击", "快**老王", "CC**粉", "老**玩家", "逆**翻盘", "稳**带飞"];
  function triggerRandomWinNotification() {
    const name = winPlayerNames[Math.floor(Math.random() * winPlayerNames.length)];
    const amount = Math.floor(Math.random() * 8500) + 1500;
    const gameType = Math.random() > 0.5 ? 'fast_three' : 'mark_six';
    showWinNotification(name, amount, gameType);
  }

  // Set interval to periodically trigger player wins every 18-24 seconds
  setInterval(triggerRandomWinNotification, 18000 + Math.random() * 6000);

  // Switch phone theme skins (Dark/Gold/Purple/Coral) via sidebar
  const mobileDevice = document.getElementById('mobile-device');
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  let currentSkinIdx = 0;
  const skins = ['phone-dark', 'phone-gold', 'phone-purple', 'phone-coral'];
  btnThemeToggle.addEventListener('click', () => {
    currentSkinIdx = (currentSkinIdx + 1) % skins.length;
    mobileDevice.className = 'phone';
    mobileDevice.classList.add(skins[currentSkinIdx]);
  });

  // ==========================================
  // 10. Video Modal Embedded Fast Three Game (一分快三)
  // ==========================================
  let fast3CountdownSeconds = 9; // set to 9 to match screenshot "00:09" initially
  let fast3ActiveIssue = 202606041274; // match screenshot 202606041274期
  let fast3SelectedOdds = new Set();
  let fast3BetAmount = 50;

  const fast3Timer = document.getElementById('fast3-timer');
  const fast3Issue = document.getElementById('fast3-issue');
  const fast3BallsRow = document.getElementById('fast3-balls-row');
  const fast3OddsGrid = document.getElementById('fast3-odds-grid');
  const fast3OddsCards = fast3OddsGrid ? fast3OddsGrid.querySelectorAll('.odds-card') : [];
  const fast3Chips = document.querySelectorAll('#fast3-chips-row .game-chip');
  const fast3InputAmount = document.getElementById('fast3-input-amount');
  const btnFast3Submit = document.getElementById('btn-fast3-submit');
  const fast3SelectedCount = document.getElementById('fast3-selected-count');
  const fast3TotalCost = document.getElementById('fast3-total-cost');
  const embeddedGamePanel = document.getElementById('embedded-game-panel');
  const btnCloseEmbeddedGame = document.getElementById('btn-close-embedded-game');
  const carouselGameItems = document.querySelectorAll('.carousel-game-item');
  const btnFloatingChat = document.getElementById('btn-floating-chat');

  // Render CSS dice faces helper
  function renderFast3Dice(values) {
    if (!fast3BallsRow) return;
    fast3BallsRow.innerHTML = '';
    values.forEach(val => {
      const diceDiv = document.createElement('div');
      diceDiv.className = `dice dice-${val}`;
      let dotsHtml = '';
      if (val === 1) {
        dotsHtml = '<span class="dot red-dot"></span>';
      } else {
        for (let i = 0; i < val; i++) {
          dotsHtml += '<span class="dot"></span>';
        }
      }
      diceDiv.innerHTML = dotsHtml;
      fast3BallsRow.appendChild(diceDiv);
    });
  }

  // Draw calculation results
  function calculateFast3Results(values) {
    const sum = values[0] + values[1] + values[2];
    const size = sum >= 11 ? '大' : '小';
    const oe = sum % 2 === 0 ? '双' : '单';
    return { sum, size, oe };
  }

  // Fast Three countdown timer
  function startFast3Timer() {
    setInterval(() => {
      if (fast3CountdownSeconds > 0) {
        fast3CountdownSeconds--;
        let displaySecs = fast3CountdownSeconds < 10 ? '0' + fast3CountdownSeconds : fast3CountdownSeconds;
        if (fast3Timer) fast3Timer.textContent = `00 : ${displaySecs}`;
      } else {
        performFast3Drawing();
        fast3CountdownSeconds = 15; // reset to 15s for next rounds
      }
    }, 1000);
  }

  // Fast Three Drawing animation and result resolution
  function performFast3Drawing() {
    if (fast3Timer) fast3Timer.textContent = '开奖中...';
    showPopupToast(`一分快三 第 ${fast3ActiveIssue} 期开始摇号！`);

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const tempVals = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      renderFast3Dice(tempVals);
      rollCount++;

      if (rollCount >= 10) {
        clearInterval(rollInterval);

        // Final roll values
        const finalVals = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ];
        renderFast3Dice(finalVals);

        const results = calculateFast3Results(finalVals);

        // Update HTML results elements
        const sumTag = document.getElementById('fast3-sum-tag');
        const sizeTag = document.getElementById('fast3-size-tag');
        const oeTag = document.getElementById('fast3-oe-tag');
        if (sumTag) sumTag.textContent = results.sum;
        if (sizeTag) sizeTag.textContent = results.size;
        if (oeTag) oeTag.textContent = results.oe;

        // Increment issue and display
        fast3ActiveIssue++;
        if (fast3Issue) fast3Issue.textContent = fast3ActiveIssue + '期';

        showPopupToast(`一分快三 第 ${fast3ActiveIssue - 1} 期开奖结果: ${finalVals.join(',')} = ${results.sum} (${results.size} / ${results.oe})`);
      }
    }, 100);
  }

  // Initialize dice state to match screenshot (1, 3, 6)
  renderFast3Dice([1, 3, 6]);

  // Run initial timer
  startFast3Timer();

  // Odds cards selections click binding
  fast3OddsCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const name = card.getAttribute('data-name');
      if (card.classList.contains('selected')) {
        fast3SelectedOdds.add(name);
      } else {
        fast3SelectedOdds.delete(name);
      }
      updateFast3Summary();
    });
  });

  // Chips selections click binding
  fast3Chips.forEach(chip => {
    chip.addEventListener('click', () => {
      fast3Chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = parseInt(chip.getAttribute('data-val'));
      fast3BetAmount = val;
      if (fast3InputAmount) fast3InputAmount.value = val;
      updateFast3Summary();
    });
  });

  // Input field listener
  if (fast3InputAmount) {
    fast3InputAmount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val > 0) {
        fast3BetAmount = val;
        updateFast3Summary();
      }
    });
  }

  // Update summary counts and costs
  function updateFast3Summary() {
    const count = fast3SelectedOdds.size;
    const total = count * fast3BetAmount;
    if (fast3SelectedCount) fast3SelectedCount.textContent = count;
    if (fast3TotalCost) fast3TotalCost.textContent = total.toFixed(2);
  }

  // Submit Fast Three Bet handler
  if (btnFast3Submit) {
    btnFast3Submit.addEventListener('click', () => {
      const count = fast3SelectedOdds.size;
      const totalCost = count * fast3BetAmount;

      if (count <= 0) {
        alert("请选择投注盘口（单/双/大/小）！");
        return;
      }
      if (isNaN(fast3BetAmount) || fast3BetAmount <= 0) {
        alert("请输入有效的单注金额！");
        return;
      }
      if (totalCost > balance) {
        alert("投注失败：虚拟账户余额不足！请先一键充值。");
        return;
      }

      // Deduct from balance
      updateBalance(-totalCost);

      const itemsStr = Array.from(fast3SelectedOdds).join(', ');
      showPopupToast(`投注成功！一分快三 [${itemsStr}] 共 ${count}注，金额 ¥${totalCost.toFixed(2)}`);

      // Reset selection state
      fast3SelectedOdds.clear();
      fast3OddsCards.forEach(c => c.classList.remove('selected'));
      updateFast3Summary();
    });
  }

  // Collapse / Expand handlers
  if (btnCloseEmbeddedGame) {
    btnCloseEmbeddedGame.addEventListener('click', () => {
      if (embeddedGamePanel) {
        embeddedGamePanel.classList.add('collapsed');
      }
      // Remove active states from carousel
      carouselGameItems.forEach(i => i.classList.remove('active'));
    });
  }

  carouselGameItems.forEach(item => {
    item.addEventListener('click', () => {
      const game = item.getAttribute('data-game');
      const gameName = item.querySelector('span').textContent;

      if (game === 'fast3') {
        carouselGameItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        if (embeddedGamePanel) {
          embeddedGamePanel.classList.remove('collapsed');
        }
      } else {
        showPopupToast(`提示：【${gameName}】正在对接中，目前请体验【一分快三】！`);
      }
    });
  });

  // Floating chat button click event
  if (btnFloatingChat) {
    btnFloatingChat.addEventListener('click', () => {
      // Hide video modal
      if (videoPlayerModal) {
        videoPlayerModal.classList.remove('active');
      }
      // Click Chat nav tab button
      const chatTabBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-chats"]');
      if (chatTabBtn) {
        chatTabBtn.click();
      }
      showPopupToast("已为您跳转至聊天社区！");
    });
  }

  // ==========================================
  // 11. Full Page Fast Three Sub-Game (一分快三)
  // ==========================================
  let f3CountdownSeconds = 30;
  let f3ActiveIssue = 202606051280;
  let f3SelectedOdds = new Set();
  let f3LastBetSelectedOdds = null;
  let f3LastBetAmount = 0;
  let f3BetAmount = 50;

  const f3Timer = document.getElementById('fastthree-timer');
  const f3Issue = document.getElementById('fastthree-issue');
  const f3BallsContainer = document.getElementById('fastthree-balls-container');
  const f3SumTag = document.getElementById('fastthree-sum-tag');
  const f3SizeTag = document.getElementById('fastthree-size-tag');
  const f3OeTag = document.getElementById('fastthree-oe-tag');
  const f3SelectedCountDisplay = document.getElementById('fastthree-selected-count');
  const f3TotalCostDisplay = document.getElementById('fastthree-total-cost');
  const f3InputAmount = document.getElementById('fastthree-input-amount');
  
  const f3PlayTabs = document.querySelectorAll('#page-fast-three .fast3-tab');
  const f3PlayPanels = document.querySelectorAll('#page-fast-three .fast3-play-panel');
  const f3OddsCards = document.querySelectorAll('#page-fast-three .fast3-odds-card');
  const f3Chips = document.querySelectorAll('#fastthree-chips-row .game-chip');
  
  const btnF3LastBet = document.getElementById('btn-fast3-last-bet');
  const btnF3Double = document.getElementById('btn-fast3-double');
  const btnF3Cancel = document.getElementById('btn-fast3-cancel');
  const btnF3Confirm = document.getElementById('btn-fast3-confirm');

  // Initialize input field value
  if (f3InputAmount) f3InputAmount.value = 50;

  // Tab switching
  f3PlayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      f3PlayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      f3PlayPanels.forEach(panel => {
        if (panel.id === `play-panel-${targetTab}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // Odds cards selections click binding
  f3OddsCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const name = card.getAttribute('data-name');
      if (card.classList.contains('selected')) {
        f3SelectedOdds.add(name);
      } else {
        f3SelectedOdds.delete(name);
      }
      updateF3Summary();
    });
  });

  // Chips selections click binding
  f3Chips.forEach(chip => {
    chip.addEventListener('click', () => {
      f3Chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = parseInt(chip.getAttribute('data-val'));
      f3BetAmount = val;
      if (f3InputAmount) f3InputAmount.value = val;
      updateF3Summary();
    });
  });

  // Input amount field listener
  if (f3InputAmount) {
    f3InputAmount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val) && val > 0) {
        f3BetAmount = val;
        updateF3Summary();
      }
    });
  }

  // Update summary counts and costs
  function updateF3Summary() {
    const count = f3SelectedOdds.size;
    const total = count * f3BetAmount;
    if (f3SelectedCountDisplay) f3SelectedCountDisplay.textContent = count;
    if (f3TotalCostDisplay) f3TotalCostDisplay.textContent = total.toFixed(2);
  }

  // Cancel button handler
  if (btnF3Cancel) {
    btnF3Cancel.addEventListener('click', () => {
      f3SelectedOdds.clear();
      f3OddsCards.forEach(c => c.classList.remove('selected'));
      updateF3Summary();
      showPopupToast("投注已取消");
    });
  }

  // Double button handler
  if (btnF3Double) {
    btnF3Double.addEventListener('click', () => {
      f3BetAmount *= 2;
      if (f3InputAmount) f3InputAmount.value = f3BetAmount;
      
      // Update chip row active state
      f3Chips.forEach(chip => {
        const val = parseInt(chip.getAttribute('data-val'));
        if (val === f3BetAmount) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });
      
      updateF3Summary();
      showPopupToast(`单注金额已翻倍至 ¥${f3BetAmount}`);
    });
  }

  // Confirm Bet button handler
  if (btnF3Confirm) {
    btnF3Confirm.addEventListener('click', () => {
      const count = f3SelectedOdds.size;
      const totalCost = count * f3BetAmount;

      if (count <= 0) {
        alert("请选择投注盘口！");
        return;
      }
      if (isNaN(f3BetAmount) || f3BetAmount <= 0) {
        alert("请输入有效的投注金额！");
        return;
      }
      if (totalCost > balance) {
        alert("投注失败：虚拟账户余额不足！请先一键充值。");
        return;
      }

      // Deduct balance
      updateBalance(-totalCost);

      const selectionsStr = Array.from(f3SelectedOdds).join(', ');
      showPopupToast(`投注成功！一分快三 [${selectionsStr}] 共 ${count}注，金额 ¥${totalCost.toFixed(2)}`);

      // Save to last bet cache
      f3LastBetSelectedOdds = new Set(f3SelectedOdds);
      f3LastBetAmount = f3BetAmount;

      // Reset selection state
      f3SelectedOdds.clear();
      f3OddsCards.forEach(c => c.classList.remove('selected'));
      updateF3Summary();
    });
  }

  // Restore Last Bet button handler
  if (btnF3LastBet) {
    btnF3LastBet.addEventListener('click', () => {
      if (!f3LastBetSelectedOdds || f3LastBetSelectedOdds.size === 0) {
        showPopupToast("未找到上次投注记录！");
        return;
      }
      // Clear current selections
      f3SelectedOdds.clear();
      f3OddsCards.forEach(c => c.classList.remove('selected'));

      // Restore from cache
      f3BetAmount = f3LastBetAmount;
      if (f3InputAmount) f3InputAmount.value = f3BetAmount;

      f3Chips.forEach(chip => {
        const val = parseInt(chip.getAttribute('data-val'));
        if (val === f3BetAmount) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });

      f3LastBetSelectedOdds.forEach(item => {
        f3SelectedOdds.add(item);
        f3OddsCards.forEach(card => {
          if (card.getAttribute('data-name') === item) {
            card.classList.add('selected');
          }
        });
      });

      updateF3Summary();
      showPopupToast("已还原上次投注内容");
    });
  }

  // Render CSS dice faces helper
  function renderF3Dice(values) {
    if (!f3BallsContainer) return;
    f3BallsContainer.innerHTML = '';
    values.forEach(val => {
      const diceDiv = document.createElement('div');
      diceDiv.className = `dice dice-${val}`;
      let dotsHtml = '';
      if (val === 1) {
        dotsHtml = '<span class="dot red-dot"></span>';
      } else {
        for (let i = 0; i < val; i++) {
          dotsHtml += '<span class="dot"></span>';
        }
      }
      diceDiv.innerHTML = dotsHtml;
      f3BallsContainer.appendChild(diceDiv);
    });
  }

  // Fast Three countdown timer
  function startF3CountdownTimer() {
    setInterval(() => {
      if (f3CountdownSeconds > 0) {
        f3CountdownSeconds--;
        let displaySecs = f3CountdownSeconds < 10 ? '0' + f3CountdownSeconds : f3CountdownSeconds;
        if (f3Timer) f3Timer.textContent = `00 : ${displaySecs}`;
      } else {
        performF3DrawingLoop();
        f3CountdownSeconds = 30; // reset to 30s
      }
    }, 1000);
  }

  // Fast Three Drawing animation and result resolution
  function performF3DrawingLoop() {
    if (f3Timer) f3Timer.textContent = '开奖中...';
    showPopupToast(`一分快三 第 ${f3ActiveIssue} 期开始摇号！`);

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      const tempVals = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      renderF3Dice(tempVals);
      rollCount++;

      if (rollCount >= 15) { // 1.5 seconds roll animation
        clearInterval(rollInterval);

        // Final roll values
        const finalVals = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ];
        renderF3Dice(finalVals);

        const sum = finalVals[0] + finalVals[1] + finalVals[2];
        const size = sum >= 11 ? '大' : '小';
        const oe = sum % 2 === 0 ? '双' : '单';

        if (f3SumTag) f3SumTag.textContent = sum;
        if (f3SizeTag) {
          f3SizeTag.textContent = size;
          f3SizeTag.className = `tag-box ${size === '大' ? 'bg-red' : 'bg-blue'}`;
        }
        if (f3OeTag) {
          f3OeTag.textContent = oe;
          f3OeTag.className = `tag-box ${oe === '双' ? 'bg-red' : 'bg-blue'}`;
        }

        showPopupToast(`一分快三 第 ${f3ActiveIssue} 期开奖结果: ${finalVals.join(',')} = ${sum} (${size} / ${oe})`);

        // Send winner notification periodically aligned with draws
        setTimeout(() => {
          const randomWinner = winPlayerNames[Math.floor(Math.random() * winPlayerNames.length)];
          const randomAmount = Math.floor(Math.random() * 7500) + 1500;
          showWinNotification(randomWinner, randomAmount, 'fast_three');
        }, 2500);

        f3ActiveIssue++;
        if (f3Issue) f3Issue.textContent = `第${f3ActiveIssue}期`;
      }
    }, 100);
  }

  // Initialize dice state to match screenshot (1, 3, 6)
  renderF3Dice([1, 3, 6]);

  // Run initial timer
  startF3CountdownTimer();
});

