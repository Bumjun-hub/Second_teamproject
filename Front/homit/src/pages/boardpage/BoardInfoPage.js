import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { boarddummyData } from '../../data/dummyGroupBuyData';
import './BoardInfoPage.css';
import Section from "../../components/Section";

const BoardInfoPage = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [likes, setLikes] = useState(0); // 추천 수 상태

    useEffect(() => {
        const found = boarddummyData.find((it) => String(it.id) === id);
        setItem(found);
        if (found) setLikes(found.like);
    }, [id]);

    const handleLikeClick = () => {
        setLikes(prev => prev + 1);
        // TODO: 서버에 PATCH 요청 추가
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        setCommentList(prev => [...prev, commentInput.trim()]);
        setCommentInput('');
    };

    if (!item) return <div>로딩 중...</div>;

    return (
        <Section>
            <div className="info-container">
                <div className="top-buttons">
                    <button className="edit-button">수정</button>
                    <button className="delete-button">삭제</button>
                </div>

                <div className="product-card">
                    <div className="details-area">
                        <div className="header-row">
                            <h2 className="title">{item.title}</h2>

                            <div className="meta-bar">
                                <div className="meta-info">
                                    <span>작성자: {item.writer}</span>
                                    <span>조회수: {item.count}</span>
                                    <span>추천수: {likes}</span>
                                </div>
                                <div className="like-area">
                                    <button onClick={handleLikeClick} className="like-button">♡ 추천</button>
                                </div>
                            </div>
                        </div>

                        <div className="middle-content">
                            <div className="content-box">{item.content}</div>
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
