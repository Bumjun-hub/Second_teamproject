import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './GroupBuyInfoPage.css';
import Section from '../../components/Section';

const GroupBuyInfoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [currentUser, setCurrentUser] = useState("");



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
                const res = await fetch(`http://localhost:8080/api/groupBuy/detail/${id}`, {
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const json = await res.json();
                setItem(json);
            } catch (err) {
                console.error("상세 조회 실패:", err);
                alert("데이터를 불러오는데 실패했습니다.");
            }
        };

        if (id) {
            fetchItem();
        }
    }, [id]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentInput.trim()) return;
        setCommentList(prev => [...prev, commentInput.trim()]);
        setCommentInput('');
    };

    const handleEdit = () => {
        if (item.username !== currentUser) {
            alert("권한이 없습니다");
            return;
        }
        navigate(`/groupBuy/admin/edit/${item.id}`);
    };


    const handleDelete = async () => {
        if (item.username !== currentUser) {
            alert("권한이 없습니다");
            return;
        }
        if (window.confirm("정말 삭제하시겠습니까?")) {
            try {
                const res = await fetch(`http://localhost:8080/api/groupBuy/admin/delete/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!res.ok) throw new Error("삭제 실패");
                alert("삭제가 완료되었습니다");
                navigate('/groupbuy');
            } catch (err) {
                console.error("삭제 실패:", err);
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    if (!item) return <div>로딩 중...</div>;

    return (
        <Section>
            <div className="info-container">
                <div className="top-buttons">
                    <button className="edit-button" onClick={handleEdit}>수정</button>
                    <button className="delete-button" onClick={handleDelete}>삭제</button>
                </div>

                <div className="product-card">
                    <div className="image-area">
                        {item.imgUrls?.length > 0 && (
                            <img src={item.imgUrls[0]} alt={item.title} />
                        )}
                    </div>

                    <div className="details-area">
                        <div className="header-row">
                            <h2>{item.title}</h2>
                            <div className="actions">
                                {item.productUrl && (
                                    <a href={item.productUrl} target="_blank" rel="noreferrer" className="detail-link">
                                        제품 상세보기
                                    </a>
                                )}
                                <button className="heart-button">♡</button>
                            </div>
                        </div>

                        <p className="description">{item.description}</p>
                        <p className="content">{item.content}</p>

                        <div className="bottom-fixed">
                            <p className="goal">
                                목표 인원 {item.minParticipants ?? '-'} ~ {item.maxParticipants ?? '-'}명
                            </p>
                            <p className="deadline">
                                마감일: {item.deadline ? new Date(item.deadline).toLocaleString() : '-'}
                            </p>
                            <div className="bottom-row">
                                <span className="original-price">
                                    {typeof item.originalPrice === 'number'
                                        ? item.originalPrice.toLocaleString()
                                        : `${item.originalPrice ?? '-'}`}원
                                </span>
                                <span className="price">
                                    {typeof item.salePrice === 'number'
                                        ? item.salePrice.toLocaleString()
                                        : `${item.salePrice ?? '-'}`}원
                                </span>
                                <button className="buy-button">구매 참여</button>
                            </div>
                        </div>
                    </div>
                </div>

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
