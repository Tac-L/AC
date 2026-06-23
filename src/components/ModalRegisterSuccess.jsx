import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function ModalRegisterSuccess() {
  const { registerSuccessData, closeRegisterSuccess, showToast } = useApp();
  const [revealed, setRevealed] = useState(false);

  if (!registerSuccessData) return null;

  const { account, password } = registerSuccessData;

  const handleCopy = () => {
    const text = `用户名: ${account}\n密码: ${password}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast('已复制用户名和密码！');
  };

  return (
    <div className="reg-success-overlay active" id="register-success-modal">
      <div className="reg-success-card">
        <div className="reg-success-title">感谢您的注册！</div>

        {/* Credential box: 用户名 / 密码 stacked, copy on the right */}
        <div className="reg-success-cred">
          <div className="reg-success-cred-rows">
            <div className="reg-success-cred-block">
              <span className="reg-success-label">用户名:</span>
              <span className="reg-success-value">{account}</span>
            </div>
            <div className="reg-success-cred-block">
              <span className="reg-success-label">密码:</span>
              <span className={`reg-success-value reg-success-pwd ${revealed ? '' : 'masked'}`}>
                {revealed ? password : '••••••••'}
              </span>
              <i
                className={`fa-regular ${revealed ? 'fa-eye' : 'fa-eye-slash'} reg-success-info`}
                onClick={() => setRevealed((v) => !v)}
              ></i>
            </div>
          </div>
          <button className="reg-success-copy" onClick={handleCopy}>
            <i className="fa-regular fa-copy"></i>
            <span>复制</span>
          </button>
        </div>

        <div className="reg-success-warn">不要忘记保存您的用户名和密码！</div>

        {/* Save button */}
        <div className="reg-success-row">
          <button
            className="reg-success-save-btn"
            onClick={() => showToast('账号信息已截图保存！')}
          >
            <i className="fa-solid fa-camera"></i> 一键截图保存
          </button>
        </div>

        {/* Enter app */}
        <button className="reg-success-enter-btn" onClick={closeRegisterSuccess}>
          进入游戏
        </button>
      </div>
    </div>
  );
}
