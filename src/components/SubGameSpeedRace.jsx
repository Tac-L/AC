import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// 极速赛车 1~10 名次球颜色（PK10 标准配色）
const RACE_COLORS = {
  1: '#f5c211',  // 黄
  2: '#2f6fdb',  // 蓝
  3: '#3a3a3a',  // 黑
  4: '#f07c19',  // 橙
  5: '#16b1c4',  // 青
  6: '#7a52d6',  // 紫
  7: '#9aa1a8',  // 灰
  8: '#e03131',  // 红
  9: '#7a2222',  // 深红
  10: '#2f9e44'  // 绿
};

const RACE_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 名次（位置）标签
const POSITIONS = ['冠军', '亚军', '第三', '第四', '第五', '第六', '第七', '第八', '第九', '第十'];

// 名次小球
function RaceBall({ value, size = 22 }) {
  return (
    <span
      className="race-ball"
      style={{ background: RACE_COLORS[value], width: size, height: size }}
    >
      {value}
    </span>
  );
}

// 随机生成一组 1~10 的开奖排列
function randomDraw() {
  const arr = [...RACE_NUMS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SubGameSpeedRace() {
  const { balance, updateBalance, quickAmounts, setEditQuickAmountsActive, setActiveSubGame, showToast } = useApp();

  // Draw states
  const [countdown, setCountdown] = useState(8);
  const [isDrawing, setIsDrawing] = useState(false);
  const [issue, setIssue] = useState(20821);
  const [lastResult, setLastResult] = useState([1, 2, 7, 9, 4, 10, 6, 5, 8, 3]);

  // Betting states
  const [activePlay, setActivePlay] = useState('kuaijie'); // 左侧导航，默认快捷
  const [activePosition, setActivePosition] = useState('冠军'); // 顶部名次标签
  const [selectedItem, setSelectedItem] = useState(null); // { name, odds } | null
  const [betPrice, setBetPrice] = useState(10);
  const [manualAmount, setManualAmount] = useState('');

  const performDrawing = () => {
    setIsDrawing(true);
    let rollCount = 0;
    const rollTimer = setInterval(() => {
      setLastResult(randomDraw());
      rollCount++;
      if (rollCount >= 15) {
        clearInterval(rollTimer);
        setLastResult(randomDraw());
        setIssue(prev => prev + 1);
        setCountdown(60);
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
    if (playKey !== 'kuaijie') {
      return; // 其他玩法先不开放
    }
    setActivePlay(playKey);
    setSelectedItem(null);
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
    showToast(`🎉 一分极速赛车【${selectedItem.name}】投注成功！¥${totalCost.toFixed(2)}`);
    setSelectedItem(null);
  };

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast('余额已刷新为 ¥3000.00！');
  };

  // 快捷玩法投注名（带名次前缀）
  const betName = (label) => `${activePosition}-${label}`;

  return (
    <div className="sub-game-page active" id="page-speed-race">
      {/* 顶部应用栏：全屏 / 退出 */}
      <div className="f3new-appbar">
        <button className="f3new-appbar-btn" onClick={() => showToast('全屏模式')} title="全屏">
          <i className="fa-solid fa-expand"></i>
        </button>
        <button className="f3new-appbar-btn" onClick={() => setActiveSubGame(null)} title="退出游戏">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>

      {/* 游戏标题栏 */}
      <div className="m6new-title-bar">
        <div className="m6new-title-left">
          <i className="fa-solid fa-table-cells m6new-title-icon"></i>
          <span>一分极速赛车</span>
        </div>
        <div className="m6new-title-right">
          <button className="m6new-menu-btn" onClick={() => showToast('更多玩法菜单对接中')}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

      {/* 期号 + 上期结果行 */}
      <div className="f3new-issue-bar">
        <div className="f3new-issue-row">
          <span className="f3new-issue-label"><strong>{issue - 1}</strong>期</span>
          <div className="race-result-row">
            {lastResult.map((v, i) => (
              <RaceBall key={i} value={v} />
            ))}
          </div>
          <i className="fa-solid fa-trophy f3new-trophy" style={{ color: '#3b5bdb' }}></i>
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
              {isDrawing ? "开奖中" : `00:00:${countdown.toString().padStart(2, '0')}`}
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
            { id: 'kuaijie', label: '快捷' },
            { id: 'caihaoma', label: '猜号码' },
            { id: 'liangmian', label: '两面盘' },
            { id: 'guanyahe', label: '冠亚和' }
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
        <div className="f3new-content" id="speedrace-content">
          {/* 快捷 panel */}
          {activePlay === 'kuaijie' && (
            <div className="f3new-panel active">
              {/* 顶部名次标签 */}
              <div className="race-pos-tabs">
                {POSITIONS.map(pos => (
                  <div
                    key={pos}
                    className={`race-pos-tab ${activePosition === pos ? 'active' : ''}`}
                    onClick={() => { setActivePosition(pos); setSelectedItem(null); }}
                  >
                    {pos}
                  </div>
                ))}
              </div>

              {/* 1~10 号码投注（两列） */}
              {[0, 2, 4, 6, 8].map(i => (
                <div className="f3new-row-2col" key={i}>
                  {[RACE_NUMS[i], RACE_NUMS[i + 1]].map(num => (
                    <div
                      key={num}
                      className={`f3new-bet-item ${selectedItem?.name === betName(String(num)) ? 'selected' : ''}`}
                      onClick={() => handleBetItemClick(betName(String(num)), '10')}
                    >
                      <span className="race-num-badge" style={{ background: RACE_COLORS[num] }}>{num}</span>
                      <span className="f3new-odds">10</span>
                    </div>
                  ))}
                </div>
              ))}

              {/* 大 / 小 */}
              <div className="f3new-row-2col">
                <div
                  className={`f3new-bet-item blue-item ${selectedItem?.name === betName('大') ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick(betName('大'), '2')}
                >
                  <span className="f3new-dice-label">大</span>
                  <span className="f3new-odds">2</span>
                </div>
                <div
                  className={`f3new-bet-item orange-item ${selectedItem?.name === betName('小') ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick(betName('小'), '2')}
                >
                  <span className="f3new-dice-label">小</span>
                  <span className="f3new-odds">2</span>
                </div>
              </div>

              {/* 单 / 双 */}
              <div className="f3new-row-2col">
                <div
                  className={`f3new-bet-item blue-item ${selectedItem?.name === betName('单') ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick(betName('单'), '2')}
                >
                  <span className="f3new-dice-label">单</span>
                  <span className="f3new-odds">2</span>
                </div>
                <div
                  className={`f3new-bet-item orange-item ${selectedItem?.name === betName('双') ? 'selected' : ''}`}
                  onClick={() => handleBetItemClick(betName('双'), '2')}
                >
                  <span className="f3new-dice-label">双</span>
                  <span className="f3new-odds">2</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部投注控制台 */}
      <div className="f3new-console">
        <div className="f3new-console-info">
          <span>
            余额: <strong>{balance.toFixed(2)}</strong>
            <i
              className="fa-solid fa-rotate"
              onClick={handleRefreshBalance}
              style={{ cursor: 'pointer', marginLeft: '6px' }}
            ></i>
          </span>
          <span>共 <strong>{betCount}</strong>注 &nbsp; 下注金额: <strong>{totalCost.toFixed(0)}</strong></span>
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
          <div className="f3new-quick-btn f3new-edit-btn" onClick={() => setEditQuickAmountsActive(true)}>
            <i className="fa-solid fa-pen"></i>
          </div>
        </div>
        <div className="f3new-console-input-row">
          <input
            type="number"
            className="f3new-input-amount"
            placeholder="输入金额"
            value={manualAmount}
            onChange={handleManualAmountChange}
          />
        </div>
        <div className="f3new-console-btns">
          <button className="f3new-reset-btn" onClick={handleResetBets}>重置</button>
          <button className="f3new-submit-btn" onClick={handleSubmitBets}>投注</button>
        </div>
      </div>
    </div>
  );
}
