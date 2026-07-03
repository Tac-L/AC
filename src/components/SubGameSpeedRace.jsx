import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function SubGameSpeedRace() {
  const { setActiveSubGame, selectedSkin, activeRoomId, activeGameName } = useApp();
  const [iframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fallback defaults if opened directly without setting context values
  const roomId = activeRoomId || '1062010';
  const gameName = activeGameName || '一分极速赛车';

  // Dynamic nested URL carrying the selected skin and roomid parameters
  const targetUrl = `https://tac-l.github.io/F-2/?embed=1&skin=${selectedSkin}&roomid=${roomId}`;

  return (
    <div 
      className="sub-game-page active" 
      id="page-speed-race"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0b0f19',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 1. Header Bar (嵌套框) - Shown only when not in fullscreen mode */}
      {!isFullscreen && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            padding: '0 16px',
            height: '46px',
            borderBottom: '1px solid #e2e8f0',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
        >
          {/* Left: Exit/Back button (matching the right button icon in user reference image) */}
          <button 
            onClick={() => setActiveSubGame(null)} 
            title="返回"
            style={{
              background: 'none',
              border: 'none',
              color: '#334155',
              fontSize: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>

          {/* Middle: Empty (嵌套框不要顯示文字) */}
          <div></div>

          {/* Right: Fullscreen button (matching the left button icon in user reference image) */}
          <button 
            onClick={() => setIsFullscreen(true)} 
            title="全屏"
            style={{
              background: 'none',
              border: 'none',
              color: '#334155',
              fontSize: '1.15rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            <i className="fa-solid fa-expand"></i>
          </button>
        </div>
      )}

      {/* 2. Floating minimize button - Shown only in fullscreen mode */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          title="恢复窗口"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.05rem',
            cursor: 'pointer',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)'
          }}
        >
          <i className="fa-solid fa-compress"></i>
        </button>
      )}

      {/* 3. Embedded game iframe */}
      <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <iframe
          key={iframeKey}
          src={targetUrl}
          title={gameName}
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
