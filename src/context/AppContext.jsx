import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // 1. Core State
  const [balance, setBalance] = useState(1000.00);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // auth state (default: logged out)
  const [isGuest, setIsGuest] = useState(false); // guest (访客) session: logged in but no phone bound
  const [activePage, setActivePageState] = useState('page-login'); // first screen on open is the login page
  const [pageHistory, setPageHistory] = useState([]); // navigation history stack
  const [activeSubGame, setActiveSubGame] = useState(null); // 'mark_six' or 'fast_three'
  const [phoneSkin, setPhoneSkin] = useState('phone-dark'); // phone-dark, phone-gold, phone-purple, phone-coral
  const [systemTime, setSystemTime] = useState('22:03');
  const [selectedSkin, setSelectedSkin] = useState(() => {
    const saved = localStorage.getItem('selectedSkin');
    return saved ? parseInt(saved, 10) : 2; // 1: 浅蓝, 2: 深蓝 (默认), 3: 午夜蓝, 4: 午夜紫
  });
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeGameName, setActiveGameName] = useState('');

  const changeSelectedSkin = (skinValue) => {
    setSelectedSkin(skinValue);
    localStorage.setItem('selectedSkin', skinValue);
  };

  // Account credential set via 设置帐号密码 page.
  // null = not yet set (shows the "set" flow); otherwise { account, password }.
  // Kept only in memory so a full page reload clears it and the demo flow can replay.
  const [accountCredential, setAccountCredential] = useState(null);

  // Withdraw password (取款密码) set via 取款密码 page.
  // null = not yet set (shows 未设置 + the "set" flow); otherwise the 4-digit string.
  // Kept only in memory so a full page reload clears it and the demo flow can replay.
  const [withdrawPassword, setWithdrawPassword] = useState(null);

  // Random 8-digit member ID, generated once per session (stable across navigation).
  const [memberId] = useState(() => String(Math.floor(10000000 + Math.random() * 90000000)));

  // Cross-component Triggers
  const [activeChatroom, setActiveChatroom] = useState(null);
  const [activeGameCategory, setActiveGameCategory] = useState('hot');
  const [autoOpenGameId, setAutoOpenGameId] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoPlayerActive, setVideoPlayerActive] = useState(false);
  const [activityTab, setActivityTab] = useState('task'); // initial tab for Activity Center
  const [betRecordsTab, setBetRecordsTab] = useState('bets'); // initial tab for 详细记录 ('bets' | 'unsettled' | 'transactions')

  // 2. Custom Configs
  const [quickAmounts, setQuickAmounts] = useState([50, 100, 500, 1000]);
  const [multipliers, setMultipliers] = useState([1, 2, 5, 10, 20]);

  // 3. Staged Lottery Bets (for details modal checkout)
  const [stagedItems, setStagedItems] = useState([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [currentActiveGame, setCurrentActiveGame] = useState(''); // 'mark_six', 'fast_three_embedded', or 'fast_three'
  const [betDetailsModalActive, setBetDetailsModalActive] = useState(false);

  // 4. Staged Sports Bets
  const [stagedSportsBets, setStagedSportsBets] = useState([]);
  const [activeSportsDrawerTab, setActiveSportsDrawerTab] = useState('single');
  const [parlayBetAmount, setParlayBetAmount] = useState(10);
  const [sportsDrawerActive, setSportsDrawerActive] = useState(false);

  // 5. Toasts notifications queue
  const [toasts, setToasts] = useState([]);

  // 6. Config Modals Active States
  const [editMultipliersActive, setEditMultipliersActive] = useState(false);
  const [editQuickAmountsActive, setEditQuickAmountsActive] = useState(false);

  // 8. 一键注册 success modal — holds the auto-generated { account, password } or null
  const [registerSuccessData, setRegisterSuccessData] = useState(null);

  // 7. PG Game Detail modal + nested game embed
  const [gameDetailModalActive, setGameDetailModalActive] = useState(false);
  const [gameDetailData, setGameDetailData] = useState(null); // { name, img }
  const [pgGameActive, setPgGameActive] = useState(false);
  const [pgGameData, setPgGameData] = useState(null); // { name, img }
  const [immersiveMode, setImmersiveMode] = useState(false);

  // Clock Update Effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setSystemTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  // Update Balance Helper (relative or absolute)
  const updateBalance = (amount, isRelative = true) => {
    setBalance(prev => {
      const next = isRelative ? prev + amount : amount;
      return Number(next);
    });
  };

  // Toast Helper
  const showToast = (message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  // Open Bet Details Modal helper
  const openBetDetailsModal = (gameType, itemsList) => {
    setCurrentActiveGame(gameType);
    setStagedItems(JSON.parse(JSON.stringify(itemsList))); // deep clone
    setCurrentMultiplier(1);
    setBetDetailsModalActive(true);
  };

  const closeBetDetailsModal = () => {
    setBetDetailsModalActive(false);
  };

  // Navigation: wrap setActivePage to record previous page in history
  const setActivePage = (page) => {
    if (page !== activePage) {
      setPageHistory(h => [...h, activePage]);
    }
    setActivePageState(page);
  };

  // Go back to the previously visited page (fallback used when history is empty)
  const goBack = (fallback = 'page-profile') => {
    setPageHistory(h => {
      if (h.length === 0) {
        setActivePageState(fallback);
        return h;
      }
      setActivePageState(h[h.length - 1]);
      return h.slice(0, -1);
    });
    setActiveSubGame(null);
  };

  // Auth helpers
  const logout = () => {
    setIsLoggedIn(false);
    setIsGuest(false);
    setPageHistory([]);
    setActiveSubGame(null);
    setActivePageState('page-login'); // back to login page after logout
  };

  const login = () => {
    setIsLoggedIn(true);
    setIsGuest(false);
    setPageHistory([]);
    setActivePageState('page-profile');
  };

  // 访客登录: logged in as guest → 短剧 page, but no phone bound yet
  const guestLogin = () => {
    setIsLoggedIn(true);
    setIsGuest(true);
    setPageHistory([]);
    setActivePageState('page-dramas');
  };

  // 一键注册: auto-generate an account + password, then show the success modal.
  // The user is not logged in until they dismiss the modal (closeRegisterSuccess).
  const oneClickRegister = () => {
    const account = String(Math.floor(1000000000 + Math.random() * 9000000000)); // 10-digit username
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    setAccountCredential({ account, password });
    setRegisterSuccessData({ account, password });
  };

  // Dismiss the 一键注册 success modal and finish logging the new member in.
  const closeRegisterSuccess = () => {
    setRegisterSuccessData(null);
    login();
  };

  // Navigation helpers
  const openDepositPage = () => {
    setActivePage('page-deposit');
    setActiveSubGame(null);
  };

  const openWithdrawPage = () => {
    setActivePage('page-withdraw');
    setActiveSubGame(null);
  };

  const openRebatePage = () => {
    setActivePage('page-rebate');
    setActiveSubGame(null);
  };

  const openPlatformBalancePage = () => {
    setActivePage('page-platform-balance');
    setActiveSubGame(null);
  };

  const openOffersPage = () => {
    setActivePage('page-offers');
    setActiveSubGame(null);
  };

  // Open Activity Center on a specific tab ('task' | 'rebate' | 'vip' | 'tournament')
  const openActivityPage = (tab = 'task') => {
    setActivityTab(tab);
    setActivePage('page-activity');
    setActiveSubGame(null);
  };

  // Open 详细记录 page on a specific tab ('bets' | 'unsettled' | 'transactions')
  const openBetRecordsPage = (tab = 'bets') => {
    setBetRecordsTab(tab);
    setActivePage('page-bet-records');
    setActiveSubGame(null);
  };

  // PG Game Detail modal + nested game embed helpers
  const openGameDetailModal = (game) => {
    setGameDetailData(game || { name: '赏金大对决', img: 'assets/drawing.png' });
    setGameDetailModalActive(true);
  };

  const closeGameDetailModal = () => {
    setGameDetailModalActive(false);
  };

  // Launch the nested PG game embed (image 3) from the detail modal
  const openPgGame = (game) => {
    setPgGameData(game || gameDetailData || { name: '赏金大对决', img: 'assets/drawing.png' });
    setGameDetailModalActive(false);
    setPgGameActive(true);
  };

  const closePgGame = () => {
    setPgGameActive(false);
  };

  return (
    <AppContext.Provider value={{
      balance,
      setBalance,
      updateBalance,

      isLoggedIn,
      isGuest,
      login,
      guestLogin,
      oneClickRegister,
      registerSuccessData,
      closeRegisterSuccess,
      logout,

      activePage,
      setActivePage,
      goBack,

      activeSubGame,
      setActiveSubGame,
      
      phoneSkin,
      setPhoneSkin,
      
      selectedSkin,
      setSelectedSkin: changeSelectedSkin,
      
      systemTime,

      accountCredential,
      setAccountCredential,
      withdrawPassword,
      setWithdrawPassword,
      memberId,

      quickAmounts,
      setQuickAmounts,
      
      multipliers,
      setMultipliers,
      
      stagedItems,
      setStagedItems,
      
      currentMultiplier,
      setCurrentMultiplier,
      
      currentActiveGame,
      setCurrentActiveGame,
      
      betDetailsModalActive,
      setBetDetailsModalActive,
      openBetDetailsModal,
      closeBetDetailsModal,

      stagedSportsBets,
      setStagedSportsBets,
      
      activeSportsDrawerTab,
      setActiveSportsDrawerTab,
      
      parlayBetAmount,
      setParlayBetAmount,
      
      sportsDrawerActive,
      setSportsDrawerActive,
      
      toasts,
      showToast,
      
      openDepositPage,
      openWithdrawPage,
      openRebatePage,
      openPlatformBalancePage,
      openOffersPage,
      openActivityPage,
      activityTab,
      openBetRecordsPage,
      betRecordsTab,

      activeChatroom,
      setActiveChatroom,
      activeGameCategory,
      setActiveGameCategory,
      autoOpenGameId,
      setAutoOpenGameId,
      activeVideo,
      setActiveVideo,
      videoPlayerActive,
      setVideoPlayerActive,

      editMultipliersActive,
      setEditMultipliersActive,
      editQuickAmountsActive,
      setEditQuickAmountsActive,

      gameDetailModalActive,
      setGameDetailModalActive,
      gameDetailData,
      openGameDetailModal,
      closeGameDetailModal,
      pgGameActive,
      setPgGameActive,
      pgGameData,
      openPgGame,
      closePgGame,
      immersiveMode,
      setImmersiveMode,
      activeRoomId,
      setActiveRoomId,
      activeGameName,
      setActiveGameName
    }}>
      {children}
    </AppContext.Provider>
  );
};
