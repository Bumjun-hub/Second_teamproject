import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MemberPage.css';

const MemberPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        address: '',
        detailAddress: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

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

    const handleAgreementChange = (e)=> {
        setAgreed(e.target.checked);
        if (error) {
            setError('');
        }
    };

    const validateForm = () => {
        if (!formData.email) {
            setError('이메일을 입력해주세요.');
            return false;
        }
        if (!formData.username) {
            setError('사용자명을 입력해주세요.');
            return false;
        }
        if (!formData.password) {
            setError('비밀번호를 입력해주세요.');
            return false;
        }
        if (!formData.confirmPassword) {
            setError('비밀번호 확인을 입력해주세요.');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('입력하신 비밀번호가 서로 일치하지 않습니다.');
            return false;
        }
        if (!agreed) {
            setError('이용약관 및 개인정보처리방침에 동의해주세요.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!validateForm()) {
            return;
        }
        setError('');

        try {
            const response = await fetch('http://localhost:8080/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    address: formData.address + ' ' + formData.detailAddress,
                    phone: formData.phone
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // 회원가입 성공
                console.log('회원가입 성공:', data);
                alert('회원가입이 완료되었습니다!');
                // 로그인 페이지로 이동
                navigate('/login');
            } else {
                // 회원가입 실패
                setError(data.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            setError('서버 연결에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    // 주소 검색
    const findAddress = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                let selectedAddr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                
                // formData 업데이트
                setFormData(prev => ({
                    ...prev,
                    address: selectedAddr
                }));
            }
        }).open();
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="signup-header">
                    <h2 className="page-title">회원가입</h2>
                    <div className="brand">
                        <h1 className="brand-name">HOMIT</h1>
                        <p className="brand-subtitle">특별한 생활을 소원의 시작</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='signup-form'>
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
                        <label htmlFor="username" className="input-label">사용자명</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="사용자명을 입력해주세요"
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
                            placeholder="4자 이상 입력해주세요"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword" className="input-label">비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="비밀번호를 다시 입력해주세요"
                            className="input-field"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="address" className="input-label">주소 (선택)</label>
                        
                        {/* 기본 주소 검색 */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="주소를 입력해주세요"
                                className="input-field"
                                readOnly
                            />
                            <button
                                type="button"
                                onClick={findAddress}
                                className="address-search-btn"
                            >
                                주소 검색
                            </button>
                        </div>
                        
                        {/* 상세주소 입력 */}
                        <input
                            type="text"
                            id="detailAddress"
                            name="detailAddress"
                            value={formData.detailAddress}
                            onChange={handleChange}
                            placeholder="상세주소를 입력해주세요 (아파트명, 동/호수 등)"
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="phone" className="input-label">전화번호 (선택)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="010-0000-0000"
                            className="input-field"
                        />
                    </div>

                    <div className="agreement-section">
                        <label className="agreement-label">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={handleAgreementChange}
                                className="agreement-checkbox"
                            />
                            <span className="agreement-text">
                                이용약관 및 개인정보처리방침에 동의합니다
                            </span>
                        </label>
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
                        {'회원가입'}
                    </button>
                </form>

                <div className="login-link">
                    <span>이미 계정이 있으신가요? </span>
                    <button 
                        type="button" 
                        onClick={handleLoginClick} 
                        className="login-button-link"
                    >
                        로그인
                    </button>
                </div>
            </div>
        </div>
    );
};


export default MemberPage;