import './DonationPage.css';
import PostCard from './PostCard';

const PostList = ({ posts, onEdit, onDelete }) => {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">표시할 게시글이 없습니다.</p>
        <p className="empty-subtitle">첫 번째 글을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="posts-container">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default PostList;