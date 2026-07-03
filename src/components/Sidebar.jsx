import React from 'react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { balance, updateBalance, phoneSkin, setPhoneSkin, showToast } = useApp();

  const skins = ['phone-dark', 'phone-gold', 'phone-purple', 'phone-coral'];

  const handleDeposit = () => {
    updateBalance(500);
    showToast('充值成功 ¥500！余额已同步打入虚拟账户。');
  };

  const handleToggleSkin = () => {
    const currentIdx = skins.indexOf(phoneSkin);
    const nextIdx = (currentIdx + 1) % skins.length;
    setPhoneSkin(skins[nextIdx]);
  };

  return (
    <div className="control-panel">
      <div className="logo">
        <i className="fa-solid fa-gem icon-logo"></i>
        <h1>AC娛樂城</h1>
        <p>AC CASINO & ENTERTAINMENT</p>
      </div>
      
      <div className="desc-card">
        <h3>💡 通用娱乐城风格</h3>
        <ul>
          <li><strong>模拟余额打通</strong>：所有界面共享充值与投注余额。在体育及六合彩投注均可扣除余额。</li>
          <li><strong>游戏大厅</strong>：一比一还原首页布局。包含横幅活动、个人信息栏、左侧游戏分类侧栏、右侧热门游戏格。</li>
          <li><strong>一分六合彩</strong>：点击游戏列表中的“一分六合彩”可切换至高度还原的投注页面，包含自动开奖倒计时、滚球号更新、单/双/大/小投注盘口、筹码选择及投注功能。</li>
          <li><strong>短剧播放器</strong>：竖屏短片模式，配有点赞/留言浮窗，可通过按键或上下滑动无缝切换多部短剧。</li>
          <li><strong>视频大厅</strong>：顶部横向分类左右滑动，包含视频缩略图，点击可播放。</li>
          <li><strong>分流聊天室</strong>：1/3上方推荐，2/3下方聊天弹幕流。</li>
        </ul>
      </div>

      <div className="simulator-controls">
        <h3>🎛️ 模拟账户操作</h3>
        <div className="balance-adjuster">
          <span>当前虚拟余额: <strong>¥{balance.toFixed(2)}</strong></span>
          <button id="btn-sidebar-deposit" className="control-btn" onClick={handleDeposit}>
            <i className="fa-solid fa-wallet"></i> 一键充值 ¥500
          </button>
        </div>
        <button id="btn-theme-toggle" className="control-btn" onClick={handleToggleSkin}>
          <i className="fa-solid fa-circle-half-stroke"></i> 切换手机皮肤
        </button>
      </div>
      
      <div className="credits">
        <p>© 2026 Black Panther Entertainment Space</p>
      </div>
    </div>
  );
}
