import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageRegister() {
  const { login, setActivePage, showToast } = useApp();

  const [method, setMethod] = useState('phone'); // 'phone' | 'account'

  // phone-register fields
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phonePwd, setPhonePwd] = useState('');
  const [phoneInvite, setPhoneInvite] = useState('');

  // account-register fields
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accInvite, setAccInvite] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleGetCode = () => {
    if (!phone) {
      showToast('请先输入手机号！');
      return;
    }
    showToast('验证码已发送，请注意查收！');
  };

  const handleRegister = () => {
    if (method === 'phone') {
      if (!phone || !code || !phonePwd) {
        showToast('请完整填写注册信息！');
        return;
      }
    } else {
      if (!account || !password || !confirm) {
        showToast('请完整填写注册信息！');
        return;
      }
      if (password !== confirm) {
        showToast('两次输入的密码不一致！');
        return;
      }
    }
    login();
    showToast('注册成功，欢迎加入！');
  };

  const browseAround = () => {
    setActivePage('page-dramas'); // 随便逛逛 → 回到短剧页面
  };

  return (
    <div className="app-page active auth-page" id="page-register">
      {/* Brand logo */}
      <div className="auth-logo-row">
        <img src="assets/logo-b.png" alt="logo" className="auth-logo" />
      </div>

      {/* Promo banner image */}
      <div className="auth-promo-img-wrap">
        <img src="assets/image 19.png" alt="注册活动" className="auth-promo-img" />
      </div>

      <div className="auth-body">
        {/* Method tabs: 手机注册 first, 账号注册 second */}
        <div className="auth-method-tabs">
          <div
            className={`auth-method-tab ${method === 'phone' ? 'active' : ''}`}
            onClick={() => setMethod('phone')}
          >
            手机注册
          </div>
          <div
            className={`auth-method-tab ${method === 'account' ? 'active' : ''}`}
            onClick={() => setMethod('account')}
          >
            账号注册
          </div>
        </div>

        {method === 'phone' ? (
          <>
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

            <div className="auth-input-group">
              <input
                className="auth-input"
                type="password"
                placeholder="请输入密码"
                value={phonePwd}
                onChange={(e) => setPhonePwd(e.target.value)}
              />
            </div>

            <div className="auth-input-group">
              <input
                className="auth-input"
                type="text"
                placeholder="请输入邀请码(选填)"
                value={phoneInvite}
                onChange={(e) => setPhoneInvite(e.target.value)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="auth-input-group">
              <span className="auth-input-icon"><i className="fa-regular fa-user"></i></span>
              <input
                className="auth-input"
                type="text"
                placeholder="账号必须为6-12位英文和数字组合"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />
            </div>

            <div className="auth-input-group">
              <span className="auth-input-icon"><i className="fa-solid fa-lock"></i></span>
              <input
                className="auth-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="登录密码长度为8-18位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="auth-eye" onClick={() => setShowPwd((v) => !v)}>
                <i className={`fa-regular ${showPwd ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </span>
            </div>

            <div className="auth-input-group">
              <span className="auth-input-icon"><i className="fa-solid fa-lock"></i></span>
              <input
                className="auth-input"
                type={showConfirm ? 'text' : 'password'}
                placeholder="请再次输入密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <span className="auth-eye" onClick={() => setShowConfirm((v) => !v)}>
                <i className={`fa-regular ${showConfirm ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </span>
            </div>

            <div className="auth-input-group">
              <span className="auth-input-icon"><i className="fa-solid fa-user-plus"></i></span>
              <input
                className="auth-input"
                type="text"
                placeholder="请输入邀请码(选填)"
                value={accInvite}
                onChange={(e) => setAccInvite(e.target.value)}
              />
            </div>
          </>
        )}

        <button className="auth-submit-btn" onClick={handleRegister}>注册</button>

        <div className="auth-switch-row">
          已有账号？
          <span className="auth-switch-link" onClick={() => setActivePage('page-login')}>立即登录 &gt;</span>
        </div>

        <div className="auth-browse" onClick={browseAround}>
          <i className="fa-solid fa-compass"></i> 随便逛逛
        </div>
      </div>
    </div>
  );
}
