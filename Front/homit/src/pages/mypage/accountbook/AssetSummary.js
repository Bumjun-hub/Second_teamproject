import React from 'react';
import './AccountBook.css';

const AssetSummary = ({ assets, onEditAssets }) => (
    <div className="account-asset-summary">
        <h3>내 자산</h3>
        <div className="account-asset-grid">
            <div className="account-asset-item">
                <span className="account-asset-label">현금</span>
                <span className="account-asset-amount">{assets.cash?.toLocaleString()}원</span>
            </div>
            <div className="account-asset-item">
                <span className="account-asset-label">체크카드</span>
                <span className="account-asset-amount">{assets.checkCard?.toLocaleString()}원</span>
            </div>
            <div className="account-asset-item">
                <span className="account-asset-label">신용카드</span>
                <span className="account-asset-amount">{assets.creditCard?.toLocaleString()}원</span>
            </div>
            <div className="account-asset-item account-total">
                <span className="account-asset-label">총 자산</span>
                <span className="account-asset-amount">
                    {((assets.cash || 0) + (assets.checkCard || 0) + (assets.creditCard || 0) + 
                      (assets.savingDeposit || 0) + (assets.savingInstallment || 0)).toLocaleString()}원
                </span>
            </div>
        </div>
    </div>
);

export default AssetSummary;