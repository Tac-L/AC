import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function SubGameFastThree() {
  const { balance, updateBalance, quickAmounts, setEditQuickAmountsActive, setActiveSubGame, showToast } = useApp();

  // Draw states
  const [countdown, setCountdown] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [issue, setIssue] = useState(90636);
  const [lastDice, setLastDice] = useState([1, 3, 6]);
  const [analysisTags, setAnalysisTags] = useState({ sum: 10, size: '小', oe: '双' });

  // Betting states
  const [activePlay, setActivePlay] = useState('sanjun'); // left sidebar navigation, default to sanjun
  const [selectedItem, setSelectedItem] = useState(null); // stores { name, odds } or null
  const [betPrice, setBetPrice] = useState(10); // default amount is 10
  const [manualAmount, setManualAmount] = useState('');

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
      if (rollCount >= 15) {
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
        setAnalysisTags({ sum: sumVal, size: sizeVal, oe: oeVal });

        setIssue(prev => prev + 1);
        setCountdown(30);
        setIsDrawing(false);
      }
    }, 100);
  };

  // Countdown effect
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setTimeout(() => performDrawing(), 0);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSidebarTabClick = (playKey) => {
    if (playKey !== 'sanjun') {
      return; // "其他按鈕點了先不用有反應" (no response for other tabs)
    }
    setActivePlay(playKey);
    setSelectedItem(null); // clear selections
  };

  const handleBetItemClick = (name, odds) => {
    setSelectedItem({ name, odds });
  };

  const handleQuickAmountClick = (val) => {
    setBetPrice(val);
    setManualAmount('');
  };

  const handleManualAmountChange = (e) => {
    setManualAmount(e.target.value);
  };

  const currentAmount = manualAmount !== '' ? parseFloat(manualAmount) || 0 : betPrice;
  const betCount = selectedItem ? 1 : 0;
  const totalCost = betCount * currentAmount;
  const activeQuickAmount = manualAmount === '' ? betPrice : 0;

  const handleResetBets = () => {
    setSelectedItem(null);
    setManualAmount('');
    setBetPrice(10);
  };

  const handleSubmitBets = () => {
    if (!selectedItem) {
      showToast('请先选择投注项目！');
      return;
    }
    if (totalCost <= 0) {
      showToast('请输入有效金额！');
      return;
    }
    if (totalCost > balance) {
      showToast('余额不足，请先充值！');
      return;
    }

    updateBalance(-totalCost);
    showToast(`🎉 一分快三【${selectedItem.name}】投注成功！¥${totalCost.toFixed(2)}`);
    setSelectedItem(null);
  };

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast('余额已刷新为 ¥3000.00！');
  };

  // Helper to render mini dot text representation
  const renderDiceText = (val) => {
    const dots = ['•', '••', '•••', '••••', '•••••', '••••••'];
    return dots[val - 1] || '•';
  };

  return (
    <div className="sub-game-page active" id="page-fast-three">
      {/* 模擬嵌套頁面的瀏覽器頭部樣式 */}
      <div className="f3new-webview-header">
        <div className="f3new-webview-controls-left">
          <button className="f3new-webview-btn" onClick={() => setActiveSubGame(null)} title="返回">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button className="f3new-webview-btn" onClick={() => setActiveSubGame(null)} title="关闭">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="f3new-webview-url-bar">
          <i className="fa-solid fa-lock f3new-webview-secure-icon"></i>
          <span className="f3new-webview-url-text">game.1068tv.com/fast3_play</span>
          <i className="fa-solid fa-rotate-right f3new-webview-refresh-icon" onClick={performDrawing} title="刷新"></i>
        </div>
        <div className="f3new-webview-controls-right">
          <button className="f3new-webview-btn" onClick={() => showToast('安全嵌套连接')} title="选项">
            <i className="fa-solid fa-ellipsis"></i>
          </button>
        </div>
      </div>

      {/* 期号 + 上期结果行 */}
      <div className="f3new-issue-bar">
        <div className="f3new-issue-row">
          <span className="f3new-issue-label"><strong>{issue - 1}</strong>期</span>
          <div className="f3new-last-dice-row">
            <span className={`f3new-mini-dice ${lastDice[0] === 1 ? 'red-dot-mini' : ''}`}>
              {renderDiceText(lastDice[0])}
            </span>
            <span className={`f3new-mini-dice ${lastDice[1] === 1 ? 'red-dot-mini' : ''}`}>
              {renderDiceText(lastDice[1])}
            </span>
            <span className={`f3new-mini-dice ${lastDice[2] === 1 ? 'red-dot-mini' : ''}`}>
              {renderDiceText(lastDice[2])}
            </span>
          </div>
          <i className="fa-solid fa-trophy f3new-trophy" style={{ color: '#ff9f43' }}></i>
        </div>
        <div className="f3new-countdown-row">
          <span className="f3new-next-issue"><strong>{issue}</strong>期</span>
          <span className="f3new-countdown-label">
            封盘 <strong className="f3new-red-time">
              {isDrawing ? "00:00:00" : `00:00:${countdown.toString().padStart(2, '0')}`}
            </strong>
          </span>
          <span className="f3new-countdown-label">
            开奖 <strong className="f3new-red-time">
              {isDrawing ? "开奖中" : `00:00:${(countdown + 2).toString().padStart(2, '0')}`}
            </strong>
          </span>
          <i className="fa-solid fa-circle-play f3new-play-icon" onClick={performDrawing}></i>
        </div>
      </div>

      {/* 主体：左侧 + 右侧 */}
      <div className="f3new-body">
        {/* 左侧玩法导航 */}
        <div className="f3new-sidebar">
          {[
            { id: 'changlong', label: '长龙' },
            { id: 'sanjun', label: '三军' },
            { id: 'duanpai', label: '短牌' },
            { id: 'changpai', label: '长牌' },
            { id: 'quansha', label: '全骰' },
            { id: 'hezhi', label: '和值' },
            { id: 'ertongbao', label: '二同号' },
            { id: 'santong', label: '三不同' }
          ].map(tab => (
            <div 
              key={tab.id}
              className={`f3new-nav-item ${activePlay === tab.id ? 'active' : ''}`}
              onClick={() => handleSidebarTabClick(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* 右侧内容区 */}
        <div className="f3new-content" id="f3new-content">
          
          {/* 长龙 panel */}
          {activePlay === 'changlong' && (
            <div className="f3new-panel active">
              <div className="f3new-group-title">和值-单 <span className="f3new-hot-label">5 期</span></div>
              <div className="f3new-row-2col">
                <div 
                  className={`f3new-bet-item blue-item ${selectedItem?.name === '单' ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick('单', '2.05')}
                >
                  <span className="f3new-dice-label">单</span>
                  <span className="f3new-odds">2.05</span>
                </div>
                <div 
                  className={`f3new-bet-item orange-item ${selectedItem?.name === '双' ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick('双', '2.05')}
                >
                  <span className="f3new-dice-label">双</span>
                  <span className="f3new-odds">2.05</span>
                </div>
              </div>
              <div className="f3new-group-title">和值-小 <span className="f3new-hot-label">5 期</span></div>
              <div className="f3new-row-2col">
                <div 
                  className={`f3new-bet-item blue-item ${selectedItem?.name === '小' ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick('小', '2.05')}
                >
                  <span className="f3new-dice-label">小</span>
                  <span className="f3new-odds">2.05</span>
                </div>
                <div 
                  className={`f3new-bet-item orange-item ${selectedItem?.name === '大' ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick('大', '2.05')}
                >
                  <span className="f3new-dice-label">大</span>
                  <span className="f3new-odds">2.05</span>
                </div>
              </div>
            </div>
          )}

          {/* 三军 panel */}
          {activePlay === 'sanjun' && (
            <div className="f3new-panel active">
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '三军1' ? 'selected' : ''}`} onClick={() => handleBetItemClick('三军1', '2')}>
                  <span className="f3new-dice-dot red-dot-mini">•</span><span className="f3new-odds">2</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '三军2' ? 'selected' : ''}`} onClick={() => handleBetItemClick('三军2', '2')}>
                  <span className="f3new-dice-dot">••</span><span className="f3new-odds">2</span>
                </div>
              </div>
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '三军3' ? 'selected' : ''}`} onClick={() => handleBetItemClick('三军3', '2')}>
                  <span className="f3new-dice-dot">•••</span><span className="f3new-odds">2</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '三军4' ? 'selected' : ''}`} onClick={() => handleBetItemClick('三军4', '2')}>
                  <span className="f3new-dice-dot">••••</span><span className="f3new-odds">2</span>
                </div>
              </div>
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '三军5' ? 'selected' : ''}`} onClick={() => handleBetItemClick('三军5', '2')}>
                  <span className="f3new-dice-dot">•••••</span><span className="f3new-odds">2</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '三军6' ? 'selected' : ''}`} onClick={() => handleBetItemClick('三军6', '2')}>
                  <span className="f3new-dice-dot">••••••</span><span className="f3new-odds">2</span>
                </div>
              </div>
            </div>
          )}

          {/* 短牌 panel */}
          {activePlay === 'duanpai' && (
            <div className="f3new-panel active">
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '短牌1-2' ? 'selected' : ''}`} onClick={() => handleBetItemClick('短牌1-2', '13.5')}>
                  <span className="f3new-dice-dot red-dot-mini">•</span><span className="f3new-dice-dot">••</span><span className="f3new-odds">13.5</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '短牌3-4' ? 'selected' : ''}`} onClick={() => handleBetItemClick('短牌3-4', '13.5')}>
                  <span className="f3new-dice-dot">•••</span><span className="f3new-dice-dot">••••</span><span className="f3new-odds">13.5</span>
                </div>
              </div>
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '短牌5-6' ? 'selected' : ''}`} onClick={() => handleBetItemClick('短牌5-6', '13.5')}>
                  <span className="f3new-dice-dot">•••••</span><span className="f3new-dice-dot">••••••</span><span className="f3new-odds">13.5</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '短牌2-3' ? 'selected' : ''}`} onClick={() => handleBetItemClick('短牌2-3', '13.5')}>
                  <span className="f3new-dice-dot">••</span><span className="f3new-dice-dot">•••</span><span className="f3new-odds">13.5</span>
                </div>
              </div>
            </div>
          )}

          {/* 长牌 panel */}
          {activePlay === 'changpai' && (
            <div className="f3new-panel active">
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '长牌1-2' ? 'selected' : ''}`} onClick={() => handleBetItemClick('长牌1-2', '7.2')}>
                  <span className="f3new-dice-dot red-dot-mini">•</span><span className="f3new-dice-dot">••</span><span className="f3new-odds">7.2</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '长牌3-2' ? 'selected' : ''}`} onClick={() => handleBetItemClick('长牌3-2', '7.2')}>
                  <span className="f3new-dice-dot">•••</span><span className="f3new-dice-dot">••</span><span className="f3new-odds">7.2</span>
                </div>
              </div>
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '长牌4-3' ? 'selected' : ''}`} onClick={() => handleBetItemClick('长牌4-3', '7.2')}>
                  <span className="f3new-dice-dot">••••</span><span className="f3new-dice-dot">•••</span><span className="f3new-odds">7.2</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '长牌5-4' ? 'selected' : ''}`} onClick={() => handleBetItemClick('长牌5-4', '7.2')}>
                  <span className="f3new-dice-dot">•••••</span><span className="f3new-dice-dot">••••</span><span className="f3new-odds">7.2</span>
                </div>
              </div>
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item ${selectedItem?.name === '长牌3-4' ? 'selected' : ''}`} onClick={() => handleBetItemClick('长牌3-4', '7.2')}>
                  <span className="f3new-dice-dot">•••</span><span className="f3new-dice-dot">••••</span><span className="f3new-odds">7.2</span>
                </div>
                <div className={`f3new-bet-item ${selectedItem?.name === '长牌4-5' ? 'selected' : ''}`} onClick={() => handleBetItemClick('长牌4-5', '7.2')}>
                  <span className="f3new-dice-dot">••••</span><span className="f3new-dice-dot">•••••</span><span className="f3new-odds">7.2</span>
                </div>
              </div>
            </div>
          )}

          {/* 全骰 panel */}
          {activePlay === 'quansha' && (
            <div className="f3new-panel active">
              <div className="f3new-row-single">
                <div 
                  className={`f3new-bet-item f3new-wide-item blue-item ${selectedItem?.name === '全骰' ? 'selected' : ''}`} 
                  onClick={() => handleBetItemClick('全骰', '36')}
                >
                  <span className="f3new-dice-label">全骰</span>
                  <span className="f3new-odds">36</span>
                </div>
              </div>
            </div>
          )}

          {/* 和值 panel */}
          {activePlay === 'hezhi' && (
            <div className="f3new-panel active">
              {Array.from({ length: 8 }, (_, idx) => {
                const num1 = idx + 3;
                const num2 = 18 - idx;
                const odds1 = [216, 72, 36, 21.6, 14.4, 10.28, 8.64, 8][idx];
                const odds2 = odds1;

                return (
                  <div key={idx} className="f3new-row-2col">
                    <div 
                      className={`f3new-bet-item blue-item ${selectedItem?.name === String(num1) ? 'selected' : ''}`}
                      onClick={() => handleBetItemClick(String(num1), odds1.toString())}
                    >
                      <span className="f3new-dice-label">{num1}</span>
                      <span className="f3new-odds">{odds1}</span>
                    </div>
                    {num1 !== num2 && (
                      <div 
                        className={`f3new-bet-item blue-item ${selectedItem?.name === String(num2) ? 'selected' : ''}`}
                        onClick={() => handleBetItemClick(String(num2), odds2.toString())}
                      >
                        <span className="f3new-dice-label">{num2}</span>
                        <span className="f3new-odds">{odds2}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item orange-item ${selectedItem?.name === '大' ? 'selected' : ''}`} onClick={() => handleBetItemClick('大', '2.05')}>
                  <span className="f3new-dice-label">大</span><span className="f3new-odds">2.05</span>
                </div>
                <div className={`f3new-bet-item blue-item ${selectedItem?.name === '小' ? 'selected' : ''}`} onClick={() => handleBetItemClick('小', '2.05')}>
                  <span className="f3new-dice-label">小</span><span className="f3new-odds">2.05</span>
                </div>
              </div>
              <div className="f3new-row-2col">
                <div className={`f3new-bet-item blue-item ${selectedItem?.name === '单' ? 'selected' : ''}`} onClick={() => handleBetItemClick('单', '2.05')}>
                  <span className="f3new-dice-label">单</span><span className="f3new-odds">2.05</span>
                </div>
                <div className={`f3new-bet-item orange-item ${selectedItem?.name === '双' ? 'selected' : ''}`} onClick={() => handleBetItemClick('双', '2.05')}>
                  <span className="f3new-dice-label">双</span><span className="f3new-odds">2.05</span>
                </div>
              </div>
            </div>
          )}

          {/* 二同号 panel */}
          {activePlay === 'ertongbao' && (
            <div className="f3new-panel active">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="f3new-row-2col">
                  <div 
                    className={`f3new-bet-item ${selectedItem?.name === `二同${idx * 2 + 1}` ? 'selected' : ''}`} 
                    onClick={() => handleBetItemClick(`二同${idx * 2 + 1}`, '72')}
                  >
                    <span className="f3new-dice-dot">••</span><span className="f3new-dice-dot">•••</span><span className="f3new-odds">72</span>
                  </div>
                  <div 
                    className={`f3new-bet-item ${selectedItem?.name === `二同${idx * 2 + 2}` ? 'selected' : ''}`} 
                    onClick={() => handleBetItemClick(`二同${idx * 2 + 2}`, '72')}
                  >
                    <span className="f3new-dice-dot">••••</span><span className="f3new-dice-dot">•</span><span className="f3new-odds">72</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 三不同 panel */}
          {activePlay === 'santong' && (
            <div className="f3new-panel active">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="f3new-row-2col">
                  <div 
                    className={`f3new-bet-item ${selectedItem?.name === `三不同${idx * 2 + 1}` ? 'selected' : ''}`} 
                    onClick={() => handleBetItemClick(`三不同${idx * 2 + 1}`, '72')}
                  >
                    <span className="f3new-dice-dot">•</span><span className="f3new-dice-dot">••</span><span className="f3new-dice-dot">•••</span><span className="f3new-odds">72</span>
                  </div>
                  <div 
                    className={`f3new-bet-item ${selectedItem?.name === `三不同${idx * 2 + 2}` ? 'selected' : ''}`} 
                    onClick={() => handleBetItemClick(`三不同${idx * 2 + 2}`, '72')}
                  >
                    <span className="f3new-dice-dot">•</span><span className="f3new-dice-dot">••</span><span className="f3new-dice-dot">••••</span><span className="f3new-odds">72</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* 底部投注控制台 */}
      <div className="f3new-console">
        <div className="f3new-console-info">
          <span>
            余额: <strong id="fastthree-console-balance">{balance.toFixed(2)}</strong> 
            <i 
              className="fa-solid fa-rotate" 
              onClick={handleRefreshBalance}
              style={{ cursor: 'pointer', marginLeft: '6px' }}
            ></i>
          </span>
          <span>共 <strong id="fastthree-selected-count">{betCount}</strong>注 &nbsp; 下注金额: <strong id="fastthree-total-cost">{totalCost.toFixed(0)}</strong></span>
        </div>
        <div className="f3new-console-amounts">
          {quickAmounts.slice(0, 4).map(val => (
            <div 
              key={val}
              className={`f3new-quick-btn ${activeQuickAmount === val ? 'active' : ''}`} 
              onClick={() => handleQuickAmountClick(val)}
            >
              {val}
            </div>
          ))}
          <div className="f3new-quick-btn f3new-edit-btn" id="btn-edit-fastthree-quick" onClick={() => setEditQuickAmountsActive(true)}>
            <i className="fa-solid fa-pen"></i>
          </div>
        </div>
        <div className="f3new-console-input-row">
          <input 
            type="number" 
            id="fastthree-input-amount" 
            className="f3new-input-amount" 
            placeholder="输入金额" 
            value={manualAmount}
            onChange={handleManualAmountChange}
          />
        </div>
        <div className="f3new-console-btns">
          <button className="f3new-reset-btn" id="btn-fastthree-cancel" onClick={handleResetBets}>重置</button>
          <button className="f3new-submit-btn" id="btn-fastthree-submit" onClick={handleSubmitBets}>投注</button>
        </div>
      </div>
    </div>
  );
}
