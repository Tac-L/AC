import React from 'react';
import { useApp } from '../context/AppContext';

// Bottom horizontal scroll of related PG games
const relatedGames = [
  { id: 'mahjong', name: '麻将胡了', img: 'assets/game_mahjong.png' },
  { id: 'mahjong2', name: '麻将胡了2', img: 'assets/gold_dragon_bg.png' },
  { id: 'bounty', name: '赏金大对决', img: 'assets/drawing.png' },
  { id: 'queen', name: '夜醉佳人', img: 'assets/origami.png' },
  { id: 'undead', name: '赏金女王', img: 'assets/lego.png' }
];

export default function ModalGameDetail() {
  const {
    gameDetailModalActive,
    gameDetailData,
    closeGameDetailModal,
    openPgGame,
    showToast
  } = useApp();

  if (!gameDetailModalActive) return null;

  const current = gameDetailData || { name: '赏金大对决', img: 'assets/drawing.png' };

  return (
    <div className="game-detail-overlay active" id="game-detail-modal">
      <button className="game-detail-close" onClick={closeGameDetailModal}>
        <i className="fa-solid fa-xmark"></i>
      </button>

      <div className="game-detail-machine">
        <div className="game-detail-title">游戏详情</div>

        {/* Balance + GAMES logo row */}
        <div className="gd-balance-row">
          <div className="gd-balance-left">
            <img src="assets/black_panther_logo.png" className="gd-balance-avatar" alt="头像" />
            <div className="gd-balance-info">
              <span className="gd-balance-label">我的余额</span>
              <strong className="gd-balance-value">0.00</strong>
            </div>
          </div>
          <div className="gd-games-logo">★GAMES★</div>
        </div>

        {/* Jackpot */}
        <div className="gd-jackpot-box">
          <span className="gd-jackpot-label">累计奖池</span>
          <strong className="gd-jackpot-value">266,149.00</strong>
        </div>

        {/* Current game */}
        <div className="gd-current-game">
          <div className="gd-current-thumb">
            <img src={current.img} alt={current.name} />
            <span className="gd-current-tag">PG</span>
          </div>
          <div className="gd-current-info">
            <span className="gd-current-divider">— 当前游戏 —</span>
            <span className="gd-current-platform">PG电子</span>
            <span className="gd-current-name">{current.name}</span>
          </div>
        </div>

        {/* Enter game button */}
        <button className="gd-enter-btn" onClick={() => openPgGame(current)}>
          <i className="fa-solid fa-spade"></i> 进入游戏 <i className="fa-solid fa-club"></i>
        </button>
      </div>

      {/* Bottom related games scroll */}
      <div className="gd-related-scroll">
        {relatedGames.map(g => (
          <div
            key={g.id}
            className="gd-related-card"
            onClick={() => showToast(`提示：【${g.name}】正在对接中，敬请期待！`)}
          >
            <div className="gd-related-thumb">
              <img src={g.img} alt={g.name} />
              <span className="gd-related-tag">PG</span>
            </div>
            <span className="gd-related-name">{g.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
