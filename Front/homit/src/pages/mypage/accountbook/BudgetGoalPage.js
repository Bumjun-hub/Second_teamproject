import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BudgetGoalPage.css';

const BudgetGoalPage = () => {
  const navigate = useNavigate();
  
  // 현재 월 목표 데이터 (실제로는 백엔드에서 가져올 데이터)
  const [budgetGoals, setBudgetGoals] = useState([
    {
      category: 'FOOD',
      categoryName: '식비',
      icon: '❤️',
      targetAmount: 618147,
      currentAmount: 75820,
      percentage: 12,
      status: 'safe',
      message: '아직 542327원은 더 써도 돼요. 잘하고 있어요!👍'
    },
    {
      category: 'TRANSPORT',
      categoryName: '여가비',
      icon: '👤',
      targetAmount: 98904,
      currentAmount: 32400,
      percentage: 33,
      status: 'safe',
      message: '아직 66504원은 더 써도 돼요. 잘하고 있어요!👍'
    },
    {
      category: 'LIVING',
      categoryName: '생활비',
      icon: '🏠',
      targetAmount: 61815,
      currentAmount: 25300,
      percentage: 41,
      status: 'safe',
      message: '아직 36515원은 더 써도 돼요. 잘하고 있어요!👍'
    },
    {
      category: 'CULTURE',
      categoryName: '미용/의류/구독비',
      icon: '🎭',
      targetAmount: 98904,
      currentAmount: 238750,
      percentage: 241,
      status: 'danger',
      message: '벌써 139846원이나 더 썼어요. 정신 차리세요!😱'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [tempAmount, setTempAmount] = useState('');

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return 'status-safe';
      case 'warning': return 'status-warning';
      case 'danger': return 'status-danger';
      default: return 'status-safe';
    }
  };

  const getProgressBarClass = (status) => {
    switch (status) {
      case 'safe': return 'progress-safe';
      case 'warning': return 'progress-warning';
      case 'danger': return 'progress-danger';
      default: return 'progress-safe';
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setTempAmount(goal.targetAmount.toString());
    setShowModal(true);
  };

  const handleSaveGoal = () => {
    if (editingGoal && tempAmount) {
      const newAmount = parseInt(tempAmount);
      setBudgetGoals(prev => 
        prev.map(goal => 
          goal.category === editingGoal.category 
            ? { 
                ...goal, 
                targetAmount: newAmount,
                percentage: Math.round((goal.currentAmount / newAmount) * 100),
                status: getNewStatus(goal.currentAmount, newAmount)
              }
            : goal
        )
      );
      setShowModal(false);
      setEditingGoal(null);
      setTempAmount('');
    }
  };

  const getNewStatus = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage <= 70) return 'safe';
    if (percentage <= 100) return 'warning';
    return 'danger';
  };

  const totalBudget = budgetGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSpent = budgetGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalPercentage = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="budget-container">
      {/* 헤더 */}
      <div className="budget-header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon">📌</span>
            <h1>머니 챌린지</h1>
          </div>
          <div className="header-actions">
            <button 
              className="nav-link-button"
              onClick={() => navigate('/accountbook')}
            >
              📅 캘린더
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="tab-navigation">
        <button className="tab-item">🎯 목표설정</button>
        <button className="tab-item inactive">👥 대시보드</button>
        <button className="tab-item inactive">📊 All</button>
      </div>

      {/* 필터 */}
      <div className="filter-section">
        <div className="filter-item">
          <span className="filter-icon">🔍</span>
          <span>카테고리</span>
        </div>
        <div className="filter-item">
          <span className="filter-icon">📅</span>
          <span>월 목표금액</span>
        </div>
        <div className="filter-item">
          <span className="filter-icon">💎</span>
          <span>이번달 합계</span>
        </div>
        <div className="filter-item">
          <span className="filter-icon">👤</span>
          <span>사용률</span>
        </div>
        <div className="filter-item">
          <span className="filter-icon">📱</span>
          <span>머니북 알림</span>
        </div>
      </div>

      {/* 총 예산 요약 */}
      <div className="budget-summary">
        <div className="summary-item">
          <span className="summary-label">총 목표 예산</span>
          <span className="summary-amount">₩{formatAmount(totalBudget)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">사용한 금액</span>
          <span className="summary-amount spent">₩{formatAmount(totalSpent)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">전체 사용률</span>
          <span className={`summary-percentage ${totalPercentage > 100 ? 'over-budget' : ''}`}>
            {totalPercentage}%
          </span>
        </div>
      </div>

      {/* 목표 리스트 */}
      <div className="goals-list">
        {budgetGoals.map((goal, index) => (
          <div key={goal.category} className="goal-card">
            <div className="goal-header">
              <div className="goal-category">
                <span className="category-icon">{goal.icon}</span>
                <span className="category-name">{goal.categoryName}</span>
              </div>
              <button 
                className="edit-button"
                onClick={() => handleEditGoal(goal)}
              >
                편집
              </button>
            </div>
            
            <div className="goal-amounts">
              <div className="amount-row">
                <span className="amount-label">목표</span>
                <span className="amount-value">₩{formatAmount(goal.targetAmount)}</span>
              </div>
              <div className="amount-row">
                <span className="amount-label">사용</span>
                <span className="amount-value current">₩{formatAmount(goal.currentAmount)}</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${getProgressBarClass(goal.status)}`}
                  style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                ></div>
              </div>
              <span className={`percentage ${getStatusColor(goal.status)}`}>
                {goal.percentage}%
              </span>
            </div>

            <div className={`goal-message ${getStatusColor(goal.status)}`}>
              {goal.message}
            </div>
          </div>
        ))}
      </div>

      {/* 목표 편집 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingGoal?.categoryName} 목표 설정</h3>
              <button 
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>목표 금액</label>
                <input
                  type="number"
                  value={tempAmount}
                  onChange={(e) => setTempAmount(e.target.value)}
                  placeholder="목표 금액을 입력하세요"
                  className="amount-input"
                />
              </div>
              <div className="current-info">
                <span>현재 사용액: ₩{formatAmount(editingGoal?.currentAmount || 0)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowModal(false)}
              >
                취소
              </button>
              <button 
                className="save-button"
                onClick={handleSaveGoal}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 액션 버튼 */}
      <button className="floating-button">
        <span className="plus-icon">+</span>
      </button>
    </div>
  );
};

export default BudgetGoalPage;