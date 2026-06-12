import React from 'react';
import { useApp } from '../context/AppContext';

export default function PhoneContainer({ children }) {
  const { phoneSkin, systemTime, toasts, showToast } = useApp();

  const handleHardwareBtn = (btnName) => {
    showToast(`系统提示：[${btnName}] 功能已按下`);
  };

  return (
    <div className="phone-wrapper">
      <div className={`phone ${phoneSkin}`} id="mobile-device">
        {/* Phone Speaker and Camera (Notch/Dynamic Island) */}
        <div className="phone-notch">
          <div className="camera"></div>
          <div className="speaker"></div>
        </div>
        
        {/* Side Buttons */}
        <div className="phone-btn phone-btn-vol-up" onClick={() => handleHardwareBtn('音量 +')}></div>
        <div className="phone-btn phone-btn-vol-down" onClick={() => handleHardwareBtn('音量 -')}></div>
        <div className="phone-btn phone-btn-power" onClick={() => handleHardwareBtn('电源键')}></div>
        
        {/* Screen Content Container */}
        <div className="phone-screen" id="phone-screen-container">
          
          {/* Status Bar */}
          <div className="status-bar">
            <div className="status-left">
              <span className="carrier"><i className="fa-solid fa-wifi"></i> 无SIM卡</span>
            </div>
            <div className="status-time" id="status-time">{systemTime}</div>
            <div className="status-right">
              <i className="fa-solid fa-lock"></i>
              <i className="fa-solid fa-battery-full"></i>
            </div>
          </div>
          
          {/* Web App Body Inside Phone */}
          <div className="app-body" id="app-root">
            {children}
          </div>

          {/* Toast Notification Overlays */}
          {toasts.map(toast => (
            <div key={toast.id} className="toast-notification" style={{
              position: 'absolute',
              bottom: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              color: '#fff',
              border: '1px solid #d4af37', // Gold color variable fallback
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              zIndex: '9999',
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              pointerEvents: 'none',
              width: '80%',
              textAlign: 'center',
              wordBreak: 'break-all'
            }}>
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
