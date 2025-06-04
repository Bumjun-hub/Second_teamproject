import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './GroupBuyInfoPage.css';
import Section from '../../components/Section';

const GroupBuyInfoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [currentUser, setCurrentUser] = useState("");

    // 구매 신청 , 미신청 상태 
    const [isParticipated, setIsParticipated] = useState(false);



    const fetchItem = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/groupBuy/detail/${id}`, {
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const json = await res.json();
            setItem(json);

            // 참여 여부 판단
            const userRes = await fetch("/api/mypage", { credentials: "include" });
            const userData = await userRes.json();
            setCurrentUser(userData.name);

            // 참여자 목록에 현재 유저가 있는지 확인
            const participated = json.participants?.some(p => p === userData.name);
            setIsParticipated(participated);

        } catch (err) {
            console.error("상세 조회 실패:", err);
            alert("데이터를 불러오는데 실패했습니다.");
        }
    };
    useEffect(() => {


        if (id) fetchItem();
    }, [id]);


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

    // 구매 참여 버튼 이벤트
    const handleApply = async () => {
        try {
            const res = await fetch(`/api/groupBuy/${id}/apply`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('신청 실패');

            alert("신청 완료!");
            setIsParticipated(true);

            // 최신 데이터 다시 불러오기
            fetchItem();
        } catch (err) {
            console.error(err);
            alert("오류 발생");
        }
    };

    const handleCancel = async () => {
        try {
            const res = await fetch(`/api/groupBuy/${id}/cancel`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('취소 실패');

            alert("신청이 취소되었습니다!");
            setIsParticipated(false);

            // 최신 데이터 다시 불러오기
            fetchItem();
        } catch (err) {
            console.error(err);
            alert("오류 발생");
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
                            <h2 className="main-title">{item.title}</h2>
                            <div className="actions">
                                {item.productUrl && (
                                    <a href={item.productUrl} target="_blank" rel="noreferrer" className="detail-link">
                                        제품 상세보기
                                    </a>
                                )}
                                <button className="heart-button">♡</button>
                            </div>
                        </div>

                        <div className="card-section">
                            <div className="section-title">📝 상품 설명</div>
                            <div className="section-content">{item.description}</div>
                        </div>

                        <div className="card-section">
                            <div className="section-title">📦 상세 내용</div>
                            <div className="section-content">{item.content}</div>
                        </div>

                        <div className="info-footer">
                            <div className="info-box">
                                <span className="info-label">모집 인원</span>
                                <span>{item.minParticipants} ~ {item.maxParticipants} 명</span>
                            </div>

                            <div className="info-box">
                                <span className="info-label">참여자 수 : <strong>{item.currentParticipants}</strong> / {item.maxParticipants}명</span>
                                <div className="progress-bar-wrapper">
                                    <div
                                        className="progress-bar-fill"
                                        style={{
                                            width: `${Math.min((item.currentParticipants / item.maxParticipants) * 100, 100)}%`,
                                        }}
                                    ></div>
                                </div>

                            </div>


                            <div className="info-box">
                                <span className="info-label">마감일</span>
                                <span>{item.deadline ? new Date(item.deadline).toLocaleString() : '-'}</span>
                            </div>
                        </div>

                        <div className="bottom-row">
                            <div className="price-wrapper">
                                <span className="original-price">
                                    {typeof item.originalPrice === 'number'
                                        ? item.originalPrice.toLocaleString()
                                        : `${item.originalPrice ?? '-'}`}원
                                </span>
                                <span className="sale-price">
                                    {typeof item.salePrice === 'number'
                                        ? item.salePrice.toLocaleString()
                                        : `${item.salePrice ?? '-'}`}원
                                </span>
                            </div>
                            <button
                                className="buy-button"
                                onClick={isParticipated ? handleCancel : handleApply}
                            >
                                {isParticipated ? "신청 중 (취소)" : "구매 참여"}
                            </button>
                        </div>


                    </div>

                </div>
            </div>
        </Section>
    );
};

export default GroupBuyInfoPage;
