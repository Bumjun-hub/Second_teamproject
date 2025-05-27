import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import '../memberpage/MemberPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // 입력 시 에러 메시지 초기화
        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키를 포함해서 요청
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 로그인 성공
                console.log('로그인 성공:', data);
                
                // 쿠키 설정 확인
                setTimeout(() => {
                    console.log('로그인 후 쿠키:', document.cookie);
                }, 100);
                
                // JWT 토큰은 서버에서 HttpOnly 쿠키로 자동 설정됨
                // localStorage 사용하지 않음
                window.dispatchEvent(new Event('authChange'));
                // 메인 페이지로 이동
                navigate('/');
            } else {
                // 로그인 실패
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