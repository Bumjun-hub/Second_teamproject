import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/authUtils'; 
import './MyGroupBuy.css';
import { IoClose } from "react-icons/io5";

const MyGroupBuy = () => {
    const [groupBuyItems, setGroupBuyItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 페이지당 아이템 수
    
    // 현재 페이지에 표시할 아이템들
    const currentItems = groupBuyItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    const totalPages = Math.ceil(groupBuyItems.length / itemsPerPage);

    const fetchMyGroupBuy = async () => {
        try {
            setLoading(true);
            
            const response = await authenticatedFetch('/api/groupbuy/my-applications', {
                method: 'GET'
            });

            const data = await response.json();
            setGroupBuyItems(data);

        } catch (err) {
            if (err.message.includes('인증이 만료되었습니다')) {
                // 인증 만료 처리
            } else {
                console.error('내 공동구매 조회 에러:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // 공동구매 신청 취소
    const cancelGroupBuyApplication = async (groupBuyId, title) => {
        if (!window.confirm(`"${title}" 공동구매 신청을 취소하시겠습니까?`)) {
            return;
        }

        try {
            await authenticatedFetch(`/api/groupbuy/cancel/${groupBuyId}`, {
                method: 'DELETE'
            });
            
            // 성공 시 목록에서 제거
            setGroupBuyItems(prevItems => 
                prevItems.filter(item => item.id !== groupBuyId)
            );
            
            // 현재 페이지에 아이템이 없으면 이전 페이지로
            const newItemCount = groupBuyItems.length - 1;
            const newTotalPages = Math.ceil(newItemCount / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
            
            alert('공동구매 신청이 취소되었습니다.');
        } catch (err) {
            if (err.message.includes('인증이 만료되었습니다')) {
                // 인증 만료 처리
            } else {
                alert('공동구매 신청 취소에 실패했습니다.');
            }
            console.error('공동구매 취소 에러:', err);
        }
    };

    // 가격 포맷팅
    const formatPrice = (price) => {
        if (!price) return '가격 정보 없음';
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return '날짜 정보 없음';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 상태에 따른 배지 색상
    const getStatusBadge = (status) => {
        const statusMap = {
            'RECRUITING': { text: '모집중', className: 'status-recruiting' },
            'COMPLETED': { text: '모집완료', className: 'status-completed' },
            'CLOSED': { text: '마감', className: 'status-closed' },
            'CANCELLED': { text: '취소됨', className: 'status-cancelled' }
        };
        
        const statusInfo = statusMap[status] || { text: status, className: 'status-default' };
        return (
            <span className={`status-badge ${statusInfo.className}`}>
                {statusInfo.text}
            </span>
        );
    };

    // 컴포넌트 마운트 시 공동구매 목록 조회
    useEffect(() => {
        fetchMyGroupBuy();
    }, []);

    if (loading) {
        return (
            <div className="my-groupbuy-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>내 공동구매를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-groupbuy-container">
            <div className="my-groupbuy-header">
                <h1>내가 신청한 공동구매</h1>
                <p className="item-count">총 {groupBuyItems.length}개의 신청</p>
            </div>

            {groupBuyItems.length === 0 ? (
                <div className="empty-groupbuy">
                    <div className="empty-icon">🛒</div>
                    <h2>신청한 공동구매가 없습니다</h2>
                    <p>다양한 공동구매에 참여해보세요!</p>
                </div>
            ) : (
                <>
                    <div className="groupbuy-grid">
                        {currentItems.map((item) => (
                            <div key={item.id} className="groupbuy-item">
                                <div className="item-image-container">
                                    <img 
                                        src={item.imageUrl || '/placeholder-image.png'} 
                                        alt={item.title}
                                        className="item-image"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.png';
                                        }}
                                    />
                                    {item.status === 'RECRUITING' && (
                                        <button 
                                            className="cancel-btn"
                                            onClick={() => cancelGroupBuyApplication(item.id, item.title)}
                                            title="공동구매 신청 취소"
                                        >
                                            <IoClose size={24} />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="item-info">
                                    <div className="item-header">
                                        <h3 className="item-title" title={item.title}>
                                            {item.title}
                                        </h3>
                                        {getStatusBadge(item.status)}
                                    </div>
                                    
                                    <div className="item-details">
                                        <div className="item-price">
                                            개당 가격: {formatPrice(item.pricePerUnit)}
                                        </div>
                                        
                                        <div className="item-quantity">
                                            신청 수량: {item.myQuantity}개
                                        </div>
                                        
                                        <div className="item-total">
                                            총 금액: {formatPrice(item.pricePerUnit * item.myQuantity)}
                                        </div>
                                        
                                        <div className="item-progress">
                                            진행률: {item.currentParticipants}/{item.maxParticipants}명
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${Math.min((item.currentParticipants / item.maxParticipants) * 100, 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        <div className="item-dates">
                                            <div className="apply-date">
                                                신청일: {formatDate(item.applicationDate)}
                                            </div>
                                            <div className="end-date">
                                                마감일: {formatDate(item.endDate)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="item-actions">
                                        <button 
                                            className="view-detail-btn"
                                            onClick={() => {
                                                // 공동구매 상세 페이지로 이동
                                                window.location.href = `/groupbuy/${item.id}`;
                                            }}
                                        >
                                            상세보기
                                        </button>
                                        
                                        {item.organizerContact && (
                                            <button 
                                                className="contact-organizer-btn"
                                                onClick={() => {
                                                    // 주최자 연락하기 기능
                                                    alert(`주최자 연락처: ${item.organizerContact}`);
                                                }}
                                            >
                                                주최자 연락
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 페이징 */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn"
                            >
                                이전
                            </button>
                            <span className="pagination-info">
                                {currentPage} / {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                            >
                                다음
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MyGroupBuy;