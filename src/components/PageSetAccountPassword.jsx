import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageSetAccountPassword() {
  const { goBack, showToast, accountCredential, setAccountCredential } = useApp();

  const isSet = !!accountCredential;

  // "Set" flow fields (first time) — matches the pill-style inputs
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // "Change" flow fields (already set) — old / new / confirm
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newConfirm, setNewConfirm] = useState('');

  const handleSet = () => {
    if (!account || !password || !confirm) {
      showToast('请完整填写帐号和密码！');
      return;
    }
    if (!/^[A-Za-z0-9]{6,12}$/.test(account)) {
      showToast('账号必须为6-12位英文和数字组合！');
      return;
    }
    if (password.length < 8 || password.length > 18) {
      showToast('登录密码长度为8-18位！');
      return;
    }
    if (password !== confirm) {
      showToast('两次输入的密码不一致！');
      return;
    }
    setAccountCredential({ account, password });
    showToast('帐号密码设置成功！');
    goBack('page-account-settings');
  };

  const handleChange = () => {
    if (!oldPwd || !newPwd || !newConfirm) {
      showToast('请完整填写密码信息！');
      return;
    }
    if (oldPwd !== accountCredential.password) {
      showToast('旧密码不正确！');
      return;
    }
    if (newPwd.length < 8 || newPwd.length > 18) {
      showToast('登录密码长度为8-18位！');
      return;
    }
    if (newPwd !== newConfirm) {
      showToast('两次输入的密码不一致！');
      return;
    }
    setAccountCredential({ ...accountCredential, password: newPwd });
    showToast('密码修改成功！');
    goBack('page-account-settings');
  };

  return (
    <div className="app-page active" id="page-set-account-password">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-set-account-password-back" onClick={() => goBack('page-account-settings')}></i>
        <span className="activity-header-title">设置帐号密码</span>
        <div></div>
      </div>

      <div className="scroll-content settings-content">
        <div className="settings-card">
          {!isSet ? (
            <div className="settings-phone-body">
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

              <button className="settings-phone-submit" onClick={handleSet}>设置</button>
            </div>
          ) : (
            <div className="setpw-form">
              <div className="setpw-row">
                <span className="setpw-label">账号</span>
                <span className="setpw-value">{accountCredential.account}</span>
              </div>
              <div className="setpw-row">
                <span className="setpw-label">旧密码</span>
                <input
                  className="setpw-input"
                  type="password"
                  placeholder="请输入您的旧密码"
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                />
              </div>
              <div className="setpw-row">
                <span className="setpw-label">密码</span>
                <input
                  className="setpw-input"
                  type="password"
                  placeholder="请输入您的新密码"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>
              <div className="setpw-row">
                <span className="setpw-label">确认密码</span>
                <input
                  className="setpw-input"
                  type="password"
                  placeholder="请再次输入您的密码"
                  value={newConfirm}
                  onChange={(e) => setNewConfirm(e.target.value)}
                />
              </div>

              <button className="settings-phone-submit" onClick={handleChange}>设置</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
