import React, { useState } from 'react';
import './CheckPw.css';
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const CheckPw = ({ onPasswordVerified, onCancel, authenticatedFetch }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호 확인 API 호출 함수
  const verifyPassword = async (inputPassword) => {
    try {
      let response;
      
      if (authenticatedFetch) {
        response = await authenticatedFetch('http://localhost:8080/api/mypage/checkPwd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: inputPassword })
        });
      } else {
        response = await fetch('http://localhost:8080/api/mypage/checkPwd', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ password: inputPassword })
        });
      }

      if (response.ok) {
        return true;
      } else {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      throw new Error(err.message || '비밀번호 확인에 실패했습니다.');
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
        onPasswordVerified(password);
      } else {
        setError('비밀번호가 일치하지 않습니다.');
        setPassword('');
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
    if (error) setError('');
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
                {showPassword ? <AiFillEyeInvisible size={25}/>: <AiFillEye size={25}/>}
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