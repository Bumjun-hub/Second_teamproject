import React, { useState } from 'react';
import './CheckPw.css';

const CheckPw = ({ onPasswordVerified, onCancel }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 확인 API 호출 함수
  const verifyPassword = async (inputPassword) => {
    try {
      const response = await fetch('/api/mypage/checkPwd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // 또는 적절한 인증 방식
        },
        body: JSON.stringify({ password: inputPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        return data.isValid;
      } else {
        throw new Error(data.message || '비밀번호 확인에 실패했습니다.');
      }
    } catch (err) {
      throw new Error(err.message || '서버 오류가 발생했습니다.');
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await verifyPassword(password);
      
      if (isValid) {
        onPasswordVerified(); // 부모 컴포넌트에 비밀번호 확인 완료 알림
      } else {
        setError('비밀번호가 일치하지 않습니다.');
        setPassword(''); // 비밀번호 입력 필드 초기화
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 비밀번호 입력 처리
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // 에러 메시지 초기화
  };

  // 취소 버튼 처리
  const handleCancel = () => {
    setPassword('');
    setError('');
    if (onCancel) onCancel();
  };

  return (
    <div className="check-pw-overlay">
      <div className="check-pw-modal">
        <div className="check-pw-header">
          <h2>회원정보 확인</h2>
          <p>개인정보 보호를 위해 비밀번호를 다시 한번 확인해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="check-pw-form">
          <div className="password-input-group">
            <label htmlFor="password">현재 비밀번호</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="현재 비밀번호를 입력하세요"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="check-pw-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="confirm-btn"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? '확인 중...' : '확인'}
            </button>
          </div>
        </form>

        <div className="security-notice">
          <small>
            🔒 개인정보 보호를 위한 보안 절차입니다.
          </small>
        </div>
      </div>
    </div>
  );
};

export default CheckPw;