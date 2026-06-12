import React from 'react';
import { useApp } from '../context/AppContext';

export default function PageSettings() {
  const { goBack, showToast } = useApp();

  const handleRow = (name) => {
    showToast(`提示：【${name}】功能正在开发中，敬请期待！`);
  };

  const group1 = [
    {
      name: '会员账号',
      icon: <i className="fa-solid fa-user" style={{ color: '#94a3b8' }}></i>,
      value: 'ht0326',
      arrow: false
    },
    {
      name: '真实姓名',
      icon: <i className="fa-solid fa-user" style={{ color: '#ef4444' }}></i>,
      value: '未绑定',
      arrow: true
    },
    {
      name: '手机',
      icon: <i className="fa-solid fa-mobile-screen-button" style={{ color: '#3b82f6' }}></i>,
      value: '未添加',
      arrow: true
    },
    {
      name: 'QQ',
      icon: <i className="fa-brands fa-qq" style={{ color: '#3b82f6' }}></i>,
      value: '未添加',
      arrow: true
    }
  ];

  const group2 = [
    {
      name: '登录密码',
      icon: <i className="fa-solid fa-key" style={{ color: '#22c55e' }}></i>,
      value: '',
      arrow: true
    },
    {
      name: '取款密码',
      icon: <i className="fa-solid fa-credit-card" style={{ color: '#ef4444' }}></i>,
      value: '未设置',
      arrow: true
    },
    {
      name: '两步验证',
      icon: <i className="fa-brands fa-google" style={{ color: '#4285f4' }}></i>,
      value: '未绑定',
      arrow: true
    }
  ];

  const renderRow = (row, idx) => (
    <div
      key={idx}
      className="settings-row"
      onClick={() => row.arrow && handleRow(row.name)}
    >
      <div className="settings-row-left">
        <span className="settings-row-icon">{row.icon}</span>
        <span className="settings-row-name">{row.name}</span>
      </div>
      <div className="settings-row-right">
        {row.value && <span className="settings-row-value">{row.value}</span>}
        {row.arrow && <i className="fa-solid fa-chevron-right settings-row-arrow"></i>}
      </div>
    </div>
  );

  return (
    <div className="app-page active" id="page-settings">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-activity-back" onClick={() => goBack('page-profile')}></i>
        <span className="activity-header-title">个人设置</span>
        <div></div>
      </div>

      <div className="scroll-content settings-content">
        <div className="settings-card">
          {group1.map(renderRow)}
        </div>

        <div className="settings-card">
          {group2.map(renderRow)}
        </div>
      </div>
    </div>
  );
}
