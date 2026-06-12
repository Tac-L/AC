import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageSportsPlatforms() {
  const { setActiveSubGame, showToast } = useApp();
  const [favorites, setFavorites] = useState(['sb', 'fb', 'im']);
  const [enteringPlatform, setEnteringPlatform] = useState(null);

  const platforms = [
    {
      id: 'sb',
      name: 'SB沙巴体育',
      img: 'assets/sb_saba_sports.png',
      badgeText: '沙巴',
      badgeColor: '#2b2b2b',
      logoStyle: 'saba-logo',
      logoText: 'SABA',
      badgeIcon: '⚽'
    },
    {
      id: 'fb',
      name: 'FB体育',
      img: 'assets/fb_sports.png',
      badgeText: 'FB',
      badgeColor: '#3b82f6',
      logoStyle: 'fb-logo',
      logoText: 'FB体育',
      badgeIcon: '⚡'
    },
    {
      id: 'im',
      name: 'IM体育',
      img: 'assets/im_sports.png',
      badgeText: 'IM',
      badgeColor: '#e11d48',
      logoStyle: 'im-logo',
      logoText: 'IM',
      badgeIcon: '📊'
    },
    {
      id: 'ft368',
      name: 'FT368体育',
      img: 'assets/ft368_sports.png',
      badgeText: 'CMD',
      badgeColor: '#10b981',
      logoStyle: 'cmd-logo',
      logoText: 'CMD368',
      badgeIcon: '🏆'
    },
    {
      id: 'bti',
      name: 'BTI体育',
      img: 'assets/bti_sports.png',
      badgeText: 'BTi',
      badgeColor: '#f59e0b',
      logoStyle: 'bti-logo',
      logoText: 'BTi',
      badgeIcon: '🌐'
    },
    {
      id: 'nhg',
      name: 'NHG皇冠体育',
      img: 'assets/nhg_sports.png',
      badgeText: '皇冠',
      badgeColor: '#8b5cf6',
      logoStyle: 'crown-logo',
      logoText: 'CROWN',
      badgeIcon: '👑'
    }
  ];

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
      showToast('已取消收藏该平台');
    } else {
      setFavorites([...favorites, id]);
      showToast('已成功收藏該平台！');
    }
  };

  const handlePlatformClick = (platform) => {
    setEnteringPlatform(platform.name);
    setTimeout(() => {
      setEnteringPlatform(null);
      showToast(`成功进入 ${platform.name} 平台！`);
    }, 1800);
  };

  return (
    <div className="sports-platforms-page active">
      {/* Header Bar */}
      <div className="sports-platforms-header">
        <button className="sp-back-btn" onClick={() => setActiveSubGame(null)}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="sp-header-info">
          <div className="sp-header-logo-wrapper">
            <i className="fa-solid fa-futbol sp-ball-icon"></i>
          </div>
          <div className="sp-header-titles">
            <span className="sp-title">体育平台</span>
            <span className="sp-subtitle">顶级体育平台，玩法多样更稳定！</span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="sports-platforms-scroll scroll-content">
        <div className="sports-platforms-grid">
          {platforms.map(platform => {
            const isFav = favorites.includes(platform.id);
            return (
              <div 
                key={platform.id} 
                className="platform-card"
                onClick={() => handlePlatformClick(platform)}
              >
                <div className="platform-card-img-wrapper">
                  {/* Background Player Card */}
                  <img 
                    src={platform.img} 
                    alt={platform.name} 
                    className="platform-card-img" 
                  />
                  
                  {/* Top Left Badge */}
                  <div className="platform-card-badge" style={{ backgroundColor: platform.badgeColor }}>
                    <span className="platform-badge-icon">{platform.badgeIcon}</span>
                    <span className="platform-badge-text">{platform.badgeText}</span>
                  </div>

                  {/* Top Right Favorite Star */}
                  <button 
                    className={`platform-card-fav-btn ${isFav ? 'fav-active' : ''}`}
                    onClick={(e) => toggleFavorite(platform.id, e)}
                  >
                    <i className={isFav ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                  </button>

                  {/* Center Overlay Logo */}
                  <div className="platform-card-center-logo-container">
                    <div className={`platform-center-logo ${platform.logoStyle}`}>
                      {platform.id === 'sb' && (
                        <div className="logo-saba-inner">
                          <i className="fa-solid fa-futbol logo-ball"></i>
                          <span>{platform.logoText}</span>
                        </div>
                      )}
                      {platform.id === 'fb' && (
                        <div className="logo-fb-inner">
                          <i className="fa-solid fa-bolt logo-bolt"></i>
                          <span>{platform.logoText}</span>
                        </div>
                      )}
                      {platform.id === 'im' && (
                        <div className="logo-im-inner">
                          <span className="logo-im-box">IM</span>
                        </div>
                      )}
                      {platform.id === 'ft368' && (
                        <div className="logo-cmd-inner">
                          <i className="fa-solid fa-trophy logo-trophy"></i>
                          <span>{platform.logoText}</span>
                        </div>
                      )}
                      {platform.id === 'bti' && (
                        <div className="logo-bti-inner">
                          <span>{platform.logoText}</span>
                        </div>
                      )}
                      {platform.id === 'nhg' && (
                        <div className="logo-crown-inner">
                          <i className="fa-solid fa-crown logo-crown-icon"></i>
                          <span>{platform.logoText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Platform Name Label */}
                <div className="platform-card-name">
                  {platform.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading Overlay */}
      {enteringPlatform && (
        <div className="platform-loading-overlay">
          <div className="platform-loading-card">
            <div className="platform-spinner"></div>
            <div className="platform-loading-text">正在安全加密连接...</div>
            <div className="platform-loading-target">{enteringPlatform}</div>
          </div>
        </div>
      )}
    </div>
  );
}
