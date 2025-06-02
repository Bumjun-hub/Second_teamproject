import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './BoardInfoPage.css';
import Section from "../../components/Section";

const BoardInfoPage = () => {
  const { category, id } = useParams();
  const [item, setItem] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [likes, setLikes] = useState(0);
  const [currentUser, setCurrentUser] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/mypage", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data.name);
      });
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/community/detail/${category}/${id}`);
        const json = await res.json();
        setItem(json);
        setLikes(json.likes);
      } catch (err) {
        console.error("게시글 상세 불러오기 실패", err);
      }
    };

    fetchItem();
  }, [category, id]);

  const handleLikeClick = () => {
    setLikes(prev => prev + 1);
    // 서버 PATCH 요청 추가 예정
  };

  const handleEdit = () => {
    if (item.username !== currentUser) {
      alert("권한이 없습니다");
      return;
    }
    navigate(`/board/edit/${item.category}/${item.id}`);
  };

  const handleDelete = async () => {
    if (item.username !== currentUser) {
      alert("권한이 없습니다");
      return;
    }

    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await fetch(`/api/community/delete/${item.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        alert("삭제 완료!");
        navigate("/board");
      } catch (err) {
        alert("삭제 실패!");
        console.error(err);
      }
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setCommentList(prev => [...prev, commentInput.trim()]);
    setCommentInput('');
  };

  if (!item) return <div>로딩 중...</div>;

  // ✅ 본문 + 이미지 HTML 조합
  const combinedContent = item.content + (
    item.imgUrls?.length > 0
      ? item.imgUrls.map(url => `<img src="${url}" alt="첨부 이미지" class="content-image" />`).join('')
      : ''
  );

  return (
    <Section>
      <div className="info-container">

        <div className="top-buttons">
          <button className="edit-button" onClick={handleEdit}>수정</button>
          <button className="delete-button" onClick={handleDelete}>삭제</button>
        </div>

        <div className="product-card">
          <div className="details-area">
            <div className="header-row">
              <h2 className="title">{item.title}</h2>
              <div className="divider-line"></div>
              <div className="meta-bar">
                <div className="meta-info">
                  <span><strong>작성자</strong> {item.username}</span>
                  <span><strong>작성일</strong> {new Date(item.createdAt).toISOString().slice(0, 10)}</span>
                  <span><strong>조회</strong> {item.viewCount}</span>
                  <span><strong>추천</strong> {likes}</span>
                </div>


                <div className="product-card">
                    <div className="details-area">
                        <div className="header-row">
                            <h2 className="title">{item.title}</h2>
                            <div className="divider-line"></div>
                            <div className="meta-bar">
                                <div className="meta-info">
                                    <span><strong>작성자</strong> {item.username}</span>
                                    {/* toIOString() : 2025-05-30T12:34:56.000Z 형태*/}
                                    <span><strong>작성일</strong> {new Date(item.createdAt).toISOString().slice(0, 10)}</span>
                                    <span><strong>조회</strong> {item.viewCount}</span>
                                    <span><strong>추천</strong> {likes}</span>
                                </div>

                                <div className="like-area">
                                    <button onClick={handleLikeClick} className="like-button">♡ 추천</button>
                                </div>
                            </div>
                        </div>

                        <div className="middle-content">
                            <div className="content-box" dangerouslySetInnerHTML={{ __html: item.content }} />
                            {item.imgUrls && item.imgUrls.length > 0 && (
                                <div className="image-gallery">
                                    {item.imgUrls.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`첨부 이미지 ${idx + 1}`}
                                            className="attached-image"
                                            style={{ maxWidth: '100%', display: 'block', margin: '10px auto' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="comment-box">
                    <h3>댓글</h3>
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            className="comment-textarea"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                        />
                        <button type="submit" className="comment-submit-btn">댓글 등록</button>
                    </form>

                    <ul className="comment-list">
                        {commentList.map((comment, index) => (
                            <li key={index} className="comment-item">• {comment}</li>
                        ))}
                    </ul>
                </div>
              </div>
            </div>

            <div className="middle-content">
              <div
                className="content-box"
                dangerouslySetInnerHTML={{ __html: combinedContent }}
              />
            </div>
          </div>
        </div>

        <div className="comment-box">
          <h3>댓글</h3>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              className="comment-textarea"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 입력하세요..."
            />
            <button type="submit" className="comment-submit-btn">댓글 등록</button>
          </form>

          <ul className="comment-list">
            {commentList.map((comment, index) => (
              <li key={index} className="comment-item">• {comment}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default BoardInfoPage;
