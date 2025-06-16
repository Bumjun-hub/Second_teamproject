import React from 'react';
import './AccountBook.css';

const RecordsList = ({ records, categories, paymentMethods, onEdit, onDelete, onAddNew }) => (
    <div className="account-records-section">
        <h3>최근 기록</h3>
        {records.length === 0 ? (
            <div className="account-empty-records">
                <p>아직 기록이 없습니다.</p>
                <button onClick={onAddNew}>첫 기록 추가하기</button>
            </div>
        ) : (
            <div className="account-records-list">
                {records.map(record => (
                    <div key={record.id} className={`account-record-item ${record.recordType.toLowerCase()}`}>
                        <div className="account-record-date">
                            {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="account-record-info">
                            <div className="account-record-main">
                                <span className={`account-record-type ${record.recordType.toLowerCase()}`}>
                                    {record.recordType === 'INCOME' ? '수입' : '지출'}
                                </span>
                                <span className="account-record-category">
                                    {categories[record.recordType][record.category]}
                                </span>
                                <span className="account-record-memo">{record.memo}</span>
                            </div>
                            <div className="account-record-sub">
                                <span className="account-record-method">
                                    {paymentMethods[record.paymentMethod]}
                                </span>
                                {record.isRepeat && <span className="account-repeat-badge">반복</span>}
                            </div>
                        </div>
                        <div className="account-record-amount">
                            <span className={record.recordType.toLowerCase()}>
                                {record.recordType === 'INCOME' ? '+' : '-'}
                                {record.amount?.toLocaleString()}원
                            </span>
                        </div>
                        <div className="account-record-actions">
                            <button onClick={() => onEdit(record)}>수정</button>
                            <button onClick={() => onDelete(record.id)}>삭제</button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default RecordsList;