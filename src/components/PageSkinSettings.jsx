import React from 'react';
import { useApp } from '../context/AppContext';

export default function PageSkinSettings() {
  const { goBack, selectedSkin, setSelectedSkin, showToast } = useApp();

  const skinOptions = [
    { value: 1, label: '浅蓝', color: '#38bdf8', desc: '清新明亮的天空浅蓝色调' },
    { value: 2, label: '深蓝 (默认)', color: '#1d4ed8', desc: '经典稳重的系统默认深蓝色调' },
    { value: 3, label: '午夜蓝', color: '#0f172a', desc: '静谧深邃的暗夜蓝黑色调' },
    { value: 4, label: '午夜紫', color: '#6b21a8', desc: '高贵神秘的午夜暗紫色调' },
  ];

  const handleSelectSkin = (value, label) => {
    setSelectedSkin(value);
    showToast(`皮肤已选择为：${label}`);
  };

  return (
    <div className="app-page active" id="page-skin-settings">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-skin-settings-back" onClick={() => goBack('page-profile')}></i>
        <span className="activity-header-title">皮肤设置</span>
        <div></div>
      </div>

      <div className="scroll-content settings-content">


        <div className="settings-card">
          {skinOptions.map((opt) => {
            const isSelected = selectedSkin === opt.value;
            return (
              <div
                key={opt.value}
                className="settings-row"
                onClick={() => handleSelectSkin(opt.value, opt.label)}
                style={{ cursor: 'pointer', padding: '14px 16px' }}
              >
                <div className="settings-row-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: opt.color,
                      display: 'inline-block',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      border: '1.5px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.88rem', color: '#1e293b', fontWeight: '600' }}>{opt.label}</span>
                    <span style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>{opt.desc}</span>
                  </div>
                </div>
                <div className="settings-row-right">
                  <span className={`settings-radio-dot ${isSelected ? 'checked' : ''}`}></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
