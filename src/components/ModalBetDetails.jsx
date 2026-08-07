import { useLayoutEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

// 各投注入口对应的游戏名。抬头的「游戏名 投注详情」和投注成功的 toast 都取这一份 ——
// 原本两边各写一串 if/else，久了就会漂：fast_three_embedded 那个「(视频)」后缀
// 只是同一个游戏从视频页进来的入口，玩家看到的还是同一个游戏，不该出现在名字里。
const GAME_NAMES = {
  mark_six: '一分澳门六合彩',
  fast_three_embedded: '一分快三',
  speed_race: '一分极速赛车',
  fish_crab: '一分鱼虾蟹',
  baccarat: '百家乐A1',
  animal_sports: '一分动物运动会',
  ffc: '一分分分彩',
  lucky28: '一分幸运28',
  sports_live: '体育赛事'
};

const gameNameOf = (key) => GAME_NAMES[key] || '一分快三';

export default function ModalBetDetails() {
  const {
    balance,
    updateBalance,
    stagedItems,
    setStagedItems,
    currentMultiplier,
    setCurrentMultiplier,
    currentActiveGame,
    betDetailsModalActive,
    closeBetDetailsModal,
    multipliers,
    setEditMultipliersActive,
    showToast
  } = useApp();

  // 高度对齐投注面板。
  // 原本这个弹窗是 height: auto + max-height: 85%，高度跟着注单数量长：一注约 280px、
  // 八注就顶到 690px，而投注面板只有 400 上下 —— 从「提交下注」跳到「确认投注」，
  // 同一个动作的前后两步版面高度差一大截，看起来像换了个界面。
  // 改成开窗当下量一次投注面板的高度贴上来，注单列表在里面滚（本来就有 overflow-y）。
  //
  // 量的是 DOM 而不是从 context 拿：面板高度是 ModalVideoPlayer 里那支 layoutBetOverlay
  // 依各游戏点位区实际布局量完写进 inline style 的，没有第二个地方持有这个数字。
  // 量到就直接写进 DOM，不绕一轮 state：这本来就是「把量到的版面尺寸同步给 DOM」，
  // 走 setState 只是多触发一次渲染。用 useLayoutEffect 是要在 paint 前写好，
  // 否则会先画一帧自适应高度再跳到面板高度。
  const contentRef = useRef(null);
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return; // 关闭时整个组件 return null，量不到也不用量
    const panel = document.querySelector('.vp-play-sheet, .live-bet-sheet, .drama-betting-sheet');
    const h = panel ? panel.getBoundingClientRect().height : 0;
    if (h <= 0) return; // 找不到投注面板：留着样式表的 auto + max-height: 85%
    el.style.height = `${h}px`;
    // max-height 一起解除 —— 面板本身已被 layoutBetOverlay 夹在 .app-body 高度以内，
    // 不会超出手机可视区，留着 85% 反而会让两边对不齐。
    el.style.maxHeight = 'none';
  }, [betDetailsModalActive]);

  if (!betDetailsModalActive) return null;

  const gameTitle = `${gameNameOf(currentActiveGame)} 投注详情`;

  // Handle amount change for specific staged item.
  // The input shows baseVal * currentMultiplier, so divide back to store the 1x base.
  const handleAmountChange = (index, value) => {
    const nextItems = [...stagedItems];
    const displayed = parseFloat(value) || 0;
    nextItems[index].baseVal = currentMultiplier ? displayed / currentMultiplier : displayed;
    setStagedItems(nextItems);
  };

  // Handle delete staged item
  const handleDeleteItem = (index) => {
    const nextItems = stagedItems.filter((_, idx) => idx !== index);
    setStagedItems(nextItems);
  };

  // Calculate summary
  const count = stagedItems.length;
  const sumBase = stagedItems.reduce((acc, item) => acc + (item.baseVal || 0), 0);
  const totalCost = sumBase * currentMultiplier;

  const handleRefreshBalance = () => {
    updateBalance(3000, false);
    showToast("余额已刷新为 ¥3000.00！");
  };

  const handleConfirmBet = () => {
    if (stagedItems.length === 0) {
      alert("当前没有可投注的项目！");
      return;
    }

    if (totalCost > balance) {
      alert("投注失败：虚拟账户余额不足！请先充值。");
      return;
    }

    // Deduct balance
    updateBalance(-totalCost);

    showToast(`🎉 ${gameNameOf(currentActiveGame)} 投注成功！共 ${stagedItems.length} 注，总投注额 ¥${totalCost.toFixed(2)}`);

    // Reset staged items and close
    setStagedItems([]);
    closeBetDetailsModal();
  };

  return (
    <div className={`bet-details-modal-overlay ${betDetailsModalActive ? 'active' : ''}`} id="modal-bet-details" style={{ display: 'flex' }}>
      <div className="bet-details-modal-content" ref={contentRef}>
        <div className="modal-header">
          <span className="modal-title-text" id="bet-details-game-title">{gameTitle}</span>
          <button className="modal-close-x" id="btn-close-bet-details" onClick={closeBetDetailsModal}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        {/* Scrollable Bet Items List */}
        <div className="bet-items-list" id="bet-details-items-container">
          {stagedItems.map((item, index) => (
            <div key={index} className="bet-item-card">
              <div className="item-info">
                <span className="item-category">{item.category || '投注项'}</span>
                <span className="item-name">{item.name}</span>
              </div>
              <div className="item-right">
                <span className="item-odds-lbl">赔率 <span className="item-odds-val">{item.odds}</span></span>
                <input
                  type="number"
                  className="item-amount-input"
                  value={item.baseVal * currentMultiplier}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                />
                <i 
                  className="fa-solid fa-trash-can item-delete-icon" 
                  onClick={() => handleDeleteItem(index)}
                ></i>
              </div>
            </div>
          ))}
          {stagedItems.length === 0 && (
            <div style={{ color: '#aaa', textAlign: 'center', padding: '20px', fontSize: '0.75rem' }}>
              无投注项目
            </div>
          )}
        </div>
        
        {/* Multipliers Row */}
        <div className="multiplier-bar-container">
          <div className="multiplier-options-row" id="bet-details-multipliers">
            {multipliers.map(mult => (
              <div 
                key={mult}
                className={`multiplier-btn ${currentMultiplier === mult ? 'active' : ''}`}
                onClick={() => setCurrentMultiplier(mult)}
              >
                {mult}倍
              </div>
            ))}
            <div 
              className="multiplier-btn edit-mult-btn" 
              id="btn-edit-multipliers"
              onClick={() => setEditMultipliersActive(true)}
            >
              <i className="fa-solid fa-pen"></i>
            </div>
          </div>
        </div>
        
        {/* Footer Info: Balance and total cost */}
        <div className="modal-info-footer">
          <div className="footer-balance-box">
            余额: <span id="details-modal-balance-val">{balance.toFixed(2)}</span>{' '}
            <i 
              className="fa-solid fa-rotate console-refresh-icon" 
              id="btn-refresh-details-balance"
              onClick={handleRefreshBalance}
            ></i>
          </div>
          <div className="footer-summary-box">
            <span id="details-modal-count-val" className="txt-red">{count}</span> 单，共{' '}
            <span id="details-modal-cost-val" className="txt-red">{totalCost.toFixed(2)}</span> 元
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="modal-actions-row">
          <button className="modal-action-btn cancel-btn" id="btn-cancel-bet-details" onClick={closeBetDetailsModal}>取消</button>
          <button className="modal-action-btn confirm-btn" id="btn-confirm-bet-details" onClick={handleConfirmBet}>确认投注</button>
        </div>
      </div>
    </div>
  );
}
