import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function PageMail() {
  const { setActivePage, showToast } = useApp();

  // Active tab state: 'inbox' or 'outbox'
  const [activeTab, setActiveTab] = useState('inbox');

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Read states (mock read state for announcements)
  const [readIds, setReadIds] = useState([]);

  // Active modal details state: null, 'warning', or 'promo'
  const [activeModal, setActiveModal] = useState(null);

  const announcements = [
    {
      id: 'warning',
      title: '【最新公告】⚠️【 谨防被骗·通知 】⚠️',
      time: '3个月前',
      popupTitle: '⚠️【 谨防被骗·通知 】⚠️',
      timeText: '系统于 2026-03-13 20:13:54 (美东时间)发表 -3个月前',
      content: '尊敬的会员：您好！为防止被骗/被盗用，任何钱包平台的客服都不会主动通过社交软件添加用户好友。如有人自称【钱包客服】，以【资金风控，账户异常】等理由索要账号、密码等信息，均为诈骗！请立即拉黑举报！切勿泄露任何个人信息，谨防财产损失！'
    },
    {
      id: 'promo',
      title: '【最新公告】🔥【 黑豹娱乐 】🔥',
      time: '3个月前',
      popupTitle: '🔥【 黑豹娱乐 】🔥',
      timeText: '系统于 2026-03-13 20:13:01 (美东时间)发表 -3个月前',
      content: '欢迎加入【 黑豹娱乐 】全球顶尖USDT娱乐平台.行业领先者 始终坚持⭐️“信誉至上，心系用户，用心铸就品牌⭐️”的运营理念，为玩家带来 公平、公正、公开高品质的娱乐平台。各种大型优惠活动和不定期现金大回馈等奖金计划应有尽有；🔥选择黑豹娱乐，一次娱乐，终身选择！'
    }
  ];

  // Checkbox toggle helpers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === announcements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(announcements.map(a => a.id));
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleMarkAsRead = () => {
    if (selectedIds.length === 0) {
      showToast('提示：请先勾选需要标记的公告消息！');
      return;
    }
    setReadIds(prev => {
      const next = [...prev];
      selectedIds.forEach(id => {
        if (!next.includes(id)) {
          next.push(id);
        }
      });
      return next;
    });
    setSelectedIds([]);
    showToast('消息已标记为已读！');
  };

  const handleRowClick = (id) => {
    setActiveModal(id);
    // Auto mark as read on open
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
    }
  };

  const handleReply = () => {
    showToast('提示：站内信回复通道暂未开启！');
  };

  // Find active announcement data for the popup
  const activeAnn = announcements.find(a => a.id === activeModal);

  return (
    <div className="app-page active" id="page-mail">
      {/* Header Bar */}
      <div className="mail-header-bar">
        <i className="fa-solid fa-chevron-left" id="btn-mail-back" onClick={() => setActivePage('page-profile')}></i>
        <span className="mail-header-title">站内信</span>
        <div></div> {/* Spacer */}
      </div>

      <div className="scroll-content" style={{ padding: '12px 14px', paddingBottom: '30px' }}>
        {/* Tab Buttons Row */}
        <div className="mail-tabs-row">
          <button 
            className={`mail-tab ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            收件箱
          </button>
          <button 
            className={`mail-tab ${activeTab === 'outbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('outbox')}
          >
            寄件箱
          </button>
        </div>

        {/* Mail Box Main Card Content Container */}
        <div className="mail-card-content">
          {activeTab === 'inbox' ? (
            <>
              {/* Mark as read section */}
              <div className="mail-actions-row">
                <button 
                  className={`mail-btn-read ${selectedIds.length > 0 ? 'enabled' : ''}`}
                  onClick={handleMarkAsRead}
                >
                  <svg viewBox="0 0 24 24" className="mail-read-icon" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="13" y2="17" />
                    <polyline points="5 5 12 12 19 5" />
                  </svg>
                  <span>标记已读</span>
                </button>
              </div>

              {/* Mail Table List */}
              <div className="mail-table-list">
                {/* Header Row */}
                <div className="mail-table-header">
                  <div className="mail-cell-checkbox">
                    <div 
                      className={`custom-checkbox-wrapper ${selectedIds.length === announcements.length ? 'checked' : ''}`}
                      onClick={handleToggleSelectAll}
                    >
                      {selectedIds.length === announcements.length && <i className="fa-solid fa-check"></i>}
                    </div>
                  </div>
                  <div className="mail-cell-title-header">标题</div>
                  <div className="mail-cell-time-header">时间</div>
                </div>

                {/* Items Rows */}
                {announcements.map((ann) => {
                  const isChecked = selectedIds.includes(ann.id);
                  const isRead = readIds.includes(ann.id);
                  return (
                    <div 
                      key={ann.id} 
                      className={`mail-table-row ${isRead ? 'read' : 'unread'}`}
                    >
                      <div className="mail-cell-checkbox">
                        <div 
                          className={`custom-checkbox-wrapper ${isChecked ? 'checked' : ''}`}
                          onClick={() => handleToggleSelect(ann.id)}
                        >
                          {isChecked && <i className="fa-solid fa-check"></i>}
                        </div>
                      </div>
                      <div 
                        className="mail-cell-title-content" 
                        onClick={() => handleRowClick(ann.id)}
                      >
                        {ann.title}
                      </div>
                      <div 
                        className="mail-cell-time-content"
                        onClick={() => handleRowClick(ann.id)}
                      >
                        {ann.time}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* End of list banner */}
              <div className="mail-all-loaded-banner">
                已全部载入
              </div>
            </>
          ) : (
            <div className="mail-empty-state">
              <i className="fa-regular fa-envelope-open empty-icon"></i>
              <p>暂无寄件记录</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Global Announcement Modal Overlay */}
      {activeModal && activeAnn && (
        <div className="mail-modal-overlay active">
          <div className="mail-modal-box">
            {/* Modal Header */}
            <div className="mail-modal-header">
              <span className="mail-modal-title-text">{activeAnn.popupTitle}</span>
              <button 
                className="mail-modal-close-btn" 
                onClick={() => setActiveModal(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mail-modal-body">
              <div className="mail-modal-subtitle">
                {activeAnn.timeText}
              </div>
              
              <div className="mail-content-card">
                <p className="mail-content-text">{activeAnn.content}</p>
              </div>

              {/* Modal Footer Buttons */}
              <div className="mail-modal-footer">
                <button 
                  className="mail-modal-btn close-btn" 
                  onClick={() => setActiveModal(null)}
                >
                  关闭
                </button>
                <button 
                  className="mail-modal-btn reply-btn" 
                  onClick={handleReply}
                >
                  回复
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
