import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post, onEdit, onDelete, postType = 'donation' }) => {
  const [currentImageIndex ] = useState(0);
  const [currentUser, setCurrentUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/mypage", { credentials: "include" })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 401) {
          // 로그인하지 않은 상태 - 무시
          return null;
        } else {
          throw new Error('사용자 정보를 가져올 수 없습니다.');
        }
      })
      .then(data => {
        if (data && data.name) {
          setCurrentUser(data.name);
        }
      })
      .catch(err => console.error("사용자 정보 로드 실패:", err));
  }, []);

  const isAuthor = () => {
    return currentUser && post && post.username === currentUser;
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post.username !== currentUser) {
      alert("권한이 없습니다");
      return;
    }
    onEdit(post);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (post.username !== currentUser) {
      alert("권한이 없습니다");
      return;
    }
    
    if (window.confirm("정말 삭제하시겠습니까?")) {
      onDelete(post.id);
    }
  };

  const handleCardClick = () => {
    // 게시글 타입에 따라 다른 상세 페이지로 이동
    if (postType === 'donation') {
      // 기부 게시글의 경우 카테고리 정보도 함께 전달
      const category = post.category || 'SHARE'; // 기본값 설정
      navigate(`/donation/view/${category}/${post.id}`);
    } else if (postType === 'board') {
      navigate(`/board/${post.id}`);
    } else {
      navigate(`/posts/${post.id}`);
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
    <div 
      className="post-card-donation"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
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

export default PostCard;