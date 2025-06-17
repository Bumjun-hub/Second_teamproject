import React, { useState, useEffect } from 'react';
import './PostCard.css';

const PostCardDonation = ({ post, onEdit, onDelete }) => {
  const [currentImageIndex ] = useState(0);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    fetch("/api/mypage", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCurrentUser(data.name));
  }, []);

  const isAuthor = () => {
    return post.username === currentUser;
  };

  const handleEdit = () => {
    if (post.username !== currentUser) {
      alert("권한이 없습니다");
      return;
    }
    onEdit(post);
  };

  const handleDelete = () => {
    if (post.username !== currentUser) {
      alert("권한이 없습니다");
      return;
    }
    
    if (window.confirm("정말 삭제하시겠습니까?")) {
      onDelete(post.id);
    }
  };

  // 안전한 지역 정보 접근
  const getLocationInfo = () => {
    if (post.region && post.region.province) {
      return `${post.region.province} ${post.region.city} ${post.region.district}`;
    }
    else if (post.province) {
      return `${post.province} ${post.city} ${post.district}`;
    }
    else {
      return '위치 정보 없음';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString; 
    }
  };

  // 이미지 에러 처리
  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className="post-card-donation">
      {/* 이미지 섹션 */}
      {post.imgUrls && post.imgUrls.length > 0 && (
        <div className="post-images-donation">
          <div className="image-container-donation">
            <img
              src={post.imgUrls[currentImageIndex]}
              alt={`${post.title} 이미지 ${currentImageIndex + 1}`}
              className="post-image-donation"
              onError={handleImageError}
            />
          </div>
        </div>
      )}

      <div className="post-header-donation">
        <div className="post-badges-donation">
          <span className={`category-badge-donation ${post.category?.replace(/\s/g, '') || ''}`}>
            {post.category || '카테고리 없음'}
          </span>
          <span className="price-badge-donation">
            {post.price || '가격 정보 없음'}
          </span>
        </div>
        
        <div className="post-actions-donation">
          {isAuthor() && (
            <>
              <button
                onClick={handleEdit}
                className="action-btn-donation edit-btn-donation"
                title="수정"
              >
                ✏️
              </button>
              <button
                onClick={handleDelete}
                className="action-btn-donation delete-btn-donation"
                title="삭제"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
      
      <h3 className="post-title-donation">{post.title || '제목 없음'}</h3>
      <p className="post-content-donation">{post.content || '내용 없음'}</p>
      
      <div className="post-footer-d-donation">
        <div className="post-info-donation">
          <div className="location-info-donation">
            <span className="icon-donation">📍</span>
            <span>{getLocationInfo()}</span>
          </div>
          <span className="author-donation">작성자: {post.username || '익명'}</span>
        </div>
        <div className="post-meta-d-donation">
          <span>👁️ {post.viewCount || 0}</span>
          <span>❤️ {post.likes || 0}</span>
          <span>
            {post.updatedAt 
              ?  `${formatDate(post.updatedAt)}`
              : formatDate(post.createdAt) || '날짜 정보 없음'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCardDonation;