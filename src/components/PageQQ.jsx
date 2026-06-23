import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageQQ() {
  const { goBack, showToast } = useApp();

  const [qq, setQq] = useState('');

  const handleConfirm = () => {
    if (!qq.trim()) {
      showToast('请输入QQ号码！');
      return;
    }
    showToast('QQ号码绑定成功！');
  };

  return (
    <div className="app-page active" id="page-qq">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-qq-back" onClick={() => goBack('page-settings')}></i>
        <span className="activity-header-title">QQ号码</span>
        <div></div>
      </div>

      <div className="scroll-content realname-content">
        <div className="realname-label">绑定QQ号码</div>

        <div className="realname-input-group">
          <i className="fa-brands fa-qq realname-input-icon"></i>
          <input
            className="realname-input"
            type="tel"
            placeholder="请输入QQ号码"
            value={qq}
            onChange={(e) => setQq(e.target.value)}
          />
        </div>

        <p className="realname-tip">QQ号码方便客服及时联系到您，为您提供服务和获奖信息</p>

        <button className="realname-submit" onClick={handleConfirm}>确认</button>
      </div>
    </div>
  );
}
