import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './PostCardInfo.css';

const PostCardInfo = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPostType = () => {
    if (location.pathname.startsWith('/donation/')) return 'donation';
    if (location.pathname.startsWith('/board/')) return 'board';
    return 'donation';
  };

  const postType = getPostType();

  useEffect(() => {
    fetchCurrentUser();
    fetchPostDetail();
  }, [id, category]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/mypage", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data?.name || "");
      }
    } catch (err) {
      console.error("사용자 정보 로드 실패:", err);
    }
  };

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(apiUrl, { credentials: "include" });
      
      if (!response.ok) {
        throw new Error(getErrorMessage(response.status));
      }
      
      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getApiUrl = () => {
    if (postType === 'donation') {
      const donationCategory = category || 'SHARE';
      return `/api/donation/view/${donationCategory}/${id}`;
    }
    if (postType === 'board') {
      return `/api/board/${id}`;
    }
    return `/api/posts/${id}`;
  };

  const getErrorMessage = (status) => {
    const errorMessages = {
      404: '게시글을 찾을 수 없습니다.',
      401: '로그인이 필요합니다.',
      500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
    return errorMessages[status] || '게시글을 불러올 수 없습니다.';
  };

  const handleLike = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    
    try {
      const likeUrl = getLikeUrl();
      const response = await fetch(likeUrl, {
        method: 'POST',
        credentials: "include"
      });
      
      if (response.ok) {
        fetchPostDetail();
      } else if (response.status === 401) {
        alert("로그인이 필요합니다.");
      } else {
        alert("좋아요 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const getLikeUrl = () => {
    if (postType === 'donation') return `/api/donation/${id}/like`;
    if (postType === 'board') return `/api/board/${id}/like`;
    return `/api/posts/${id}/like`;
  };

  const navigateImage = (direction) => {
    if (!post.imgUrls || post.imgUrls.length <= 1) return;
    
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return prev === post.imgUrls.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? post.imgUrls.length - 1 : prev - 1;
    });
  };

  const getLocationInfo = () => {
    if (!post) return '';
    
    const region = post.region || post;
    if (region.province) {
      return `${region.province} ${region.city} ${region.district}`;
    }
    return '위치 정보 없음';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return <div className="donationInfo-loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="donationInfo-error">{error}</div>;
  }

  if (!post) {
    return <div className="donationInfo-error">게시글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="donationInfo-post-detail-container">
      <div className="donationInfo-post-detail-card">
        {/* 이미지 섹션 */}
        {post.imgUrls && post.imgUrls.length > 0 && (
          <div className="donationInfo-post-images-detail">
            <div className="donationInfo-image-container-detail">
              <img
                src={post.imgUrls[currentImageIndex]}
                alt={`${post.title} 이미지 ${currentImageIndex + 1}`}
                className="donationInfo-post-image-detail"
                onError={(e) => e.target.style.display = 'none'}
              />
              
              {post.imgUrls.length > 1 && (
                <>
                  <button 
                    className="donationInfo-image-nav-btn donationInfo-prev-btn"
                    onClick={() => navigateImage('prev')}
                  >
                    ‹
                  </button>
                  <button 
                    className="donationInfo-image-nav-btn donationInfo-next-btn"
                    onClick={() => navigateImage('next')}
                  >
                    ›
                  </button>
                  <div className="donationInfo-image-indicator">
                    {currentImageIndex + 1} / {post.imgUrls.length}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="donationInfo-post-content-section">
          <div className="donationInfo-post-header-section">
            <div className="donationInfo-post-badges">
              <span className={`donationInfo-category-badge ${post.category?.replace(/\s/g, '') || ''}`}>
                {post.category || '카테고리 없음'}
              </span>
              <span className="donationInfo-price-badge">
                {post.price || '가격 정보 없음'}
              </span>
            </div>
            
            <h1 className="donationInfo-post-title-detail">{post.title || '제목 없음'}</h1>
          </div>

          <div className="donationInfo-post-meta-section">
            <div className="donationInfo-author-info-section">
              <span className="donationInfo-author-name">작성자: {post.username || '익명'}</span>
              <div className="donationInfo-location-info-detail">
                <span className="donationInfo-icon">📍</span>
                <span>{getLocationInfo()}</span>
              </div>
            </div>
            
            <div className="donationInfo-post-stats">
              <span className="donationInfo-stat-item">👁️ {post.viewCount || 0}</span>
              <button 
                className={`donationInfo-like-btn donationInfo-stat-item ${!currentUser ? 'disabled' : ''}`}
                onClick={handleLike}
                disabled={!currentUser}
                title={!currentUser ? "로그인이 필요합니다" : "좋아요"}
              >
                ❤️ {post.likes || 0}
              </button>
              <span className="donationInfo-date">
                {post.updatedAt 
                  ? `수정됨: ${formatDate(post.updatedAt)}`
                  : `작성됨: ${formatDate(post.createdAt) || '날짜 정보 없음'}`
                }
              </span>
            </div>
          </div>

          <div className="donationInfo-post-content-detail">
            <p>{post.content || '내용 없음'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCardInfo;