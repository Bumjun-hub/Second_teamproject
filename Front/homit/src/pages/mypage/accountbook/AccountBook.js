import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssetForm from './AssetForm';
import './AccountBook.css';

const AccountBook = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAssetForm, setShowAssetForm] = useState(true); // 처음에는 자산 입력 화면 표시
  const [userAssets, setUserAssets] = useState({
    cash: 0,
    checkCard: 0,
    creditCard: 0,
    savingDeposit: 0,
    savingInstallment: 0
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 기존 샘플 데이터와 함수들은 그대로 유지...
  const sampleData = {
    '2025-02-02': [
      { type: 'EXPENSE', category: '식비', amount: 40950, memo: '가스비', method: 'CARD' }
    ],
    // ... 나머지 샘플 데이터
  };

  const categoryColors = {
    '식비': 'category-food',
    '생활비': 'category-living',
    '고정비': 'category-fixed',
    '교통비': 'category-transport',
    '문화비': 'category-culture',
    '교육비': 'category-education',
    '의료비': 'category-medical',
    '저축': 'category-saving',
    '기타': 'category-etc'
  };

  const incomeColor = 'category-income';

  // 컴포넌트 마운트 시 자산 정보가 있는지 확인
  useEffect(() => {
    // 실제로는 로컬스토리지나 서버에서 자산 정보 확인
    const savedAssets = localStorage.getItem('userAssets');
    if (savedAssets) {
      setUserAssets(JSON.parse(savedAssets));
      setShowAssetForm(false); // 이미 자산이 있으면 바로 가계부 표시
    }
  }, []);

  const handleSaveAssets = async (assetData) => {
    setLoading(true);
    setErrors({});
    
    try {
      // 실제로는 서버에 저장
      // await saveAssetsToServer(assetData);
      
      // 임시로 로컬스토리지에 저장
      localStorage.setItem('userAssets', JSON.stringify(assetData));
      
      // 상태 업데이트
      setUserAssets(assetData);
      
      // 자산 입력 화면 숨기고 가계부 표시
      setShowAssetForm(false);
      
    } catch (error) {
      console.error('자산 저장 실패:', error);
      setErrors({ general: '자산 저장에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setLoading(false);
    }
  };

  // 기존 함수들...
  const getMonthName = (date) => {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // 자산 입력 화면 표시
  if (showAssetForm) {
    return (
      <AssetForm 
        assets={userAssets}
        onSave={handleSaveAssets}
        loading={loading}
        errors={errors}
      />
    );
  }

  // 가계부 화면 표시 (기존 코드)
  const days = getDaysInMonth(currentDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="calendar-container">
      {/* 헤더 */}
      <div className="header">
        <div className="header-content">
          <div className="header-title">
            <span className="header-icon">📌</span>
            <h1>일일 미니 캘린더</h1>
          </div>
          <div className="header-actions-account">
            <button 
              className="nav-link-button"
              onClick={() => navigate('/budget')}
            >
              🎯 목표설정
            </button>
            {/* 자산 재설정 버튼 추가 */}
            <button 
              className="nav-link-button"
              onClick={() => setShowAssetForm(true)}
            >
              💰 자산 수정
            </button>
          </div>
        </div>
      </div>

      {/* 자산 요약 표시 */}
      <div className="asset-summary">
        <h3>내 자산</h3>
        <div className="asset-items">
          <span>💵 현금: ₩{formatAmount(userAssets.cash)}</span>
          <span>💳 체크카드: ₩{formatAmount(userAssets.checkCard)}</span>
          <span>💎 신용카드: ₩{formatAmount(userAssets.creditCard)}</span>
          <span>🏦 예금: ₩{formatAmount(userAssets.savingDeposit)}</span>
          <span>📈 적금: ₩{formatAmount(userAssets.savingInstallment)}</span>
        </div>
      </div>

      {/* 캘린더 네비게이션 */}
      <div className="nav-container">
        <div className="nav-content">
          <button 
            onClick={() => navigateMonth(-1)}
            className="nav-button"
          >
            <span className="arrow-icon">‹</span>
          </button>
          
          <h2 className="nav-title">
            {getMonthName(currentDate)}
          </h2>
          
          <button 
            onClick={() => navigateMonth(1)}
            className="nav-button"
          >
            <span className="arrow-icon">›</span>
          </button>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="calendar-grid">
        {/* 요일 헤더 */}
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="days-grid">
          {days.map((day, index) => {
            const dateKey = day ? formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
            const dayData = dateKey ? sampleData[dateKey] || [] : [];
            const isEmpty = !day;
            const isToday = day && 
              currentDate.getFullYear() === new Date().getFullYear() &&
              currentDate.getMonth() === new Date().getMonth() &&
              day === new Date().getDate();

            return (
              <div 
                key={index} 
                className={`day-cell ${isEmpty ? 'empty' : ''} ${isToday ? 'today' : ''}`}
              >
                {!isEmpty && (
                  <>
                    <div className={`day-number ${isToday ? 'today' : ''}`}>
                      {day}
                    </div>
                    <div className="transactions">
                      {dayData.slice(0, 3).map((item, idx) => (
                        <div 
                          key={idx}
                          className={`transaction-item ${
                            item.type === 'INCOME' ? incomeColor : categoryColors[item.category] || 'category-etc'
                          }`}
                        >
                          <div className="transaction-amount">
                            {item.type === 'INCOME' ? '+' : '-'}₩{formatAmount(item.amount)}
                          </div>
                          <div className="transaction-memo">{item.memo}</div>
                        </div>
                      ))}
                      {dayData.length > 3 && (
                        <div className="more-items">
                          +{dayData.length - 3}개 더
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="legend">
        <h3>카테고리</h3>
        <div className="legend-items">
          {Object.entries(categoryColors).map(([category, colorClass]) => (
            <span key={category} className={`legend-item ${colorClass}`}>
              {category}
            </span>
          ))}
          <span className={`legend-item ${incomeColor}`}>
            수입
          </span>
        </div>
      </div>

      {/* 플로팅 액션 버튼 */}
      <button className="floating-button">
        <span className="plus-icon">+</span>
      </button>
    </div>
  );
};

export default AccountBook;