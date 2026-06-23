import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageLoginPassword() {
  const { goBack, showToast } = useApp();

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    if (!oldPwd || !newPwd || !confirm) {
      showToast('请完整填写密码信息！');
      return;
    }
    if (newPwd !== confirm) {
      showToast('两次输入的密码不一致！');
      return;
    }
    showToast('登录密码修改成功！');
  };

  const rows = [
    { label: '原密码', placeholder: '请输入原密码', value: oldPwd, setValue: setOldPwd, show: showOld, setShow: setShowOld },
    { label: '新密码', placeholder: '请输入新密码', value: newPwd, setValue: setNewPwd, show: showNew, setShow: setShowNew },
    { label: '确认密码', placeholder: '请确认新密码', value: confirm, setValue: setConfirm, show: showConfirm, setShow: setShowConfirm },
  ];

  return (
    <div className="app-page active" id="page-login-password">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-login-password-back" onClick={() => goBack('page-settings')}></i>
        <span className="activity-header-title">登录密码</span>
        <div></div>
      </div>

      <div className="scroll-content loginpw-content">
        <div className="loginpw-card">
          {rows.map((row, idx) => (
            <div className="loginpw-row" key={idx}>
              <i className="fa-solid fa-lock loginpw-icon"></i>
              <span className="loginpw-label">{row.label}</span>
              <input
                className="loginpw-input"
                type={row.show ? 'text' : 'password'}
                placeholder={row.placeholder}
                value={row.value}
                onChange={(e) => row.setValue(e.target.value)}
              />
              <span className="loginpw-eye" onClick={() => row.setShow((v) => !v)}>
                <i className={`fa-regular ${row.show ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </span>
            </div>
          ))}
        </div>

        <button className="loginpw-submit" onClick={handleConfirm}>确认</button>
      </div>
    </div>
  );
}
