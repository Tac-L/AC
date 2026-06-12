import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function PageWithdraw() {
  const { balance, updateBalance, goBack, showToast } = useApp();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pwdDigits, setPwdDigits] = useState(['', '', '', '']);
  const [showPwd, setShowPwd] = useState(false);

  // Set the initial balance to match the mockup image on component mount
  useEffect(() => {
    updateBalance(6684.98, false);
  }, []);

  const handleRefreshBalance = () => {
    updateBalance(6684.98, false);
    showToast('余额已刷新为 ¥6,684.98！');
  };

  const handleCollect = () => {
    showToast('余额一键归集成功！');
  };

  const handlePwdChange = (value, index) => {
    // Only allow single digits
    if (value !== '' && !/^\d$/.test(value)) return;

    const newPwd = [...pwdDigits];
    newPwd[index] = value;
    setPwdDigits(newPwd);

    // Auto-focus next input box
    if (value !== '' && index < 3) {
      const nextInput = document.getElementById(`pwd-input-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handlePwdKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (pwdDigits[index] === '') {
        // If current is empty, focus previous cell and clear it
        if (index > 0) {
          const prevInput = document.getElementById(`pwd-input-${index - 1}`);
          if (prevInput) {
            prevInput.focus();
            const newPwd = [...pwdDigits];
            newPwd[index - 1] = '';
            setPwdDigits(newPwd);
          }
        }
      } else {
        // Clear current cell
        const newPwd = [...pwdDigits];
        newPwd[index] = '';
        setPwdDigits(newPwd);
      }
    }
  };

  const handlePwdPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (/^\d{4}$/.test(pasteData)) {
      const digits = pasteData.split('');
      setPwdDigits(digits);
      // Focus the last input box
      const lastInput = document.getElementById('pwd-input-3');
      if (lastInput) lastInput.focus();
    }
  };

  const handleConfirmWithdraw = () => {
    const val = parseFloat(withdrawAmount) || 0;
    if (val <= 0) {
      showToast('请输入有效的取款金额！');
      return;
    }
    if (val > balance) {
      showToast('取款失败：取款金额超出可用系统余额！');
      return;
    }

    const passcode = pwdDigits.join('');
    if (passcode.length !== 4 || !/^\d{4}$/.test(passcode)) {
      showToast('⚠️ 取款密码必须是4位数字！');
      return;
    }

    updateBalance(-val);
    showToast(`🎉 提交取款申请成功！正在出款中：¥${val.toFixed(2)}`);
    // Clear inputs on success
    setWithdrawAmount('');
    setPwdDigits(['', '', '', '']);
  };

  const actualArrival = parseFloat(withdrawAmount) || 0;

  return (
    <div className="app-page active" id="page-withdraw">
      {/* Header Bar */}
      <div className="withdraw-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-withdraw-back" onClick={() => goBack('page-profile')}></i>
        <span className="withdraw-header-title">在线取款</span>
        <div></div> {/* Spacer for flex-between alignment */}
      </div>

      <div className="scroll-content" style={{ padding: '16px', paddingBottom: '30px' }}>
        {/* Balance & Collect Row */}
        <div className="withdraw-balance-row">
          <div className="withdraw-bal-left">
            <span>系统余额：</span>
            <span className="withdraw-bal-val">
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <i className="fa-solid fa-rotate" id="btn-refresh-withdraw-balance" onClick={handleRefreshBalance}></i>
          </div>
          <button className="withdraw-collect-btn" id="btn-withdraw-collect" onClick={handleCollect}>余额一键归集</button>
        </div>

        {/* VIPPay Wallet Card */}
        <div className="withdraw-card">
          <div className="withdraw-card-header">
            <div className="withdraw-card-brand">
              <svg width="30" height="30" viewBox="0 0 100 100" className="bank-logo-svg">
                {/* White background circle */}
                <circle cx="50" cy="50" r="48" fill="#ffffff" />
                {/* Green outer leaves/circle */}
                <path d="M 50,15 A 35,35 0 0,0 15,50 A 35,35 0 0,0 20,68 C 22,72 26,72 28,68 C 30,64 28,60 26,56 A 25,25 0 0,1 25,50 A 25,25 0 0,1 50,25 A 25,25 0 0,1 75,50 A 25,25 0 0,1 74,56 C 72,60 70,64 72,68 C 74,72 78,72 80,68 A 35,35 0 0,0 85,50 A 35,35 0 0,0 50,15 Z" fill="#2d8f44" />
                {/* Green leaves base junction */}
                <path d="M 50,75 L 43,68 C 45,67 47,67 49,67 L 49,60 L 51,60 L 51,67 C 53,67 55,67 57,68 Z" fill="#2d8f44" />
                {/* Red circle in center */}
                <circle cx="50" cy="48" r="18" fill="#e01b22" />
                {/* White emblem in red circle */}
                <rect x="42" y="40" width="16" height="16" stroke="#ffffff" strokeWidth="3" fill="none" rx="2" />
                <line x1="50" y1="35" x2="50" y2="40" stroke="#ffffff" strokeWidth="3" />
                <line x1="50" y1="56" x2="50" y2="61" stroke="#ffffff" strokeWidth="3" />
              </svg>
              <span>阿鲁科尔沁旗农村信用合作联社</span>
            </div>
            <button className="change-card-btn" onClick={() => showToast('更换收款卡功能正在开发中！')}>更换银行<br />卡</button>
          </div>
          <div className="withdraw-card-body">
            <div className="withdraw-info-line">
              <span className="info-label">收款人：</span>
              <span className="info-value">*试</span>
            </div>
            <div className="withdraw-info-line" style={{ marginTop: '6px' }}>
              <span className="info-label">卡号：</span>
              <span className="info-value">4125 **** 2311</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Amount Input */}
        <div className="withdraw-input-section">
          <span className="withdraw-section-label">取款金额：</span>
          <div className="withdraw-input-box">
            <input 
              type="text" 
              id="withdraw-input-amount" 
              placeholder="10-10000" 
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Withdrawal Password Section */}
        <div className="withdraw-label-row">
          <span className="withdraw-section-label">取款密码：</span>
          <i 
            className={showPwd ? "fa-regular fa-eye eye-toggle-icon" : "fa-regular fa-eye-slash eye-toggle-icon"} 
            onClick={() => setShowPwd(!showPwd)}
          ></i>
        </div>
        <div className="passcode-inputs-container">
          {pwdDigits.map((digit, idx) => (
            <input
              key={idx}
              id={`pwd-input-${idx}`}
              type={showPwd ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="1"
              className="passcode-input-cell"
              value={digit}
              onChange={(e) => handlePwdChange(e.target.value, idx)}
              onKeyDown={(e) => handlePwdKeyDown(e, idx)}
              onPaste={idx === 0 ? handlePwdPaste : undefined}
              autoComplete="new-password"
            />
          ))}
        </div>
        <div className="withdraw-warning-row">
          <i className="fa-solid fa-circle-exclamation warning-icon"></i>
          <span>取款密码必须是4位数字</span>
        </div>

        {/* Fee Details List */}
        <div className="withdraw-details-list">
          <div className="detail-row">
            <span>手续费：</span>
            <span className="detail-val">0.00</span>
          </div>
          <div className="detail-row">
            <span>行政费：</span>
            <span className="detail-val">0.00</span>
          </div>
          <div className="detail-row">
            <span>优惠金额：</span>
            <span className="detail-val">0.00</span>
          </div>
          <div className="detail-row">
            <span>扣除费用总计：</span>
            <span className="detail-val">0.00</span>
          </div>
          <div className="detail-audit-link" onClick={() => showToast('暂无稽核详情记录')}>
            <span>查看稽核详情 &gt;</span>
          </div>
          <div className="detail-row actual-arrival">
            <span>实际到账：</span>
            <span className="detail-val highlight" id="withdraw-actual-arrival">
              {actualArrival.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button className="withdraw-submit-btn" id="btn-withdraw-submit" onClick={handleConfirmWithdraw}>确认提交</button>
      </div>
    </div>
  );
}
