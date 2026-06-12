import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // 1. Core State
  const [balance, setBalance] = useState(1000.00);
  const [activePage, setActivePage] = useState('page-dramas'); // default page is dramas
  const [activeSubGame, setActiveSubGame] = useState(null); // 'mark_six' or 'fast_three'
  const [phoneSkin, setPhoneSkin] = useState('phone-dark'); // phone-dark, phone-gold, phone-purple, phone-coral
  const [systemTime, setSystemTime] = useState('22:03');

  // Cross-component Triggers
  const [activeChatroom, setActiveChatroom] = useState(null);
  const [activeGameCategory, setActiveGameCategory] = useState('hot');
  const [autoOpenGameId, setAutoOpenGameId] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoPlayerActive, setVideoPlayerActive] = useState(false);

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

  // Navigation helpers
  const openDepositPage = () => {
    setActivePage('page-deposit');
    setActiveSubGame(null);
  };

  const openWithdrawPage = () => {
    setActivePage('page-withdraw');
    setActiveSubGame(null);
  };

  return (
    <AppContext.Provider value={{
      balance,
      setBalance,
      updateBalance,
      
      activePage,
      setActivePage,
      
      activeSubGame,
      setActiveSubGame,
      
      phoneSkin,
      setPhoneSkin,
      
      systemTime,
      
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
      setEditQuickAmountsActive
    }}>
      {children}
    </AppContext.Provider>
  );
};
