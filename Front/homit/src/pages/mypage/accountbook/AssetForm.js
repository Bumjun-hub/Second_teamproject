import React, { useState } from 'react';
import './AccountBook.css';

const AssetForm = ({ assets, onSave, loading, errors }) => {
    const [assetForm, setAssetForm] = useState(assets);

    return (
        <div className="account-asset-container">
            <h2>내 자산 입력</h2>
            <p className="account-asset-description">가계부를 사용하기 위해 현재 보유 자산을 입력해주세요.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); onSave(assetForm); }} className="account-asset-form">
                {[
                    { key: 'cash', label: '현금' },
                    { key: 'checkCard', label: '체크카드 (계좌잔액)' },
                    { key: 'creditCard', label: '신용카드 (사용가능금액)' },
                    { key: 'savingDeposit', label: '예금' },
                    { key: 'savingInstallment', label: '적금' }
                ].map(({ key, label }) => (
                    <div key={key} className="account-form-group">
                        <label>{label}</label>
                        <input
                            type="number"
                            value={assetForm[key]}
                            onChange={(e) => setAssetForm(prev => ({
                                ...prev, [key]: Math.max(0, parseInt(e.target.value) || 0)
                            }))}
                            placeholder="0"
                        />
                        <span className="account-currency">원</span>
                    </div>
                ))}

                {errors.general && <div className="account-error-message">{errors.general}</div>}

                <div className="account-form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? '저장 중...' : '저장하고 가계부 시작'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssetForm;