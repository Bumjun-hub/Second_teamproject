import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressInput from './AddressInput'; // 새로 만든 컴포넌트 import
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

    const handleAgreementChange = (e) => {
        setAgreed(e.target.checked);
        if (error) {
            setError('');
        }
    };
    // 주소 변경 핸들러
    const handleAddressChange = (address) => {
        setFormData(prev => ({
            ...prev,
            address: address
        }));
        if (error) {
            setError('');
        }
    };
    // 상세주소 변경 핸들러
    const handleDetailAddressChange = (detailAddress) => {
        setFormData(prev => ({
            ...prev,
            detailAddress: detailAddress
        }));
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

        if (!validateForm()) {
            return;
        }
        setError('');
        setLoading(true);

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
                console.log('회원가입 성공:', data);
                alert('회원가입이 완료되었습니다!');
                navigate('/login');
            } else {
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

                    {/* 기존의 주소 입력 부분을 AddressInput 컴포넌트로 교체 */}
                    <AddressInput
                        address={formData.address}
                        detailAddress={formData.detailAddress}
                        onAddressChange={handleAddressChange}
                        onDetailAddressChange={handleDetailAddressChange}
                        label="주소 (선택)"
                        className="input-group"
                    />

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
                        {loading ? '가입 중...' : '회원가입'}
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