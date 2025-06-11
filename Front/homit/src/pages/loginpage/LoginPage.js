import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../../utils/authUtils';
import './LoginPage.css';
import '../memberpage/MemberPage.css';
import { accessToken } from './../../utils/notificationClient';

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
            // 직접 로그인 API 호출
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if(data.accessToken){
                    localStorage.setItem('access_Token', data.accessToken);
                }
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