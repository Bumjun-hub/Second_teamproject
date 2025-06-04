import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './GroupBuyInfoPage.css';
import Section from '../../components/Section';

const GroupBuyInfoPage = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [commentInput, setCommentInput] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/groupBuy/detail/${id}`);
                const json = await res.json();
                setItem(json);
            } catch (err) {
                console.error("상세 조회 실패:", err);
            }
        };

        fetchItem();
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
                {/* 상단 수정/삭제 버튼 (권한 체크 추가 가능) */}
                <div className="top-buttons">
                    <button className="edit-button">수정</button>
                    <button className="delete-button">삭제</button>
                </div>

                {/* 상품 카드 */}
                <div className="product-card">
                    <div className="image-area">
                        {item.imageUrls?.length > 0 && (
                            <img src={item.imageUrls[0]} alt={item.title} />
                        )}
                    </div>

                    <div className="details-area">
                        <div className="header-row">
                            <h2>{item.title}</h2>
                            <div className="actions">
                                {/* {item.link && (
                                    <a href={item.link} target="_blank" rel="noreferrer" className="detail-link">
                                        제품 상세보기
                                    </a>
                                )} */}
                                <button className="heart-button">♡</button>
                            </div>
                        </div>

                        <p className="description">{item.description}</p>
                        <p className="content">{item.content}</p>

                        <div className="bottom-fixed">
                            <p className="goal">
                                목표 인원 {item.minParticipants} ~ {item.maxParticipants}명
                            </p>
                            <p className="deadline">
                                마감일: {new Date(item.deadline).toLocaleString()}
                            </p>
                            <div className="bottom-row">
                                <span className="original-price">{item.originalPrice?.toLocaleString()}원</span>
                                <span className="price">{item.salePrice?.toLocaleString()}원</span>
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
