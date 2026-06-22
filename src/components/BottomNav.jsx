import React from 'react';
import { useApp } from '../context/AppContext';

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

  // `img` is the base name used for the icon pair: 默认-{img}.png / 点击-{img}.png
  const navItems = [
    { id: 'page-dramas', img: '短剧', label: '短剧' },
    { id: 'page-videos', img: '视频', label: '视频' },
    { id: 'page-chats', img: '直播', label: '直播' },
    { id: 'page-sports', img: '体育', label: '体育' },
    { id: 'page-games', img: '游戏', label: '游戏' },
    { id: 'page-profile', img: '我的', label: '我的' }
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
            {item.img ? (
              <img
                className="nav-btn-img"
                src={`${isActive ? '点击' : '默认'}-${item.img}.png`}
                alt={item.label}
              />
            ) : (
              <i className={`fa-solid ${item.icon}`}></i>
            )}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
