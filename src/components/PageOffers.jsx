import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageOffers() {
  const { goBack, showToast } = useApp();

  // Top horizontal tabs
  const tabs = [
    { key: 'all', label: '全部优惠' },
    { key: 'hot', label: '热门推荐' },
    { key: 'newbie', label: '新人攻略' },
    { key: 'agent', label: '代理专属' },
    { key: 'egame', label: '电子专题' }
  ];
  const [activeTab, setActiveTab] = useState('all');

  // Promotion banner cards
  const promos = [
    { id: 'signin', tag: '热门', cats: ['hot'], title: '每日签到送豪礼', desc: '连续充值连续送', accent: '100%' },
    { id: 'deposit', tag: '热门', cats: ['hot'], title: '每日存款次日送', desc: '最高送18588元' },
    { id: 'mystery', tag: '热门', cats: ['hot'], title: '神秘彩金从天降', desc: '天降财神，金运来袭' },
    { id: 'comeback', tag: '热门', cats: ['hot'], title: '老友回归赠礼', desc: '8888元豪礼相迎' },
    { id: 'vip', tag: '热门', cats: ['hot'], title: 'VIP升级模式', desc: '晋级礼金+周月俸禄，终身尊享', accent: 'VIP' },
    { id: 'newbie_gift', tag: '新人', cats: ['newbie'], title: '新人首充豪礼', desc: '首存最高送1888元' },
    { id: 'newbie_guide', tag: '新人', cats: ['newbie'], title: '新人专属攻略', desc: '手把手教你领福利' },
    { id: 'agent_rebate', tag: '代理', cats: ['agent'], title: '代理高额返佣', desc: '日结无上限，躺赚不停' },
    { id: 'egame_rescue', tag: '电子', cats: ['egame'], title: '电子游艺救援金', desc: '每日最高领5888元' },
    { id: 'egame_rebate', tag: '电子', cats: ['egame'], title: '电子无限返水', desc: '高比例返水，越玩越赚' }
  ];

  const filteredPromos = promos.filter(p => activeTab === 'all' || p.cats.includes(activeTab));

  return (
    <div className="app-page active" id="page-offers">
      {/* Header Bar */}
      <div className="activity-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-offers-back" onClick={() => goBack('page-games')}></i>
        <span className="activity-header-title">优惠活动</span>
        <div></div>
      </div>

      {/* Top horizontal scrollable tabs */}
      <div className="offers-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.key}
            className={`offers-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Promotion cards list */}
      <div className="offers-list scroll-content">
        {filteredPromos.map((promo) => (
          <div
            key={promo.id}
            className="offers-card"
            onClick={() => showToast(`提示：【${promo.title}】活动详情正在对接中，敬请期待！`)}
          >
            <span className="offers-card-tag">{promo.tag}</span>
            <div className="offers-card-text">
              <h3 className="offers-card-title">{promo.title}</h3>
              <p className="offers-card-desc">{promo.desc}</p>
            </div>
            {promo.accent && <span className="offers-card-accent">{promo.accent}</span>}
            <i className="fa-solid fa-gift offers-card-icon"></i>
          </div>
        ))}
      </div>
    </div>
  );
}
