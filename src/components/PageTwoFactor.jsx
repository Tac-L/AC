import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// Generate a random base32 secret key (display only — not a real TOTP secret).
function randomSecret(len = 32) {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += BASE32[Math.floor(Math.random() * BASE32.length)];
  }
  return s;
}

// Small seeded PRNG so the fake QR pattern is stable for a given secret.
function makePrng(seedStr) {
  let h = 1779033703;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// Build a QR-looking module matrix: three finder patterns + pseudo-random fill.
function buildQrMatrix(secret, size = 25) {
  const rng = makePrng(secret);
  const m = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => rng() > 0.5)
  );

  const stampFinder = (top, left) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = top + r;
        const cc = left + c;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          m[rr][cc] = false; // white separator
        } else {
          const border = r === 0 || r === 6 || c === 0 || c === 6;
          const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          m[rr][cc] = border || core;
        }
      }
    }
  };

  stampFinder(0, 0);
  stampFinder(0, size - 7);
  stampFinder(size - 7, 0);
  return m;
}

export default function PageTwoFactor() {
  const { goBack, showToast } = useApp();

  const [code, setCode] = useState('');
  const secret = useMemo(() => randomSecret(), []);
  const matrix = useMemo(() => buildQrMatrix(secret), [secret]);
  const size = matrix.length;

  const handleCopy = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(secret).catch(() => {});
    }
    showToast('密钥已复制！');
  };

  // Display-only: never actually binds, stays 未绑定.
  const handleBind = () => {
    if (!code.trim()) {
      showToast('请输入验证码！');
      return;
    }
    showToast('两步验证功能正在开发中，敬请期待！');
  };

  return (
    <div className="app-page active" id="page-two-factor">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-two-factor-back" onClick={() => goBack('page-settings')}></i>
        <span className="activity-header-title">两步验证</span>
        <div></div>
      </div>

      <div className="scroll-content twofa-content">
        <div className="twofa-section-title">设置身份验证器</div>

        <div className="twofa-card">
          <ol className="twofa-steps">
            <li>从 App Store 或 安卓市场 安装"Google 身份验证器"应用</li>
            <li>在该应用中选择设置帐号</li>
            <li>选择扫描二维码</li>
          </ol>

          <div className="twofa-qr">
            <svg viewBox={`0 0 ${size} ${size}`} width="180" height="180" shapeRendering="crispEdges">
              <rect x="0" y="0" width={size} height={size} fill="#fff" />
              {matrix.map((row, r) =>
                row.map((on, c) =>
                  on ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#000" /> : null
                )
              )}
            </svg>
          </div>

          <div className="twofa-or">或者 复制此密钥至验证器</div>

          <div className="twofa-secret">
            <span className="twofa-secret-key">{secret}</span>
            <span className="twofa-copy" onClick={handleCopy}>
              <i className="fa-regular fa-copy"></i>
            </span>
          </div>
        </div>

        <div className="twofa-verify">
          <span className="twofa-verify-label">验证码</span>
          <input
            className="twofa-verify-input"
            type="tel"
            placeholder="请输入验证码"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="twofa-bind-btn" onClick={handleBind}>绑定</button>
        </div>
      </div>
    </div>
  );
}
