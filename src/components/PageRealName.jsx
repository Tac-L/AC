import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageRealName() {
  const { goBack, showToast } = useApp();

  const [realName, setRealName] = useState('');

  const handleConfirm = () => {
    if (!realName.trim()) {
      showToast('请输入真实姓名！');
      return;
    }
    showToast('真实姓名绑定成功！');
  };

  return (
    <div className="app-page active" id="page-real-name">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-real-name-back" onClick={() => goBack('page-settings')}></i>
        <span className="activity-header-title">真实姓名</span>
        <div></div>
      </div>

      <div className="scroll-content realname-content">
        <div className="realname-label">绑定真实姓名</div>

        <div className="realname-input-group">
          <i className="fa-solid fa-user realname-input-icon"></i>
          <input
            className="realname-input"
            type="text"
            placeholder="请输入真实姓名"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
          />
        </div>

        <p className="realname-tip">真实姓名是取款重要信息，方便客服核对您的转账信息</p>

        <button className="realname-submit" onClick={handleConfirm}>确认</button>
      </div>
    </div>
  );
}
