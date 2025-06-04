import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/authUtils'; 
import './WishList.css';

const WishList = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    

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
                <div className="wishlist-grid">
                    {wishlistItems.map((item) => (
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
                                    ❌
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
            )}
        </div>
    );
};

export default WishList;