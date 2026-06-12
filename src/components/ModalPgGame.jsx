import React from 'react';
import { useApp } from '../context/AppContext';

export default function ModalPgGame() {
  const { pgGameActive, pgGameData, closePgGame, showToast } = useApp();

  if (!pgGameActive) return null;

  const game = pgGameData || { name: '赏金大对决', img: 'assets/drawing.png' };

  const handleStart = () => {
    showToast(`提示：【${game.name}】正在对接中，敬请期待！`);
  };

  return (
    <div className="pg-game-overlay active" id="pg-game-modal">
      {/* Top bar */}
      <div className="pg-game-topbar">
        <button className="pg-game-icon-btn" onClick={() => showToast('提示：【全屏】功能正在对接中！')}>
          <i className="fa-solid fa-expand"></i>
        </button>
        <button className="pg-game-icon-btn" onClick={closePgGame}>
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>

      {/* Game splash */}
      <div className="pg-game-body">
        <div className="pg-game-splash">
          <img src={game.img} alt={game.name} className="pg-game-splash-img" />
          <div className="pg-game-splash-overlay">
            <div className="pg-game-splash-title">WILD BOUNTY</div>
            <div className="pg-game-splash-name">{game.name}</div>
            <p className="pg-game-splash-desc">
              特色金框符号和高达 x1024 奖金倍数，高额赏金轻松拿下！
            </p>
            <button className="pg-game-start-btn" onClick={handleStart}>开始</button>
          </div>
        </div>

        {/* Footer credentials */}
        <div className="pg-game-footer">
          <div className="pg-game-footer-logo">PG</div>
          <div className="pg-game-footer-cols">
            <div className="pg-game-footer-col">
              <span className="pg-game-footer-head">权威机构</span>
              <span>全球最高规格牌照机构颁发牌照</span>
            </div>
            <div className="pg-game-footer-col">
              <span className="pg-game-footer-head">公平认证</span>
              <span>由最严苛的 RTP 认证机构颁发</span>
            </div>
          </div>
          <span className="pg-game-footer-copy">PGSOFT.COM 2026 © PG SOFT® 版权所有</span>
        </div>
      </div>
    </div>
  );
}
