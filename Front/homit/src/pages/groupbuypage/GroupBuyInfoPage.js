import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { dummyGroupBuyData } from '../../data/dummyGroupBuyData';
import './GroupBuyInfoPage.css';
import Section from '../../components/Section';

const GroupBuyInfoPage = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [commentInput, setCommentInput] = useState('');

    useEffect(() => {
        const found = dummyGroupBuyData.find((it) => String(it.id) === id);
        setItem(found);
    }, [id]);

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

                {/* 상단 수정/삭제 버튼 (카드 밖, 오른쪽 정렬) */}
                <div className="top-buttons">
                    <button className="edit-button">수정</button>
                    <button className="delete-button">삭제</button>
                </div>

                {/* 상품 카드 */}
                <div className="product-card">
                    <div className="image-area">
                        <img src={item.image} alt={item.title} />
                    </div>

                    <div className="details-area">
                        <div className="header-row">
                            <h2>{item.name}</h2>
                            <div className="actions">
                                <a href={item.link} target="_blank" rel="noreferrer" className="detail-link">제품 상세보기</a>
                                <button className="heart-button">♡</button>
                            </div>
                        </div>

                        <div className="middle-content">
                            <p className="content">{item.content}</p>
                        </div>

                        <div className="bottom-fixed">
                            <p className="goal">목표 인원 1 / 10</p>
                            <div className="bottom-row">
                                <span className="price">{item.price}</span>
                                <button className="buy-button">구매 참여</button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 댓글 영역 */}
                <div className="comment-box">
                    <h3>댓글</h3>
                    <form onSubmit={handleCommentSubmit}>
                        <textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            style={{ width: '100%', height: '80px', marginTop: '10px' }}
                        />
                        <button type="submit" style={{ marginTop: '10px' }}>댓글 등록</button>
                    </form>

                    <ul style={{ marginTop: '20px', paddingLeft: '20px' }}>
                        {commentList.map((comment, index) => (
                            <li key={index} style={{ marginBottom: '8px' }}>• {comment}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Section>
    );
};

export default GroupBuyInfoPage;
