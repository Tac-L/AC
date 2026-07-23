import React from 'react';
import { useApp } from '../context/AppContext';

// Inline line-style icons (stroke uses currentColor so active/inactive color
// is driven purely by the .nav-btn text color). Matches public/bottom-nav.html.
const svgProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const NAV_ICONS = {
  'page-dramas': (
    <svg {...svgProps}>
      <rect x="6.5" y="3" width="11" height="18" rx="2.5" />
      <path d="M10.5 9.5 L14.5 12 L10.5 14.5 Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  'page-videos': (
    <svg {...svgProps}>
      <rect x="3" y="5.5" width="18" height="13" rx="3" />
      <path d="M10 9.5 L14.5 12 L10 14.5 Z" fill="currentColor" stroke="none" />
    </svg>
  ),
  'page-chats': (
    <svg {...svgProps}>
      <rect x="9" y="3" width="6" height="10.5" rx="3" />
      <path d="M6.5 11 a5.5 5.5 0 0 0 11 0" />
      <path d="M12 16.5 V20" />
      <path d="M9 20 H15" />
    </svg>
  ),
  'page-sports': (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.6 12 H20.4" />
      <path d="M12 3.5 V20.5" />
      <path d="M6 6.2 C9 9 9 15 6 17.8" />
      <path d="M18 6.2 C15 9 15 15 18 17.8" />
    </svg>
  ),
  'page-games': (
    <svg {...svgProps}>
      <rect x="2.5" y="7.5" width="19" height="9.5" rx="4.75" />
      <path d="M7 11 V14" />
      <path d="M5.5 12.5 H8.5" />
      <circle cx="15.5" cy="11.5" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="17.8" cy="13.6" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  ),
  'page-profile': (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 19.5 a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),
};

export default function BottomNav() {
  const { activePage, setActivePage, setActiveSubGame, isLoggedIn } = useApp();

  const handleNav = (pageId) => {
    // When logged out, the 我的 tab routes to the phone login page
    if (pageId === 'page-profile' && !isLoggedIn) {
      setActivePage('page-login');
      setActiveSubGame(null);
      return;
    }
    setActivePage(pageId);
    setActiveSubGame(null); // Exit sub-games if switching tabs
  };

  const navItems = [
    { id: 'page-dramas', label: '短剧' },
    { id: 'page-videos', label: '视频' },
    { id: 'page-chats', label: '直播' },
    { id: 'page-sports', label: '体育' },
    { id: 'page-games', label: '游戏' },
    { id: 'page-profile', label: '我的' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map(item => {
        const isActive = activePage === item.id;
        return (
          <div
            key={item.id}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => handleNav(item.id)}
          >
            {NAV_ICONS[item.id]}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
