import React from 'react';
import './AccountBook.css';

const RecordForm = ({ 
    show, formData, setFormData, editingRecord, categories, paymentMethods, 
    errors, loading, onSave, onCancel, onRecordTypeChange 
}) => {
    if (!show) return null;

    return (
        <div className="account-modal-overlay">
            <div className="account-record-form-modal">
                <div className="account-modal-header">
                    <h3>{editingRecord ? '기록 수정' : '기록 추가'}</h3>
                    <button className="account-close-btn" onClick={onCancel}>×</button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
                    <div className="account-form-group">
                        <label>날짜</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                            required
                        />
                        {errors.date && <span className="account-error">{errors.date}</span>}
                    </div>

                    <div className="account-form-group">
                        <label>구분</label>
                        <div className="account-radio-group">
                            <label>
                                <input
                                    type="radio"
                                    checked={formData.recordType === 'INCOME'}
                                    onChange={() => onRecordTypeChange('INCOME')}
                                />
                                수입
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    checked={formData.recordType === 'EXPENSE'}
                                    onChange={() => onRecordTypeChange('EXPENSE')}
                                />
                                지출
                            </label>
                        </div>
                    </div>

                    <div className="account-form-group">
                        <label>카테고리</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                        >
                            {Object.entries(categories[formData.recordType]).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="account-form-group">
                        <label>금액</label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))}
                            placeholder="0"
                            min="1"
                            required
                        />
                        {errors.amount && <span className="account-error">{errors.amount}</span>}
                    </div>

                    <div className="account-form-group">
                        <label>내용</label>
                        <input
                            type="text"
                            value={formData.memo}
                            onChange={(e) => setFormData(prev => ({...prev, memo: e.target.value}))}
                            placeholder="상세 내용을 입력하세요"
                            required
                        />
                        {errors.memo && <span className="account-error">{errors.memo}</span>}
                    </div>

                    <div className="account-form-group">
                        <label>결제수단</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={(e) => setFormData(prev => ({...prev, paymentMethod: e.target.value}))}
                            disabled={formData.recordType === 'INCOME'}
                        >
                            {Object.entries(paymentMethods).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>

                    <div className="account-form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.isRepeat}
                                onChange={(e) => setFormData(prev => ({...prev, isRepeat: e.target.checked}))}
                            />
                            반복 지출/수입
                        </label>
                    </div>

                    <div className="account-form-group">
                        <label>영수증/사진</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData(prev => ({...prev, image: e.target.files[0]}))}
                        />
                    </div>

                    {errors.general && <div className="account-error-message">{errors.general}</div>}

                    <div className="account-form-actions">
                        <button type="button" onClick={onCancel}>취소</button>
                        <button type="submit" disabled={loading}>
                            {loading ? '저장 중...' : (editingRecord ? '수정' : '저장')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordForm;