import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function SubGameMarkSix() {
  const { balance, updateBalance, quickAmounts, openBetDetailsModal, setEditQuickAmountsActive, setActiveSubGame, showToast } = useApp();

  // Draw states
  const [countdown, setCountdown] = useState(45);
  const [isDrawing, setIsDrawing] = useState(false);
  const [issue, setIssue] = useState(202606051273);
  const [balls, setBalls] = useState([8, 12, 24, 33, 41, 48, 8]); // default mock results
  const [analysisTags, setAnalysisTags] = useState({ num: 8, size: '小', oe: '双', color: '蓝', zodiac: '猴' });

  // Betting selections
  const [activePlayTab, setActivePlayTab] = useState('twoside'); // twoside, colorwave, zodiac, number
  const [selectedOddsKeys, setSelectedOddsKeys] = useState(new Set());
  const [betAmount, setBetAmount] = useState(50); // defaults to 50
  const [manualAmount, setManualAmount] = useState('');

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      performDrawing();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const performDrawing = () => {
    setIsDrawing(true);
    setTimeout(() => {
      // Pick 7 random numbers 1-49
      const drawn = [];
      while (drawn.length < 7) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!drawn.includes(num)) drawn.push(num);
      }

      setBalls(drawn);
      setIssue(prev => prev + 1);

      // Analyze special ball (7th element)
      const spec = drawn[6];
      const colors = ['red', 'green', 'blue'];
      const colorVal = colors[spec % 3];
      const colorName = colorVal === 'red' ? '红' : (colorVal === 'green' ? '绿' : '蓝');
      
      const isBig = spec >= 25 ? '大' : '小';
      const isSingle = spec % 2 !== 0 ? '单' : '双';
      
      const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
      const zodiacName = zodiacs[spec % 12];

      setAnalysisTags({
        num: spec,
        size: isBig,
        oe: isSingle,
        color: colorName,
        zodiac: zodiacName
      });

      setCountdown(45);
      setIsDrawing(false);
    }, 2500);
  };

  const getBallColorClass = (num) => {
    const colors = ['red', 'green', 'blue'];
    return `ball-${colors[num % 3]}`;
  };

  // Odds databases
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

  const handleOddsCardClick = (name) => {
    const nextSet = new Set(selectedOddsKeys);
    if (nextSet.has(name)) {
      nextSet.delete(name);
    } else {
      nextSet.add(name);
    }
    setSelectedOddsKeys(nextSet);
  };

  const handleQuickAmountClick = (val) => {
    setBetAmount(val);
    setManualAmount('');
  };

  const handleManualAmountChange = (e) => {
    setManualAmount(e.target.value);
  };

  const activeQuickAmount = manualAmount === '' ? betAmount : 0;
  const currentBetPrice = manualAmount !== '' ? parseFloat(manualAmount) || 0 : betAmount;
  
  const count = selectedOddsKeys.size;
  const totalCost = count * currentBetPrice;

  const handleResetBets = () => {
    selectedOddsKeys.clear();
    setSelectedOddsKeys(new Set());
    setManualAmount('');
    setBetAmount(50);
  };

  const handleConfirmBets = () => {
    if (count === 0) {
      alert("请至少选择一个投注盘口！");
      return;
    }
    if (currentBetPrice <= 0) {
      alert("请输入有效的每注投注金额！");
      return;
    }

    const activeLabel = activePlayTab === 'twoside' ? '特码两面' : (activePlayTab === 'colorwave' ? '特码色波' : (activePlayTab === 'zodiac' ? '特码生肖' : '特码直选'));
    
    const items = Array.from(selectedOddsKeys).map(name => {
      const card = playOddsDatabase[activePlayTab].find(item => item.name === name);
      return {
        name,
        odds: card ? card.odds : '1.97',
        baseVal: currentBetPrice,
        category: activeLabel
      };
    });

    openBetDetailsModal('mark_six', items);
  };

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast('余额已刷新为 ¥3000.00！');
  };

  return (
    <div className="sub-game-page active" id="page-mark-six">
      {/* Header */}
      <div className="game-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-back-to-lobby" onClick={() => setActiveSubGame(null)}></i>
        <span className="game-header-title">一分六合彩</span>
        <div className="game-header-right">
          <span>余额: <span id="game-top-balance">{balance.toFixed(2)}</span></span>
          <i className="fa-solid fa-rotate" id="btn-refresh-mark6-balance" onClick={handleRefreshBalance}></i>
        </div>
      </div>

      {/* Sub header countdown & lottery results */}
      <div className="game-lottery-board">
        <div className="board-top-row">
          <span className="issue-label">第 <span id="mark6-issue">{issue}</span> 期</span>
          <span className="timer-label" id="mark6-timer">
            {isDrawing ? "正在开奖..." : `00 : ${countdown.toString().padStart(2, '0')}`}
          </span>
        </div>
        
        {/* Draw Balls wrapper */}
        <div className="board-balls-row" id="mark6-balls-container">
          {balls.slice(0, 6).map((num, idx) => (
            <div key={idx} className={`ball ${getBallColorClass(num)}`}>{num.toString().padStart(2, '0')}</div>
          ))}
          <div className="balls-plus">+</div>
          <div className={`ball ${getBallColorClass(balls[6])}`}>{balls[6].toString().padStart(2, '0')}</div>
        </div>

        {/* Results Tags */}
        <div className="board-tags-row" id="mark6-tags-container">
          <span className="tag-box bg-white">{analysisTags.num.toString().padStart(2, '0')}</span>
          <span className="tag-box bg-blue">{analysisTags.size}</span>
          <span className="tag-box bg-light-blue">{analysisTags.oe}</span>
          <span className="tag-box bg-red">{analysisTags.color}波</span>
          <span className="tag-box bg-orange">{analysisTags.zodiac}</span>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fffbeb',
        color: '#d97706',
        fontSize: '0.62rem',
        padding: '6px 12px',
        borderBottom: '1px solid #fef3c7',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 'bold'
      }}>
        <i className="fa-solid fa-triangle-exclamation"></i>
        <span>设计MEMO：本頁面點擊遊戲會開啟完整遊戲頁面，與直播內的玩法不同</span>
      </div>

      {/* Main Game Contents */}
      <div className="game-main-content">
        {/* Play Categories Side Tabs */}
        <div className="game-play-side-tabs">
          {[
            { id: 'twoside', label: '特码两面' },
            { id: 'colorwave', label: '特码色波' },
            { id: 'zodiac', label: '特码生肖' },
            { id: 'number', label: '特码直选' }
          ].map(tab => (
            <div 
              key={tab.id}
              className={`play-side-tab ${activePlayTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActivePlayTab(tab.id);
                selectedOddsKeys.clear();
                setSelectedOddsKeys(new Set());
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Odds Cards grid */}
        <div className="game-odds-container">
          <div className="scroll-content">
            <div className={`game-odds-grid ${activePlayTab === 'number' ? 'grid-4-cols' : ''}`} id="mark6-odds-grid">
              {playOddsDatabase[activePlayTab].map(card => {
                const isSelected = selectedOddsKeys.has(card.name);
                return (
                  <div 
                    key={card.name} 
                    className={`odds-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleOddsCardClick(card.name)}
                  >
                    <span className="odds-name">{card.name}</span>
                    <strong className="odds-value">{card.odds}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Betting Console */}
      <div className="game-bet-console">
        {/* Row 1: Balance, Selected odds tags details */}
        <div className="console-info-row">
          <span className="console-balance">
            余额: <span id="mark6-console-balance">{balance.toFixed(2)}</span>
          </span>
          <span className="console-bet-summary">
            已选 <span id="bet-selected-count" className="count-value">{count}</span> 注，
            共 <span id="bet-total-cost" className="cost-value">{totalCost.toFixed(2)}</span> 元
          </span>
        </div>

        {/* Row 2: Quick chip buttons presets */}
        <div className="console-amount-row">
          <div className="console-amount-left">
            <button className="console-edit-amount-btn" onClick={() => setEditQuickAmountsActive(true)}>
              <i className="fa-solid fa-pencil"></i>
            </button>
            <div className="console-quick-amounts" id="mark6-quick-amounts">
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
            id="mark6-input-amount" 
            className="console-manual-input" 
            placeholder="自定义" 
            value={manualAmount}
            onChange={handleManualAmountChange}
          />
        </div>

        {/* Row 3: Action checkouts */}
        <div className="console-action-row">
          <button className="console-cancel-btn" onClick={handleResetBets}>
            <i className="fa-solid fa-rotate-left"></i> 重置
          </button>
          <button 
            className={`console-submit-btn ${count > 0 && currentBetPrice > 0 ? 'active' : ''}`}
            onClick={handleConfirmBets}
          >
            提交
          </button>
        </div>
      </div>
    </div>
  );
}
