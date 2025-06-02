import React, { useState } from 'react';
import { authenticatedFetch } from '../../utils/authUtils';
import CheckPw from './CheckPw';
import './ChangePw.css';

const ChangePw = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePasswordVerified = (verifiedPassword) => {
        setFormData(prev => ({
            ...prev,
            currentPassword: verifiedPassword
        }));
        setStep(2);
    };

    const handlePasswordCheckCancel = () => {
        onClose();
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        
        if (!formData.newPassword.trim()) {
            newErrors.newPassword = '새 비밀번호를 입력해주세요.';
        } else if (formData.newPassword.length < 4) {
            newErrors.newPassword = '비밀번호는 4자 이상이어야 합니다.';
        } else if (!/(?=.*[a-zA-Z])/.test(formData.newPassword)) {
            newErrors.newPassword = '비밀번호는 영문을 포함해야 합니다.';
        }
        
        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        const requestBody = {
            oldPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword
        };

        try {
            const response = await authenticatedFetch('http://localhost:8080/api/changedPwd', {
                method: 'PUT',
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                onSuccess && onSuccess();
                onClose();
            } else {
                const contentType = response.headers.get('content-type');
                let errorData;
                
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                } else {
                    errorData = { message: await response.text() };
                }
                
                setErrors({ submit: errorData.message || '비밀번호 변경에 실패했습니다.' });
            }
        } catch (error) {
            setErrors({ submit: '서버 연결에 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep(1);
        setFormData(prev => ({
            ...prev,
            newPassword: '',
            confirmPassword: ''
        }));
        setErrors({});
    };

    if (step === 1) {
        return (
            <CheckPw
                onPasswordVerified={handlePasswordVerified}
                onCancel={handlePasswordCheckCancel}
                authenticatedFetch={authenticatedFetch}
            />
        );
    }

    return (
        <div className="change-pw-overlay">
            <div className="change-pw-modal">
                <div className="change-pw-header">
                    <h2>비밀번호 변경</h2>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="change-pw-content">
                    <form onSubmit={handlePasswordChange}>
                        <div className="step-info">
                            <p>새로운 비밀번호를 입력해주세요.</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">새 비밀번호</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className={errors.newPassword ? 'error' : ''}
                                placeholder="새 비밀번호를 입력하세요"
                                disabled={loading}
                                autoFocus
                            />
                            <small className="password-hint">
                                4자 이상, 영문을 포함해주세요.
                            </small>
                            {errors.newPassword && (
                                <span className="error-message">{errors.newPassword}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">새 비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="새 비밀번호를 다시 입력하세요"
                                disabled={loading}
                            />
                            {errors.confirmPassword && (
                                <span className="error-message">{errors.confirmPassword}</span>
                            )}
                        </div>

                        {errors.submit && (
                            <div className="error-message submit-error">
                                {errors.submit}
                            </div>
                        )}

                        <div className="button-group">
                            <button 
                                type="button" 
                                className="back-btn"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                이전
                            </button>
                            <button 
                                type="submit" 
                                className="confirm-btn"
                                disabled={loading}
                            >
                                {loading ? '변경 중...' : '변경'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePw;