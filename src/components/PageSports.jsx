import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageSports() {
  const { 
    balance, 
    updateBalance, 
    stagedSportsBets, 
    setStagedSportsBets,
    activeSportsDrawerTab,
    setActiveSportsDrawerTab,
    parlayBetAmount,
    setParlayBetAmount,
    sportsDrawerActive,
    setSportsDrawerActive,
    showToast 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('soccer'); // soccer, basketball, tennis, volleyball, pingpong
  const [activeFilter, setActiveFilter] = useState('live'); // hot, live, anchor, today, early

  const categories = [
    { id: 'soccer', label: '足球' },
    { id: 'basketball', label: '篮球' },
    { id: 'tennis', label: '网球' },
    { id: 'volleyball', label: '排球' },
    { id: 'pingpong', label: '乒乓球' }
  ];

  const filters = [
    { id: 'hot', label: '热门', icon: 'fa-fire icon-hot' },
    { id: 'live', label: '滚球', icon: 'fa-futbol icon-live' },
    { id: 'anchor', label: '主播', icon: 'fa-microphone icon-anchor' },
    { id: 'today', label: '今日', icon: 'fa-calendar-days icon-today' },
    { id: 'early', label: '早盘', icon: 'fa-hourglass-start icon-early' },
    { id: 'filter', label: '筛选', icon: 'fa-filter icon-filter' }
  ];

  const matchesData = [
    {
      id: '101',
      sport: 'soccer',
      filters: ['live', 'today', 'hot'],
      league: '国际友谊赛',
      home: '秘鲁',
      away: '西班牙',
      homeFlag: '🇵🇪',
      awayFlag: '🇪🇸',
      homeScore: 0,
      awayScore: 2,
      halftime: '0:2',
      corners: '0:2',
      yellows: '0:0',
      elapsed: '上半场 34:33',
      odds: {
        winHome: '-', winAway: '-', winDraw: '-',
        handicapHomeText: '+1/1.5', handicapHomeVal: 1.78,
        handicapAwayText: '-1/1.5', handicapAwayVal: 2.13,
        ouOverText: '大 3.5/4', ouOverVal: 1.88,
        ouUnderText: '小 3.5/4', ouUnderVal: 2.00
      }
    },
    {
      id: '102',
      sport: 'soccer',
      filters: ['live', 'today', 'hot'],
      league: '女子国际友谊赛',
      home: '巴拿马 (女)',
      away: '牙买加 (女)',
      homeFlag: '🇵🇦',
      awayFlag: '🇯🇲',
      homeScore: 0,
      awayScore: 0,
      halftime: '0:0',
      corners: '3:4',
      yellows: '2:3',
      elapsed: '下半场 72:15',
      odds: {
        winHome: 4.88, winAway: 4.79, winDraw: 1.41,
        handicapHomeText: '0', handicapHomeVal: 1.97,
        handicapAwayText: '0', handicapAwayVal: 1.81,
        ouOverText: '大 0.5', ouOverVal: 2.25,
        ouUnderText: '小 0.5', ouUnderVal: 1.58
      }
    },
    {
      id: '201',
      sport: 'basketball',
      filters: ['live', 'today', 'hot'],
      league: '美职篮 NBA',
      home: '洛杉矶湖人',
      away: '金州勇士',
      homeFlag: '🏀',
      awayFlag: '🏀',
      homeScore: 102,
      awayScore: 98,
      halftime: 'Q4 08:33',
      corners: '暂停 2:1',
      yellows: '犯规 12:14',
      elapsed: '第四节 8:33',
      odds: {
        winHome: 1.72, winAway: 2.25, winDraw: '-',
        handicapHomeText: '-3.5', handicapHomeVal: 1.85,
        handicapAwayText: '+3.5', handicapAwayVal: 1.95,
        ouOverText: '大 218.5', ouOverVal: 1.90,
        ouUnderText: '小 218.5', ouUnderVal: 1.90
      }
    },
    {
      id: '301',
      sport: 'tennis',
      filters: ['live', 'today', 'hot'],
      league: '法国网球公开赛',
      home: '德约科维奇',
      away: '纳达尔',
      homeFlag: '🎾',
      awayFlag: '🎾',
      homeScore: 2,
      awayScore: 1,
      halftime: 'Set 3',
      corners: '盘局 2-1',
      yellows: '双误 1:3',
      elapsed: '第三盘 2-1',
      odds: {
        winHome: 1.68, winAway: 2.15, winDraw: '-',
        handicapHomeText: '-1.5', handicapHomeVal: 1.80,
        handicapAwayText: '+1.5', handicapAwayVal: 1.95,
        ouOverText: '大 38.5', ouOverVal: 1.88,
        ouUnderText: '小 38.5', ouUnderVal: 2.02
      }
    }
  ];

  // Filters cards
  const visibleMatches = matchesData.filter(m => {
    const sportMatch = m.sport === activeCategory;
    const filterMatch = m.filters.includes(activeFilter);
    return sportMatch && filterMatch;
  });

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id);
    if (cat.id === 'volleyball' || cat.id === 'pingpong') {
      showToast(`提示：【${cat.label}】赛事目前暂无进行中的直播。`);
    }
  };

  const handleFilterClick = (f) => {
    if (f.id === 'filter') {
      showToast('提示：【条件筛选】功能正在开发中，敬请期待！');
      return;
    }
    setActiveFilter(f.id);
    if (f.id === 'anchor') {
      showToast('提示：当前暂无体育主播正在直播。');
    }
  };

  // Selection toggle
  const handleOddsClick = (match, type, oddsVal, handicapText) => {
    if (oddsVal === '-') {
      showToast('该盘口已关盘，请选择其他盘口！');
      return;
    }

    const key = `${match.id}_${type}`;
    const exists = stagedSportsBets.some(item => item.key === key);

    if (exists) {
      const nextList = stagedSportsBets.filter(item => item.key !== key);
      setStagedSportsBets(nextList);
      if (nextList.length === 0) setSportsDrawerActive(false);
    } else {
      let market = '独赢';
      let selection = '主胜';

      if (type.startsWith('handicap')) {
        market = '全场让球';
        selection = type === 'handicapHome' ? `${match.home} (${handicapText})` : `${match.away} (${handicapText})`;
      } else if (type.startsWith('ou')) {
        market = '全场大小';
        selection = handicapText;
      } else {
        market = '全场独赢';
        selection = type === 'winHome' ? `${match.home}` : (type === 'winAway' ? `${match.away}` : '和局');
      }

      const sportLabel = categories.find(c => c.id === match.sport)?.label || '体育';

      const nextList = [...stagedSportsBets, {
        key,
        matchId: match.id,
        type,
        selection,
        market,
        teams: `${match.home} V ${match.away}`,
        odds: parseFloat(oddsVal),
        amount: 10, // Default base amount is 10
        sport: sportLabel
      }];
      setStagedSportsBets(nextList);
      setSportsDrawerActive(true);
    }
  };

  // Inline amount modification in Single mode
  const handleSingleAmountChange = (key, val) => {
    const amount = parseFloat(val) || 0;
    setStagedSportsBets(prev => prev.map(item => item.key === key ? { ...item, amount } : item));
  };

  // Clear all staged bets
  const handleClearDrawer = () => {
    setStagedSportsBets([]);
    setSportsDrawerActive(false);
    showToast('已清空所有投注项');
  };

  // Calculations for drawer footer
  const totalBetsCount = stagedSportsBets.length;
  const totalSingleAmount = stagedSportsBets.reduce((sum, item) => sum + item.amount, 0);

  // Parlay validation checks
  const matchIds = stagedSportsBets.map(item => item.matchId);
  const uniqueMatchIds = [...new Set(matchIds)];
  const isParlayValid = uniqueMatchIds.length >= 2 && uniqueMatchIds.length === stagedSportsBets.length;
  
  const parlayCombinedOdds = stagedSportsBets.reduce((prod, item) => prod * item.odds, 1);

  // Submit bets
  const handleConfirmBets = () => {
    if (stagedSportsBets.length === 0) return;

    if (activeSportsDrawerTab === 'single') {
      const invalid = stagedSportsBets.find(item => item.amount < 10 || item.amount > 1000);
      if (invalid) {
        showToast('单笔投注金额范围必须在 10 ~ 1000 元之间');
        return;
      }

      if (totalSingleAmount > balance) {
        showToast('投注失败：账户可用余额不足！');
        return;
      }

      updateBalance(-totalSingleAmount);
      showToast(`投注成功！已投 ${totalBetsCount} 笔单关，共 ¥${totalSingleAmount.toFixed(2)} 元！`);
      setStagedSportsBets([]);
      setSportsDrawerActive(false);
    } else {
      if (!isParlayValid) {
        showToast('请满足串关投注条件后再提交投注');
        return;
      }

      if (parlayBetAmount < 10 || parlayBetAmount > 1000) {
        showToast('串关投注金额范围必须在 10 ~ 1000 元之间');
        return;
      }

      if (parlayBetAmount > balance) {
        showToast('投注失败：账户可用余额不足！');
        return;
      }

      updateBalance(-parlayBetAmount);
      showToast(`串关成功！已投 ${uniqueMatchIds.length}串1 (赔率 @${parlayCombinedOdds.toFixed(2)})，共 ¥${parlayBetAmount.toFixed(2)} 元！`);
      setStagedSportsBets([]);
      setSportsDrawerActive(false);
    }
  };

  return (
    <div className="app-page active" id="page-sports">
      <div className="sports-header">
        {/* Row 1: Category Pills */}
        <div className="sports-category-row">
          <div className="sports-category-pills">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                className={`sports-category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.label}
              </div>
            ))}
          </div>
          <button className="sports-more-platform" onClick={() => showToast('提示：【更多体育平台】正在接入中，敬请期待！')}>
            更多平台 <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        {/* Row 2: Icon Filters */}
        <div className="sports-filter-row">
          {filters.map(f => (
            <div 
              key={f.id} 
              className={`sports-filter-item ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => handleFilterClick(f)}
            >
              <i className={`fa-solid ${f.icon}`}></i>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-content">
        <div className="sports-match-list" id="sports-match-list-container">
          {visibleMatches.map(match => (
            <div key={match.id} className="match-card">
              <div className="match-card-header">
                <div className="league-info">
                  <i className="fa-solid fa-trophy league-icon"></i>
                  <span className="match-league">{match.league}</span>
                </div>
                <div className="market-headers">
                  <span>独赢</span>
                  <span>让球</span>
                  <span>大小</span>
                </div>
              </div>

              <div className="match-card-body">
                <div className="match-details-left">
                  <div className="team-row">
                    <span className="team-name">
                      <span className="flag-icon" style={{ marginRight: '4px' }}>{match.homeFlag}</span> 
                      {match.home}
                    </span>
                    <span className="team-score">{match.homeScore}</span>
                  </div>
                  <div className="team-row">
                    <span className="team-name">
                      <span className="flag-icon" style={{ marginRight: '4px' }}>{match.awayFlag}</span> 
                      {match.away}
                    </span>
                    <span className={`team-score ${match.awayScore > match.homeScore ? 'active-score' : ''}`}>{match.awayScore}</span>
                  </div>
                  <div className="match-stats-row">
                    <span>半 {match.halftime}</span>
                    <span>角 {match.corners}</span>
                    <span>黄 {match.yellows}</span>
                  </div>
                </div>

                <div className="match-odds-grid">
                  {/* 1X2 odds col */}
                  <div className="odds-col col-1">
                    <button 
                      className={`odds-btn live-sports-odds-btn ${stagedSportsBets.some(i => i.key === `${match.id}_winHome`) ? 'selected' : ''}`}
                      onClick={() => handleOddsClick(match, 'winHome', match.odds.winHome)}
                    >
                      {match.odds.winHome !== '-' ? (
                        <>
                          <span className="opt-text">主队</span>
                          <span className="odds-val">{match.odds.winHome}</span>
                        </>
                      ) : '-'}
                    </button>
                    <button 
                      className={`odds-btn live-sports-odds-btn ${stagedSportsBets.some(i => i.key === `${match.id}_winAway`) ? 'selected' : ''}`}
                      onClick={() => handleOddsClick(match, 'winAway', match.odds.winAway)}
                    >
                      {match.odds.winAway !== '-' ? (
                        <>
                          <span className="opt-text">客队</span>
                          <span className="odds-val">{match.odds.winAway}</span>
                        </>
                      ) : '-'}
                    </button>
                    <button 
                      className={`odds-btn live-sports-odds-btn ${stagedSportsBets.some(i => i.key === `${match.id}_winDraw`) ? 'selected' : ''}`}
                      onClick={() => handleOddsClick(match, 'winDraw', match.odds.winDraw)}
                    >
                      {match.odds.winDraw !== '-' ? (
                        <>
                          <span className="opt-text">平</span>
                          <span className="odds-val">{match.odds.winDraw}</span>
                        </>
                      ) : '-'}
                    </button>
                  </div>

                  {/* Handicap odds col */}
                  <div className="odds-col col-2">
                    <button 
                      className={`odds-btn live-sports-odds-btn ${stagedSportsBets.some(i => i.key === `${match.id}_handicapHome`) ? 'selected' : ''}`}
                      onClick={() => handleOddsClick(match, 'handicapHome', match.odds.handicapHomeVal, match.odds.handicapHomeText)}
                    >
                      <span className="opt-text">{match.odds.handicapHomeText}</span>
                      <span className="odds-val">{match.odds.handicapHomeVal}</span>
                    </button>
                    <button 
                      className={`odds-btn live-sports-odds-btn ${stagedSportsBets.some(i => i.key === `${match.id}_handicapAway`) ? 'selected' : ''}`}
                      onClick={() => handleOddsClick(match, 'handicapAway', match.odds.handicapAwayVal, match.odds.handicapAwayText)}
                    >
                      <span className="opt-text">{match.odds.handicapAwayText}</span>
                      <span className="odds-val">{match.odds.handicapAwayVal}</span>
                    </button>
                  </div>

                  {/* OU odds col */}
                  <div className="odds-col col-3">
                    <button 
                      className={`odds-btn live-sports-odds-btn ${stagedSportsBets.some(i => i.key === `${match.id}_ouOver`) ? 'selected' : ''}`}
                      onClick={() => handleOddsClick(match, 'ouOver', match.odds.ouOverVal, match.odds.ouOverText)}
                    >
                      <span className="opt-text">{match.odds.ouOverText}</span>
                      <span className="odds-val">{match.odds.ouOverVal}</span>
                    </button>
                    <button 
                      className={`odds-btn live-sports-odds-btn ${stagedSportsBets.some(i => i.key === `${match.id}_ouUnder`) ? 'selected' : ''}`}
                      onClick={() => handleOddsClick(match, 'ouUnder', match.odds.ouUnderVal, match.odds.ouUnderText)}
                    >
                      <span className="opt-text">{match.odds.ouUnderText}</span>
                      <span className="odds-val">{match.odds.ouUnderVal}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="match-card-footer">
                <span className="match-time-elapsed">{match.elapsed}</span>
                <span className="more-markets-btn" onClick={() => showToast('提示：更多玩法盘口对接中！')}>
                  更多玩法 <i className="fa-solid fa-chevron-right"></i>
                </span>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {visibleMatches.length === 0 && (
            <div className="sports-empty-state" style={{ display: 'block', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
              <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '2rem', marginBottom: '8px', color: 'rgba(0,0,0,0.15)', display: 'block' }}></i>
              暂无进行中的比赛，敬请期待！
            </div>
          )}
        </div>
      </div>

      {/* 3. Sports Betting Slip Drawer Panel */}
      <div className={`sports-betting-drawer ${sportsDrawerActive ? 'active' : ''}`} id="sports-bet-drawer">
        <div className="sports-drawer-header">
          <button id="btn-close-sports-drawer" className="sports-drawer-close-btn" onClick={() => setSportsDrawerActive(false)}>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
          <h4 className="sports-drawer-title">确认投注</h4>
          <button id="btn-clear-sports-drawer" className="sports-drawer-clear-btn" onClick={handleClearDrawer}>清空</button>
        </div>
        
        <div className="sports-drawer-tabs">
          <div 
            className={`sports-drawer-tab ${activeSportsDrawerTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveSportsDrawerTab('single')}
          >
            单关
          </div>
          <div 
            className={`sports-drawer-tab ${activeSportsDrawerTab === 'parlay' ? 'active' : ''}`}
            onClick={() => setActiveSportsDrawerTab('parlay')}
          >
            串关
          </div>
        </div>

        <div className="sports-drawer-scroll-content" id="sports-drawer-items-list">
          {activeSportsDrawerTab === 'single' ? (
            /* Single Bet items */
            stagedSportsBets.length === 0 ? (
              <div className="sports-drawer-placeholder">暂无投注选项，请选择盘口进行投注</div>
            ) : (
              stagedSportsBets.map(item => (
                <div key={item.key} className="sports-drawer-bet-card">
                  <div className="sports-drawer-card-left">
                    <div className="sports-drawer-card-option">{item.selection}</div>
                    <div className="sports-drawer-card-market">{item.market}</div>
                    <div className="sports-drawer-card-match">{item.teams}</div>
                    <div className="sports-drawer-card-odds">@{item.odds.toFixed(2)}</div>
                  </div>
                  <div className="sports-drawer-card-right">
                    <button className="sports-drawer-card-close" onClick={() => {
                      const next = stagedSportsBets.filter(i => i.key !== item.key);
                      setStagedSportsBets(next);
                      if (next.length === 0) setSportsDrawerActive(false);
                    }}>✕</button>
                    <span className="sports-drawer-card-sport">{item.sport}</span>
                    <div className="sports-drawer-card-input-wrapper">
                      <input 
                        type="number" 
                        className="sports-drawer-card-input" 
                        value={item.amount} 
                        onChange={(e) => handleSingleAmountChange(item.key, e.target.value)}
                        min="1" 
                        max="10000" 
                      />
                      <div className="sports-drawer-card-limit">限额 10 ~ 1000</div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Parlay Bet items */
            stagedSportsBets.length === 0 ? (
              <div className="sports-drawer-placeholder">暂无投注选项，请选择盘口进行投注</div>
            ) : (
              <>
                {stagedSportsBets.map(item => (
                  <div key={item.key} className="sports-drawer-bet-card parlay-mode">
                    <div className="sports-drawer-card-left">
                      <div className="sports-drawer-card-option">{item.selection}</div>
                      <div className="sports-drawer-card-market">{item.market}</div>
                      <div className="sports-drawer-card-match">{item.teams}</div>
                      <div className="sports-drawer-card-odds">@{item.odds.toFixed(2)}</div>
                    </div>
                    <div className="sports-drawer-card-right">
                      <button className="sports-drawer-card-close" onClick={() => {
                        const next = stagedSportsBets.filter(i => i.key !== item.key);
                        setStagedSportsBets(next);
                        if (next.length === 0) setSportsDrawerActive(false);
                      }}>✕</button>
                      <span className="sports-drawer-card-sport">{item.sport}</span>
                    </div>
                  </div>
                ))}
                
                {/* Parlay conditions warning notices */}
                {uniqueMatchIds.length < 2 ? (
                  <div className="sports-drawer-placeholder-warning">请选择至少2场不同赛事的选项进行串关投注</div>
                ) : uniqueMatchIds.length < stagedSportsBets.length ? (
                  <div className="sports-drawer-placeholder-warning">不支持同场赛事的多个选项进行串关，请先移除非同一赛事的重合选项</div>
                ) : (
                  <div className="sports-drawer-parlay-card">
                    <div className="parlay-card-left">
                      <div className="parlay-card-title">{uniqueMatchIds.length}串1</div>
                      <div className="parlay-card-odds">@{parlayCombinedOdds.toFixed(2)}</div>
                    </div>
                    <div className="parlay-card-right">
                      <div className="sports-drawer-card-input-wrapper">
                        <input 
                          type="number" 
                          className="sports-drawer-parlay-input" 
                          value={parlayBetAmount} 
                          onChange={(e) => setParlayBetAmount(parseFloat(e.target.value) || 0)}
                          min="1" 
                          max="10000" 
                        />
                        <div className="sports-drawer-card-limit">限额 10 ~ 1000</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>

        <div className="sports-drawer-footer">
          <div className="sports-drawer-footer-info">
            <div className="sports-drawer-footer-summary" id="sports-drawer-summary-text">
              {activeSportsDrawerTab === 'single' ? (
                <>{totalBetsCount}单，共<span>{totalSingleAmount.toFixed(2)}</span>元</>
              ) : (
                <>{isParlayValid ? 1 : 0}个串关，共<span>{isParlayValid ? parlayBetAmount.toFixed(2) : '0.00'}</span>元</>
              )}
            </div>
            <div className="sports-drawer-footer-odds-policy">
              自动接受更好的赔率 <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
          </div>
          <div className="sports-drawer-footer-actions">
            <button className="sports-drawer-cancel-btn" id="btn-cancel-sports-bet" onClick={() => setSportsDrawerActive(false)}>取消</button>
            <button 
              className="sports-drawer-confirm-btn" 
              id="btn-confirm-sports-bet" 
              onClick={handleConfirmBets}
              disabled={stagedSportsBets.length === 0 || (activeSportsDrawerTab === 'parlay' && !isParlayValid)}
            >
              确认投注
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
