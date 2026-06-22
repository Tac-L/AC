import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageAccountSettings() {
  const { goBack, showToast, logout, setActivePage } = useApp();

  const [openAccount, setOpenAccount] = useState(false);
  const [openSports, setOpenSports] = useState(false);
  const [handicap, setHandicap] = useState('euro');      // euro | hk
  const [oddsAccept, setOddsAccept] = useState('better'); // better | any | none
  const [oddsColor, setOddsColor] = useState('redup');    // redup | greenup
  const [matchSort, setMatchSort] = useState('league');   // time | league

  const accountInfo = [
    { label: '货币类型', value: 'CNY' },
    { label: '账户状态', value: '正常' },
    { label: '注册时间', value: '2026-03-26 12:36:31' },
    { label: '注册IP', value: '114.***.***.111' },
    { label: '上次登录时间', value: '2026-06-19 10:17:25' },
    { label: '上次登录IP', value: '153.***.***.237' },
  ];

  const handleLogout = () => {
    logout();
    showToast('您已成功退出登录！');
  };


  const Radio = ({ active }) => (
    <span className={`settings-radio-dot ${active ? 'checked' : ''}`}></span>
  );

  return (
    <div className="app-page active" id="page-account-settings">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-account-settings-back" onClick={() => goBack('page-profile')}></i>
        <span className="activity-header-title">设置</span>
        <div></div>
      </div>

      <div className="scroll-content settings-content">
        {/* Personal settings entry → opens 个人设置 sub-page */}
        <div className="settings-card">
          <div className="settings-section-head" onClick={() => setActivePage('page-settings')}>
            <span className="settings-section-title">个人设置</span>
            <i className="fa-solid fa-chevron-right settings-section-caret"></i>
          </div>
        </div>

        {/* Account status */}
        <div className="settings-card">
          <div className="settings-section-head" onClick={() => setOpenAccount((v) => !v)}>
            <span className="settings-section-title">账户状态</span>
            <i className={`fa-solid ${openAccount ? 'fa-chevron-up' : 'fa-chevron-down'} settings-section-caret`}></i>
          </div>
          {openAccount && (
            <div className="settings-info-list">
              {accountInfo.map((it, i) => (
                <div className="settings-info-row" key={i}>
                  <span className="settings-info-label">{it.label}</span>
                  <span className="settings-info-value">{it.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sports settings */}
        <div className="settings-card">
          <div className="settings-section-head" onClick={() => setOpenSports((v) => !v)}>
            <span className="settings-section-title">体育相关设置</span>
            <i className={`fa-solid ${openSports ? 'fa-chevron-up' : 'fa-chevron-down'} settings-section-caret`}></i>
          </div>
          {openSports && (
            <div className="settings-sports-body">
              <div className="settings-sub-label">盘口设置</div>
              <div className="settings-radio-row">
                <div className="settings-radio" onClick={() => setHandicap('euro')}>
                  <Radio active={handicap === 'euro'} /> 欧洲盘
                </div>
                <div className="settings-radio" onClick={() => setHandicap('hk')}>
                  <Radio active={handicap === 'hk'} /> 香港盘
                </div>
              </div>

              <div className="settings-sub-label">赔率偏好</div>
              <div className="settings-radio-col">
                {[
                  ['better', '自动接受更好的赔率'],
                  ['any', '自动接受任何赔率'],
                  ['none', '不接受任何赔率变动'],
                ].map(([k, t]) => (
                  <div className="settings-radio" key={k} onClick={() => setOddsAccept(k)}>
                    <Radio active={oddsAccept === k} /> {t}
                  </div>
                ))}
              </div>

              <div className="settings-sub-label">赔率偏好</div>
              <div className="settings-radio-col">
                <div className="settings-radio" onClick={() => setOddsColor('redup')}>
                  <Radio active={oddsColor === 'redup'} />
                  <span className="settings-odds-mark"><i className="fa-solid fa-caret-up" style={{ color: '#ef4444' }}></i> 红升</span>
                  <span className="settings-odds-mark"><i className="fa-solid fa-caret-down" style={{ color: '#22c55e' }}></i> 绿降</span>
                </div>
                <div className="settings-radio" onClick={() => setOddsColor('greenup')}>
                  <Radio active={oddsColor === 'greenup'} />
                  <span className="settings-odds-mark"><i className="fa-solid fa-caret-up" style={{ color: '#22c55e' }}></i> 绿升</span>
                  <span className="settings-odds-mark"><i className="fa-solid fa-caret-down" style={{ color: '#ef4444' }}></i> 红降</span>
                </div>
              </div>

              <div className="settings-sub-label">赛事排序</div>
              <div className="settings-radio-row">
                <div className="settings-radio" onClick={() => setMatchSort('time')}>
                  <Radio active={matchSort === 'time'} /> 时间排序
                </div>
                <div className="settings-radio" onClick={() => setMatchSort('league')}>
                  <Radio active={matchSort === 'league'} /> 联赛排序
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Version */}
        <div className="settings-card">
          <div className="settings-info-row">
            <span className="settings-info-label">当前版本</span>
            <span className="settings-info-value">1.0.0</span>
          </div>
        </div>

        <button className="settings-logout-btn" onClick={handleLogout}>退出登录</button>
      </div>
    </div>
  );
}
