import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageBindPhone() {
  const { goBack, showToast } = useApp();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const handleGetCode = () => {
    if (!phone) {
      showToast('请先输入手机号！');
      return;
    }
    showToast('验证码已发送，请注意查收！');
  };

  const handleBindPhone = () => {
    if (!phone || !code) {
      showToast('请填写手机号和验证码！');
      return;
    }
    showToast('手机号绑定成功！');
  };

  return (
    <div className="app-page active" id="page-bind-phone">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-bind-phone-back" onClick={() => goBack('page-settings')}></i>
        <span className="activity-header-title">绑定手机</span>
        <div></div>
      </div>

      <div className="scroll-content settings-content">
        <div className="settings-card">
          <div className="settings-phone-body">
            <div className="auth-input-group">
              <span className="auth-country-code">+86</span>
              <input
                className="auth-input"
                type="tel"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="auth-input-group">
              <input
                className="auth-input"
                type="tel"
                placeholder="请输入短信验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="auth-code-btn" onClick={handleGetCode}>获取验证码</button>
            </div>

            <button className="settings-phone-submit" onClick={handleBindPhone}>确定绑定</button>
          </div>
        </div>
      </div>
    </div>
  );
}
