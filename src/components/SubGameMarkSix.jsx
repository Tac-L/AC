import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// 标准六合彩号码颜色对照
const RED_NUMS = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
const BLUE_NUMS = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

const getBallColor = (num) => {
  if (RED_NUMS.includes(num)) return 'red';
  if (BLUE_NUMS.includes(num)) return 'blue';
  return 'green';
};

export default function SubGameMarkSix() {
  const { balance, updateBalance, quickAmounts, openBetDetailsModal, setEditQuickAmountsActive, setActiveSubGame, showToast } = useApp();

  // 开奖状态
  const [issue, setIssue] = useState(20062);
  const [countdown, setCountdown] = useState(263); // 04:23
  const [isDrawing, setIsDrawing] = useState(false);
  // 上期结果（含特别号）：默认与设计图一致
  const [lastResult, setLastResult] = useState([
    { n: 2, z: '蛇' }, { n: 49, z: '马' }, { n: 16, z: '兔' },
    { n: 5, z: '虎' }, { n: 40, z: '兔' }, { n: 21, z: '狗' },
    { n: 36, z: '羊' } // 特别号
  ]);

  // 投注状态
  const [activePlay, setActivePlay] = useState('tema'); // 左侧导航：默认特码
  const [betTab, setBetTab] = useState('A');             // 特码A / 特码B
  const [quickOpen, setQuickOpen] = useState(true);      // 快捷投注 折叠
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [betAmount, setBetAmount] = useState(quickAmounts[0] || 10);
  const [manualAmount, setManualAmount] = useState('');

  const performDrawing = () => {
    setIsDrawing(true);
    setTimeout(() => {
      const drawn = [];
      while (drawn.length < 7) {
        const num = Math.floor(Math.random() * 49) + 1;
        if (!drawn.includes(num)) drawn.push(num);
      }
      setLastResult(drawn.map(n => ({ n, z: ZODIACS[n % 12] })));
      setIssue(prev => prev + 1);
      setCountdown(263);
      setIsDrawing(false);
    }, 2000);
  };

  // 倒计时
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else {
      setTimeout(() => performDrawing(), 0);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `00:${m}:${s}`;
  };

  // 左侧导航：特码以外暂不响应（与一分快三一致）
  const handleSidebarClick = (id) => {
    if (id !== 'tema') return;
    setActivePlay(id);
  };

  const handleNumClick = (name) => {
    const next = new Set(selectedKeys);
    next.has(name) ? next.delete(name) : next.add(name);
    setSelectedKeys(next);
  };

  const handleQuickAmountClick = (val) => {
    setBetAmount(val);
    setManualAmount('');
  };

  const activeQuickAmount = manualAmount === '' ? betAmount : 0;
  const currentBetPrice = manualAmount !== '' ? parseFloat(manualAmount) || 0 : betAmount;
  const count = selectedKeys.size;
  const totalCost = count * currentBetPrice;

  const handleReset = () => {
    setSelectedKeys(new Set());
    setManualAmount('');
    setBetAmount(quickAmounts[0] || 10);
  };

  const handleSubmit = () => {
    if (count === 0) {
      showToast('请先选择投注号码！');
      return;
    }
    if (currentBetPrice <= 0) {
      showToast('请输入有效金额！');
      return;
    }
    const items = Array.from(selectedKeys).map(name => ({
      name,
      odds: '48.0',
      baseVal: currentBetPrice,
      category: `特码${betTab}`
    }));
    openBetDetailsModal('mark_six', items);
  };

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast('余额已刷新为 ¥3000.00！');
  };

  const sidebarTabs = [
    { id: 'changlong', label: '长龙' },
    { id: 'tema', label: '特码' },
    { id: 'zhengma', label: '正码' },
    { id: 'zhengte', label: '正特' },
    { id: 'texiao', label: '特肖' },
    { id: 'zhengxiao', label: '正肖' },
    { id: 'yixiao', label: '一肖' },
    { id: 'yixiaobuzhong', label: '一肖不中' }
  ];

  const numbers = Array.from({ length: 49 }, (_, i) => i + 1);

  return (
    <div className="sub-game-page active" id="page-mark-six">
      {/* 顶部应用栏：全屏 / 退出（与一分快三一致） */}
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
          <span>十分澳门六合彩</span>
        </div>
        <div className="m6new-title-right">
          <div className="m6new-pan-select" onClick={() => showToast('盘口切换功能对接中')}>
            A盘 <i className="fa-solid fa-chevron-down"></i>
          </div>
          <button className="m6new-menu-btn" onClick={() => showToast('更多玩法菜单对接中')}>
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

      {/* 开奖结果行 */}
      <div className="m6new-result-bar">
        <div className="m6new-result-row">
          <span className="m6new-issue">{issue - 1}期</span>
          <div className="m6new-balls">
            {lastResult.slice(0, 6).map((b, i) => (
              <div key={i} className="m6new-ball-wrap">
                <div className={`m6new-ball ball-${getBallColor(b.n)}`}>{b.n.toString().padStart(2, '0')}</div>
                <span className="m6new-ball-zodiac">{b.z}</span>
              </div>
            ))}
            <span className="m6new-plus">+</span>
            <div className="m6new-ball-wrap">
              <div className={`m6new-ball ball-${getBallColor(lastResult[6].n)}`}>{lastResult[6].n.toString().padStart(2, '0')}</div>
              <span className="m6new-ball-zodiac">{lastResult[6].z}</span>
            </div>
          </div>
          <i className="fa-solid fa-trophy m6new-trophy"></i>
        </div>
        <div className="m6new-countdown-row">
          <span className="m6new-next-issue">{issue}期</span>
          <span className="m6new-cd-label">封盘 <strong className="m6new-cd-red">{isDrawing ? '正在开奖' : formatTime(countdown)}</strong></span>
          <span className="m6new-cd-label">开奖 <strong className="m6new-cd-green">{isDrawing ? '正在开奖' : formatTime(countdown)}</strong></span>
          <i className="fa-solid fa-circle-play m6new-play-icon" onClick={performDrawing}></i>
        </div>
      </div>

      {/* 主体：左侧导航 + 右侧内容 */}
      <div className="m6new-body">
        <div className="m6new-sidebar">
          {sidebarTabs.map(tab => (
            <div
              key={tab.id}
              className={`m6new-nav-item ${activePlay === tab.id ? 'active' : ''}`}
              onClick={() => handleSidebarClick(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div className="m6new-content">
          {/* 特码A / 特码B */}
          <div className="m6new-sub-tabs">
            <div className={`m6new-sub-tab ${betTab === 'A' ? 'active' : ''}`} onClick={() => setBetTab('A')}>特码A</div>
            <div className={`m6new-sub-tab ${betTab === 'B' ? 'active' : ''}`} onClick={() => setBetTab('B')}>特码B</div>
          </div>

          {/* 快捷投注 折叠头 */}
          <div className="m6new-collapse-header" onClick={() => setQuickOpen(prev => !prev)}>
            <span>快捷投注</span>
            <i className={`fa-solid ${quickOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
          </div>

          {quickOpen && (
            <>
              {/* 数字 下拉头 */}
              <div className="m6new-dropdown-header" onClick={() => showToast('显示方式切换对接中')}>
                <span>数字</span>
                <i className="fa-solid fa-chevron-down"></i>
              </div>

              {/* 号码网格 */}
              <div className="m6new-num-grid">
                {numbers.map(n => {
                  const name = n.toString().padStart(2, '0');
                  const selected = selectedKeys.has(name);
                  return (
                    <div
                      key={n}
                      className={`m6new-num-card ${selected ? 'selected' : ''}`}
                      onClick={() => handleNumClick(name)}
                    >
                      <span className={`m6new-num-ball ball-${getBallColor(n)}`}>{name}</span>
                      <span className="m6new-num-odds">48</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 底部投注控制台 */}
      <div className="m6new-console">
        <div className="m6new-console-info">
          <span>
            余额：<strong>{balance.toFixed(2)}</strong>
            <i className="fa-solid fa-rotate" onClick={handleRefreshBalance} style={{ cursor: 'pointer', marginLeft: '6px' }}></i>
          </span>
          <span>共 <strong className="m6new-orange">{count}</strong> 注 &nbsp; 下注金额: <strong>{totalCost.toFixed(0)}</strong></span>
        </div>
        <div className="m6new-console-amounts">
          {quickAmounts.map(val => (
            <div
              key={val}
              className={`m6new-quick-btn ${activeQuickAmount === val ? 'active' : ''}`}
              onClick={() => handleQuickAmountClick(val)}
            >
              {val}
            </div>
          ))}
          <div className="m6new-quick-btn m6new-edit-btn" onClick={() => setEditQuickAmountsActive(true)}>
            <i className="fa-solid fa-pen"></i>
          </div>
        </div>
        <div className="m6new-console-btns">
          <input
            type="number"
            className="m6new-input-amount"
            placeholder="输入金额"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
          />
          <button className="m6new-reset-btn" onClick={handleReset}>重置</button>
          <button className="m6new-submit-btn" onClick={handleSubmit}>投注</button>
        </div>
      </div>
    </div>
  );
}
