import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageSportsMorePlay() {
  const { 
    stagedSportsBets, 
    setStagedSportsBets, 
    setSportsDrawerActive, 
    setActiveSubGame, 
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState('betting'); // betting, data, red_order, anchor
  const [activeFilter, setActiveFilter] = useState('hot'); // hot, all, handicap_ou, half, full, correct_score
  const [expandedSections, setExpandedSections] = useState({
    handicap: true,
    ou: true,
    half_ou: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Helper to click odds and sync with betting drawer
  const handleOddsClick = (key, selection, market, oddsVal) => {
    const isSelected = stagedSportsBets.some(item => item.key === key);
    if (isSelected) {
      const nextList = stagedSportsBets.filter(item => item.key !== key);
      setStagedSportsBets(nextList);
      if (nextList.length === 0) setSportsDrawerActive(false);
    } else {
      const sportLabel = '足球';
      const nextList = [...stagedSportsBets, {
        key,
        matchId: '100', // Unique ID for this match
        type: key,
        selection,
        market,
        teams: 'SC圣地亚哥市 VS 阿纳海姆',
        odds: parseFloat(oddsVal),
        amount: 10,
        sport: sportLabel
      }];
      setStagedSportsBets(nextList);
      setSportsDrawerActive(true);
    }
  };

  const isOddsSelected = (key) => stagedSportsBets.some(item => item.key === key);

  return (
    <div className="sports-moreplay-page active">
      {/* 1. Glowing Match Header Area */}
      <div className="moreplay-match-header">
        {/* Navigation Bar */}
        <div className="moreplay-nav-bar">
          <button className="moreplay-back-btn" onClick={() => setActiveSubGame(null)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="moreplay-league-title" onClick={() => showToast('提示：暂无其他可选联赛')}>
            <span>美国乙级联赛</span>
            <i className="fa-solid fa-chevron-down league-arrow"></i>
          </div>
          <button className="moreplay-notes-btn" onClick={() => showToast('提示：暂无历史赛事报表')}>
            <i className="fa-regular fa-file-lines"></i>
          </button>
        </div>

        {/* Competitors & Scores */}
        <div className="moreplay-match-scoreboard">
          {/* Home Team */}
          <div className="moreplay-team home">
            <div className="moreplay-team-logo">
              <svg viewBox="0 0 100 100" width="44" height="44">
                <circle cx="50" cy="50" r="48" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
                <circle cx="50" cy="50" r="40" fill="#2563eb" />
                <path d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M25 75 L75 25" stroke="#fbbf24" strokeWidth="3" strokeDasharray="4 2" />
                <circle cx="50" cy="50" r="18" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                <circle cx="50" cy="50" r="8" fill="#d97706" />
              </svg>
            </div>
            <span className="moreplay-team-name">SC圣地亚哥市</span>
          </div>

          {/* Center Details */}
          <div className="moreplay-center-status">
            <span className="moreplay-match-timer">上半场 20:09</span>
            <div className="moreplay-big-score">
              <span>0</span>
              <span className="divider">:</span>
              <span>0</span>
            </div>
          </div>

          {/* Away Team */}
          <div className="moreplay-team away">
            <div className="moreplay-team-logo">
              <svg viewBox="0 0 100 100" width="44" height="44">
                <path d="M15 10 L85 10 L85 45 C85 70 50 90 50 90 C50 90 15 70 15 45 Z" fill="#b91c1c" stroke="#ffffff" strokeWidth="2" />
                <path d="M22 15 L78 15 L78 45 C78 66 50 82 50 82 C50 82 22 66 22 45 Z" fill="#dc2626" />
                <path d="M50 25 L35 45 H65 Z" fill="#ffffff" />
                <path d="M50 45 L35 65 H65 Z" fill="#ffffff" />
                <circle cx="50" cy="35" r="5" fill="#b91c1c" />
              </svg>
            </div>
            <span className="moreplay-team-name">阿纳海姆足球俱乐部</span>
          </div>
        </div>

        {/* Live Match Stats Row */}
        <div className="moreplay-match-stats-row">
          <div className="moreplay-stat-item">
            <i className="fa-solid fa-flag stat-flag-icon"></i>
            <span className="stat-label">角球</span>
            <span className="stat-val">0:0</span>
          </div>
          <div className="moreplay-stat-item">
            <div className="card-red"></div>
            <span className="stat-label">红牌</span>
            <span className="stat-val">0:0</span>
          </div>
          <div className="moreplay-stat-item">
            <div className="card-yellow"></div>
            <span className="stat-label">黄牌</span>
            <span className="stat-val">0:0</span>
          </div>
          <div className="moreplay-stat-item">
            <span className="stat-label">上半场</span>
            <span className="stat-val">0:0</span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="moreplay-header-footer">
          <button className="moreplay-btn-animation" onClick={() => showToast('提示：三维赛事动画加载中...')}>
            <i className="fa-solid fa-tv"></i>
            <span>动画</span>
          </button>
          <div className="moreplay-collapse-indicator" onClick={() => showToast('提示：主看板已展开')}>
            <i className="fa-solid fa-chevron-up"></i>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div className="moreplay-tabs-row">
        <button 
          className={`moreplay-tab-item ${activeTab === 'betting' ? 'active' : ''}`}
          onClick={() => setActiveTab('betting')}
        >
          投注
        </button>
        <button 
          className={`moreplay-tab-item ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('data');
            showToast('提示：已切换至【数据】看板');
          }}
        >
          数据
        </button>
        <button 
          className={`moreplay-tab-item ${activeTab === 'red_order' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('red_order');
            showToast('提示：已切换至【红单推荐】');
          }}
        >
          红单
        </button>
        <button 
          className={`moreplay-tab-item ${activeTab === 'anchor' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('anchor');
            showToast('提示：已切换至【主播频道】');
          }}
        >
          主播
        </button>
      </div>

      {/* 3. Main Scrollable Content */}
      <div className="moreplay-scroll-content scroll-content">
        {activeTab === 'betting' && (
          <>
            {/* Filter Pills Bar */}
            <div className="moreplay-filter-row">
              <button className="filter-collapse-btn" onClick={() => showToast('提示：已重置筛选条件')}>
                <i className="fa-solid fa-chevron-up filter-up-icon"></i>
              </button>
              <div className="filter-divider"></div>
              <div className="filter-pills-scroll">
                {[
                  { id: 'hot', label: '热门' },
                  { id: 'all', label: '全部' },
                  { id: 'handicap_ou', label: '让球&大小' },
                  { id: 'half', label: '半场' },
                  { id: 'full', label: '全场' },
                  { id: 'correct_score', label: '波胆' }
                ].map(item => (
                  <button 
                    key={item.id}
                    className={`filter-pill-item ${activeFilter === item.id ? 'active' : ''}`}
                    onClick={() => setActiveFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion Panels */}
            <div className="moreplay-accordions-container">
              {/* Card 1: 全场让球 */}
              {(activeFilter === 'hot' || activeFilter === 'all' || activeFilter === 'handicap_ou' || activeFilter === 'full') && (
                <div className={`accordion-card ${expandedSections.handicap ? 'expanded' : ''}`}>
                  <div className="accordion-header" onClick={() => toggleSection('handicap')}>
                    <div className="accordion-title">
                      <i className="fa-solid fa-chevron-down accordion-arrow"></i>
                      <span>全场让球</span>
                    </div>
                    <button className="accordion-header-action" onClick={(e) => { e.stopPropagation(); showToast('已置顶【全场让球】'); }}>
                      <i className="fa-solid fa-arrow-up-from-bracket"></i>
                    </button>
                  </div>
                  <div className="accordion-content">
                    <div className="odds-grid-two-cols">
                      {/* Row 1 */}
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_handicap_home_1') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_handicap_home_1', '主队 -1', '全场让球', '1.77')}
                      >
                        <span className="odds-option-label">主队 -1</span>
                        <span className="odds-option-value">1.77</span>
                      </button>
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_handicap_away_1') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_handicap_away_1', '客队 +1', '全场让球', '2.01')}
                      >
                        <span className="odds-option-label">客队 +1</span>
                        <span className="odds-option-value">2.01</span>
                      </button>

                      {/* Row 2 */}
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_handicap_home_1.25') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_handicap_home_1.25', '主队 -1/1.5', '全场让球', '2.04')}
                      >
                        <span className="odds-option-label">主队 -1/1.5</span>
                        <span className="odds-option-value">2.04</span>
                      </button>
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_handicap_away_1.25') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_handicap_away_1.25', '客队 +1/1.5', '全场让球', '1.74')}
                      >
                        <span className="odds-option-label">客队 +1/1.5</span>
                        <span className="odds-option-value">1.74</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2: 全场大小 */}
              {(activeFilter === 'hot' || activeFilter === 'all' || activeFilter === 'handicap_ou' || activeFilter === 'full') && (
                <div className={`accordion-card ${expandedSections.ou ? 'expanded' : ''}`}>
                  <div className="accordion-header" onClick={() => toggleSection('ou')}>
                    <div className="accordion-title">
                      <i className="fa-solid fa-chevron-down accordion-arrow"></i>
                      <span>全场大小</span>
                    </div>
                    <button className="accordion-header-action" onClick={(e) => { e.stopPropagation(); showToast('已置顶【全场大小】'); }}>
                      <i className="fa-solid fa-arrow-up-from-bracket"></i>
                    </button>
                  </div>
                  <div className="accordion-content">
                    <div className="odds-grid-two-cols">
                      {/* Row 1 */}
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_ou_over_3') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_ou_over_3', '大 3', '全场大小', '1.96')}
                      >
                        <span className="odds-option-label">大 3</span>
                        <span className="odds-option-value">1.96</span>
                      </button>
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_ou_under_3') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_ou_under_3', '小 3', '全场大小', '1.82')}
                      >
                        <span className="odds-option-label">小 3</span>
                        <span className="odds-option-value">1.82</span>
                      </button>

                      {/* Row 2 */}
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_ou_over_2.75') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_ou_over_2.75', '大 2.5/3', '全场大小', '1.72')}
                      >
                        <span className="odds-option-label">大 2.5/3</span>
                        <span className="odds-option-value">1.72</span>
                      </button>
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_ou_under_2.75') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_ou_under_2.75', '小 2.5/3', '全场大小', '2.06')}
                      >
                        <span className="odds-option-label">小 2.5/3</span>
                        <span className="odds-option-value">2.06</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 3: 上半场大小 */}
              {(activeFilter === 'hot' || activeFilter === 'all' || activeFilter === 'half') && (
                <div className={`accordion-card ${expandedSections.half_ou ? 'expanded' : ''}`}>
                  <div className="accordion-header" onClick={() => toggleSection('half_ou')}>
                    <div className="accordion-title">
                      <i className="fa-solid fa-chevron-down accordion-arrow"></i>
                      <span>上半场大小</span>
                    </div>
                    <button className="accordion-header-action" onClick={(e) => { e.stopPropagation(); showToast('已置顶【上半场大小】'); }}>
                      <i className="fa-solid fa-arrow-up-from-bracket"></i>
                    </button>
                  </div>
                  <div className="accordion-content">
                    <div className="odds-grid-two-cols">
                      {/* Row 1 */}
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_half_ou_over_1') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_half_ou_over_1', '大 1', '上半场大小', '2.01')}
                      >
                        <span className="odds-option-label">大 1</span>
                        <span className="odds-option-value">2.01</span>
                      </button>
                      <button 
                        className={`odds-option-btn ${isOddsSelected('mp_half_ou_under_1') ? 'selected' : ''}`}
                        onClick={() => handleOddsClick('mp_half_ou_under_1', '小 1', '上半场大小', '1.77')}
                      >
                        <span className="odds-option-label">小 1</span>
                        <span className="odds-option-value">1.77</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Dummy Stats for "数据" Tab */}
        {activeTab === 'data' && (
          <div className="moreplay-stats-container" style={{ padding: '16px', color: '#2c3e50' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h5 style={{ margin: '0 0 16px 0', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #f1f2f6', paddingBottom: '8px' }}>
                赛事技术统计
              </h5>
              
              {/* Possession Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#57606f', marginBottom: '4px' }}>
                  <span>SC圣地亚哥市 52%</span>
                  <span>控球率</span>
                  <span>阿纳海姆 48%</span>
                </div>
                <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '52%', backgroundColor: '#2563eb' }}></div>
                  <div style={{ width: '48%', backgroundColor: '#dc2626' }}></div>
                </div>
              </div>

              {/* Stat rows */}
              {[
                { label: '射门', home: 5, away: 3 },
                { label: '射正', home: 2, away: 1 },
                { label: '危险进攻', home: 28, away: 22 },
                { label: '角球', home: 0, away: 0 },
                { label: '犯规', home: 4, away: 6 },
                { label: '黄牌', home: 0, away: 0 }
              ].map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0', fontSize: '0.72rem' }}>
                  <span style={{ width: '40px', fontWeight: 'bold', color: '#2563eb' }}>{stat.home}</span>
                  <span style={{ color: '#7f8c8d' }}>{stat.label}</span>
                  <span style={{ width: '40px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>{stat.away}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dummy Expert Recommendations for "红单" Tab */}
        {activeTab === 'red_order' && (
          <div className="moreplay-redorders-container" style={{ padding: '12px' }}>
            {[
              { author: '红单老司机', rate: '92%', match: '让球胜/平', desc: 'SC圣地亚哥市近期主场状态极为火热，阿纳海姆客场防守不稳，看好主队让球打出。' },
              { author: '波胆预测大师', rate: '85%', match: '小 3', desc: '双方历史交锋多为防守战，本次开出大小盘3球偏深，极概率是小球局。' }
            ].map((order, idx) => (
              <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '12px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color: '#2c3e50' }}>{order.author}</span>
                  <span style={{ fontSize: '0.64rem', color: '#e11d48', backgroundColor: '#ffe4e6', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                    胜率 {order.rate}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#2f3542', fontWeight: '600', marginBottom: '6px' }}>
                  推荐盘口: <span style={{ color: '#2563eb' }}>{order.match}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.68rem', color: '#747d8c', lineHeight: 1.4 }}>
                  {order.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Dummy Streamers for "主播" Tab */}
        {activeTab === 'anchor' && (
          <div className="moreplay-anchors-container" style={{ padding: '12px' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '12px' }}>
              <div style={{ position: 'relative', height: '140px', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <i className="fa-solid fa-play" style={{ color: '#ffffff', fontSize: '2rem', opacity: 0.6, cursor: 'pointer' }}></i>
                <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#e11d48', color: '#ffffff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                  LIVE
                </div>
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: '#ffffff', fontSize: '0.7rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontWeight: 'bold' }}>
                  主播莉莉正在解说
                </div>
              </div>
              <div style={{ padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#57606f' }}><i className="fa-solid fa-user-group" style={{ marginRight: '4px' }}></i> 2,840 观看</span>
                  <button 
                    style={{ border: 'none', background: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: 'bold' }}
                    onClick={() => showToast('关注主播成功！')}
                  >
                    关注
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
