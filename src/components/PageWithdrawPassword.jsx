import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

const PIN_LENGTH = 4;

// A single 取款密码 field: a label, an eye toggle, and PIN_LENGTH boxes.
function PinField({ label, value, onChange, show, onToggleShow }) {
  const inputsRef = useRef([]);

  const handleChange = (idx, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1); // keep only the last typed digit
    const chars = value.split('');
    chars[idx] = digit;
    const next = chars.join('').slice(0, PIN_LENGTH);
    onChange(next);
    if (digit && idx < PIN_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="wpw-field">
      <div className="wpw-field-head">
        <span className="wpw-field-label">{label}</span>
        <span className="wpw-eye" onClick={onToggleShow}>
          <i className={`fa-regular ${show ? 'fa-eye' : 'fa-eye-slash'}`}></i>
        </span>
      </div>
      <div className="wpw-boxes">
        {Array.from({ length: PIN_LENGTH }).map((_, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            className="wpw-box"
            type={show ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={1}
            value={value[idx] || ''}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
          />
        ))}
      </div>
    </div>
  );
}

export default function PageWithdrawPassword() {
  const { goBack, showToast, withdrawPassword, setWithdrawPassword } = useApp();

  const isSet = !!withdrawPassword;

  // "Set" flow (未设置): 取款密码 + 确认取款密码
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  // "Change" flow (已设置): 原取款密码 + 新取款密码 + 确认新取款密码
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newConfirm, setNewConfirm] = useState('');

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showNewConfirm, setShowNewConfirm] = useState(false);

  const handleSet = () => {
    if (pwd.length < PIN_LENGTH || confirm.length < PIN_LENGTH) {
      showToast(`请输入${PIN_LENGTH}位取款密码！`);
      return;
    }
    if (pwd !== confirm) {
      showToast('两次输入的取款密码不一致！');
      return;
    }
    setWithdrawPassword(pwd);
    showToast('取款密码设置成功！');
    goBack('page-settings');
  };

  const handleChange = () => {
    if (oldPwd.length < PIN_LENGTH || newPwd.length < PIN_LENGTH || newConfirm.length < PIN_LENGTH) {
      showToast(`请输入${PIN_LENGTH}位取款密码！`);
      return;
    }
    if (oldPwd !== withdrawPassword) {
      showToast('原取款密码不正确！');
      return;
    }
    if (newPwd !== newConfirm) {
      showToast('两次输入的取款密码不一致！');
      return;
    }
    setWithdrawPassword(newPwd);
    showToast('取款密码修改成功！');
    goBack('page-settings');
  };

  return (
    <div className="app-page active" id="page-withdraw-password">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-withdraw-password-back" onClick={() => goBack('page-settings')}></i>
        <span className="activity-header-title">取款密码</span>
        <div></div>
      </div>

      <div className="scroll-content wpw-content">
        {!isSet ? (
          <>
            <PinField label="取款密码" value={pwd} onChange={setPwd} show={showPwd} onToggleShow={() => setShowPwd((v) => !v)} />
            <PinField label="确认取款密码" value={confirm} onChange={setConfirm} show={showConfirm} onToggleShow={() => setShowConfirm((v) => !v)} />
            <button className="wpw-submit" onClick={handleSet}>确认</button>
          </>
        ) : (
          <>
            <PinField label="原取款密码" value={oldPwd} onChange={setOldPwd} show={showOld} onToggleShow={() => setShowOld((v) => !v)} />
            <PinField label="新取款密码" value={newPwd} onChange={setNewPwd} show={showNew} onToggleShow={() => setShowNew((v) => !v)} />
            <PinField label="确认新取款密码" value={newConfirm} onChange={setNewConfirm} show={showNewConfirm} onToggleShow={() => setShowNewConfirm((v) => !v)} />
            <button className="wpw-submit" onClick={handleChange}>确认</button>
          </>
        )}
      </div>
    </div>
  );
}
