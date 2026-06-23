import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageLogin() {
  const { login, oneClickRegister, setActivePage, showToast } = useApp();

  const [method, setMethod] = useState('phone'); // 'phone' | 'account'
  const [phoneMode, setPhoneMode] = useState('code'); // 'code' | 'password'

  // phone-login fields
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [phonePwd, setPhonePwd] = useState('');

  // account-login fields
  const [account, setAccount] = useState('');
  const [accPwd, setAccPwd] = useState('');
  const [showAccPwd, setShowAccPwd] = useState(false);
  const [remember, setRemember] = useState(true);

  const handleGetCode = () => {
    if (!phone) {
      showToast('请先输入手机号！');
      return;
    }
    showToast('验证码已发送，请注意查收！');
  };

  const handleLogin = () => {
    login();
    showToast('登录成功，欢迎回来！');
  };

  return (
    <div className="app-page active auth-page" id="page-login">
      {/* Brand logo */}
      <div className="auth-logo-row">
        <img src="assets/logo-b.png" alt="logo" className="auth-logo" />
      </div>

      {/* Promo banner */}
      <div className="auth-promo">
        <div className="auth-promo-left">
          <div className="auth-promo-title">VIP钱包首存100送38</div>
          <div className="auth-promo-sub">VIPpay钱包首提送8元</div>
          <span className="auth-promo-btn">立即领取</span>
        </div>
        <div className="auth-promo-medal">
          <i className="fa-solid fa-medal"></i>
          <span>VIP</span>
        </div>
      </div>

      <div className="auth-body">
        {/* Method tabs: 手机登录 first, 账号登录 second */}
        <div className="auth-method-tabs">
          <div
            className={`auth-method-tab ${method === 'phone' ? 'active' : ''}`}
            onClick={() => setMethod('phone')}
          >
            手机登录
          </div>
          <div
            className={`auth-method-tab ${method === 'account' ? 'active' : ''}`}
            onClick={() => setMethod('account')}
          >
            账号登录
          </div>
        </div>

        {method === 'phone' ? (
          <>
            {/* Phone input */}
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

            {/* Phone sub-mode tabs */}
            <div className="auth-mode-tabs">
              <div
                className={`auth-mode-tab ${phoneMode === 'code' ? 'active' : ''}`}
                onClick={() => setPhoneMode('code')}
              >
                <i className="fa-regular fa-comment-dots"></i> 验证码登录
              </div>
              <div
                className={`auth-mode-tab ${phoneMode === 'password' ? 'active' : ''}`}
                onClick={() => setPhoneMode('password')}
              >
                <i className="fa-solid fa-lock"></i> 密码登录
              </div>
            </div>

            {phoneMode === 'code' ? (
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
            ) : (
              <div className="auth-input-group">
                <input
                  className="auth-input"
                  type="password"
                  placeholder="请输入登录密码"
                  value={phonePwd}
                  onChange={(e) => setPhonePwd(e.target.value)}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {/* Account input */}
            <div className="auth-input-group">
              <span className="auth-input-icon"><i className="fa-regular fa-user"></i></span>
              <input
                className="auth-input"
                type="text"
                placeholder="请输入账号"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />
            </div>

            {/* Password input */}
            <div className="auth-input-group">
              <span className="auth-input-icon"><i className="fa-solid fa-lock"></i></span>
              <input
                className="auth-input"
                type={showAccPwd ? 'text' : 'password'}
                placeholder="请输入密码"
                value={accPwd}
                onChange={(e) => setAccPwd(e.target.value)}
              />
              <span className="auth-eye" onClick={() => setShowAccPwd((v) => !v)}>
                <i className={`fa-regular ${showAccPwd ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </span>
            </div>

            {/* Remember / forgot row */}
            <div className="auth-account-row">
              <label className="auth-remember" onClick={() => setRemember((v) => !v)}>
                <span className={`auth-checkbox ${remember ? 'checked' : ''}`}>
                  {remember && <i className="fa-solid fa-check"></i>}
                </span>
                记住密码
              </label>
              <span className="auth-forgot" onClick={() => showToast('提示：请联系在线客服找回密码！')}>忘记密码?</span>
            </div>
          </>
        )}

        {/* Login button */}
        <button className="auth-submit-btn" onClick={handleLogin}>立即登录</button>

        {/* One-click register button */}
        <button className="auth-guest-btn" onClick={oneClickRegister}>一键注册</button>

        {/* Register link */}
        <div className="auth-switch-row">
          没有账号？
          <span className="auth-switch-link" onClick={() => setActivePage('page-register')}>立即注册 &gt;</span>
        </div>
      </div>
    </div>
  );
}
