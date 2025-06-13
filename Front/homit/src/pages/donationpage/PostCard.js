import './DonationPage.css';

const PostCard = ({ post, onEdit, onDelete }) => {
  // 안전한 지역 정보 접근
  const getLocationInfo = () => {
    // 중첩된 region 객체가 있는 경우
    if (post.region && post.region.province) {
      return `${post.region.province} ${post.region.city} ${post.region.district}`;
    }
    // 평면적인 구조인 경우
    else if (post.province) {
      return `${post.province} ${post.city} ${post.district}`;
    }
    // 둘 다 없는 경우
    else {
      return '위치 정보 없음';
    }
  };

  // 안전한 날짜 처리
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString; // 변환 실패 시 원본 반환
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-badges">
          <span className={`category-badge ${post.category?.replace(/\s/g, '') || ''}`}>
            {post.category || '카테고리 없음'}
          </span>
          <span className="price-badge">
            {post.price || '가격 정보 없음'}
          </span>
        </div>
        
        <div className="post-actions">
          <button
            onClick={() => onEdit(post)}
            className="action-btn edit-btn"
            title="수정"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="action-btn delete-btn"
            title="삭제"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <h3 className="post-title">{post.title || '제목 없음'}</h3>
      <p className="post-content">{post.content || '내용 없음'}</p>
      
      <div className="post-footer">
        <div className="post-info">
          <div className="location-info">
            <span className="icon">📍</span>
            <span>{getLocationInfo()}</span>
          </div>
          <span className="author">작성자: {post.username || '익명'}</span>
        </div>
        <div className="post-meta">
          <span>조회 {post.views || 0}</span>
          <span>
            {post.updatedAt 
              ? `수정 ${formatDate(post.updatedAt)}`
              : formatDate(post.createdAt) || '날짜 정보 없음'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;