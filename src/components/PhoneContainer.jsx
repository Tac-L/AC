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
    setActivePage,
    activeSubGame,
    selectedSkin
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
        <div
          className={`phone-screen ${SHOW_MOCK_PHONE_CHROME ? 'has-mock-chrome' : ''}`}
          id="phone-screen-container"
        >
          
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

          {/* 模拟手机系统列 + 浏览器网址列：只在本机 dev 预览 + 手机宽度（≤500px）下显示并占位 */}
          {SHOW_MOCK_PHONE_CHROME && (
            <>
              <MobileStatusBar time={systemTime} />
              <MobileUrlBar />
            </>
          )}

          {/* Web App Body Inside Phone */}
          <div className={`app-body skin-${selectedSkin} ${immersiveMode ? 'immersive' : ''}`} id="app-root">
            {children}

            {/* Toast Notification Overlays */}
            {toasts.map(toast => (
              <div key={toast.id} className="toast-notification">
                {toast.message}
              </div>
            ))}
          </div>

          {/* 模拟手机浏览器底部工具列 + iOS home indicator（同一个开关，同样只在本机预览） */}
          {SHOW_MOCK_PHONE_CHROME && <MobileBottomChrome />}

          {/* Floating Immersive Widget */}
          {immersiveMode && !activeSubGame && (
            <ImmersiveWidget />
          )}
        </div>
      </div>
    </div>
  );
}

// 模拟真手机浏览器上下的 chrome（合称 mock chrome），由上到下四条：
//   系统列 47px + 网址列 48px + [app 本体] + 底部工具列 44px + home indicator 34px
// 共 173px。每个数字都是 iOS 的实际尺寸：47px = 刘海机 safe-area-inset-top，
// 34px = safe-area-inset-bottom，44px = Safari 底部工具列。
// 补上这四条，PC 上缩成手机宽度时剩下的中间高度才贴近真机
//（iPhone X 812 - 173 = 639px，Safari 实测可用高度约 635px）。
//
// 判定只看「这台是不是真手机」，跟 dev／正式、本机／内网都无关：
//   PC（有滑鼠）→ 挂上，补出真机被浏览器 UI 吃掉的那段空间；
//   真手机 → 不挂，手机自己的系统列／网址列就是真的，再画一套会变成两层。
// 不用 user agent 判断 —— 那串在各家浏览器和模拟器上早就不可靠，
// 改看指标类型：桌机滑鼠是 fine + hover，触控装置是 coarse。
//
// 已知限制：DevTools 的装置模拟（iPhone 12 Pro 那种）会把 pointer／hover／user agent／
// screen 一起伪装成真手机，所以「PC + DevTools 手机模式」会被判成真手机、看不到这四条。
// 那是刻意取舍 —— 从 JS 分不出它和真手机（试过 outerWidth／screen，都被覆盖或不可靠）。
// 要在 DevTools 手机模式下看，网址加 ?mock=1；要在真手机上关掉，加 ?mock=0。
// PC 上直接把浏览器视窗拖窄到 ≤500px 则不受影响，照样看得到。
//
// 显示条件还要再叠一层：index.css 里的 Responsive Real Mobile Viewport Override
// （≤500px）才会把它们从 display:none 打开。
const SHOW_MOCK_PHONE_CHROME = (() => {
  const flag = new URLSearchParams(window.location.search).get('mock');
  if (flag === '1') return true;
  if (flag === '0') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
})();

// 模拟手机系统列：左边时间（沿用 context 里每 30 秒更新的 systemTime），右边讯号/wifi/电量
function MobileStatusBar({ time }) {
  return (
    <div className="mobile-status-bar" aria-hidden="true">
      <span className="mobile-status-time">{time}</span>
      <span className="mobile-status-icons">
        <i className="fa-solid fa-signal"></i>
        <i className="fa-solid fa-wifi"></i>
        <i className="fa-solid fa-battery-full"></i>
      </span>
    </div>
  );
}

// 本站是单页 SPA，网址不会变，模块载入时算一次就够（不放在 render 里读 location）
const BROWSER_URL_TEXT = (() => {
  const { host, pathname } = window.location;
  return pathname === '/' ? host : `${host}${pathname}`;
})();

function MobileUrlBar() {
  return (
    <div className="mobile-url-bar" aria-hidden="true">
      <div className="mobile-url-pill">
        <i className="fa-solid fa-lock mobile-url-lock"></i>
        <span className="mobile-url-text">{BROWSER_URL_TEXT}</span>
      </div>
      <i className="fa-solid fa-rotate-right mobile-url-reload"></i>
    </div>
  );
}

// 模拟浏览器底部工具列 + iOS home indicator（那条横线）。
// 真机上这两段一样吃掉高度，补上后本机预览剩下的中间空间才跟真机对得上。
function MobileBottomChrome() {
  return (
    <div className="mobile-bottom-chrome" aria-hidden="true">
      <div className="mobile-bottom-bar">
        <i className="fa-solid fa-chevron-left"></i>
        <i className="fa-solid fa-chevron-right is-dim"></i>
        <i className="fa-solid fa-arrow-up-from-bracket"></i>
        <i className="fa-regular fa-bookmark"></i>
        <i className="fa-regular fa-clone"></i>
      </div>
      <div className="mobile-home-indicator">
        <span className="mobile-home-indicator-pill"></span>
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

      if (newX < 0) newX = 0;
      if (newX > 325) newX = 325;
      if (newY < 0) newY = 0;
      if (newY > 760) newY = 760;

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
        <div className="floating-content-wrapper">
          <svg className="floating-spade-svg" viewBox="0 0 512 512">
            <path 
              d="M 256, 95 C 256, 95, 140, 195, 140, 275 C 140, 355, 205, 375, 256, 325 C 307, 375, 372, 355, 372, 275 C 372, 195, 256, 95, 256, 95 Z M 256, 325 C 256, 325, 225, 365, 195, 395 L 317, 395 C 287, 365, 256, 325, 256, 325 Z" 
              fill="#0e081c" 
            />
          </svg>
          <span className="floating-text">{getPageName(activePage)}</span>
        </div>
      </div>

      {/* Vertical Portal Drawer Menu */}
      {drawerOpen && (
        <div 
          className="immersive-portal-drawer"
          style={pos.y > 380 ? { bottom: '58px', top: 'auto' } : { top: '58px', bottom: 'auto' }}
        >
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
