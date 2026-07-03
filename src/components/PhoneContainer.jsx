import React from 'react';
import { useApp } from '../context/AppContext';

export default function PhoneContainer({ children }) {
  const { 
    phoneSkin, 
    systemTime, 
    toasts, 
    showToast, 
    immersiveMode, 
    setImmersiveMode, 
    activePage, 
    setActivePage 
  } = useApp();

  const handleHardwareBtn = (btnName) => {
    showToast(`系统提示：[${btnName}] 功能已按下`);
  };

  return (
    <div className="phone-wrapper">
      <div className={`phone ${phoneSkin}`} id="mobile-device">
        {/* Phone Speaker and Camera (Notch/Dynamic Island) */}
        <div className="phone-notch">
          <div className="camera"></div>
          <div className="speaker"></div>
        </div>
        
        {/* Side Buttons */}
        <div className="phone-btn phone-btn-vol-up" onClick={() => handleHardwareBtn('音量 +')}></div>
        <div className="phone-btn phone-btn-vol-down" onClick={() => handleHardwareBtn('音量 -')}></div>
        <div className="phone-btn phone-btn-power" onClick={() => handleHardwareBtn('电源键')}></div>
        
        {/* Screen Content Container */}
        <div className="phone-screen" id="phone-screen-container">
          
          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-left">
              <span className="carrier"><i className="fa-solid fa-wifi"></i> 无SIM卡</span>
            </div>
            <div className="status-time" id="status-time">{systemTime}</div>
            <div className="status-right">
              <i className="fa-solid fa-lock"></i>
              <i className="fa-solid fa-battery-full"></i>
            </div>
          </div>
          
          {/* Web App Body Inside Phone */}
          <div className={`app-body ${immersiveMode ? 'immersive' : ''}`} id="app-root">
            {children}
          </div>

          {/* Floating Immersive Widget */}
          {immersiveMode && (
            <ImmersiveWidget />
          )}

          {/* Toast Notification Overlays */}
          {toasts.map(toast => (
            <div key={toast.id} className="toast-notification" style={{
              position: 'absolute',
              bottom: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              color: '#fff',
              border: '1px solid #d4af37', // Gold color variable fallback
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              zIndex: '9999',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              width: '80%',
              textAlign: 'center',
              wordBreak: 'break-all'
            }}>
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImmersiveWidget() {
  const { activePage, setActivePage, setImmersiveMode } = useApp();
  const [pos, setPos] = React.useState({ x: 280, y: 70 });
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const dragStart = React.useRef({ x: 0, y: 0 });
  const posStart = React.useRef({ x: 0, y: 0 });

  const getPageName = (pageId) => {
    switch (pageId) {
      case 'page-dramas': return '短剧';
      case 'page-videos': return '视频';
      case 'page-chats': return '直播';
      case 'page-sports': return '体育';
      case 'page-games': return '游戏';
      case 'page-profile': return '我的';
      default: return 'AC';
    }
  };

  const handleStart = (e) => {
    if (e.type === 'touchstart') {
      e.stopPropagation();
    }
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    dragStart.current = { x: clientX, y: clientY };
    posStart.current = { x: pos.x, y: pos.y };
    setIsDragging(false);

    const handleMouseMove = (moveEvent) => {
      const curX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0].clientX);
      const curY = moveEvent.clientY || (moveEvent.touches && moveEvent.touches[0].clientY);
      const dx = curX - clientX;
      const dy = curY - clientY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        setIsDragging(true);
      }

      let newX = posStart.current.x + dx;
      let newY = posStart.current.y + dy;

      if (newX < 10) newX = 10;
      if (newX > 290) newX = 290;
      if (newY < 40) newY = 40;
      if (newY > 600) newY = 600;

      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      dragStart.current = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
  };

  const handleWidgetClick = (e) => {
    e.stopPropagation();
    if (isDragging) return;
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigate = (pageId, e) => {
    e.stopPropagation();
    setActivePage(pageId);
    setDrawerOpen(false);
  };

  const handleRestore = (e) => {
    e.stopPropagation();
    setImmersiveMode(false);
    setDrawerOpen(false);
  };

  const portals = [
    { id: 'page-dramas', label: '短剧' },
    { id: 'page-videos', label: '视频' },
    { id: 'page-chats', label: '直播' },
    { id: 'page-sports', label: '体育' },
    { id: 'page-games', label: '游戏' },
    { id: 'page-profile', label: '我的' }
  ];

  return (
    <div 
      className="immersive-widget-wrapper"
      style={{
        position: 'absolute',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 99999,
        userSelect: 'none'
      }}
    >
      {/* Floating Circular Button */}
      <div 
        className={`immersive-floating-button ${drawerOpen ? 'open' : ''}`}
        onTouchStart={handleStart}
        onMouseDown={handleStart}
        onClick={handleWidgetClick}
      >
        <span className="floating-text">{getPageName(activePage)}</span>
      </div>

      {/* Vertical Portal Drawer Menu */}
      {drawerOpen && (
        <div className="immersive-portal-drawer">
          <div className="drawer-portals-list">
            {portals.map(p => {
              const isActive = activePage === p.id;
              return (
                <div 
                  key={p.id}
                  className={`drawer-portal-circle ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleNavigate(p.id, e)}
                >
                  {p.label}
                </div>
              );
            })}
            <div className="drawer-restore-btn" onClick={handleRestore}>
              还原
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
