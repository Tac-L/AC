import React from 'react';
import { useApp } from '../context/AppContext';

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

  if (!betDetailsModalActive) return null;

  // Set game title
  let gameTitle = '一分快三 投注详情';
  if (currentActiveGame === 'mark_six') {
    gameTitle = '一分六合彩 投注详情';
  } else if (currentActiveGame === 'fast_three_embedded') {
    gameTitle = '一分快三(视频) 投注详情';
  } else if (currentActiveGame === 'speed_race') {
    gameTitle = '一分极速赛车 投注详情';
  }

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

    let gameName = '一分快三';
    if (currentActiveGame === 'mark_six') {
      gameName = '一分六合彩';
    } else if (currentActiveGame === 'fast_three_embedded') {
      gameName = '一分快三(视频)';
    } else if (currentActiveGame === 'speed_race') {
      gameName = '一分极速赛车';
    }

    showToast(`🎉 ${gameName} 投注成功！共 ${stagedItems.length} 注，总投注额 ¥${totalCost.toFixed(2)}`);

    // Reset staged items and close
    setStagedItems([]);
    closeBetDetailsModal();
  };

  return (
    <div className={`bet-details-modal-overlay ${betDetailsModalActive ? 'active' : ''}`} id="modal-bet-details" style={{ display: 'flex' }}>
      <div className="bet-details-modal-content">
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
