/* ==========================================================================
   BLACK PANTHER CASINO SIMULATOR - INTERACTIVE JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Global State: User Balance & Clock
  // ==========================================
  let balance = 1000.00;
  let customQuickAmounts = [50, 100, 500, 1000];
  let customMultipliers = [1, 2, 5, 10, 20];
  let currentActiveGame = ''; // 'mark_six', 'fast_three_embedded', or 'fast_three'
  let stagedItems = [];
  let currentMultiplier = 1;

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
    const homeUserBal = document.getElementById('home-user-balance-display');
    if (homeUserBal) homeUserBal.textContent = formatted;

    // Redesigned consoles and confirmation modal balance displays
    const mark6Bal = document.getElementById('mark6-console-balance');
    if (mark6Bal) mark6Bal.textContent = balance.toFixed(2);
    const fast3Bal = document.getElementById('fast3-console-balance');
    if (fast3Bal) fast3Bal.textContent = balance.toFixed(2);
    const fastthreeBal = document.getElementById('fastthree-console-balance');
    if (fastthreeBal) fastthreeBal.textContent = balance.toFixed(2);
    const modalBal = document.getElementById('details-modal-balance-val');
    if (modalBal) modalBal.textContent = balance.toFixed(2);
    const liveFast3Bal = document.getElementById('live-fast3-balance');
    if (liveFast3Bal) liveFast3Bal.textContent = balance.toFixed(2);
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

  // Homepage Recommended Live Stream Cards Routing
  const homeLiveCards = document.querySelectorAll('#page-home .home-live-card');
  homeLiveCards.forEach(card => {
    card.addEventListener('click', () => {
      const roomName = card.getAttribute('data-room-name');
      if (!roomName) return;

      // Navigate to chat tab
      const chatBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-chats"]');
      if (chatBtn) {
        chatBtn.click();
        // Enter the chatroom
        enterChatroom(roomName);
      }
    });
  });

  // Homepage Recommended Movie Cards Routing
  const homeMovieCards = document.querySelectorAll('#page-home .home-movie-card');
  homeMovieCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.getAttribute('data-video-title');
      const img = card.getAttribute('data-img');
      if (!title || !img) return;

      // Open video player overlay modal
      const videoPlayerModal = document.getElementById('video-player-modal');
      const modalPlayerStill = document.getElementById('modal-player-still');
      const modalPlayerTitle = document.getElementById('modal-player-title');
      
      if (videoPlayerModal && modalPlayerStill && modalPlayerTitle) {
        modalPlayerStill.src = img;
        modalPlayerTitle.textContent = title;
        videoPlayerModal.classList.add('active');
      }
    });
  });

  // Homepage Recommended Game Cards Routing
  const homeGameCards = document.querySelectorAll('#page-home .home-game-card');
  homeGameCards.forEach(card => {
    card.addEventListener('click', () => {
      const gameTarget = card.getAttribute('data-game-target');
      if (!gameTarget) return;

      // Switch to games page tab
      const gamesBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-games"]');
      if (gamesBtn) {
        gamesBtn.click();

        // Trigger corresponding game click
        setTimeout(() => {
          const gameCard = document.querySelector(`.lobby-game-card[data-game-id="${gameTarget}"]`);
          if (gameCard) {
            gameCard.click();
          }
        }, 150);
      }
    });
  });

  // ==========================================
  // Homepage Interactive Features & SSC Countdown
  // ==========================================
  
  // Search bar
  const homeSearchInput = document.getElementById('home-search-input');
  if (homeSearchInput) {
    homeSearchInput.addEventListener('click', () => {
      showPopupToast("提示：【搜索功能】正在对接中，敬请期待！");
    });
  }

  // Customer Service Icon
  const btnHomeCS = document.getElementById('btn-home-customer-service');
  if (btnHomeCS) {
    btnHomeCS.addEventListener('click', () => {
      showPopupToast("正在为您连接在线客服，请稍候...");
    });
  }

  // Notification Bell Icon
  const btnHomeNotif = document.getElementById('btn-home-notifications');
  if (btnHomeNotif) {
    btnHomeNotif.addEventListener('click', () => {
      showPopupToast("您有 3 条未读公告消息！");
    });
  }

  // Homepage Carousel Slides Click Event Listeners
  // 1. 一分快三 Bet Button
  const btnHomeBetK3 = document.getElementById('btn-home-bet-k3');
  if (btnHomeBetK3) {
    btnHomeBetK3.addEventListener('click', () => {
      const gamesBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-games"]');
      if (gamesBtn) {
        gamesBtn.click();
        const fastThree = document.querySelector('.lobby-game-card[data-game-id="fast_three"]');
        if (fastThree) {
          setTimeout(() => {
            fastThree.click();
            showPopupToast("已为您推荐进入【一分快三】热门游戏房！");
          }, 150);
        }
      }
    });
  }

  // 2. 一分时时彩 Bet Button
  const btnHomeBetSSC = document.getElementById('btn-home-bet-ssc');
  if (btnHomeBetSSC) {
    btnHomeBetSSC.addEventListener('click', () => {
      const gamesBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-games"]');
      if (gamesBtn) {
        gamesBtn.click();
        const fastThree = document.querySelector('.lobby-game-card[data-game-id="fast_three"]');
        if (fastThree) {
          setTimeout(() => {
            fastThree.click();
            showPopupToast("已为您推荐进入【一分时时彩】热门房间！");
          }, 150);
        }
      }
    });
  }

  // 3. 一分六合彩 Bet Button
  const btnHomeBetLHC = document.getElementById('btn-home-bet-lhc');
  if (btnHomeBetLHC) {
    btnHomeBetLHC.addEventListener('click', () => {
      const gamesBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-games"]');
      if (gamesBtn) {
        gamesBtn.click();
        const markSix = document.querySelector('.lobby-game-card[data-game-id="mark_six"]');
        if (markSix) {
          setTimeout(() => {
            markSix.click();
            showPopupToast("已为您推荐进入【一分六合彩】经典游戏房！");
          }, 150);
        }
      }
    });
  }

  // 4. 广告1 (Promo Ad 1 Action) -> Profile page
  const btnHomeAd1 = document.getElementById('btn-home-ad1-action');
  if (btnHomeAd1) {
    btnHomeAd1.addEventListener('click', () => {
      const profileBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-profile"]');
      if (profileBtn) {
        profileBtn.click();
        showPopupToast("欢迎查看每周首充返利特权！");
      }
    });
  }

  // 5. 广告2 (Sports Ad 2 Action) -> Sports page
  const btnHomeAd2 = document.getElementById('btn-home-ad2-action');
  if (btnHomeAd2) {
    btnHomeAd2.addEventListener('click', () => {
      const sportsBtn = document.querySelector('.bottom-nav .nav-btn[data-target="page-sports"]');
      if (sportsBtn) {
        sportsBtn.click();
        showPopupToast("已为您加载顶级赛事，尊享体育返水特权！");
      }
    });
  }

  // "立即首充" (Newbie Deposit Banner) -> Adds ¥120 to balance
  const btnHomeDepositPromo = document.getElementById('btn-home-deposit-promo');
  if (btnHomeDepositPromo) {
    btnHomeDepositPromo.addEventListener('click', () => {
      updateBalance(120);
      showPopupToast("首充成功！充值金额 ¥100 及送首充红利 ¥20 已打入您的虚拟账户。");
    });
  }

  // ==========================================
  // Multi-Lottery countdown loops & Carousel
  // ==========================================

  // 1. 一分快三 (K3)
  const homeK3Period = document.getElementById('home-k3-period');
  const homeK3Countdown = document.getElementById('home-k3-countdown');
  const homeK3HistoryNum = document.getElementById('home-k3-history-num');
  const homeK3BallsContainer = document.getElementById('home-k3-balls');

  let k3TimeLeft = 30;
  let k3CurrentPeriodNum = 20260609128;
  let k3HistoryNumVal = 127;

  function updateK3Countdown() {
    if (!homeK3Countdown) return;

    let m = Math.floor(k3TimeLeft / 60);
    let s = k3TimeLeft % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    homeK3Countdown.textContent = `${m}:${s}`;

    if (k3TimeLeft <= 0) {
      homeK3Countdown.textContent = "开奖中";
      setTimeout(() => {
        const diceVals = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ];

        if (homeK3BallsContainer) {
          homeK3BallsContainer.innerHTML = diceVals.map(val => {
            if (val === 1) {
              return `<div class="dice dice-1"><span class="dot red-dot"></span></div>`;
            }
            let dots = '';
            for (let i = 0; i < val; i++) {
              dots += `<span class="dot"></span>`;
            }
            return `<div class="dice dice-${val}">${dots}</div>`;
          }).join('');
        }

        const f3BallsContainer = document.getElementById('fastthree-balls-container');
        if (f3BallsContainer) {
          f3BallsContainer.innerHTML = diceVals.map(val => {
            if (val === 1) {
              return `<div class="dice dice-1"><span class="dot red-dot"></span></div>`;
            }
            let dots = '';
            for (let i = 0; i < val; i++) {
              dots += `<span class="dot"></span>`;
            }
            return `<div class="dice dice-${val}">${dots}</div>`;
          }).join('');
        }

        k3HistoryNumVal = k3CurrentPeriodNum % 1000;
        if (homeK3HistoryNum) homeK3HistoryNum.textContent = k3HistoryNumVal;

        k3CurrentPeriodNum++;
        if (homeK3Period) homeK3Period.textContent = k3CurrentPeriodNum;

        k3TimeLeft = 30;
        updateK3Countdown();
      }, 2000);
    } else {
      k3TimeLeft--;
      setTimeout(updateK3Countdown, 1000);
    }
  }

  // 2. 一分时时彩 (SSC)
  const sscPeriod = document.getElementById('home-ssc-period');
  const sscCountdown = document.getElementById('home-ssc-countdown');
  const sscHistoryNum = document.getElementById('home-ssc-history-num');
  const sscBallsContainer = document.getElementById('home-ssc-balls');

  let sscTimeLeft = 45;
  let sscCurrentPeriodNum = 284;
  let sscHistoryNumVal = 41;

  function updateSSCCountdown() {
    if (!sscCountdown) return;

    let m = Math.floor(sscTimeLeft / 60);
    let s = sscTimeLeft % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    sscCountdown.textContent = `${m}:${s}`;

    if (sscTimeLeft <= 0) {
      sscCountdown.textContent = "开奖中";
      setTimeout(() => {
        const balls = [];
        for (let i = 0; i < 5; i++) {
          balls.push(Math.floor(Math.random() * 10));
        }

        if (sscBallsContainer) {
          sscBallsContainer.innerHTML = balls.map(num => `<div class="ssc-ball">${num}</div>`).join('');
        }

        sscHistoryNumVal = sscCurrentPeriodNum % 1000;
        if (sscHistoryNum) sscHistoryNum.textContent = sscHistoryNumVal;

        sscCurrentPeriodNum++;
        if (sscPeriod) sscPeriod.textContent = sscCurrentPeriodNum;

        sscTimeLeft = 45;
        updateSSCCountdown();
      }, 2000);
    } else {
      sscTimeLeft--;
      setTimeout(updateSSCCountdown, 1000);
    }
  }

  // 3. 一分六合彩 (LHC)
  const homeLHCPeriod = document.getElementById('home-lhc-period');
  const homeLHCCountdown = document.getElementById('home-lhc-countdown');
  const homeLHCHistoryNum = document.getElementById('home-lhc-history-num');
  const homeLHCBallsContainer = document.getElementById('home-lhc-balls');

  let lhcTimeLeft = 55;
  let lhcCurrentPeriodNum = 2026060;
  let lhcHistoryNumVal = 88;

  function updateLHCCountdown() {
    if (!homeLHCCountdown) return;

    let m = Math.floor(lhcTimeLeft / 60);
    let s = lhcTimeLeft % 60;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    homeLHCCountdown.textContent = `${m}:${s}`;

    if (lhcTimeLeft <= 0) {
      homeLHCCountdown.textContent = "开奖中";
      setTimeout(() => {
        const balls = [];
        for (let i = 0; i < 7; i++) {
          let num = Math.floor(Math.random() * 49) + 1;
          let numStr = num < 10 ? '0' + num : '' + num;
          balls.push(numStr);
        }

        if (homeLHCBallsContainer) {
          let html = '';
          for (let i = 0; i < 6; i++) {
            html += `<div class="ssc-ball lhc-ball">${balls[i]}</div>`;
          }
          html += `<span style="color: #fff; font-size: 0.7rem; font-weight: bold; align-self: center;">+</span>`;
          const colors = ['#eb3b5a', '#20bf6b', '#10ac84', '#2e86de', '#e67e22'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          html += `<div class="ssc-ball lhc-ball lhc-special-ball" style="background: ${randomColor};">${balls[6]}</div>`;
          homeLHCBallsContainer.innerHTML = html;
        }

        lhcHistoryNumVal = lhcCurrentPeriodNum % 1000;
        if (homeLHCHistoryNum) homeLHCHistoryNum.textContent = lhcHistoryNumVal;

        lhcCurrentPeriodNum++;
        if (homeLHCPeriod) homeLHCPeriod.textContent = lhcCurrentPeriodNum;

        lhcTimeLeft = 55;
        updateLHCCountdown();
      }, 2000);
    } else {
      lhcTimeLeft--;
      setTimeout(updateLHCCountdown, 1000);
    }
  }

  // Start Countdowns
  if (homeK3Countdown) updateK3Countdown();
  if (sscCountdown) updateSSCCountdown();
  if (homeLHCCountdown) updateLHCCountdown();

  // Carousel slider rotation logic (Randomly switches slides every 2.5 seconds)
  const homeCarouselSlides = document.querySelectorAll('.home-hero-carousel .home-hero-banner');
  const homeCarouselDots = document.querySelectorAll('.home-hero-carousel .carousel-indicators .dot');
  let currentCarouselSlideIndex = 0;
  let homeCarouselInterval = null;

  function switchCarouselToSlide(index) {
    if (index < 0 || index >= homeCarouselSlides.length) return;

    homeCarouselSlides.forEach(slide => slide.classList.remove('active'));
    homeCarouselDots.forEach(dot => dot.classList.remove('active'));

    homeCarouselSlides[index].classList.add('active');
    homeCarouselDots[index].classList.add('active');
    currentCarouselSlideIndex = index;
  }

  function startHomeCarouselRotation() {
    if (homeCarouselInterval) clearInterval(homeCarouselInterval);
    homeCarouselInterval = setInterval(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * homeCarouselSlides.length);
      } while (nextIndex === currentCarouselSlideIndex);
      
      switchCarouselToSlide(nextIndex);
    }, 4000);
  }

  // Dot manual click handlers
  homeCarouselDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.getAttribute('data-slide'));
      switchCarouselToSlide(slideIndex);
      startHomeCarouselRotation(); // reset timer
    });
  });

  // Start Carousel
  if (homeCarouselSlides.length > 0) {
    startHomeCarouselRotation();
  }

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
  // 5a. Live Room Betting Panel (一分快三)
  // ==========================================
  const btnPlaySameGame = document.getElementById('btn-play-same-game');
  const btnCloseLiveBetting = document.getElementById('btn-close-live-betting');
  const liveBettingPanel = document.getElementById('live-betting-panel');
  const liveChatViewContainer = document.getElementById('live-chat-view-container');
  const livePlayTabs = document.querySelectorAll('.live-play-tab');
  const liveOddsCards = document.querySelectorAll('.live-odds-card');
  const liveFast3TotalCost = document.getElementById('live-fast3-total-cost');
  const liveFast3ManualAmount = document.getElementById('live-fast3-input-amount');
  const btnLiveFast3Cancel = document.getElementById('btn-live-fast3-cancel');
  const btnLiveFast3Submit = document.getElementById('btn-live-fast3-submit');
  const liveFast3BalanceEl = document.getElementById('live-fast3-balance');
  const btnLiveFast3RefreshBalance = document.getElementById('btn-live-fast3-refresh-balance');
  const btnLiveFast3EditQuick = document.getElementById('btn-live-fast3-edit-quick');

  let liveFast3SelectedOdds = new Set();
  let liveFast3BetAmount = 50; // default active quick amount is 50

  // 1. Toggle between Chat view and Betting Panel view
  if (btnPlaySameGame) {
    btnPlaySameGame.addEventListener('click', () => {
      if (liveChatViewContainer) liveChatViewContainer.style.display = 'none';
      if (liveBettingPanel) liveBettingPanel.style.display = 'flex';
      updateLiveFast3Balance();
      // Select Size tab by default
      const defaultTab = document.querySelector('.live-play-tab[data-play-cat="size"]');
      if (defaultTab) defaultTab.click();
    });
  }

  if (btnCloseLiveBetting) {
    btnCloseLiveBetting.addEventListener('click', () => {
      if (liveBettingPanel) liveBettingPanel.style.display = 'none';
      if (liveChatViewContainer) liveChatViewContainer.style.display = 'flex';
    });
  }

  // 1a. Listeners for live room header sub-tabs (跟注, 计划, 更多)
  const liveTabs = document.querySelectorAll('.live-tab');
  liveTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      if (tabName === 'follow' || tabName === 'plan' || tabName === 'more') {
        showPopupToast("对接中，敬请期待！");
      } else {
        liveTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      }
    });
  });

  // 1b. Listener for live room betting panel playbook button (玩法)
  const livePlaybookBtn = document.querySelector('.live-playbook-btn');
  if (livePlaybookBtn) {
    livePlaybookBtn.addEventListener('click', () => {
      showPopupToast("对接中，敬请期待！");
    });
  }

  // 2. Play Sub-tab switching logic
  livePlayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all play tabs
      livePlayTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Hide all grids
      const grids = document.querySelectorAll('.live-betting-options-grid');
      grids.forEach(g => {
        g.style.display = 'none';
        g.classList.remove('active');
      });

      // Show targeted grid
      const cat = tab.getAttribute('data-play-cat');
      const targetGrid = document.getElementById(`live-fast3-grid-${cat}`);
      if (targetGrid) {
        targetGrid.style.display = 'grid';
        targetGrid.classList.add('active');
      }
    });
  });

  // 3. Selection of Odds Cards
  liveOddsCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      const name = card.getAttribute('data-name');
      if (card.classList.contains('selected')) {
        liveFast3SelectedOdds.add(name);
      } else {
        liveFast3SelectedOdds.delete(name);
      }
      updateLiveFast3Summary();
    });
  });

  // 4. Balance Syncing Helper
  function updateLiveFast3Balance() {
    if (liveFast3BalanceEl) {
      liveFast3BalanceEl.textContent = Number(balance).toFixed(2);
    }
  }

  if (btnLiveFast3RefreshBalance) {
    btnLiveFast3RefreshBalance.addEventListener('click', () => {
      updateLiveFast3Balance();
      showPopupToast("余额已刷新");
    });
  }

  // 5. Quick Segmented Amounts Click binding
  const liveQuickAmountsBar = document.getElementById('live-fast3-quick-amounts');
  if (liveQuickAmountsBar) {
    liveQuickAmountsBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.quick-amount-btn');
      if (!btn) return;

      const buttons = liveQuickAmountsBar.querySelectorAll('.quick-amount-btn');
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const val = parseInt(btn.getAttribute('data-val')) || 0;
      liveFast3BetAmount = val;
      if (liveFast3ManualAmount) liveFast3ManualAmount.value = ''; // clear manual input
      updateLiveFast3Summary();
    });
  }

  // 7. Manual Input Field
  if (liveFast3ManualAmount) {
    liveFast3ManualAmount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) || 0;
      liveFast3BetAmount = val;
      // Deactivate all quick amount buttons
      if (liveQuickAmountsBar) {
        const buttons = liveQuickAmountsBar.querySelectorAll('.quick-amount-btn');
        buttons.forEach(b => b.classList.remove('active'));
      }
      updateLiveFast3Summary();
    });
  }

  // 8. Update Summary Calculations
  function updateLiveFast3Summary() {
    const count = liveFast3SelectedOdds.size;
    const total = count * liveFast3BetAmount;
    if (liveFast3TotalCost) liveFast3TotalCost.textContent = total.toFixed(2);

    // Toggle submit button active class
    if (count > 0 && liveFast3BetAmount > 0) {
      btnLiveFast3Submit.classList.add('active');
    } else {
      btnLiveFast3Submit.classList.remove('active');
    }
  }

  // 9. Reset Betting state ("撤回")
  function resetLiveFast3Bets() {
    liveFast3SelectedOdds.clear();
    liveOddsCards.forEach(card => card.classList.remove('selected'));
    if (liveFast3ManualAmount) liveFast3ManualAmount.value = '';
    
    // Reset to default quick amount
    if (liveQuickAmountsBar) {
      const buttons = liveQuickAmountsBar.querySelectorAll('.quick-amount-btn');
      buttons.forEach(b => b.classList.remove('active'));
      const defaultBtn = liveQuickAmountsBar.querySelector('.quick-amount-btn');
      if (defaultBtn) {
        defaultBtn.classList.add('active');
        liveFast3BetAmount = parseInt(defaultBtn.getAttribute('data-val')) || 50;
      } else {
        liveFast3BetAmount = 50;
      }
    }
    updateLiveFast3Summary();
  }

  if (btnLiveFast3Cancel) {
    btnLiveFast3Cancel.addEventListener('click', () => {
      resetLiveFast3Bets();
      showPopupToast("已撤回所有投注选择");
    });
  }

  // 10. Submit Bets Opens Shared Bet Details modal
  if (btnLiveFast3Submit) {
    btnLiveFast3Submit.addEventListener('click', () => {
      const count = liveFast3SelectedOdds.size;
      if (count <= 0) {
        showPopupToast("请选择投注盘口！");
        return;
      }
      if (isNaN(liveFast3BetAmount) || liveFast3BetAmount <= 0) {
        showPopupToast("请输入或选择有效的投注金额！");
        return;
      }

      const activePlayTab = document.querySelector('.live-play-tabs-row .live-play-tab.active');
      const category = activePlayTab ? activePlayTab.textContent.trim() : '大小';

      const items = [];
      const selectedCards = document.querySelectorAll('.live-odds-card.selected');
      selectedCards.forEach(card => {
        const name = card.getAttribute('data-name');
        const odds = card.getAttribute('data-odds');
        items.push({ name, odds, baseVal: liveFast3BetAmount, category });
      });

      // Open details modal using fast_three_embedded type
      openBetDetailsModal('fast_three_embedded', items);
    });
  }

  // 11. Follow bets ("跟单") clicks in the chat messages list
  const betCardFollowButtons = document.querySelectorAll('.bet-card-follow-btn');
  betCardFollowButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.live-bet-slip-card');
      if (!card) return;

      const name = card.getAttribute('data-selection');
      const odds = card.getAttribute('data-odds');
      const amount = parseFloat(card.getAttribute('data-amount')) || 10;
      const play = card.getAttribute('data-play');

      // Immediately stage this single follow bet in the confirmation modal!
      const items = [{ name, odds, baseVal: amount, category: play }];
      openBetDetailsModal('fast_three_embedded', items);
    });
  });

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

  // Mark Six input listener to sync with manual amount typing
  if (mark6InputAmount) {
    mark6InputAmount.addEventListener('input', (e) => {
      let val = parseFloat(e.target.value) || 0;
      currentMarkSixBetAmount = val;
      updateBetSummaryCalculation();
      
      const bar = document.getElementById('mark6-quick-amounts');
      if (bar) {
        const buttons = bar.querySelectorAll('.quick-amount-btn');
        buttons.forEach(b => b.classList.remove('active'));
        buttons.forEach(b => {
          if (parseFloat(b.getAttribute('data-val')) === val) {
            b.classList.add('active');
          }
        });
      }
    });
  }

  function updateBetSummaryCalculation() {
    const count = selectedOddsKeys.size;
    const total = count * currentMarkSixBetAmount;
    if (betSelectedCount) betSelectedCount.textContent = count;
    if (betTotalCost) betTotalCost.textContent = total.toFixed(2);
  }

  // Submit Mark Six Bet opens details confirmation modal
  if (btnMark6Submit) {
    btnMark6Submit.addEventListener('click', () => {
      const count = selectedOddsKeys.size;
      if (count <= 0) {
        alert("请至少选择一个投注盘口！");
        return;
      }
      if (isNaN(currentMarkSixBetAmount) || currentMarkSixBetAmount <= 0) {
        alert("请输入有效的每注投注金额！");
        return;
      }
      
      const activePlayTab = document.querySelector('.play-side-tab.active');
      const category = activePlayTab ? activePlayTab.textContent.trim() : '特码两面';
      
      const cards = document.querySelectorAll('#mark6-odds-grid .odds-card.selected');
      const items = [];
      cards.forEach(card => {
        const name = card.getAttribute('data-name');
        const odds = card.getAttribute('data-odds');
        items.push({ name, odds, baseVal: currentMarkSixBetAmount, category });
      });
      
      openBetDetailsModal('mark_six', items);
    });
  }

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
    }, 2000);
  }

  // Background random win notification generator
  const winPlayerNames = ["张**三", "李**四", "回**狂魔", "神**子", "特**狙击", "快**老王", "CC**粉", "老**玩家", "逆**翻盘", "稳**带飞"];
  function triggerRandomWinNotification() {
    const name = winPlayerNames[Math.floor(Math.random() * winPlayerNames.length)];
    const amount = Math.floor(Math.random() * 8500) + 1500;
    const gameType = Math.random() > 0.5 ? 'fast_three' : 'mark_six';
    showWinNotification(name, amount, gameType);
  }

  // Set interval to periodically trigger player wins every 10 seconds
  setInterval(triggerRandomWinNotification, 10000);

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

  // Embedded Fast Three input listener to sync with manual amount typing
  if (fast3InputAmount) {
    fast3InputAmount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) || 0;
      fast3BetAmount = val;
      updateFast3Summary();
      
      const bar = document.getElementById('fast3-quick-amounts');
      if (bar) {
        const buttons = bar.querySelectorAll('.quick-amount-btn');
        buttons.forEach(b => b.classList.remove('active'));
        buttons.forEach(b => {
          if (parseInt(b.getAttribute('data-val')) === val) {
            b.classList.add('active');
          }
        });
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

  // Submit Fast Three Bet opens details confirmation modal
  if (btnFast3Submit) {
    btnFast3Submit.addEventListener('click', () => {
      const count = fast3SelectedOdds.size;
      if (count <= 0) {
        alert("请选择投注盘口（单/双/大/小）！");
        return;
      }
      if (isNaN(fast3BetAmount) || fast3BetAmount <= 0) {
        alert("请输入有效的单注金额！");
        return;
      }
      
      const activePlayTab = document.querySelector('.fast3-play-tabs .play-tab.active');
      const category = activePlayTab ? activePlayTab.textContent.trim() : '大小';
      
      const cards = document.querySelectorAll('#fast3-odds-grid .odds-card.selected');
      const items = [];
      cards.forEach(card => {
        const name = card.getAttribute('data-name');
        const odds = card.getAttribute('data-odds');
        items.push({ name, odds, baseVal: fast3BetAmount, category });
      });
      
      openBetDetailsModal('fast_three_embedded', items);
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

  // Full-page Fast Three input listener to sync with manual amount typing
  if (f3InputAmount) {
    f3InputAmount.addEventListener('input', (e) => {
      const val = parseInt(e.target.value) || 0;
      f3BetAmount = val;
      updateF3Summary();
      
      const bar = document.getElementById('fastthree-quick-amounts');
      if (bar) {
        const buttons = bar.querySelectorAll('.quick-amount-btn');
        buttons.forEach(b => b.classList.remove('active'));
        buttons.forEach(b => {
          if (parseInt(b.getAttribute('data-val')) === val) {
            b.classList.add('active');
          }
        });
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

  // Cancel button handler for full page Fast Three
  const btnFastthreeCancel = document.getElementById('btn-fastthree-cancel');
  if (btnFastthreeCancel) {
    btnFastthreeCancel.addEventListener('click', () => {
      f3SelectedOdds.clear();
      f3OddsCards.forEach(c => c.classList.remove('selected'));
      updateF3Summary();
      showPopupToast("已撤回选号");
    });
  }

  // Submit Full Page Fast Three Bet opens details confirmation modal
  const btnFastthreeSubmit = document.getElementById('btn-fastthree-submit');
  if (btnFastthreeSubmit) {
    btnFastthreeSubmit.addEventListener('click', () => {
      const count = f3SelectedOdds.size;
      if (count <= 0) {
        alert("请选择投注盘口！");
        return;
      }
      if (isNaN(f3BetAmount) || f3BetAmount <= 0) {
        alert("请输入有效的投注金额！");
        return;
      }
      
      const activePlayTab = document.querySelector('#page-fast-three .fast3-tab.active');
      const category = activePlayTab ? activePlayTab.textContent.trim() : '大小';
      
      const cards = document.querySelectorAll('#page-fast-three .fast3-odds-card.selected');
      const items = [];
      cards.forEach(card => {
        const name = card.getAttribute('data-name');
        const odds = card.getAttribute('data-odds');
        items.push({ name, odds, baseVal: f3BetAmount, category });
      });
      
      openBetDetailsModal('fast_three', items);
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

        f3ActiveIssue++;
        if (f3Issue) f3Issue.textContent = `第${f3ActiveIssue}期`;
      }
    }, 100);
  }

  // Initialize dice state to match screenshot (1, 3, 6)
  renderF3Dice([1, 3, 6]);

  // ==========================================================================
  // 12. Redesigned Console, Bet Details Modal, and Sub-Modals Actions
  // ==========================================================================
  const modalBetDetails = document.getElementById('modal-bet-details');
  const detailsItemsContainer = document.getElementById('bet-details-items-container');
  const detailsGameTitle = document.getElementById('bet-details-game-title');
  const modalEditMultipliers = document.getElementById('modal-edit-multipliers');
  const modalEditQuickAmounts = document.getElementById('modal-edit-quick-amounts');

  // Open Bet Details Modal
  function openBetDetailsModal(gameType, itemsList) {
    currentActiveGame = gameType;
    stagedItems = JSON.parse(JSON.stringify(itemsList)); // deep clone items to edit freely
    currentMultiplier = 1;

    // Set game title
    if (gameType === 'mark_six') {
      detailsGameTitle.textContent = '一分六合彩 投注详情';
    } else if (gameType === 'fast_three_embedded') {
      detailsGameTitle.textContent = '一分快三(视频) 投注详情';
    } else {
      detailsGameTitle.textContent = '一分快三 投注详情';
    }

    // Render components
    renderMultiplierBar();
    renderStagedItems();
    updateDetailsModalSummary();

    // Sync balance display inside modal
    const modalBal = document.getElementById('details-modal-balance-val');
    if (modalBal) modalBal.textContent = balance.toFixed(2);

    // Open modal
    modalBetDetails.classList.add('active');
  }

  // Render Staged items inside Details modal
  function renderStagedItems() {
    if (!detailsItemsContainer) return;
    detailsItemsContainer.innerHTML = '';

    stagedItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'bet-item-card';
      card.innerHTML = `
        <div class="item-info">
          <span class="item-category">${item.category || '投注项'}</span>
          <span class="item-name">${item.name}</span>
        </div>
        <div class="item-right">
          <span class="item-odds-lbl">赔率 <span class="item-odds-val">${item.odds}</span></span>
          <input type="number" class="item-amount-input" value="${item.baseVal}" data-index="${index}">
          <i class="fa-solid fa-trash-can item-delete-icon" data-index="${index}"></i>
        </div>
      `;

      // Bind inline amount change
      const amountInput = card.querySelector('.item-amount-input');
      amountInput.addEventListener('input', (e) => {
        let val = parseFloat(e.target.value) || 0;
        stagedItems[index].baseVal = val;
        updateDetailsModalSummary();
      });

      // Bind delete button click
      const deleteIcon = card.querySelector('.item-delete-icon');
      deleteIcon.addEventListener('click', () => {
        stagedItems.splice(index, 1);
        renderStagedItems();
        updateDetailsModalSummary();
      });

      detailsItemsContainer.appendChild(card);
    });
  }

  // Update totals inside Details modal
  function updateDetailsModalSummary() {
    let count = stagedItems.length;
    let sum = 0;
    stagedItems.forEach(item => {
      sum += item.baseVal;
    });
    let totalCost = sum * currentMultiplier;

    const countVal = document.getElementById('details-modal-count-val');
    const costVal = document.getElementById('details-modal-cost-val');

    if (countVal) countVal.textContent = count;
    if (costVal) costVal.textContent = totalCost.toFixed(2);
  }

  // Render Multiplier options row inside Details modal
  function renderMultiplierBar() {
    const bar = document.getElementById('bet-details-multipliers');
    if (!bar) return;

    // Clear everything except the pencil edit button
    const editBtn = document.getElementById('btn-edit-multipliers');
    bar.innerHTML = '';

    customMultipliers.forEach(mult => {
      const btn = document.createElement('div');
      btn.className = 'multiplier-btn';
      if (mult === currentMultiplier) {
        btn.classList.add('active');
      }
      btn.setAttribute('data-mult', mult);
      btn.textContent = `${mult}倍`;

      btn.addEventListener('click', () => {
        currentMultiplier = mult;
        const buttons = bar.querySelectorAll('.multiplier-btn');
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateDetailsModalSummary();
      });

      bar.appendChild(btn);
    });

    if (editBtn) {
      bar.appendChild(editBtn);
    }
  }

  // Render Quick Amounts bar on game bottom consoles
  function renderQuickAmountsBars() {
    const prefixes = ['mark6', 'fast3', 'fastthree', 'live-fast3'];
    prefixes.forEach(prefix => {
      const bar = document.getElementById(`${prefix}-quick-amounts`);
      if (!bar) return;

      let editBtn = document.getElementById(`btn-edit-${prefix}-quick`);
      if (!editBtn && prefix === 'live-fast3') {
        editBtn = document.getElementById('btn-live-fast3-edit-quick');
      }
      bar.innerHTML = '';

      // Re-append edit button
      if (editBtn) {
        bar.appendChild(editBtn);
      }

      // Append quick amount buttons
      customQuickAmounts.forEach((amt, index) => {
        const btn = document.createElement('div');
        btn.className = 'quick-amount-btn';
        if (index === 0) {
          btn.classList.add('active');
          const input = document.getElementById(`${prefix}-input-amount`);
          if (input) input.value = amt;
          if (prefix === 'mark6') {
            currentMarkSixBetAmount = amt;
            updateBetSummaryCalculation();
          } else if (prefix === 'fast3') {
            fast3BetAmount = amt;
            updateFast3Summary();
          } else if (prefix === 'fastthree') {
            f3BetAmount = amt;
            updateF3Summary();
          } else if (prefix === 'live-fast3') {
            liveFast3BetAmount = amt;
            if (typeof updateLiveFast3Summary === 'function') updateLiveFast3Summary();
          }
        }

        btn.setAttribute('data-val', amt);
        btn.textContent = amt;

        btn.addEventListener('click', () => {
          const buttons = bar.querySelectorAll('.quick-amount-btn');
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const val = parseFloat(amt);
          const input = document.getElementById(`${prefix}-input-amount`);
          if (input) input.value = val;

          if (prefix === 'mark6') {
            currentMarkSixBetAmount = val;
            updateBetSummaryCalculation();
          } else if (prefix === 'fast3') {
            fast3BetAmount = val;
            updateFast3Summary();
          } else if (prefix === 'fastthree') {
            f3BetAmount = val;
            updateF3Summary();
          } else if (prefix === 'live-fast3') {
            liveFast3BetAmount = val;
            if (typeof updateLiveFast3Summary === 'function') updateLiveFast3Summary();
          }
        });

        bar.appendChild(btn);
      });
    });
  }

  // Bind sub-modals edit buttons
  const btnEditMultipliers = document.getElementById('btn-edit-multipliers');
  if (btnEditMultipliers) {
    btnEditMultipliers.addEventListener('click', () => {
      for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`input-mult-${i}`);
        if (input) {
          input.value = customMultipliers[i - 1];
        }
      }
      modalEditMultipliers.classList.add('active');
    });
  }

  const editQuickBtns = ['btn-edit-mark6-quick', 'btn-edit-fast3-quick', 'btn-edit-fastthree-quick', 'btn-live-fast3-edit-quick'];
  editQuickBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        for (let i = 1; i <= 4; i++) {
          const input = document.getElementById(`input-quick-${i}`);
          if (input) {
            input.value = customQuickAmounts[i - 1];
          }
        }
        modalEditQuickAmounts.classList.add('active');
      });
    }
  });

  // Modal Closures
  const btnCloseBetDetails = document.getElementById('btn-close-bet-details');
  if (btnCloseBetDetails) {
    btnCloseBetDetails.addEventListener('click', () => {
      modalBetDetails.classList.remove('active');
    });
  }
  const btnCancelBetDetails = document.getElementById('btn-cancel-bet-details');
  if (btnCancelBetDetails) {
    btnCancelBetDetails.addEventListener('click', () => {
      modalBetDetails.classList.remove('active');
    });
  }

  const btnCloseEditMultipliers = document.getElementById('btn-close-edit-multipliers');
  if (btnCloseEditMultipliers) {
    btnCloseEditMultipliers.addEventListener('click', () => {
      modalEditMultipliers.classList.remove('active');
    });
  }

  const btnCloseEditQuickAmounts = document.getElementById('btn-close-edit-quick-amounts');
  if (btnCloseEditQuickAmounts) {
    btnCloseEditQuickAmounts.addEventListener('click', () => {
      modalEditQuickAmounts.classList.remove('active');
    });
  }

  // Multiplier sub-modal actions
  const btnSaveMultipliers = document.getElementById('btn-save-multipliers');
  if (btnSaveMultipliers) {
    btnSaveMultipliers.addEventListener('click', () => {
      const newMults = [];
      for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`input-mult-${i}`);
        const val = parseInt(input.value);
        if (isNaN(val) || val <= 0) {
          alert("请输入有效的正整数倍数！");
          return;
        }
        newMults.push(val);
      }
      customMultipliers = newMults;
      renderMultiplierBar();
      modalEditMultipliers.classList.remove('active');
      showPopupToast("倍数配置保存成功！");
    });
  }

  const btnResetMultipliersDefault = document.getElementById('btn-reset-multipliers-default');
  if (btnResetMultipliersDefault) {
    btnResetMultipliersDefault.addEventListener('click', () => {
      customMultipliers = [1, 2, 5, 10, 20];
      for (let i = 1; i <= 5; i++) {
        const input = document.getElementById(`input-mult-${i}`);
        if (input) input.value = customMultipliers[i - 1];
      }
      renderMultiplierBar();
      modalEditMultipliers.classList.remove('active');
      showPopupToast("已恢复默认倍数配置！");
    });
  }

  // Quick amounts sub-modal actions
  const btnSaveQuickAmounts = document.getElementById('btn-save-quick-amounts');
  if (btnSaveQuickAmounts) {
    btnSaveQuickAmounts.addEventListener('click', () => {
      const newAmounts = [];
      for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`input-quick-${i}`);
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) {
          alert("请输入有效的正数金额！");
          return;
        }
        newAmounts.push(val);
      }
      customQuickAmounts = newAmounts;
      renderQuickAmountsBars();
      modalEditQuickAmounts.classList.remove('active');
      showPopupToast("快捷金额配置保存成功！");
    });
  }

  const btnResetQuickAmountsDefault = document.getElementById('btn-reset-quick-amounts-default');
  if (btnResetQuickAmountsDefault) {
    btnResetQuickAmountsDefault.addEventListener('click', () => {
      customQuickAmounts = [50, 100, 500, 1000];
      for (let i = 1; i <= 4; i++) {
        const input = document.getElementById(`input-quick-${i}`);
        if (input) input.value = customQuickAmounts[i - 1];
      }
      renderQuickAmountsBars();
      modalEditQuickAmounts.classList.remove('active');
      showPopupToast("已恢复默认快捷金额！");
    });
  }

  // Final checkout confirm button inside Details modal
  const btnConfirmBetDetails = document.getElementById('btn-confirm-bet-details');
  if (btnConfirmBetDetails) {
    btnConfirmBetDetails.addEventListener('click', () => {
      if (stagedItems.length === 0) {
        alert("当前没有可投注的项目！");
        return;
      }

      let sum = 0;
      stagedItems.forEach(item => {
        sum += item.baseVal;
      });
      const totalCost = sum * currentMultiplier;

      if (totalCost > balance) {
        alert("投注失败：虚拟账户余额不足！请先充值。");
        return;
      }

      // Deduct balance
      updateBalance(-totalCost);

      let gameName = '';
      if (currentActiveGame === 'mark_six') {
        gameName = '一分六合彩';
      } else if (currentActiveGame === 'fast_three_embedded') {
        gameName = '一分快三(视频)';
      } else {
        gameName = '一分快三';
      }

      showPopupToast(`🎉 ${gameName} 投注成功！共 ${stagedItems.length} 注，总投注额 ¥${totalCost.toFixed(2)}`);

      // Reset source game state
      if (currentActiveGame === 'mark_six') {
        selectedOddsKeys.clear();
        const activePlayType = document.querySelector('.play-side-tab.active').getAttribute('data-play');
        renderBetOddsCards(activePlayType);
        updateBetSummaryCalculation();
      } else if (currentActiveGame === 'fast_three_embedded') {
        // Clear video modal fast3 selections if active
        if (typeof fast3SelectedOdds !== 'undefined' && fast3SelectedOdds.clear) fast3SelectedOdds.clear();
        if (typeof fast3OddsCards !== 'undefined') fast3OddsCards.forEach(c => c.classList.remove('selected'));
        if (typeof updateFast3Summary === 'function') updateFast3Summary();

        // Clear live room fast3 selections if active
        if (typeof liveFast3SelectedOdds !== 'undefined' && liveFast3SelectedOdds.clear) liveFast3SelectedOdds.clear();
        if (typeof liveOddsCards !== 'undefined') liveOddsCards.forEach(c => c.classList.remove('selected'));
        if (typeof updateLiveFast3Summary === 'function') updateLiveFast3Summary();
      } else if (currentActiveGame === 'fast_three') {
        f3SelectedOdds.clear();
        f3OddsCards.forEach(c => c.classList.remove('selected'));
        updateF3Summary();
      }

      // Close modal
      modalBetDetails.classList.remove('active');
    });
  }

  // Initialize balance and consoles
  updateBalance(0);
  renderQuickAmountsBars();

  // Run initial timer
  startF3CountdownTimer();
});

