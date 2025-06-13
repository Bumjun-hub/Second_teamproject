import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../../utils/authUtils';
import './LoginPage.css';
import '../memberpage/MemberPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const navigate = useNavigate();

    // 컴포넌트 마운트 시 자동 로그인 확인
    useEffect(() => {
        const checkExistingAuth = async () => {
            try {
                const authResult = await checkAuthStatus();
                if (authResult.isAuthenticated) {
                    console.log('이미 로그인된 사용자:', authResult.user);
                    navigate('/', { replace: true });
                    return;
                }
            } catch (error) {
                console.log('자동 로그인 확인 실패:', error);
            } finally {
                setCheckingAuth(false);
            }
        };

        checkExistingAuth();
    }, [navigate]);

    // 구글 로그인 버튼 클릭 핸들러 (OAuth2 리다이렉트 방식)
    const handleGoogleLogin = () => {
        // 백엔드의 OAuth2 로그인 엔드포인트로 리다이렉트
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 일반 로그인 API 호출 (쿠키 방식)
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키 포함
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('로그인 성공:', data);

                // 인증 상태 변경 이벤트 발생
                window.dispatchEvent(new Event('authChange'));
                
                // 잠시 대기 후 네비게이션
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 200);
                
            } else {
                setError(data.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignupClick = () => {
        navigate('/member');
    };

    // 초기 인증 상태 확인 중일 때 로딩 표시
    if (checkingAuth) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div className="signup-header">
                        <h2 className="page-title">로딩 중...</h2>
                        <div className="brand">
                            <h1 className="brand-name">HOMIT</h1>
                            <p className="brand-subtitle">인증 상태를 확인하고 있습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="signup-header">
                    <h2 className="page-title">로그인</h2>
                    <div className="brand">
                        <h1 className="brand-name">HOMIT</h1>
                        <p className="brand-subtitle">다시 와서 반가워요!</p>
                    </div>
                </div>

                {/* 구글 로그인 버튼 */}
                <div className="google-login-section">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="google-login-button"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.20454Z" fill="#4285F4"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59307 3.68182 8.99989C3.68182 8.40671 3.78409 7.82989 3.96409 7.28989V4.95807H0.957273C0.347727 6.17353 0 7.54898 0 8.99989C0 10.4508 0.347727 11.8262 0.957273 13.0417L3.96409 10.7098Z" fill="#FBBC05"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
                        </svg>
                        Google로 로그인
                    </button>
                </div>

                {/* 구분선 */}
                <div className="divider">
                    <span>또는</span>
                </div>

                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="input-group">
                        <label htmlFor="email" className="input-label">이메일 주소</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password" className="input-label">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력해주세요"
                            className="input-field"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={'signup-button'}
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="signup-link">
                    <span>아직 계정이 없으신가요? </span>
                    <button
                        type="button"
                        onClick={handleSignupClick}
                        className="signup-button2"
                    >
                        회원가입
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;