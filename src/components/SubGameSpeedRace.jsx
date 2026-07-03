import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SubGameSpeedRace() {
  const { setActiveSubGame, selectedSkin } = useApp();
  const [iframeKey, setIframeKey] = useState(0);

  // Dynamic nested URL carrying the selected skin parameter
  const targetUrl = `https://tac-l.github.io/F-2/?embed=1&skin=${selectedSkin}`;

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div 
      className="sub-game-page active" 
      id="page-speed-race"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0b0f19',
        overflow: 'hidden'
      }}
    >
      {/* Simulated Webview Browser Header */}
      <div className="f3new-webview-header">
        <div className="f3new-webview-controls-left">
          <button className="f3new-webview-btn" onClick={() => setActiveSubGame(null)} title="退出游戏">
            <i className="fa-solid fa-chevron-left" style={{ fontSize: '1rem' }}></i>
          </button>
        </div>

        <div style={{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: '600' }}>
          一分极速赛车
        </div>

        <div className="f3new-webview-controls-right">
          <button className="f3new-webview-btn" onClick={() => setActiveSubGame(null)} title="关闭">
            <i className="fa-solid fa-xmark" style={{ fontSize: '1.1rem' }}></i>
          </button>
        </div>
      </div>

      {/* Embedded nested page iframe */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          key={iframeKey}
          src={targetUrl}
          title="一分极速赛车"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#0b0f19'
          }}
          allow="autoplay; clipboard-write; encrypted-media"
        />
      </div>
    </div>
  );
}
