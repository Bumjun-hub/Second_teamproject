import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/authUtils'; 
import './WishList.css';
import { IoClose } from "react-icons/io5";

const WishList = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 페이지당 아이템 수
    
    // 현재 페이지에 표시할 아이템들
    const currentItems = wishlistItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    const totalPages = Math.ceil(wishlistItems.length / itemsPerPage);

    // 위시리스트 조회
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            
            const response = await authenticatedFetch('/api/wishlist/getlist', {
                method: 'GET'
            });

            const data = await response.json();
            setWishlistItems(data);

        } catch (err) {
            if (err.message.includes('인증이 만료되었습니다')) {
            } else {
            }
            console.error('위시리스트 조회 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    // 위시리스트에서 상품 삭제
    const removeFromWishlist = async (naverProductId, productName) => {
        if (!window.confirm(`"${productName}"을(를) 위시리스트에서 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await authenticatedFetch(`/api/wishlist/delete/${naverProductId}`, {
                method: 'DELETE'
            });
            
            // 성공 시 목록에서 제거
            setWishlistItems(prevItems => 
                prevItems.filter(item => item.naverProductId !== naverProductId)
            );
            
            // 현재 페이지에 아이템이 없으면 이전 페이지로
            const newItemCount = wishlistItems.length - 1;
            const newTotalPages = Math.ceil(newItemCount / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            }
            
            alert('상품이 위시리스트에서 삭제되었습니다.');
        } catch (err) {
            if (err.message.includes('인증이 만료되었습니다')) {
               
            } else {
                alert('상품 삭제에 실패했습니다.');
            }
            console.error('위시리스트 삭제 에러:', err);
        }
    };

    // 가격
    const formatPrice = (price) => {
        if (!price) return '가격 정보 없음';
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    };

    // 카테고리
    const getCategoryPath = (item) => {
        const categories = [item.category1, item.category2, item.category3, item.category4]
            .filter(cat => cat && cat.trim() !== '');
        return categories.length > 0 ? categories.join(' > ') : '카테고리 없음';
    };

    // 컴포넌트 마운트 시 위시리스트 조회
    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <div className="wishlist-container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>위시리스트를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-container">
            <div className="wishlist-header">
                <h1>나의 위시리스트</h1>
                <p className="item-count">총 {wishlistItems.length}개의 상품</p>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="empty-wishlist">
                    <div className="empty-icon">💔</div>
                    <h2>위시리스트가 비어있습니다</h2>
                    <p>관심있는 상품을 위시리스트에 추가해보세요!</p>
                </div>
            ) : (
                <>
                    <div className="wishlist-grid">
                        {currentItems.map((item) => (
                            <div key={item.naverProductId} className="wishlist-item">
                                <div className="item-image-container1">
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.name}
                                        className="item-image"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.png'; // 대체 이미지
                                        }}
                                    />
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeFromWishlist(item.naverProductId, item.name)}
                                        title="위시리스트에서 삭제"
                                    >
                                        <IoClose size={35} />
                                    </button>
                                </div>
                                
                                <div className="item-info">
                                    <h3 className="item-name" title={item.name}>
                                        {item.name}
                                    </h3>
                                    
                                    <div className="item-price">
                                        {formatPrice(item.price)}
                                    </div>
                                    
                                    <div className="item-category">
                                        {getCategoryPath(item)}
                                    </div>
                                    
                                    <div className="item-actions">
                                        {item.url && (
                                            <a 
                                                href={item.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="view-product-btn"
                                            >
                                                상품 보기
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 간단한 페이징 */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                이전
                            </button>
                            <span>{currentPage} / {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
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

export default WishList;