import React, { useState, useEffect } from 'react';
import AssetForm from './AssetForm';
import AssetSummary from './AssetSummary';
import RecordsList from './RecordsList';
import RecordForm from './RecordForm';
import './AccountBook.css';

const AccountBook = () => {
    const [currentView, setCurrentView] = useState('assets');
    const [assets, setAssets] = useState({
        cash: 0, checkCard: 0, creditCard: 0, savingDeposit: 0, savingInstallment: 0
    });
    const [hasAssets, setHasAssets] = useState(false);
    const [records, setRecords] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        recordType: 'EXPENSE', category: 'FOOD', amount: '', memo: '',
        paymentMethod: 'CHECK_CARD', isRepeat: false, image: null
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const categories = {
        INCOME: { SALARY: '월급', ALLOWANCE: '용돈', REFUND: '환급금', INTEREST: '이자수익' },
        EXPENSE: { FOOD: '식비', LIVING: '생활비', FIXED: '고정비', TRANSPORT: '교통비', 
                  CULTURE: '문화비', EDUCATION: '교육비', MEDICAL: '의료비', SAVING: '저축', ETC: '기타' }
    };
    const paymentMethods = { CASH: '현금', CHECK_CARD: '체크카드', CREDIT_CARD: '신용카드' };

    useEffect(() => {
        fetchAssets();
    }, []);

    useEffect(() => {
        if (hasAssets) fetchRecords();
    }, [hasAssets]);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/assets', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setAssets(data);
                setHasAssets(true);
                setCurrentView('accountbook');
            } else if (response.status === 404) {
                setHasAssets(false);
                setCurrentView('assets');
            }
        } catch (error) {
            console.error('자산 정보 로드 실패:', error);
            setHasAssets(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecords = async () => {
        try {
            const response = await fetch('/api/accountbook', { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setRecords(data);
            }
        } catch (error) {
            console.error('가계부 기록 로드 실패:', error);
        }
    };

    const saveAssets = async (assetData) => {
    try {
        setLoading(true);
        setErrors({});
        
        // 백엔드 저장 시도
        const response = await fetch('/api/assets', {
            method: hasAssets ? 'PUT' : 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assetData)
        });
        
        if (response.ok) {
            const data = await response.json();
            setAssets(data);
            console.log('백엔드 저장 성공!');
            alert('자산 정보가 저장되었습니다.');
        } else {
            throw new Error('백엔드 저장 실패');
        }
    } catch (error) {
        console.error('백엔드 저장 실패, 로컬에 임시 저장:', error);
        
        // 백엔드 저장 실패 시 로컬 스토리지에 임시 저장
        localStorage.setItem('tempAssets', JSON.stringify(assetData));
        localStorage.setItem('tempAssetsTimestamp', new Date().toISOString());
        
        // 로컬 state 업데이트 (가계부가 동작하도록)
        setAssets(assetData);
        
        console.log('로컬 임시 저장 완료');
        // 에러 메시지 대신 성공 메시지 표시 (사용자 경험 개선)
        alert('자산 정보가 임시 저장되었습니다. 가계부를 시작하세요!');
    } finally {
        setLoading(false);
        
        // 성공/실패 관계없이 가계부 메인으로 이동
        setHasAssets(true);
        setCurrentView('accountbook');
    }
};

    const saveRecord = async (recordData) => {
        try {
            setLoading(true);
            setErrors({});

            // 유효성 검사
            const validationErrors = {};
            if (!recordData.date) validationErrors.date = '날짜를 입력해주세요.';
            if (!recordData.amount || recordData.amount <= 0) validationErrors.amount = '올바른 금액을 입력해주세요.';
            if (!recordData.memo?.trim()) validationErrors.memo = '내용을 입력해주세요.';

            if (recordData.recordType === 'EXPENSE') {
                const amount = parseFloat(recordData.amount);
                if (recordData.paymentMethod === 'CASH' && assets.cash < amount) {
                    validationErrors.amount = '현금 잔액이 부족합니다.';
                } else if (recordData.paymentMethod === 'CHECK_CARD' && assets.checkCard < amount) {
                    validationErrors.amount = '체크카드 잔액이 부족합니다.';
                }
            }

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }

            const formDataToSend = new FormData();
            Object.keys(recordData).forEach(key => {
                if (key === 'image' && recordData[key]) {
                    formDataToSend.append(key, recordData[key]);
                } else if (key !== 'image') {
                    formDataToSend.append(key, recordData[key]);
                }
            });

            const url = editingRecord ? `/api/accountbook/${editingRecord.id}` : '/api/accountbook';
            const method = editingRecord ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method, credentials: 'include', body: formDataToSend
            });

            if (response.ok) {
                await fetchRecords();
                await fetchAssets();
                resetForm();
                alert(editingRecord ? '기록이 수정되었습니다.' : '기록이 저장되었습니다.');
            } else {
                const errorData = await response.json();
                setErrors(errorData.errors || { general: '저장에 실패했습니다.' });
            }
        } catch (error) {
            console.error('기록 저장 실패:', error);
            setErrors({ general: '네트워크 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const deleteRecord = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            const response = await fetch(`/api/accountbook/${id}`, {
                method: 'DELETE', credentials: 'include'
            });
            if (response.ok) {
                await fetchRecords();
                await fetchAssets();
                alert('기록이 삭제되었습니다.');
            }
        } catch (error) {
            console.error('삭제 실패:', error);
            alert('삭제에 실패했습니다.');
        }
    };

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            recordType: 'EXPENSE', category: 'FOOD', amount: '', memo: '',
            paymentMethod: 'CHECK_CARD', isRepeat: false, image: null
        });
        setEditingRecord(null);
        setShowAddForm(false);
        setErrors({});
    };

    const handleRecordTypeChange = (type) => {
        setFormData(prev => ({
            ...prev, recordType: type,
            category: type === 'INCOME' ? 'SALARY' : 'FOOD',
            paymentMethod: type === 'INCOME' ? 'CASH' : 'CHECK_CARD'
        }));
    };

    const handleEditRecord = (record) => {
        setEditingRecord(record);
        setFormData({
            date: record.date, recordType: record.recordType, category: record.category,
            amount: record.amount, memo: record.memo, paymentMethod: record.paymentMethod,
            isRepeat: record.isRepeat, image: null
        });
        setShowAddForm(true);
    };

    if (loading && !showAddForm) {
        return <div className="account-loading">로딩 중...</div>;
    }

    if (currentView === 'assets') {
        return <AssetForm assets={assets} onSave={saveAssets} loading={loading} errors={errors} />;
    }

    return (
        <div className="account-book-container">
            <div className="account-book-header">
                <h2>가계부</h2>
                <div className="account-header-actions">
                    <button className="account-asset-edit-btn" onClick={() => setCurrentView('assets')}>
                        자산 수정
                    </button>
                    <button className="account-add-record-btn" onClick={() => setShowAddForm(true)}>
                        기록 추가
                    </button>
                </div>
            </div>

            <AssetSummary assets={assets} onEditAssets={() => setCurrentView('assets')} />
            
            <RecordsList 
                records={records} 
                categories={categories} 
                paymentMethods={paymentMethods}
                onEdit={handleEditRecord}
                onDelete={deleteRecord}
                onAddNew={() => setShowAddForm(true)}
            />

            <RecordForm
                show={showAddForm}
                formData={formData}
                setFormData={setFormData}
                editingRecord={editingRecord}
                categories={categories}
                paymentMethods={paymentMethods}
                errors={errors}
                loading={loading}
                onSave={saveRecord}
                onCancel={resetForm}
                onRecordTypeChange={handleRecordTypeChange}
            />
        </div>
    );
};

export default AccountBook;