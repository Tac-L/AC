import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ModalsConfig() {
  const {
    multipliers,
    setMultipliers,
    editMultipliersActive,
    setEditMultipliersActive,
    
    quickAmounts,
    setQuickAmounts,
    editQuickAmountsActive,
    setEditQuickAmountsActive,
    
    showToast
  } = useApp();

  const [localMults, setLocalMults] = useState([1, 2, 5, 10, 20]);
  const [localQuicks, setLocalQuicks] = useState([50, 100, 500, 1000]);

  useEffect(() => {
    if (editMultipliersActive) {
      setLocalMults([...multipliers]);
    }
  }, [editMultipliersActive, multipliers]);

  useEffect(() => {
    if (editQuickAmountsActive) {
      setLocalQuicks([...quickAmounts]);
    }
  }, [editQuickAmountsActive, quickAmounts]);

  const handleSaveMultipliers = () => {
    const invalid = localMults.some(v => isNaN(v) || v <= 0);
    if (invalid) {
      alert("请输入有效的正整数倍数！");
      return;
    }
    setMultipliers(localMults.map(Number));
    setEditMultipliersActive(false);
    showToast("倍数配置保存成功！");
  };

  const handleResetMultipliers = () => {
    const defaultMults = [1, 2, 5, 10, 20];
    setMultipliers(defaultMults);
    setLocalMults(defaultMults);
    setEditMultipliersActive(false);
    showToast("已恢复默认倍数配置！");
  };

  const handleSaveQuickAmounts = () => {
    const invalid = localQuicks.some(v => isNaN(v) || v <= 0);
    if (invalid) {
      alert("请输入有效的正数金额！");
      return;
    }
    setQuickAmounts(localQuicks.map(Number));
    setEditQuickAmountsActive(false);
    showToast("快捷金额配置保存成功！");
  };

  const handleResetQuickAmounts = () => {
    const defaultQuicks = [50, 100, 500, 1000];
    setQuickAmounts(defaultQuicks);
    setLocalQuicks(defaultQuicks);
    setEditQuickAmountsActive(false);
    showToast("已恢复默认快捷金额！");
  };

  return (
    <>
      {/* 2. Edit Multipliers Modal Overlay */}
      <div className={`sub-modal-overlay ${editMultipliersActive ? 'active' : ''}`} id="modal-edit-multipliers">
        <div className="sub-modal-content">
          <div className="modal-header">
            <span className="modal-title-text">编辑倍数</span>
            <button className="modal-close-x" id="btn-close-edit-multipliers" onClick={() => setEditMultipliersActive(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="sub-modal-inputs-list">
            {localMults.map((mult, idx) => (
              <input 
                key={idx}
                type="number" 
                className="sub-modal-input" 
                id={`input-mult-${idx + 1}`} 
                value={mult} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || '';
                  const next = [...localMults];
                  next[idx] = val;
                  setLocalMults(next);
                }}
              />
            ))}
          </div>
          
          <div className="sub-modal-actions">
            <button className="sub-modal-btn default-btn" id="btn-reset-multipliers-default" onClick={handleResetMultipliers}>恢复默认</button>
            <button className="sub-modal-btn save-btn" id="btn-save-multipliers" onClick={handleSaveMultipliers}>保存</button>
          </div>
        </div>
      </div>

      {/* 3. Edit Quick Amounts Modal Overlay */}
      <div className={`sub-modal-overlay ${editQuickAmountsActive ? 'active' : ''}`} id="modal-edit-quick-amounts">
        <div className="sub-modal-content">
          <div className="modal-header">
            <span className="modal-title-text">编辑快捷金额</span>
            <button className="modal-close-x" id="btn-close-edit-quick-amounts" onClick={() => setEditQuickAmountsActive(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          <div className="sub-modal-inputs-grid">
            {localQuicks.map((amt, idx) => (
              <div key={idx} className="input-item">
                <span className="input-lbl">金额 {idx + 1}</span>
                <input 
                  type="number" 
                  className="sub-modal-input" 
                  id={`input-quick-${idx + 1}`} 
                  value={amt}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || '';
                    const next = [...localQuicks];
                    next[idx] = val;
                    setLocalQuicks(next);
                  }}
                />
              </div>
            ))}
          </div>
          
          <div className="sub-modal-actions">
            <button className="sub-modal-btn default-btn" id="btn-reset-quick-amounts-default" onClick={handleResetQuickAmounts}>恢复默认</button>
            <button className="sub-modal-btn save-btn" id="btn-save-quick-amounts" onClick={handleSaveQuickAmounts}>保存</button>
          </div>
        </div>
      </div>
    </>
  );
}
