import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './BoardInfoPage.css';
import Section from "../../components/Section";
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import PostContent from '../../components/PostContent';
import CommentSection from '../../components/CommentSection';

const BoardInfoPage = () => {
  const { category, id } = useParams();
  const [item, setItem] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/mypage", { credentials: "include" })
      .then(res => res.json())
      .then(data => setCurrentUser(data.name));
  }, []);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/community/detail/${category}/${id}`);
        const json = await res.json();
        setItem(json);
        setLikes(json.likes);
        setIsLiked(json.liked);
      } catch (err) {
        console.error("게시글 상세 불러오기 실패", err);
      }
    };
    fetchItem();
  }, [category, id]);

  const handleLikeClick = async () => {
    try {
      const res = await fetch(`/api/likes/COMMUNITY/${item.id}`, {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        setIsLiked(prev => !prev);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
      } else {
        alert("추천 실패");
      }
    } catch (err) {
      console.error("추천 요청 오류:", err);
      alert("서버오류");
    }
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

  if (!item) return <div>로딩 중...</div>;

  return (
    <Section>
      <div className="bpi-container">
        <div className="bpi-card">
          <div className="bpi-top-buttons">
            <button className="bpi-edit-button" onClick={handleEdit}>수정</button>
            <button className="bpi-delete-button" onClick={handleDelete}>삭제</button>
          </div>


          <div className="bpi-details">
            <div className="bpi-header-row">
              <h2 className="bpi-title">{item.title}</h2>
              <div className="bpi-divider-line"></div>
              <div className="bpi-meta-bar">
                <div className="bpi-meta-info">
                  <span><strong>작성자</strong> {item.username}</span>
                  <span><strong>작성일</strong> {new Date(item.createdAt).toISOString().slice(0, 10)}</span>
                  <span><strong>조회</strong> {item.viewCount}</span>
                  <span><strong>추천</strong> {likes}</span>
                </div>
                <div className="bpi-like-area">
                  <button onClick={handleLikeClick} className="bpi-like-button">{isLiked
                    ? <AiFillHeart size={17} color="red" />
                    : <AiOutlineHeart size={17} color="white" />}
                    <span style={{ marginLeft: "6px", color: "#fff" }}>추천</span></button>
                </div>
              </div>
            </div>

            <div className="middle-content">
              <PostContent content={item.content} imgUrls={item.imgUrls} />
            </div>
          </div>
        </div>

        <CommentSection postId={item.id} currentUser={currentUser} entityType="COMMUNITY" />

      </div>
    </Section>
  );
};

export default BoardInfoPage;
