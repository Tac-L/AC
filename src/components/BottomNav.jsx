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

  const navItems = [
    { id: 'page-dramas', icon: 'fa-clapperboard', label: '短剧' },
    { id: 'page-videos', icon: 'fa-circle-play', label: '视频' },
    { id: 'page-chats', icon: 'fa-microphone', label: '直播' },
    { id: 'page-sports', icon: 'fa-football', label: '体育' },
    { id: 'page-games', icon: 'fa-gamepad', label: '游戏' },
    { id: 'page-profile', icon: 'fa-user', label: '我的' }
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
            {item.isChat ? (
              <div className="btn-chat-wrapper">
                <i className={`fa-solid ${item.icon}`}></i>
                <span className="chat-badge">9+</span>
              </div>
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
